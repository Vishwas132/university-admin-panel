import express from 'express';
import {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  uploadProfileImage,
  getProfileImage,
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePicture
} from '../controllers/student.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import {
  createStudentSchema,
  updateStudentSchema,
  uploadProfileImageSchema,
  profileSchema,
  passwordSchema
} from '../schemas/student.schema.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin-only routes
router.post(
  '/',
  adminOnly,
  validate(createStudentSchema),
  createStudent
);

router.get('/', adminOnly, getStudents);

// Student profile specific routes - must be placed before the /:id routes
// to avoid conflicts with the id parameter
router.get('/profile', getProfile);
router.put('/profile', validate(profileSchema), updateProfile);
router.put('/profile/change-password', validate(passwordSchema), changePassword);
router.put(
  '/profile/picture', 
  upload.single('profilePicture'),
  uploadProfilePicture
);
router.get('/profile/picture', getProfileImage);

// Routes accessible by both admin and students
// (Student access is controlled in the controller)
router.get('/:id', getStudent);

router.put(
  '/:id',
  validate(updateStudentSchema),
  updateStudent
);

// Admin-only routes
router.delete('/:id', adminOnly, deleteStudent);

// Profile image routes
router.post(
  '/:id/profile-image',
  upload.single('profileImage'),
  validate(uploadProfileImageSchema),
  uploadProfileImage
);

export default router;
