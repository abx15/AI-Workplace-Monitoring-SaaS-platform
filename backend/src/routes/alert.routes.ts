import { Router } from 'express';
import { 
  getAlerts, 
  resolveAlert, 
  getAlertStats 
} from '../controllers/alert.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getAlerts);
router.get('/stats', getAlertStats);
router.put('/:id/resolve', resolveAlert);

export default router;
