import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/HttpError';
import { fail } from '../utils/apiResponse';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json(fail(err.message, err.code));
    return;
  }

  console.error(err);
  res.status(500).json(fail('Internal server error', 'INTERNAL_ERROR'));
}
