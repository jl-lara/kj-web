import { NextFunction, Request, Response } from 'express';
import prisma from '../config/prisma';
import { HttpError } from '../utils/HttpError';
import { verifyAccessToken } from '../utils/jwt';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new HttpError(401, 'Authentication required', 'UNAUTHORIZED');
    }
    const token = header.slice(7).trim();
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.active) {
      throw new HttpError(401, 'Authentication required', 'UNAUTHORIZED');
    }
    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    if (err instanceof HttpError) {
      next(err);
      return;
    }
    next(new HttpError(401, 'Invalid or expired token', 'UNAUTHORIZED'));
  }
}
