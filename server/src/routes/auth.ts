import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { query } from '../db';

export async function authRoutes(fastify: FastifyInstance) {
  // Login endpoint expected by Eleva Remote Desk
  fastify.post('/api/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const username = body?.username || body?.email;
    const password = body?.password;

    if (!username || !password) {
      return reply.status(400).send({ error: 'Username/email e senha são obrigatórios' });
    }

    const users = await query<any>(
      `SELECT u.id, u.organization_id, u.email, u.password_hash, u.name, u.role, u.is_active,
              o.name as org_name, o.slug as org_slug, o.plan_id, o.status as org_status,
              p.name as plan_name, p.max_devices, p.max_concurrent_sessions
       FROM users u
       JOIN organizations o ON u.organization_id = o.id
       JOIN plans p ON o.plan_id = p.id
       WHERE LOWER(u.email) = LOWER($1) AND u.is_active = TRUE`,
      [username.trim()]
    );

    if (users.length === 0) {
      return reply.status(401).send({ error: 'Credenciais inválidas' });
    }

    const user = users[0];
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return reply.status(401).send({ error: 'Credenciais inválidas' });
    }

    if (user.org_status !== 'active') {
      return reply.status(403).send({ error: 'Assinatura da organização inativa ou suspensa' });
    }

    // Generate JWT token
    const token = fastify.jwt.sign({
      userId: user.id,
      orgId: user.organization_id,
      email: user.email,
      role: user.role,
    });

    return reply.send({
      access_token: token,
      type: 'bearer',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_admin: user.role === 'admin',
        organization: {
          id: user.organization_id,
          name: user.org_name,
          plan: user.plan_id,
          plan_name: user.plan_name,
          max_devices: user.max_devices,
          max_concurrent_sessions: user.max_concurrent_sessions,
        },
      },
    });
  });

  // Get current user profile
  fastify.get('/api/currentUser', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ error: 'Não autenticado' });
    }

    const payload = request.user as any;
    const users = await query<any>(
      `SELECT u.id, u.organization_id, u.email, u.name, u.role,
              o.name as org_name, o.plan_id, p.name as plan_name,
              p.max_devices, p.max_concurrent_sessions
       FROM users u
       JOIN organizations o ON u.organization_id = o.id
       JOIN plans p ON o.plan_id = p.id
       WHERE u.id = $1`,
      [payload.userId]
    );

    if (users.length === 0) {
      return reply.status(404).send({ error: 'Usuário não encontrado' });
    }

    const u = users[0];
    return reply.send({
      name: u.name,
      email: u.email,
      role: u.role,
      is_admin: u.role === 'admin',
      org_name: u.org_name,
      plan: u.plan_id,
      plan_name: u.plan_name,
      max_devices: u.max_devices,
      max_concurrent_sessions: u.max_concurrent_sessions,
    });
  });
}
