import express from 'express';
import {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  uploadProfileImage,
  getProfileImage
} from '../controllers/student.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import {
  createStudentSchema,
  updateStudentSchema,
  uploadProfileImageSchema
} from '../schemas/student.schema.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Student CRUD routes
router.post(
  '/',
  validate(createStudentSchema),
  createStudent
);

router.get('/', getStudents);

router.get('/:id', getStudent);

router.put(
  '/:id',
  validate(updateStudentSchema),
  updateStudent
);

router.delete('/:id', deleteStudent);

// Profile image routes
router.post(
  '/:id/profile-image',
  upload.single('profileImage'),
  validate(uploadProfileImageSchema),
  uploadProfileImage
);

router.get('/:id/profile-image', getProfileImage);

export default router; 