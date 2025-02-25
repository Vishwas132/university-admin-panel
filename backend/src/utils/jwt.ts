import jwt from 'jsonwebtoken';
import { IAdmin } from '../models/Admin.js';
import { IStudent } from '../models/Student.js';

type UserType = IAdmin | IStudent;

export const generateToken = (user: UserType): string => {
  // Determine if the user is an admin or student
  const isAdmin = 'lastLogin' in user;
  
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: isAdmin ? 'admin' : 'student'
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  );
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET!);
}; 