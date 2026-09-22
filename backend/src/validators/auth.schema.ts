import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email().transform((v) => v.toLowerCase()),
  password: z.string().min(1).max(72),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(72),
    newPassword: z.string().min(8).max(72),
    confirmPassword: z.string().min(1).max(72),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
