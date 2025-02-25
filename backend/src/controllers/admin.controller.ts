import { Request, Response, NextFunction } from 'express';
import Admin from '../models/Admin.js';
import { NotFoundError, ConflictError, AuthenticationError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { UpdateProfileInput } from '../schemas/admin.schema.js';

export const getProfile = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    logger.info('Fetching admin profile', { adminId: req.user.id });

    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    logger.debug('Admin profile retrieved successfully', { adminId: admin._id });
    res.json(admin);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request<{}, {}, UpdateProfileInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Processing admin profile update', { adminId: req.user.id });

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    const { name, email } = req.body;

    // Check if email is being changed and if it's already in use
    if (email && email !== admin.email) {
      logger.debug('Checking email availability', { email });
      const emailExists = await Admin.findOne({ email });
      if (emailExists) {
        throw new ConflictError('Email already in use');
      }
    }

    admin.name = name || admin.name;
    admin.email = email || admin.email;

    const updatedAdmin = await admin.save();
    logger.info('Admin profile updated successfully', { adminId: admin._id });

    res.json({
      _id: updatedAdmin._id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      lastLogin: updatedAdmin.lastLogin
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Processing admin password change', { adminId: req.user.id });

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    logger.info('Admin password changed successfully', { adminId: admin._id });
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const uploadProfilePicture = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Processing admin profile picture upload', { adminId: req.user.id });

    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    // Update profile picture
    admin.profilePicture = req.file.buffer;
    await admin.save();

    logger.info('Admin profile picture updated successfully', { 
      adminId: admin._id,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

    res.json({ 
      message: 'Profile picture updated successfully',
      profilePicture: {
        contentType: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProfilePicture = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    logger.info('Fetching admin profile picture', { adminId: req.user.id });

    const admin = await Admin.findById(req.user.id);
    if (!admin || !admin.profilePicture) {
      throw new NotFoundError('Profile picture not found');
    }

    logger.debug('Admin profile picture retrieved successfully', { adminId: admin._id });
    res.set('Content-Type', 'image/jpeg');
    res.send(admin.profilePicture);
  } catch (error) {
    next(error);
  }
}; 