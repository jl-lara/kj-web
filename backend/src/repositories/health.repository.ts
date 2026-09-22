import prisma from '../config/prisma';

export const healthRepository = {
  async isDatabaseConnected(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  },
};
