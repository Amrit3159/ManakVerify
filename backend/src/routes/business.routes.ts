import { Router } from 'express';
import { BusinessController } from '../controllers/business.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { updateBusinessSchema } from '../validators/business.validator';

const router = Router();

router.use(authenticate);

router.get('/profile', BusinessController.getMyProfile);
router.get('/:id', BusinessController.getById);
router.put('/:id', validateBody(updateBusinessSchema), BusinessController.update);
router.get('/', BusinessController.getAll);

export default router;
