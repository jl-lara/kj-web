import { z } from 'zod';
import { nullableUrlSchema } from './common';

export const updateSettingsSchema = z.object({
  siteName: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  whatsapp: z.string().trim().max(40).optional().nullable(),
  email: z.string().trim().email().max(200).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  facebook: nullableUrlSchema,
  instagram: nullableUrlSchema,
  tiktok: nullableUrlSchema,
  openingHours: z.string().trim().max(500).optional().nullable(),
  logoUrl: nullableUrlSchema,
  faviconUrl: nullableUrlSchema,
});
