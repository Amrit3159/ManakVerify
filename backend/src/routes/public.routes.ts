import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller';

const router = Router();

// Public certificate verification endpoint (NO authentication required)
// Supports both query param `/certificates/verify?cert=...` and path `/certificates/verify/...` (handling slashes)
router.get('/certificates/verify', CertificateController.verifyPublic);
router.get('/certificates/verify/*', CertificateController.verifyPublic);

export default router;
