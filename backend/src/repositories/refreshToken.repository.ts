import prisma from '../config/prisma';

export interface RefreshTokenCreateData {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}

export const refreshTokenRepository = {
  create(data: RefreshTokenCreateData) {
    return prisma.refreshToken.create({ data });
  },
  findById(id: string) {
    return prisma.refreshToken.findUnique({ where: { id } });
  },
  revoke(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  },
};
