import { Request, Response } from 'express';
import { LicenseService } from '../services/licenseService';
import { LicenseTier, LicenseCreateRequest, LicenseUpgradeRequest } from '../types/license';

interface AuthenticatedRequest extends Request {
  user?: { userId: string; companyId: string; email: string };
}

export class LicenseController {
  private licenseService: LicenseService;

  constructor() {
    this.licenseService = new LicenseService();
  }

  createLicense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { userId, tier, duration }: LicenseCreateRequest = req.body;

      if (!userId || !tier || !duration) {
        res.status(400).json({ 
          error: 'Missing required fields: userId, tier, duration' 
        });
        return;
      }

      if (!Object.values(LicenseTier).includes(tier)) {
        res.status(400).json({ 
          error: 'Invalid license tier',
          validTiers: Object.values(LicenseTier)
        });
        return;
      }

      const license = await this.licenseService.createLicense(userId, tier, duration);
      
      res.status(201).json({
        success: true,
        license,
        message: 'License created successfully'
      });
    } catch (error) {
      console.error('Create license error:', error);
      res.status(500).json({ 
        error: 'Failed to create license',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  getLicense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId || req.params.userId;
      
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const license = await this.licenseService.getLicenseByUserId(userId);
      
      if (!license) {
        res.status(404).json({ error: 'License not found' });
        return;
      }

      res.json({
        success: true,
        license
      });
    } catch (error) {
      console.error('Get license error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve license',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  validateLicense = async (req: Request, res: Response): Promise<void> => {
    try {
      const { apiKey, feature, cameraCount } = req.body;

      if (!apiKey) {
        res.status(400).json({ error: 'API key is required' });
        return;
      }

      const license = await this.licenseService.validateLicense(apiKey);
      
      if (!license) {
        res.status(401).json({ 
          valid: false,
          error: 'Invalid or expired license'
        });
        return;
      }

      // Check feature access if specified
      if (feature) {
        const hasFeature = await this.licenseService.hasFeatureAccess(license.userId, feature);
        if (!hasFeature) {
          res.status(403).json({
            valid: false,
            error: `Feature '${feature}' not available in your license tier`,
            license: {
              tier: license.tier,
              features: license.features
            }
          });
          return;
        }
      }

      // Check camera limit if specified
      if (cameraCount) {
        const withinLimit = await this.licenseService.checkCameraLimit(license.userId, cameraCount);
        if (!withinLimit) {
          res.status(403).json({
            valid: false,
            error: 'Camera limit exceeded',
            license: {
              currentCameras: cameraCount,
              maxCameras: license.maxCameras,
              tier: license.tier
            }
          });
          return;
        }
      }

      res.json({
        valid: true,
        license: {
          id: license.id,
          tier: license.tier,
          status: license.status,
          maxCameras: license.maxCameras,
          features: license.features,
          endDate: license.endDate,
          daysRemaining: Math.ceil((license.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        }
      });
    } catch (error) {
      console.error('Validate license error:', error);
      res.status(500).json({ 
        error: 'License validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  upgradeLicense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { licenseId, newTier }: LicenseUpgradeRequest = req.body;

      if (!licenseId || !newTier) {
        res.status(400).json({ 
          error: 'Missing required fields: licenseId, newTier' 
        });
        return;
      }

      if (!Object.values(LicenseTier).includes(newTier)) {
        res.status(400).json({ 
          error: 'Invalid license tier',
          validTiers: Object.values(LicenseTier)
        });
        return;
      }

      const license = await this.licenseService.upgradeLicense(licenseId, newTier);
      
      res.json({
        success: true,
        license,
        message: 'License upgraded successfully'
      });
    } catch (error) {
      console.error('Upgrade license error:', error);
      res.status(500).json({ 
        error: 'Failed to upgrade license',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  deactivateLicense = async (req: Request, res: Response): Promise<void> => {
    try {
      const { licenseId } = req.params;

      if (!licenseId) {
        res.status(400).json({ error: 'License ID is required' });
        return;
      }

      await this.licenseService.deactivateLicense(licenseId);
      
      res.json({
        success: true,
        message: 'License deactivated successfully'
      });
    } catch (error) {
      console.error('Deactivate license error:', error);
      res.status(500).json({ 
        error: 'Failed to deactivate license',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  checkFeatureAccess = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { feature } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!feature) {
        res.status(400).json({ error: 'Feature name is required' });
        return;
      }

      const hasAccess = await this.licenseService.hasFeatureAccess(userId, feature);
      
      res.json({
        success: true,
        hasAccess,
        feature
      });
    } catch (error) {
      console.error('Check feature access error:', error);
      res.status(500).json({ 
        error: 'Failed to check feature access',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  checkCameraLimit = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { cameraCount } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!cameraCount || cameraCount <= 0) {
        res.status(400).json({ error: 'Valid camera count is required' });
        return;
      }

      const withinLimit = await this.licenseService.checkCameraLimit(userId, cameraCount);
      
      res.json({
        success: true,
        withinLimit,
        requestedCameras: cameraCount
      });
    } catch (error) {
      console.error('Check camera limit error:', error);
      res.status(500).json({ 
        error: 'Failed to check camera limit',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
