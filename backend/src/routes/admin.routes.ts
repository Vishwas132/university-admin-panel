import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePicture,
  getProfilePicture
} from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import {
  updateProfileSchema,
  changePasswordSchema
} from '../schemas/admin.schema.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/profile', getProfile);
router.put(
  '/profile',
  validate(updateProfileSchema),
  updateProfile
);
router.put(
  '/change-password',
  validate(changePasswordSchema),
  changePassword
);

// Profile picture routes
router.post(
  '/profile/picture',
  upload.single('profilePicture'),
  uploadProfilePicture
);
router.get('/profile/picture', getProfilePicture);

export default router; 