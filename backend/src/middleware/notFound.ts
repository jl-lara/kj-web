import { Request, Response } from 'express';
import { fail } from '../utils/apiResponse';

export function notFound(_req: Request, res: Response): void {
  res.status(404).json(fail('Route not found', 'NOT_FOUND'));
}
