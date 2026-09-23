import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query } from '../db';
import { canRegisterDevice } from '../services/planLimiter';

export async function addressBookRoutes(fastify: FastifyInstance) {
  // Hook to require JWT auth on /api/ab/*
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.url.startsWith('/api/ab')) {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ error: 'Token inválido ou expirado' });
      }
    }
  });

  // Get full address book
  fastify.get('/api/ab', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    const devices = await query<any>(
      `SELECT d.id, d.alias, d.hostname, d.username, d.platform, d.hash,
              d.is_online, d.wake_mac, d.wake_energy_watts,
              COALESCE(
                json_agg(t.name) FILTER (WHERE t.name IS NOT NULL),
                '[]'
              ) as tags
       FROM devices d
       LEFT JOIN device_tag_assignments dta ON d.id = dta.device_id
       LEFT JOIN device_tags t ON dta.tag_id = t.id
       WHERE d.organization_id = $1
       GROUP BY d.id`,
      [user.orgId]
    );

    const tags = await query<any>(
      `SELECT id, name, color FROM device_tags WHERE organization_id = $1`,
      [user.orgId]
    );

    // Format expected by RustDesk / Eleva Remote Desk Address Book
    return reply.send({
      updated_at: new Date().toISOString(),
      peers: devices.map((d) => ({
        id: d.id,
        username: d.username || '',
        hostname: d.hostname || d.alias || d.id,
        alias: d.alias || '',
        platform: d.platform || 'Windows',
        tags: d.tags || [],
        hash: d.hash || '',
        online: d.is_online,
        wake_mac: d.wake_mac,
        wake_energy_watts: d.wake_energy_watts,
      })),
      tags: tags.map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color,
      })),
    });
  });

  // Personal address book endpoint
  fastify.get('/api/ab/personal', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    const devices = await query<any>(
      `SELECT id, alias, hostname, username, platform, hash, is_online FROM devices WHERE organization_id = $1`,
      [user.orgId]
    );

    return reply.send({
      data: JSON.stringify(
        devices.map((d) => ({
          id: d.id,
          username: d.username || '',
          hostname: d.hostname || d.alias || d.id,
          alias: d.alias || '',
          platform: d.platform || 'Windows',
          hash: d.hash || '',
          online: d.is_online,
        }))
      ),
    });
  });

  // Settings
  fastify.get('/api/ab/settings', async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      personal: true,
      shared: true,
    });
  });

  // Register / Add a peer (PC) with plan limit enforcement
  fastify.post('/api/ab/peer/add/:guid', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    const body = request.body as any;
    const deviceId = body?.id?.toString().trim();

    if (!deviceId) {
      return reply.status(400).send({ error: 'Device ID é obrigatório' });
    }

    // Check device limit for the customer's plan
    const check = await canRegisterDevice(user.orgId, deviceId);
    if (!check.allowed) {
      return reply.status(403).send({
        error: check.reason,
        current: check.current,
        max: check.max,
      });
    }

    await query(
      `INSERT INTO devices (id, organization_id, alias, hostname, username, platform, hash, is_online, last_heartbeat)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, NOW())
       ON CONFLICT (id) DO UPDATE SET
          organization_id = EXCLUDED.organization_id,
          alias = COALESCE(EXCLUDED.alias, devices.alias),
          hostname = COALESCE(EXCLUDED.hostname, devices.hostname),
          username = COALESCE(EXCLUDED.username, devices.username),
          platform = COALESCE(EXCLUDED.platform, devices.platform),
          hash = COALESCE(EXCLUDED.hash, devices.hash),
          is_online = TRUE,
          last_heartbeat = NOW()`,
      [
        deviceId,
        user.orgId,
        body?.alias || '',
        body?.hostname || '',
        body?.username || '',
        body?.platform || 'Windows',
        body?.hash || '',
      ]
    );

    return reply.send({ success: true, message: 'Dispositivo cadastrado com sucesso' });
  });

  // Update peer (alias, tags, etc.)
  fastify.post('/api/ab/peer/update/:guid', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    const body = request.body as any;
    const deviceId = body?.id?.toString().trim();

    if (!deviceId) {
      return reply.status(400).send({ error: 'Device ID é obrigatório' });
    }

    await query(
      `UPDATE devices SET
          alias = COALESCE($1, alias),
          hostname = COALESCE($2, hostname),
          username = COALESCE($3, username),
          wake_mac = COALESCE($4, wake_mac)
       WHERE id = $5 AND organization_id = $6`,
      [body?.alias, body?.hostname, body?.username, body?.wake_mac, deviceId, user.orgId]
    );

    return reply.send({ success: true });
  });
}
