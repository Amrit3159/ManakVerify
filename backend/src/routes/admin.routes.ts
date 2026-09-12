import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { DashboardController } from '../controllers/dashboard.controller';
import { BusinessController } from '../controllers/business.controller';
import { ApplicationController } from '../controllers/application.controller';
import { InstrumentController } from '../controllers/instrument.controller';
import { InspectionController } from '../controllers/inspection.controller';
import { CertificateController } from '../controllers/certificate.controller';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/dashboard', DashboardController.getStats);
router.get('/businesses', BusinessController.getAll);
router.get('/applications', ApplicationController.getAll);
router.get('/instruments', InstrumentController.getAll);
router.get('/inspections', InspectionController.getAll);
router.get('/certificates', CertificateController.getAll);

export default router;
