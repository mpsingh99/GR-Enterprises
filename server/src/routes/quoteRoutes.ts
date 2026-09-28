import { Router } from 'express';
import {
  createQuote,
  getQuotes,
  updateQuote,
} from '../controllers/quoteController.js';

const router = Router();

router.post('/', createQuote);
router.get('/', getQuotes);
router.patch('/:id', updateQuote);

export default router;
