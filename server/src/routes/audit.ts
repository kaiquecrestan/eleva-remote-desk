import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query } from '../db';
import { canStartSession } from '../services/planLimiter';

export async function auditRoutes(fastify: FastifyInstance) {
  // Connection started - ENFORCE CONCURRENT SESSION LIMIT
  fastify.post('/api/audit/conn', async (request: FastifyRequest, reply: FastifyReply) => {
    let orgId: string | null = null;
    let userId: string | null = null;

    try {
      await request.jwtVerify();
      const payload = request.user as any;
      orgId = payload.orgId;
      userId = payload.userId;
    } catch {
      // If unauthenticated, try to infer organization from the destination device
    }

    const body = request.body as any;
    const toDeviceId = (body?.id || body?.peer_id || '').toString().trim();
    const sessionId = (body?.session_id || body?.uuid || `${Date.now()}-${Math.random()}`).toString();

    if (!orgId && toDeviceId) {
      const dev = await query<{ organization_id: string }>(
        `SELECT organization_id FROM devices WHERE id = $1`,
        [toDeviceId]
      );
      if (dev.length > 0) {
        orgId = dev[0].organization_id;
      }
    }

    if (orgId) {
      // Enforce simultaneous connection limit for this customer
      const check = await canStartSession(orgId);
      if (!check.allowed) {
        return reply.status(403).send({
          error: check.reason,
          code: 'CONCURRENT_LIMIT_EXCEEDED',
          current: check.current,
          max: check.max,
        });
      }

      await query(
        `INSERT INTO active_sessions (organization_id, user_id, session_id, from_device_id, to_device_id, started_at, last_ping)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT (session_id) DO UPDATE SET last_ping = NOW()`,
        [orgId, userId, sessionId, body?.from || '', toDeviceId]
      );

      await query(
        `INSERT INTO audit_logs (organization_id, user_id, session_id, from_device_id, to_device_id, started_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [orgId, userId, sessionId, body?.from || '', toDeviceId]
      );
    }

    return reply.send({ success: true, session_id: sessionId });
  });

  // Session heartbeat/ping
  fastify.post('/api/audit/ping', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const sessionId = body?.session_id?.toString();
    if (sessionId) {
      await query(`UPDATE active_sessions SET last_ping = NOW() WHERE session_id = $1`, [sessionId]);
    }
    return reply.send({ success: true });
  });

  // Connection closed - Release active session slot
  fastify.post('/api/audit/close', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const sessionId = body?.session_id?.toString();

    if (sessionId) {
      await query(`DELETE FROM active_sessions WHERE session_id = $1`, [sessionId]);
      await query(
        `UPDATE audit_logs SET
            ended_at = NOW(),
            duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INT
         WHERE session_id = $1 AND ended_at IS NULL`,
        [sessionId]
      );
    }

    return reply.send({ success: true });
  });
}
