import { NextFunction, Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { HttpError } from '../utils/HttpError';

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new HttpError(401, 'Authentication required', 'UNAUTHORIZED'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new HttpError(403, 'Forbidden', 'FORBIDDEN'));
      return;
    }
    next();
  };
}
