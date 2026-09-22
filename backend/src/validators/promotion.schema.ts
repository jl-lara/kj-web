import { z } from 'zod';
import { booleanQuerySchema, nullableUrlSchema, paginationSchema } from './common';

export const listPromotionsQuerySchema = paginationSchema.extend({
  active: booleanQuerySchema.optional(),
  sort: z.enum(['title', 'startsAt', 'createdAt']).default('createdAt'),
});

const basePromotionSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional().nullable(),
  imageUrl: nullableUrlSchema,
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
});

export const createPromotionSchema = basePromotionSchema
  .extend({
    active: z.boolean().default(true),
  })
  .refine((d) => !d.startsAt || !d.endsAt || d.startsAt < d.endsAt, {
    message: 'endsAt must be after startsAt',
    path: ['endsAt'],
  });

export const updatePromotionSchema = basePromotionSchema
  .partial()
  .extend({
    active: z.boolean().optional(),
  })
  .refine((d) => !d.startsAt || !d.endsAt || d.startsAt < d.endsAt, {
    message: 'endsAt must be after startsAt',
    path: ['endsAt'],
  });
