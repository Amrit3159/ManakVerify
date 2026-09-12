import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', CertificateController.getAll);
router.get('/:id', CertificateController.getById);

export default router;
