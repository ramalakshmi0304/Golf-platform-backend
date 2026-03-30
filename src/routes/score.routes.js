import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import * as scoreController from '../controllers/score.controller.js';

const router = express.Router();

/**
 * @route   POST /api/scores/submit
 * @desc    Submit a new score (Rolling 5 logic)
 */
// ✅ Changed to use 'handleScoreSubmit' to match your controller
router.post('/submit', protect(['subscriber', 'admin']), scoreController.handleScoreSubmit);

/**
 * @route   GET /api/scores/my-scores
 */
router.get('/my-scores', protect(['subscriber', 'admin']), scoreController.getMyScores);

/**
 * @route   GET /api/scores/hall-of-fame
 */
router.get('/hall-of-fame', scoreController.getWinners);

export default router;