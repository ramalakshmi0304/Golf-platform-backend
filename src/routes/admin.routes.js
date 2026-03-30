import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import * as drawController from '../controllers/draw.controller.js';
import * as charityController from '../controllers/charity.controller.js';

const router = express.Router();

// 1. Reward Engine / Draw Management
router.post(
  '/draw/simulate', 
  protect(['admin']), 
  drawController.simulateDraw // ✅ Ensure this is exported in draw.controller.js
);

router.post(
  '/draw/execute', 
  protect(['admin']), 
  drawController.finalizeDraw // ✅ Ensure this is exported in draw.controller.js
);

// 2. Charity Partner Management
router.post(
  '/charities', 
  protect(['admin']), 
  charityController.createCharity // ❌ Error likely here if createCharity is undefined
);

router.patch(
  '/charities/:id', 
  protect(['admin']), 
  charityController.updateCharity // ❌ Or error here
);

export default router;