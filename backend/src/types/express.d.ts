import { Request } from "express";
import { Multer } from 'multer';

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
        role: 'admin' | 'student';
      };
    }
    interface Multer {
      File: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
}

export {};