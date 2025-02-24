import { Request, Response } from 'express';
import Admin from '../models/Admin.js';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }
    res.json(admin);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    const { name, email } = req.body;

    // Check if email is being changed and if it's already in use
    if (email && email !== admin.email) {
      const emailExists = await Admin.findOne({ email });
      if (emailExists) {
        res.status(400).json({ message: 'Email already in use' });
        return;
      }
    }

    admin.name = name || admin.name;
    admin.email = email || admin.email;

    const updatedAdmin = await admin.save();

    res.json({
      _id: updatedAdmin._id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      lastLogin: updatedAdmin.lastLogin
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (
  req: Request,
  res: Response
) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadProfilePicture = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    // Update profile picture
    admin.profilePicture = req.file.buffer;
    await admin.save();

    res.json({ 
      message: 'Profile picture updated successfully',
      profilePicture: {
        contentType: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Add method to get profile picture
export const getProfilePicture = async (req: Request, res: Response) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin || !admin.profilePicture) {
      res.status(404).json({ message: 'Profile picture not found' });
      return;
    }

    res.set('Content-Type', 'image/jpeg');
    res.send(admin.profilePicture);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}; 