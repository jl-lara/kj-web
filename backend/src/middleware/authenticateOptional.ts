import { NextFunction, Request, Response } from 'express';
import prisma from '../config/prisma';
import { verifyAccessToken } from '../utils/jwt';

export async function authenticateOptional(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const token = header.slice(7).trim();
      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (user && user.active) {
        req.user = { id: user.id, role: user.role };
      }
    }
  } catch {
    // Ignore invalid tokens for optional auth; treat as anonymous.
  }
  next();
}
