import { z } from 'zod';

export const updateProfileSchema = z.object({
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  profilePhoto: z.string().url().or(z.string().startsWith('data:image/')).optional().nullable(),
});

export const semesterQuerySchema = z.object({
  semester: z.string().regex(/^\d+$/).transform(Number).optional(),
});
