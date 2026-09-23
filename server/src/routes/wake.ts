import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query } from '../db';
import dgram from 'dgram';

// Helper to send Wake-on-LAN Magic Packet
function sendWakeOnLan(macAddress: string, broadcastIp = '255.255.255.255', port = 9): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const cleanMac = macAddress.replace(/[^0-9A-Fa-f]/g, '');
      if (cleanMac.length !== 12) {
        return reject(new Error('Endereço MAC inválido'));
      }
      const macBytes = Buffer.from(cleanMac, 'hex');
      const magicPacket = Buffer.alloc(102);

      // 6 bytes of 0xFF followed by MAC repeated 16 times
      magicPacket.fill(0xff, 0, 6);
      for (let i = 0; i < 16; i++) {
        macBytes.copy(magicPacket, 6 + i * 6);
      }

      const socket = dgram.createSocket('udp4');
      socket.once('error', (err) => {
        socket.close();
        reject(err);
      });

      socket.send(magicPacket, 0, magicPacket.length, port, broadcastIp, (err) => {
        socket.close();
        if (err) reject(err);
        else resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

export async function wakeRoutes(fastify: FastifyInstance) {
  // Telemetry sent from Eleva Remote Wake hardware module
  fastify.post('/api/wake/telemetry', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const deviceId = (body?.device_id || '').toString().trim();
    const mac = (body?.mac || '').toString().trim();
    const watts = parseFloat(body?.watts || '0');

    if (!deviceId) {
      return reply.status(400).send({ error: 'device_id é obrigatório' });
    }

    const isPoweredOn = watts > 15.0; // Over 15W idle threshold indicates computer is ON

    await query(
      `UPDATE devices SET
          wake_energy_watts = $1,
          wake_mac = COALESCE(NULLIF($2, ''), wake_mac),
          is_online = CASE WHEN $3 = TRUE THEN TRUE ELSE is_online END
       WHERE id = $4`,
      [watts, mac, isPoweredOn, deviceId]
    );

    return reply.send({ success: true, powered_on: isPoweredOn });
  });

  // Trigger remote start via Eleva Remote Wake (WoL + Relay)
  fastify.post('/api/wake/trigger', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Não autenticado' });
    }

    const user = request.user as any;
    const body = request.body as any;
    const deviceId = (body?.device_id || '').toString().trim();

    const dev = await query<any>(
      `SELECT id, alias, hostname, wake_mac, wake_energy_watts FROM devices WHERE id = $1 AND organization_id = $2`,
      [deviceId, user.orgId]
    );

    if (dev.length === 0) {
      return reply.status(404).send({ error: 'Computador não encontrado na organização' });
    }

    const target = dev[0];
    if (!target.wake_mac) {
      return reply.status(400).send({
        error: 'Endereço MAC não configurado para este computador. Cadastre o MAC ou vincule o Eleva Remote Wake.',
      });
    }

    try {
      await sendWakeOnLan(target.wake_mac);
      return reply.send({
        success: true,
        message: `Comando de inicialização enviado com sucesso para ${target.alias || target.hostname || target.id}`,
      });
    } catch (err: any) {
      return reply.status(500).send({
        error: `Falha ao emitir pacote de inicialização: ${err.message}`,
      });
    }
  });

  // Query Wake & Power status of a computer
  fastify.get('/api/wake/status/:deviceId', async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as any;
    const dev = await query<any>(
      `SELECT id, alias, is_online, wake_mac, wake_energy_watts, last_heartbeat FROM devices WHERE id = $1`,
      [params.deviceId]
    );

    if (dev.length === 0) {
      return reply.status(404).send({ error: 'Dispositivo não encontrado' });
    }

    const d = dev[0];
    const watts = parseFloat(d.wake_energy_watts || '0');
    return reply.send({
      device_id: d.id,
      alias: d.alias,
      is_online: d.is_online,
      wake_configured: !!d.wake_mac,
      wake_mac: d.wake_mac,
      energy_watts: watts,
      power_state: watts > 15 ? 'RUNNING' : watts > 1 ? 'STANDBY' : 'OFF',
      last_heartbeat: d.last_heartbeat,
    });
  });
}
