import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { env } from '../config/env';
import { parseDurationSeconds } from './duration';

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  role: UserRole;
}

export interface RefreshTokenPayload extends JwtPayload {
  sub: string;
  tokenId: string;
  type: 'refresh';
}

export function signAccessToken(userId: string, role: UserRole): string {
  return jwt.sign({ role }, env.jwtAccessSecret, {
    subject: userId,
    expiresIn: parseDurationSeconds(env.accessTokenExpiresIn),
  });
}

export function signRefreshToken(userId: string, tokenId: string): string {
  return jwt.sign({ tokenId, type: 'refresh' }, env.jwtRefreshSecret, {
    subject: userId,
    expiresIn: parseDurationSeconds(env.refreshTokenExpiresIn),
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
}

export function refreshTokenTtlSeconds(): number {
  return parseDurationSeconds(env.refreshTokenExpiresIn);
}
