import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  jwtSecret: process.env.JWT_SECRET || 'eleva-remote-secret-jwt-key-production-change-me',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/eleva_remote',
  serverHost: process.env.SERVER_HOST || 'desk.elevabs.com',
  apiHost: process.env.API_HOST || 'https://api-remote.elevabs.com',
  panelHost: process.env.PANEL_HOST || 'https://remote.elevabs.com',
  sessionTimeoutMinutes: 5,
};
