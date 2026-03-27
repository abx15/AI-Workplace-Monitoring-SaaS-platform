import { Router } from 'express';
import { 
  getCameras, 
  getCameraById, 
  createCamera, 
  updateCamera, 
  deleteCamera, 
  getCamerasByLocation 
} from '../controllers/camera.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireSupervisor } from '../middleware/role.middleware';
import { validateObjectId, validatePagination } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/cameras - Get all cameras for company
router.get('/', validatePagination, getCameras);

// GET /api/cameras/location/:location - Get cameras by location
router.get('/location/:location', getCamerasByLocation);

// GET /api/cameras/:id - Get camera by ID
router.get('/:id', validateObjectId('id'), getCameraById);

// POST /api/cameras - Create new camera
router.post('/', requireSupervisor, createCamera);

// PUT /api/cameras/:id - Update camera
router.put('/:id', validateObjectId('id'), requireSupervisor, updateCamera);

// DELETE /api/cameras/:id - Delete camera (soft delete)
router.delete('/:id', validateObjectId('id'), requireSupervisor, deleteCamera);

export default router;
