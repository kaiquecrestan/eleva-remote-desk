import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import bcrypt from 'bcryptjs';
import { config } from './config';
import { initDb, query } from './db';
import { authRoutes } from './routes/auth';
import { addressBookRoutes } from './routes/ab';
import { auditRoutes } from './routes/audit';
import { deviceRoutes } from './routes/devices';
import { wakeRoutes } from './routes/wake';

const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

async function main() {
  // CORS configuration allowing client app and web panel
  await server.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // JWT registration
  await server.register(jwt, {
    secret: config.jwtSecret,
  });

  // Health check endpoint
  server.get('/health', async () => {
    return {
      status: 'healthy',
      service: 'Eleva Remote API',
      timestamp: new Date().toISOString(),
    };
  });

  // Root endpoint info
  server.get('/', async () => {
    return {
      name: 'Eleva Remote Infrastructure API',
      version: '1.0.0',
      company: 'Eleva Business Solutions',
      website: config.panelHost,
    };
  });

  // Register API modules
  await server.register(authRoutes);
  await server.register(addressBookRoutes);
  await server.register(auditRoutes);
  await server.register(deviceRoutes);
  await server.register(wakeRoutes);

  // Quick initial organization and admin user provisioning if empty
  server.post('/api/admin/provision-initial', async (request, reply) => {
    const body = request.body as any;
    const adminKey = request.headers['x-admin-key'];

    if (adminKey !== config.jwtSecret) {
      return reply.status(403).send({ error: 'Acesso negado: Chave de administração incorreta' });
    }

    const email = body?.email || 'admin@elevabs.com';
    const password = body?.password || 'ElevaRemote2026!';
    const orgName = body?.org_name || 'Eleva Business Solutions';
    const planId = body?.plan_id || 'enterprise';

    const hash = await bcrypt.hash(password, 10);

    const orgRes = await query<{ id: string }>(
      `INSERT INTO organizations (name, slug, plan_id, status)
       VALUES ($1, 'eleva-matriz', $2, 'active')
       ON CONFLICT (slug) DO UPDATE SET plan_id = $2
       RETURNING id`,
      [orgName, planId]
    );

    const orgId = orgRes[0].id;

    await query(
      `INSERT INTO users (organization_id, email, password_hash, name, role)
       VALUES ($1, $2, $3, 'Administrador Eleva', 'admin')
       ON CONFLICT (email) DO UPDATE SET password_hash = $3`,
      [orgId, email, hash]
    );

    return reply.send({
      success: true,
      message: 'Organização e usuário administrador provisionados com sucesso',
      credentials: { email, plan: planId },
    });
  });

  // Initialize DB and start listening
  try {
    await initDb();
    await server.listen({ port: config.port, host: config.host });
    console.log(`\n======================================================`);
    console.log(`🚀 Eleva Remote API rodando em http://${config.host}:${config.port}`);
    console.log(`🌐 Endpoint oficial: ${config.apiHost}`);
    console.log(`💻 ID / Relay Server: ${config.serverHost}`);
    console.log(`======================================================\n`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
