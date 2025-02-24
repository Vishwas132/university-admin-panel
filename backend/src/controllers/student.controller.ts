import { Request, Response } from 'express';
import Student from '../models/Student.js';
import { CreateStudentInput, UpdateStudentInput } from '../schemas/student.schema.js';

export const createStudent = async (
  req: Request<{}, {}, CreateStudentInput>,
  res: Response
) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
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
    const student = await Student.findById(req.params.id)
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
    const student = await Student.findById(req.params.id);
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

    Object.assign(student, req.body);
    await student.save();

    res.json(student);
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

    const student = await Student.findById(req.params.id);
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
    const student = await Student.findById(req.params.id)
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