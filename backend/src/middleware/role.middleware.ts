import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
  next();
};

export const requireOperator = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !['admin', 'operator'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Unauthorized role.',
    });
  }
  next();
};
