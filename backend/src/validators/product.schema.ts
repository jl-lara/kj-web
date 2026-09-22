import { z } from 'zod';
import { booleanQuerySchema, nullableUrlSchema, paginationSchema, uuidSchema } from './common';

const priceSchema = z
  .union([z.number(), z.string()])
  .transform((v) => Number(v))
  .pipe(z.number().min(0, 'Price must be >= 0'));

export const listProductsQuerySchema = paginationSchema.extend({
  active: booleanQuerySchema.optional(),
  categoryId: uuidSchema.optional(),
  search: z.string().trim().optional(),
  sort: z.enum(['name', 'price', 'displayOrder', 'createdAt']).default('name'),
});

export const createProductSchema = z.object({
  categoryId: uuidSchema,
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional().nullable(),
  price: priceSchema,
  imageUrl: nullableUrlSchema,
  displayOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

export const updateProductSchema = z.object({
  categoryId: uuidSchema.optional(),
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  price: priceSchema.optional(),
  imageUrl: nullableUrlSchema,
  displayOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});
