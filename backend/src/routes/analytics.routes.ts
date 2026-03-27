import { Router } from 'express';
import { 
  getDashboardAnalytics, 
  getEmployeeProductivity, 
  getCameraAnalytics 
} from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireManager } from '../middleware/role.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/analytics/dashboard - Get dashboard analytics
router.get('/dashboard', getDashboardAnalytics);

// GET /api/analytics/productivity - Get employee productivity analytics
router.get('/productivity', requireManager, getEmployeeProductivity);

// GET /api/analytics/cameras - Get camera analytics
router.get('/cameras', getCameraAnalytics);

export default router;
