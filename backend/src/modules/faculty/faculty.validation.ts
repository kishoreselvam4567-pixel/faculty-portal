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

export const markAttendanceSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  period: z.string().min(1).max(50),
  remarks: z.string().max(255).optional().nullable(),
  records: z.array(
    z.object({
      studentUid: z.string().min(1),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
      remarks: z.string().max(255).optional().nullable(),
    })
  ).min(1, 'At least one student record is required'),
});

