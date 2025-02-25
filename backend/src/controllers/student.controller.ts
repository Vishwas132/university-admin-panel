import { Request, Response, NextFunction } from 'express';
import Student from '../models/Student.js';
import { 
  CreateStudentInput, 
  UpdateStudentInput, 
  UpdateProfileInput,
  PasswordChangeInput 
} from '../schemas/student.schema.js';
import { NotFoundError, ConflictError, AuthorizationError, ValidationError, AuthenticationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const createStudent = async (
  req: Request<{}, {}, CreateStudentInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Creating new student', { email: req.body.email });

    const student = await Student.create(req.body);
    
    // Don't return the password in the response
    const { password, ...newStudent } = student.toObject();
    
    logger.info('Student created successfully', { studentId: student._id });
    res.status(201).json(newStudent);
  } catch (error: any) {
    if (error.code === 11000) {
      next(new ConflictError('Email already exists'));
      return;
    }
    next(error);
  }
};

export const getStudents = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    logger.info('Fetching students list', { page, limit, search });

    const query = search
      ? { $text: { $search: search } }
      : {};

    const students = await Student.find(query)
      .select('-profileImage -password')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(query);

    logger.debug('Students retrieved successfully', { 
      count: students.length, 
      total, 
      page 
    });

    res.json({
      students,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

export const getStudent = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const studentId = req.params.id;
    logger.info('Fetching student details', { studentId });
    
    // Check if the user is a student trying to access another student's data
    if (req.user?.role === 'student' && req.user.id !== studentId) {
      throw new AuthorizationError('Access denied. You can only view your own profile.');
    }
    
    const student = await Student.findById(studentId)
      .select('-profileImage -password');
    
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    
    logger.debug('Student details retrieved successfully', { studentId });
    res.json(student);
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (
  req: Request<{ id: string }, {}, UpdateStudentInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = req.params.id;
    logger.info('Processing student update', { studentId });
    
    // Check if the user is a student trying to update another student's data
    if (req.user?.role === 'student' && req.user.id !== studentId) {
      throw new AuthorizationError('Access denied. You can only update your own profile.');
    }
    
    const student = await Student.findById(studentId).select('+password');
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    // Check if email is being changed and if it's already in use
    if (req.body.email && req.body.email !== student.email) {
      logger.debug('Checking email availability', { email: req.body.email });
      const emailExists = await Student.findOne({ email: req.body.email });
      if (emailExists) {
        throw new ConflictError('Email already in use');
      }
    }

    // Update fields except password
    const { password, ...otherFields } = req.body;
    Object.assign(student, otherFields);
    
    // Only update password if provided
    if (password) {
      student.password = password;
    }
    
    await student.save();

    // Don't return the password in the response
    const { password: _, ...updatedStudent } = student.toObject();

    logger.info('Student updated successfully', { studentId });
    res.json(updatedStudent);
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const studentId = req.params.id;
    logger.info('Processing student deletion', { studentId });

    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    
    logger.info('Student deleted successfully', { studentId });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const uploadProfileImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = req.params.id;
    logger.info('Processing student profile image upload', { studentId });

    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    // Check if the user is a student trying to update another student's profile image
    if (req.user?.role === 'student' && req.user.id !== studentId) {
      throw new AuthorizationError('Access denied. You can only update your own profile image.');
    }

    const student = await Student.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    // Update profile image
    student.profileImage = req.file.buffer;
    await student.save();

    logger.info('Student profile image updated successfully', { 
      studentId,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

    res.json({ 
      message: 'Profile image updated successfully',
      profileImage: {
        contentType: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProfileImage = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const studentId = req.params.id;
    logger.info('Fetching student profile image', { studentId });
    
    const student = await Student.findById(studentId)
      .select('profileImage');
    
    if (!student || !student.profileImage) {
      throw new NotFoundError('Profile image not found');
    }

    logger.debug('Student profile image retrieved successfully', { studentId });
    res.set('Content-Type', 'image/jpeg');
    res.send(student.profileImage);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    logger.info('Fetching student profile', { studentId: req.user.id });

    const student = await Student.findById(req.user.id).select('-password');
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    logger.debug('Student profile retrieved successfully', { studentId: student._id });
    res.json(student);
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
    logger.info('Processing student profile update', { studentId: req.user.id });

    const student = await Student.findById(req.user.id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const { name, email, phoneNumber } = req.body;

    // Check if email is being changed and if it's already in use
    if (email && email !== student.email) {
      logger.debug('Checking email availability', { email });
      const emailExists = await Student.findOne({ email });
      if (emailExists) {
        throw new ConflictError('Email already in use');
      }
    }

    student.name = name || student.name;
    student.email = email || student.email;
    if (phoneNumber) {
      student.phoneNumber = phoneNumber;
    }

    const updatedStudent = await student.save();
    logger.info('Student profile updated successfully', { studentId: student._id });

    res.json({
      _id: updatedStudent._id,
      name: updatedStudent.name,
      email: updatedStudent.email,
      phoneNumber: updatedStudent.phoneNumber,
      qualifications: updatedStudent.qualifications,
      gender: updatedStudent.gender,
      createdAt: updatedStudent.createdAt
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request<{}, {}, PasswordChangeInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Processing student password change', { studentId: req.user.id });

    const student = await Student.findById(req.user.id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await student.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Update password
    student.password = newPassword;
    await student.save();

    logger.info('Student password changed successfully', { studentId: student._id });
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
    logger.info('Processing student profile picture upload', { studentId: req.user.id });

    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    // Update profile picture
    student.profileImage = req.file.buffer;
    await student.save();

    logger.info('Student profile picture updated successfully', { 
      studentId: student._id,
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
    logger.info('Fetching student profile picture', { studentId: req.user.id });

    const student = await Student.findById(req.user.id);
    if (!student || !student.profileImage) {
      throw new NotFoundError('Profile picture not found');
    }

    logger.debug('Student profile picture retrieved successfully', { studentId: student._id });
    res.set('Content-Type', 'image/jpeg');
    res.send(student.profileImage);
  } catch (error) {
    next(error);
  }
};
