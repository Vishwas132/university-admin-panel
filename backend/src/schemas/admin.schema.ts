import { z } from 'zod';
import { Multer } from 'multer';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name is too long')
      .optional(),
    email: z.string()
      .email('Invalid email format')
      .optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string()
      .min(1, 'Current password is required'),
    newPassword: z.string()
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password is too long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
  }),
});

export const uploadProfilePictureSchema = z.object({
  body: z.object({}).optional(),
  file: z.custom<Express.Multer.File>((file) => file !== null)
    .refine((file) => file !== undefined, {
      message: "Profile picture is required"
    })
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type UploadProfilePictureInput = z.infer<typeof uploadProfilePictureSchema>; 