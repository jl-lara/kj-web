import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/apiResponse';
import { HttpError } from '../utils/HttpError';
import { uploadService } from '../services/upload.service';
import { storageService } from '../services/storage.service';

export const uploadController = {
  uploadImage: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new HttpError(400, 'No image file provided', 'NO_FILE');
    }
    const result = await uploadService.storeImage(req.file.buffer, req.file.mimetype);
    res.status(201).json(ok(result));
  }),

  removeImage: asyncHandler(async (req: Request, res: Response) => {
    const key = req.query.key as string | undefined;
    if (!key) {
      throw new HttpError(400, 'Missing storage key', 'MISSING_STORAGE_KEY');
    }
    await storageService.remove(key);
    res.status(204).send();
  }),
};
