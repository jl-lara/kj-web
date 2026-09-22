import { ALLOWED_IMAGE_TYPES, storageService } from './storage.service';
import { HttpError } from '../utils/HttpError';

export interface UploadedImage {
  key: string;
  url: string;
  mimeType: string;
  size: number;
}

export function detectImageType(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

export const uploadService = {
  async storeImage(buffer: Buffer, declaredMime: string): Promise<UploadedImage> {
    if (!ALLOWED_IMAGE_TYPES[declaredMime]) {
      throw new HttpError(415, 'Unsupported image type', 'UNSUPPORTED_MEDIA_TYPE');
    }
    const detected = detectImageType(buffer);
    if (!detected) {
      throw new HttpError(415, 'File content is not a valid image', 'INVALID_IMAGE');
    }
    const stored = await storageService.upload(buffer, detected);
    return { key: stored.key, url: stored.url, mimeType: detected, size: buffer.length };
  },
};
