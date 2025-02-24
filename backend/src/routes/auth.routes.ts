import express from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { 
  registerSchema,
  loginSchema,
  forgotPasswordSchema, 
  resetPasswordSchema 
} from '../schemas/auth.schema';

const router = express.Router();

router.post(
  '/admin/register',
  validate(registerSchema),
  register
);

router.post(
  '/admin/login',
  validate(loginSchema),
  login
);

router.post(
  '/forgot-password', 
  validate(forgotPasswordSchema), 
  forgotPassword
);

router.put(
  '/reset-password', 
  validate(resetPasswordSchema), 
  resetPassword
);

export default router; 