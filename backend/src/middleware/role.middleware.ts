import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

// Role-based access control
export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const user = await User.findById(req.user.userId);
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error: any) {
      console.error('Role middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

// Require admin role
export const requireAdmin = requireRole(['admin']);

// Require manager or admin role
export const requireManager = requireRole(['manager', 'admin']);

// Require supervisor, manager, or admin role
export const requireSupervisor = requireRole(['supervisor', 'manager', 'admin']);
