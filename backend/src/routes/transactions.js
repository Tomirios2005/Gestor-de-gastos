import express from 'express';
import authMiddleware from '../middleware/auth.js'
import { insertData, getData } from '../controllers/transactionsController.js';
const router = express.Router();

router.post('/', authMiddleware, insertData);
router.get('/', authMiddleware, getData);
export default router;

