import { Router } from 'express';
import { 
  getOperators, 
  addOperator, 
  updateOperator, 
  deleteOperator 
} from '../controllers/operator.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.use(authMiddleware);
router.use(requireAdmin);

router.get('/', getOperators);
router.post('/', addOperator);
router.put('/:id', updateOperator);
router.delete('/:id', deleteOperator);

export default router;
