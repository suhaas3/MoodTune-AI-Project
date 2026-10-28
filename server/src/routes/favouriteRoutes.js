import express from 'express';
import { 
  getFavourites, 
  addFavourite, 
  removeFavourite, 
  checkIsFavourite 
} from '../controllers/favouriteController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validatorMiddleware.js';

const router = express.Router();

// All favourite routes require authentication
router.use(protect);

router.get('/', getFavourites);
router.post('/:songId', validateObjectId('songId'), addFavourite);
router.delete('/:songId', validateObjectId('songId'), removeFavourite);
router.get('/check/:songId', validateObjectId('songId'), checkIsFavourite);

export default router;
