import { Router } from 'express';
import { 
  addCamera, 
  getCameras, 
  updateCamera, 
  deleteCamera, 
  assignCamera 
} from '../controllers/camera.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getCameras);
router.post('/', requireAdmin, addCamera);
router.put('/:id', requireAdmin, updateCamera);
router.delete('/:id', requireAdmin, deleteCamera);
router.post('/:id/assign', requireAdmin, assignCamera);

export default router;
