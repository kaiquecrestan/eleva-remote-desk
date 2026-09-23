import { query } from '../db';
import { config } from '../config';

export interface PlanLimits {
  maxDevices: number;
  maxConcurrentSessions: number;
}

export async function getOrganizationPlanLimits(organizationId: string): Promise<PlanLimits> {
  const rows = await query<{ max_devices: number; max_concurrent_sessions: number }>(
    `SELECT p.max_devices, p.max_concurrent_sessions
     FROM organizations o
     JOIN plans p ON o.plan_id = p.id
     WHERE o.id = $1`,
    [organizationId]
  );

  if (rows.length === 0) {
    // Default fallback to Single plan limits
    return { maxDevices: 3, maxConcurrentSessions: 1 };
  }

  return {
    maxDevices: rows[0].max_devices,
    maxConcurrentSessions: rows[0].max_concurrent_sessions,
  };
}

export async function canRegisterDevice(
  organizationId: string,
  deviceId: string
): Promise<{ allowed: boolean; reason?: string; current: number; max: number }> {
  // If device is already registered, allow update
  const existing = await query(`SELECT id FROM devices WHERE id = $1 AND organization_id = $2`, [
    deviceId,
    organizationId,
  ]);
  if (existing.length > 0) {
    const limits = await getOrganizationPlanLimits(organizationId);
    return { allowed: true, current: 1, max: limits.maxDevices };
  }

  const limits = await getOrganizationPlanLimits(organizationId);
  const countRes = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM devices WHERE organization_id = $1`,
    [organizationId]
  );
  const currentCount = parseInt(countRes[0]?.count || '0', 10);

  if (currentCount >= limits.maxDevices) {
    return {
      allowed: false,
      reason: `Limite de dispositivos atingido (${currentCount}/${limits.maxDevices}). Faça upgrade do plano no painel Eleva.`,
      current: currentCount,
      max: limits.maxDevices,
    };
  }

  return { allowed: true, current: currentCount, max: limits.maxDevices };
}

export async function cleanupStaleSessions(): Promise<number> {
  const threshold = new Date(Date.now() - config.sessionTimeoutMinutes * 60 * 1000);
  const res = await query(
    `DELETE FROM active_sessions WHERE last_ping < $1 RETURNING id`,
    [threshold]
  );
  return res.length;
}

export async function canStartSession(
  organizationId: string
): Promise<{ allowed: boolean; reason?: string; current: number; max: number }> {
  await cleanupStaleSessions();

  const limits = await getOrganizationPlanLimits(organizationId);
  const countRes = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM active_sessions WHERE organization_id = $1`,
    [organizationId]
  );
  const currentSessions = parseInt(countRes[0]?.count || '0', 10);

  if (currentSessions >= limits.maxConcurrentSessions) {
    return {
      allowed: false,
      reason: `Limite de conexões simultâneas do plano atingido (${currentSessions}/${limits.maxConcurrentSessions}). Faça upgrade para mais conexões simultâneas.`,
      current: currentSessions,
      max: limits.maxConcurrentSessions,
    };
  }

  return { allowed: true, current: currentSessions, max: limits.maxConcurrentSessions };
}
