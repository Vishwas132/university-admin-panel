import { z } from 'zod';

const phoneRegex = /^\+?[\d\s-]{8,}$/;

export const createStudentSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name is too long'),
    email: z.string()
      .email('Invalid email format'),
    phoneNumber: z.string()
      .regex(phoneRegex, 'Invalid phone number format'),
    qualifications: z.array(z.string())
      .min(1, 'At least one qualification is required'),
    gender: z.enum(['male', 'female', 'other']),
    password: z.string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password is too long')
  })
});

export const updateStudentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Student ID is required')
  }),
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name is too long')
      .optional(),
    email: z.string()
      .email('Invalid email format')
      .optional(),
    phoneNumber: z.string()
      .regex(phoneRegex, 'Invalid phone number format')
      .optional(),
    qualifications: z.array(z.string())
      .min(1, 'At least one qualification is required')
      .optional(),
    gender: z.enum(['male', 'female', 'other'])
      .optional(),
    password: z.string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password is too long')
      .optional()
  })
});

export const uploadProfileImageSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Student ID is required')
  }),
  body: z.object({}).optional(),
  file: z.custom<Express.Multer.File>((file) => file !== null)
    .refine((file) => file !== undefined, {
      message: "Profile image is required"
    })
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>['body'];
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>['body'];
export type UploadProfileImageInput = z.infer<typeof uploadProfileImageSchema>; 