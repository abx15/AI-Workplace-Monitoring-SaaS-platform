import { Router } from 'express';
import { 
  getAlerts, 
  getAlertById, 
  createAlert, 
  resolveAlert, 
  getAlertStats, 
  getEmployeeAlerts 
} from '../controllers/alert.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireSupervisor } from '../middleware/role.middleware';
import { validateObjectId, validatePagination } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/alerts - Get all alerts for company
router.get('/', validatePagination, getAlerts);

// GET /api/alerts/stats - Get alert statistics
router.get('/stats', getAlertStats);

// GET /api/alerts/employee/:employeeId - Get alerts for specific employee
router.get('/employee/:employeeId', validateObjectId('employeeId'), validatePagination, getEmployeeAlerts);

// GET /api/alerts/:id - Get alert by ID
router.get('/:id', validateObjectId('id'), getAlertById);

// POST /api/alerts - Create new alert
router.post('/', requireSupervisor, createAlert);

// PUT /api/alerts/:id/resolve - Resolve alert
router.put('/:id/resolve', validateObjectId('id'), requireSupervisor, resolveAlert);

export default router;
