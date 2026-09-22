import multer from 'multer';
import { ALLOWED_IMAGE_TYPES } from '../services/storage.service';
import { HttpError } from '../utils/HttpError';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new HttpError(415, 'Unsupported image type', 'UNSUPPORTED_MEDIA_TYPE'));
    }
  },
});
