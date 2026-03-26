import { Router } from 'express';
import { 
  getEmployees, 
  addEmployee, 
  updateEmployee, 
  deleteEmployee 
} from '../controllers/employee.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { uploadSingle } from '../middleware/upload.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getEmployees);
router.post('/', requireAdmin, uploadSingle, addEmployee);
router.put('/:id', requireAdmin, uploadSingle, updateEmployee);
router.delete('/:id', requireAdmin, deleteEmployee);

export default router;
