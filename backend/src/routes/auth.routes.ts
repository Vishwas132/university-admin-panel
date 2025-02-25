import express from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  studentLogin
} from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { 
  registerSchema,
  loginSchema,
  forgotPasswordSchema, 
  resetPasswordSchema,
  studentLoginSchema
} from '../schemas/auth.schema.js';

const router = express.Router();

// Admin routes
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

// Student routes
router.post(
  '/student/login',
  validate(studentLoginSchema),
  studentLogin
);

// Password reset routes
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