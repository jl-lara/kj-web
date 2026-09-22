import { Response } from 'express';
import { env } from '../config/env';
import { refreshTokenTtlSeconds } from './jwt';

const cookiePath = '/api/auth';

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(env.refreshCookieName, token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge: refreshTokenTtlSeconds() * 1000,
    path: cookiePath,
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(env.refreshCookieName, { path: cookiePath });
}
