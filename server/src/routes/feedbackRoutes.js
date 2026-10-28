import express from 'express';
import { recordFeedback, getFeedbackStats } from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateFeedback } from '../middleware/validatorMiddleware.js';

const router = express.Router();

// All feedback telemetry routes require authentication
router.use(protect);

router.post('/', validateFeedback, recordFeedback);
router.get('/stats', getFeedbackStats);

export default router;
