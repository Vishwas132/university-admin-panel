import jwt from 'jsonwebtoken';
import { IAdmin } from '../models/Admin';

export const generateToken = (admin: IAdmin): string => {
  return jwt.sign(
    { 
      id: admin._id,
      email: admin.email 
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  );
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET!);
}; 