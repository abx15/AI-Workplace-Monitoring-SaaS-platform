import { Router } from 'express';
import { 
  getAILogs, 
  getDetectionEvents, 
  getStatsOverview 
} from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/logs', getAILogs);
router.get('/events', getDetectionEvents);
router.get('/overview', getStatsOverview);

export default router;
