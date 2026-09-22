import { z } from 'zod';

export const uuidSchema = z.string().uuid();

export const idParamsSchema = z.object({ id: uuidSchema });

export const statusBodySchema = z.object({
  active: z.boolean(),
});

export const booleanQuerySchema = z
  .enum(['true', 'false'])
  .transform((v) => v === 'true');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export const nullableUrlSchema = z
  .union([z.string().url(), z.literal('')])
  .nullish()
  .transform((v) => (v === undefined ? undefined : v === '' || v === null ? null : v));

export const optionalNullableString = (max: number) =>
  z.string().trim().max(max).optional().nullable();
