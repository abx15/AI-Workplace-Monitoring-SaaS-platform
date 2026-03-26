import { Router } from 'express';
import { 
  createOrder, 
  verifyPayment, 
  getStatus 
} from '../controllers/subscription.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/status', getStatus);
router.post('/create-order', requireAdmin, createOrder);
router.post('/verify-payment', requireAdmin, verifyPayment);

export default router;
