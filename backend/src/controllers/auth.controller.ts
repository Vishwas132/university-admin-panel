import { Request, Response } from 'express';
import Admin, { IAdmin } from '../models/Admin.js';
import Student, { IStudent } from '../models/Student.js';
import { generateToken } from '../utils/jwt.js';
import { sendPasswordResetEmail } from '../utils/email.js';
import crypto from 'crypto';
import { ForgotPasswordInput, ResetPasswordInput, RegisterInput, LoginInput, StudentLoginInput } from '../schemas/auth.schema.js';

export const register = async (req: Request<{}, {}, RegisterInput>, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      res.status(400).json({ message: 'Admin already exists' });
      return;
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      password
    });

    const token = generateToken(admin);

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request<{}, {}, LoginInput>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin);

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req: Request<{}, {}, ForgotPasswordInput>, res: Response) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    // Generate reset token
    const resetToken = await admin.generateResetToken();
    
    // Send reset email
    await sendPasswordResetEmail(email, resetToken);

    res.json({ 
      message: 'Password reset instructions sent to email',
      // Don't send the token in production
      debug: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request<{}, {}, ResetPasswordInput>, res: Response) => {
  try {
    const { token, password } = req.body;

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
      res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
      return;
    }

    // Update password and clear reset token fields
    admin.password = password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.json({ message: 'Password reset successful' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const studentLogin = async (req: Request<{}, {}, StudentLoginInput>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find student with password field
    const student = await Student.findOne({ email }).select('+password');
    if (!student) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(student);

    res.json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: 'student',
      token
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}; 