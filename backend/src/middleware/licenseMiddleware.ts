import { Request, Response, NextFunction } from 'express';
import { LicenseService } from '../services/licenseService';
import { LicenseValidationResponse } from '../types/license';

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: string };
  license?: any;
}

export class LicenseMiddleware {
  private licenseService: LicenseService;

  constructor() {
    this.licenseService = new LicenseService();
  }

  validateApiKey = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apiKey = req.headers['x-api-key'] as string;
      
      if (!apiKey) {
        res.status(401).json({ error: 'API key is required' });
        return;
      }

      const license = await this.licenseService.validateLicense(apiKey);
      
      if (!license) {
        res.status(401).json({ error: 'Invalid or expired license' });
        return;
      }

      req.license = license;
      next();
    } catch (error) {
      console.error('License validation error:', error);
      res.status(500).json({ error: 'License validation failed' });
    }
  };

  checkFeatureAccess = (feature: string) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.license) {
          res.status(401).json({ error: 'License not validated' });
          return;
        }

        const userId = req.user?.id || req.license.userId;
        const hasAccess = await this.licenseService.hasFeatureAccess(userId, feature);

        if (!hasAccess) {
          res.status(403).json({ 
            error: `Feature '${feature}' not available in your license tier`,
            currentTier: req.license.tier,
            requiredFeature: feature
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Feature access check error:', error);
        res.status(500).json({ error: 'Feature access validation failed' });
      }
    };
  };

  checkCameraLimit = (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    return this.checkCameraLimitWithCount(req, res, next, () => {
      // Extract camera count from request body or params
      const cameraCount = parseInt(req.body.cameraCount || req.params.cameraCount || '1');
      return cameraCount;
    });
  };

  checkCameraLimitWithCount = (
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction,
    getCount: () => number
  ): Promise<void> => {
    return (async () => {
      try {
        if (!req.license) {
          res.status(401).json({ error: 'License not validated' });
          return;
        }

        const cameraCount = getCount();
        const userId = req.user?.id || req.license.userId;
        const withinLimit = await this.licenseService.checkCameraLimit(userId, cameraCount);

        if (!withinLimit) {
          res.status(403).json({ 
            error: 'Camera limit exceeded',
            currentCameras: cameraCount,
            maxCameras: req.license.maxCameras,
            tier: req.license.tier
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Camera limit check error:', error);
        res.status(500).json({ error: 'Camera limit validation failed' });
      }
    })();
  };

  requireMinimumTier = (minimumTier: string) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      try {
        if (!req.license) {
          res.status(401).json({ error: 'License not validated' });
          return;
        }

        const tierHierarchy = ['STANDARD', 'PROFESSIONAL', 'ENTERPRISE'];
        const currentTierIndex = tierHierarchy.indexOf(req.license.tier);
        const requiredTierIndex = tierHierarchy.indexOf(minimumTier);

        if (currentTierIndex < requiredTierIndex) {
          res.status(403).json({ 
            error: `This feature requires ${minimumTier} tier or higher`,
            currentTier: req.license.tier,
            requiredTier: minimumTier
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Tier validation error:', error);
        res.status(500).json({ error: 'Tier validation failed' });
      }
    };
  };

  // Middleware to check if user has active license (for authenticated routes)
  requireActiveLicense = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const license = await this.licenseService.getLicenseByUserId(req.user.id);
      
      if (!license) {
        res.status(403).json({ error: 'No active license found' });
        return;
      }

      if (license.status !== 'ACTIVE') {
        res.status(403).json({ error: 'License is not active', status: license.status });
        return;
      }

      if (license.endDate < new Date()) {
        res.status(403).json({ error: 'License has expired' });
        return;
      }

      req.license = license;
      next();
    } catch (error) {
      console.error('Active license check error:', error);
      res.status(500).json({ error: 'License validation failed' });
    }
  };
}

export const licenseMiddleware = new LicenseMiddleware();
