import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error(error, {
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: error.errors,
    });
    return;
  }

  // Handle known operational errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
    return;
  }

  // Handle mongoose validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: error.message,
    });
    return;
  }

  // Handle mongoose duplicate key errors
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    res.status(409).json({
      status: 'error',
      message: 'Duplicate entry found',
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token',
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      status: 'error',
      message: 'Token expired',
    });
    return;
  }

  // Handle all other errors
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
  });
}; 