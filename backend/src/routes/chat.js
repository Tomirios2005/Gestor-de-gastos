import authMiddleware from '../middleware/auth.js'
import handleMessage from '../controllers/chatController.js'
import express from 'express'
const router = express.Router();

router.post('/',authMiddleware, handleMessage)
export default router;