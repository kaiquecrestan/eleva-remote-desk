import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query } from '../db';

export async function deviceRoutes(fastify: FastifyInstance) {
  // Device heartbeat (marks computer online)
  fastify.post('/api/heartbeat', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const deviceId = (body?.id || body?.uuid || '').toString().trim();

    if (deviceId) {
      await query(
        `UPDATE devices SET
            is_online = TRUE,
            last_heartbeat = NOW()
         WHERE id = $1`,
        [deviceId]
      );
    }

    return reply.send({ success: true, timestamp: Date.now() });
  });

  // Device telemetry / sysinfo
  fastify.post('/api/sysinfo', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const deviceId = (body?.id || '').toString().trim();

    if (deviceId) {
      await query(
        `UPDATE devices SET
            hostname = COALESCE($1, hostname),
            username = COALESCE($2, username),
            platform = COALESCE($3, platform),
            last_heartbeat = NOW(),
            is_online = TRUE
         WHERE id = $4`,
        [body?.hostname, body?.username, body?.platform, deviceId]
      );
    }

    return reply.send({ success: true });
  });
}
