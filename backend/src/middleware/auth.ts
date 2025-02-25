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
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Middleware to restrict access to admin only
export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Access denied. Admin only.' });
    return;
  }
  next();
};

// Middleware to restrict access to students only
export const studentOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'student') {
    res.status(403).json({ message: 'Access denied. Student only.' });
    return;
  }
  next();
}; 