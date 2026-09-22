import { z } from 'zod';
import { booleanQuerySchema, paginationSchema } from './common';

export const listGalleryQuerySchema = paginationSchema.extend({
  active: booleanQuerySchema.optional(),
  sort: z.enum(['title', 'displayOrder', 'createdAt']).default('displayOrder'),
});

export const createGallerySchema = z.object({
  imageUrl: z.string().url(),
  title: z.string().trim().max(200).optional().nullable(),
  altText: z.string().trim().max(300).optional().nullable(),
  displayOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

export const updateGallerySchema = z.object({
  imageUrl: z.string().url().optional(),
  title: z.string().trim().max(200).optional().nullable(),
  altText: z.string().trim().max(300).optional().nullable(),
  displayOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});
