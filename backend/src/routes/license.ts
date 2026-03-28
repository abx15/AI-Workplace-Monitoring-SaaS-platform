import { Router } from 'express';
import { LicenseController } from '../controllers/licenseController';
import { licenseMiddleware } from '../middleware/licenseMiddleware';

const router = Router();
const licenseController = new LicenseController();

// Public routes (for API key validation)
router.post('/validate', licenseController.validateLicense);

// Protected routes (require authentication)
router.use(licenseMiddleware.requireActiveLicense);

// License management routes
router.get('/', licenseController.getLicense);
router.post('/', licenseController.createLicense);
router.put('/upgrade', licenseController.upgradeLicense);
router.delete('/:licenseId', licenseController.deactivateLicense);

// Feature and limit checking routes
router.post('/check-feature/:feature', licenseController.checkFeatureAccess);
router.post('/check-camera-limit', licenseController.checkCameraLimit);

export default router;
