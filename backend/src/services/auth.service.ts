import { randomUUID } from 'node:crypto';
import { HttpError } from '../utils/HttpError';
import { comparePassword, hashPassword } from '../utils/password';
import { hashToken } from '../utils/hashToken';
import {
  refreshTokenTtlSeconds,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { refreshTokenRepository } from '../repositories/refreshToken.repository';
import { userRepository } from '../repositories/user.repository';
import { toSafeUser } from '../utils/userSerializer';

export type SafeUser = ReturnType<typeof toSafeUser>;

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResult> {
    const user = await userRepository.findByEmail(email);
    if (!user || !(await comparePassword(password, user.passwordHash)) || !user.active) {
      throw new HttpError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }
    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = await authService.issueRefreshToken(user.id);
    return { accessToken, refreshToken, user: toSafeUser(user) };
  },

  async issueRefreshToken(userId: string): Promise<string> {
    const tokenId = randomUUID();
    const rawToken = signRefreshToken(userId, tokenId);
    const expiresAt = new Date(Date.now() + refreshTokenTtlSeconds() * 1000);
    await refreshTokenRepository.create({
      id: tokenId,
      tokenHash: hashToken(rawToken),
      userId,
      expiresAt,
    });
    return rawToken;
  },

  async refresh(rawToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(rawToken);
    } catch {
      throw new HttpError(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    const record = await refreshTokenRepository.findById(payload.tokenId);
    if (!record || record.revokedAt || record.expiresAt.getTime() < Date.now()) {
      throw new HttpError(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }
    if (record.userId !== payload.sub || record.tokenHash !== hashToken(rawToken)) {
      throw new HttpError(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    const user = await userRepository.findById(record.userId);
    if (!user || !user.active) {
      throw new HttpError(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    await refreshTokenRepository.revoke(record.id);
    const refreshToken = await authService.issueRefreshToken(user.id);
    const accessToken = signAccessToken(user.id, user.role);
    return { accessToken, refreshToken };
  },

  async logout(rawToken?: string): Promise<void> {
    if (!rawToken) {
      return;
    }
    try {
      const payload = verifyRefreshToken(rawToken);
      await refreshTokenRepository.revoke(payload.tokenId);
    } catch {
      // Invalid or already expired token; nothing to revoke.
    }
  },

  async me(userId: string): Promise<SafeUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, 'User not found', 'USER_NOT_FOUND');
    }
    return toSafeUser(user);
  },

  async updateProfile(userId: string, name: string): Promise<SafeUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, 'User not found', 'USER_NOT_FOUND');
    }
    const updated = await userRepository.update(userId, { name });
    return toSafeUser(updated);
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user || !user.active) {
      throw new HttpError(401, 'Authentication required', 'UNAUTHORIZED');
    }
    const matches = await comparePassword(currentPassword, user.passwordHash);
    if (!matches) {
      throw new HttpError(400, 'Current password is incorrect', 'CURRENT_PASSWORD_INCORRECT');
    }
    const passwordHash = await hashPassword(newPassword);
    await userRepository.update(userId, { passwordHash });
    await refreshTokenRepository.revokeAllForUser(userId);
  },
};
