import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { registerSchema, loginSchema, demoLoginSchema } from '../validators/auth.validator';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/sync', AuthController.sync);
router.post('/register', validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/demo-login', validateBody(demoLoginSchema), AuthController.demoLogin);
router.get('/me', authenticate, AuthController.getMe);
router.post('/logout', authenticate, AuthController.logout);

export default router;
