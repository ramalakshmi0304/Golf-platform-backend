import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import * as userController from '../controllers/user.controller.js'

const router = express.Router();

/**
 * @route   GET /api/user/profile
 * @desc    Get current user profile from Supabase
 * @access  Private
 */
router.get('/profile', protect(), userController.getProfile);

/**
 * @route   PATCH /api/user/update-profile
 * @desc    Update user details (Name, Charity Preference)
 * @access  Private
 */
router.patch('/update-profile', protect(), userController.updateProfile);

export default router;