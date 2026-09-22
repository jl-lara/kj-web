import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { HttpError } from '../utils/HttpError';

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export interface StoredImage {
  key: string;
  url: string;
}

interface StorageDriver {
  upload(buffer: Buffer, mimeType: string): Promise<StoredImage>;
  remove(key: string): Promise<void>;
}

function extensionFor(mimeType: string): string {
  const ext = ALLOWED_IMAGE_TYPES[mimeType];
  if (!ext) {
    throw new HttpError(415, 'Unsupported image type', 'UNSUPPORTED_MEDIA_TYPE');
  }
  return ext;
}

// --- Local filesystem driver (desarrollo) ---

const localDriver: StorageDriver = {
  async upload(buffer, mimeType) {
    const key = `${randomUUID()}.${extensionFor(mimeType)}`;
    await mkdir(env.uploadDir, { recursive: true });
    await writeFile(path.join(env.uploadDir, key), buffer);
    return { key, url: `${env.publicBaseUrl}/uploads/${key}` };
  },
  async remove(key) {
    if (!key) return;
    const safe = path.basename(key);
    if (safe !== key) {
      throw new HttpError(400, 'Invalid storage key', 'INVALID_STORAGE_KEY');
    }
    try {
      await unlink(path.join(env.uploadDir, safe));
    } catch {
      // File already gone; nothing to do.
    }
  },
};

// --- Supabase Storage driver (producción) ---

let supabaseClient: SupabaseClient | null = null;

function supabase(): SupabaseClient {
  if (!supabaseClient) {
    if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
      throw new HttpError(500, 'Storage is not configured', 'STORAGE_NOT_CONFIGURED');
    }
    supabaseClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return supabaseClient;
}

const supabaseDriver: StorageDriver = {
  async upload(buffer, mimeType) {
    const key = `${randomUUID()}.${extensionFor(mimeType)}`;
    const bucket = supabase().storage.from(env.supabaseStorageBucket);
    const { error } = await bucket.upload(key, buffer, { contentType: mimeType, upsert: false });
    if (error) {
      throw new HttpError(500, 'Upload failed', 'UPLOAD_FAILED');
    }
    const { data } = bucket.getPublicUrl(key);
    return { key, url: data.publicUrl };
  },
  async remove(key) {
    if (!key) return;
    const { error } = await supabase().storage.from(env.supabaseStorageBucket).remove([key]);
    if (error) {
      throw new HttpError(500, 'Delete failed', 'DELETE_FAILED');
    }
  },
};

function activeDriver(): StorageDriver {
  return env.storageProvider === 'supabase' ? supabaseDriver : localDriver;
}

function extractKeyFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const key = segments[segments.length - 1];
    if (!key) return null;

    if (url.includes('/uploads/')) return key;

    const bucket = env.supabaseStorageBucket;
    if (bucket && url.includes(`/object/public/${bucket}/`)) return key;

    return null;
  } catch {
    return null;
  }
}

export const storageService = {
  async upload(buffer: Buffer, mimeType: string): Promise<StoredImage> {
    return activeDriver().upload(buffer, mimeType);
  },

  async remove(key: string): Promise<void> {
    if (!key) return;
    await activeDriver().remove(key);
  },

  async removeByUrl(url: string | null | undefined): Promise<void> {
    if (!url) return;
    const key = extractKeyFromUrl(url);
    if (!key) return;
    await activeDriver().remove(key);
  },
};
