import express from 'express';
import { 
  getSongs, 
  getSongById, 
  getSongsByMood, 
  getSongsByGenre,
  getDistinctGenres 
} from '../controllers/songController.js';
import { validateObjectId } from '../middleware/validatorMiddleware.js';

const router = express.Router();

router.get('/', getSongs);
router.get('/genres/list', getDistinctGenres);
router.get('/mood/:mood', getSongsByMood);
router.get('/genre/:genre', getSongsByGenre);
router.get('/:id', validateObjectId('id'), getSongById);

export default router;
