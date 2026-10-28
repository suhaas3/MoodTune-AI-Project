import express from 'express';
import { 
  getListeningHistory, 
  recordListeningHistory, 
  clearListeningHistory 
} from '../controllers/historyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateHistory } from '../middleware/validatorMiddleware.js';

const router = express.Router();

// All history routes require authentication
router.use(protect);

router.get('/', getListeningHistory);
router.post('/', validateHistory, recordListeningHistory);
router.delete('/', clearListeningHistory);

export default router;
