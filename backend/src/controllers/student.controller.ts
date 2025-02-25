import { Request, Response } from 'express';
import Student from '../models/Student.js';
import { CreateStudentInput, UpdateStudentInput } from '../schemas/student.schema.js';

export const createStudent = async (
  req: Request<{}, {}, CreateStudentInput>,
  res: Response
) => {
  try {
    const student = await Student.create(req.body);
    
    // Don't return the password in the response
    const { password, ...newStudent } = student.toObject();
    
    res.status(201).json(newStudent);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};

export const getStudents = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const query = search
      ? { $text: { $search: search } }
      : {};

    const students = await Student.find(query)
      .select('-profileImage')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(query);

    res.json({
      students,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudent = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id;
    
    // Check if the user is a student trying to access another student's data
    if (req.user?.role === 'student' && req.user.id !== studentId) {
      res.status(403).json({ message: 'Access denied. You can only view your own profile.' });
      return;
    }
    
    const student = await Student.findById(studentId)
      .select('-profileImage');
    
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    
    res.json(student);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStudent = async (
  req: Request<{ id: string }, {}, UpdateStudentInput>,
  res: Response
) => {
  try {
    const studentId = req.params.id;
    
    // Check if the user is a student trying to update another student's data
    if (req.user?.role === 'student' && req.user.id !== studentId) {
      res.status(403).json({ message: 'Access denied. You can only update your own profile.' });
      return;
    }
    
    const student = await Student.findById(studentId).select('+password');
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // Check if email is being changed and if it's already in use
    if (req.body.email && req.body.email !== student.email) {
      const emailExists = await Student.findOne({ email: req.body.email });
      if (emailExists) {
        res.status(400).json({ message: 'Email already in use' });
        return;
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

    res.json(updatedStudent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadProfileImage = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const studentId = req.params.id;
    
    // Check if the user is a student trying to update another student's profile image
    if (req.user?.role === 'student' && req.user.id !== studentId) {
      res.status(403).json({ message: 'Access denied. You can only update your own profile image.' });
      return;
    }

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // Update profile image
    student.profileImage = req.file.buffer;
    await student.save();

    res.json({ 
      message: 'Profile image updated successfully',
      profileImage: {
        contentType: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfileImage = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id;
    
    // Students can view any profile image, no need for access control here
    
    const student = await Student.findById(studentId)
      .select('profileImage');
    
    if (!student || !student.profileImage) {
      res.status(404).json({ message: 'Profile image not found' });
      return;
    }

    res.set('Content-Type', 'image/jpeg');
    res.send(student.profileImage);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}; 