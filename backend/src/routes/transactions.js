import express from 'express';
import authMiddleware from '../middleware/auth.js'
import { insertData, getData, updateData, deleteData } from '../controllers/transactionsController.js';
const router = express.Router();

router.post('/', authMiddleware, insertData);
router.get('/', authMiddleware, getData);
router.put('/', authMiddleware, updateData);
router.delete('/', authMiddleware, deleteData);
export default router;

