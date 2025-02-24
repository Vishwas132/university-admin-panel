import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.admin = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
}; 