import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import multer from 'multer';
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

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json(fail('File too large (max 5 MB)', 'FILE_TOO_LARGE'));
      return;
    }
    res.status(400).json(fail('Upload error', 'UPLOAD_ERROR'));
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        res
          .status(409)
          .json(fail('A record with the same unique value already exists', 'ALREADY_EXISTS'));
        return;
      case 'P2025':
        res.status(404).json(fail('Record not found', 'NOT_FOUND'));
        return;
      case 'P2003':
        res.status(409).json(fail('Related record does not exist', 'FOREIGN_KEY_CONFLICT'));
        return;
      default:
        break;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(422).json(fail('Invalid data', 'INVALID_DATA'));
    return;
  }

  console.error(err);
  res.status(500).json(fail('Internal server error', 'INTERNAL_ERROR'));
}
