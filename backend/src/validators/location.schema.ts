import { z } from 'zod';
import { booleanQuerySchema, nullableUrlSchema, paginationSchema } from './common';

const latitude = z.number().min(-90).max(90);
const longitude = z.number().min(-180).max(180);

export const listLocationsQuerySchema = paginationSchema.extend({
  active: booleanQuerySchema.optional(),
  sort: z.enum(['name', 'displayOrder', 'createdAt']).default('displayOrder'),
});

export const createLocationSchema = z.object({
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().min(1).max(500),
  phone: z.string().trim().max(40).optional().nullable(),
  schedule: z.string().trim().max(300).optional().nullable(),
  latitude: latitude.optional().nullable(),
  longitude: longitude.optional().nullable(),
  mapsUrl: nullableUrlSchema,
  whatsapp: z.string().trim().max(40).optional().nullable(),
  imageUrl: nullableUrlSchema,
  displayOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

export const updateLocationSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  address: z.string().trim().min(1).max(500).optional(),
  phone: z.string().trim().max(40).optional().nullable(),
  schedule: z.string().trim().max(300).optional().nullable(),
  latitude: latitude.optional().nullable(),
  longitude: longitude.optional().nullable(),
  mapsUrl: nullableUrlSchema,
  whatsapp: z.string().trim().max(40).optional().nullable(),
  imageUrl: nullableUrlSchema,
  displayOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});
