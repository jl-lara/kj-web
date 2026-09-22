import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const createUserSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().transform((v) => v.toLowerCase()),
  password: z.string().min(8).max(72),
  role: z.nativeEnum(UserRole).default(UserRole.EDITOR),
  active: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().transform((v) => v.toLowerCase()).optional(),
  password: z.string().min(8).max(72).optional(),
  role: z.nativeEnum(UserRole).optional(),
  active: z.boolean().optional(),
});
