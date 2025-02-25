import { Request, Response, NextFunction } from 'express';
import Admin, { IAdmin } from '../models/Admin.js';
import Student, { IStudent } from '../models/Student.js';
import { generateToken } from '../utils/jwt.js';
import { sendPasswordResetEmail } from '../utils/email.js';
import crypto from 'crypto';
import { ForgotPasswordInput, ResetPasswordInput, RegisterInput, LoginInput, StudentLoginInput } from '../schemas/auth.schema.js';
import { AuthenticationError, ConflictError, NotFoundError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const register = async (
  req: Request<{}, {}, RegisterInput>, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    logger.info('Processing admin registration', { email });

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      throw new ConflictError('Admin already exists');
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      password
    });

    const token = generateToken(admin);
    logger.info('Admin registered successfully', { adminId: admin._id });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, LoginInput>, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    logger.info('Processing admin login attempt', { email });

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin);
    logger.info('Admin logged in successfully', { adminId: admin._id });

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request<{}, {}, ForgotPasswordInput>, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    logger.info('Processing forgot password request', { email });

    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    // Generate reset token
    const resetToken = await admin.generateResetToken();
    
    // Send reset email
    await sendPasswordResetEmail(email, resetToken);
    logger.info('Password reset email sent', { adminId: admin._id });

    res.json({ 
      message: 'Password reset instructions sent to email',
      // Don't send the token in production
      debug: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request<{}, {}, ResetPasswordInput>, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { token, password } = req.body;
    logger.info('Processing password reset request');

    // Hash token to compare with stored hash
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const admin = await Admin.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      throw new AuthenticationError('Invalid or expired reset token');
    }

    // Update password and clear reset token fields
    admin.password = password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    logger.info('Password reset successful', { adminId: admin._id });
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

export const studentLogin = async (
  req: Request<{}, {}, StudentLoginInput>, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    logger.info('Processing student login attempt', { email });

    // Find student with password field
    const student = await Student.findOne({ email }).select('+password');
    if (!student) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid credentials');
    }

    const token = generateToken(student);
    logger.info('Student logged in successfully', { studentId: student._id });

    res.json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: 'student',
      token
    });
  } catch (error) {
    next(error);
  }
}; 