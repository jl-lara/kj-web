import { z } from 'zod';
import { booleanQuerySchema, paginationSchema } from './common';

const categoryName = z.string().trim().min(2, 'Name must be at least 2 characters').max(120);

export const listCategoriesQuerySchema = paginationSchema.extend({
  active: booleanQuerySchema.optional(),
  sort: z.enum(['name', 'displayOrder', 'createdAt']).default('name'),
});

export const createCategorySchema = z.object({
  name: categoryName,
  description: z.string().trim().max(500).optional().nullable(),
  displayOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

export const updateCategorySchema = z.object({
  name: categoryName.optional(),
  description: z.string().trim().max(500).optional().nullable(),
  displayOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});
