import express from 'express';
import { 
  getPersonalizedRecommendations, 
  getBaselineRecommendations, 
  compareRecommendations,
  configureWeights 
} from '../controllers/recommendationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Benchmark & Comparative Endpoints (open for research demonstration)
router.get('/baseline', getBaselineRecommendations);
router.get('/compare', compareRecommendations);

// 2. Authenticated Endpoints
router.get('/personalized', protect, getPersonalizedRecommendations);
router.put('/weights', protect, configureWeights);

export default router;
