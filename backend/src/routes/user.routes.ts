import { Router } from 'express';
import { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  getUsersByDepartment, 
  searchUsers 
} from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireManager } from '../middleware/role.middleware';
import { validateObjectId, validatePagination } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/users - Get all users for company
router.get('/', validatePagination, getUsers);

// GET /api/users/search - Search users
router.get('/search', searchUsers);

// GET /api/users/department/:department - Get users by department
router.get('/department/:department', getUsersByDepartment);

// GET /api/users/:id - Get user by ID
router.get('/:id', validateObjectId('id'), getUserById);

// PUT /api/users/:id - Update user
router.put('/:id', validateObjectId('id'), requireManager, updateUser);

// DELETE /api/users/:id - Delete user (soft delete)
router.delete('/:id', validateObjectId('id'), requireManager, deleteUser);

export default router;
