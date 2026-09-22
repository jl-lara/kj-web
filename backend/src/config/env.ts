import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required('DATABASE_URL'),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
  refreshCookieName: process.env.REFRESH_COOKIE_NAME ?? 'refreshToken',
  uploadDir: path.resolve(process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads')),
  publicBaseUrl: (process.env.PUBLIC_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`).replace(/\/+$/, ''),
  storageProvider: (process.env.STORAGE_PROVIDER ?? 'local').toLowerCase(),
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? 'images',
};
