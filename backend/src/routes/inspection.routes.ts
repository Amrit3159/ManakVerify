import { Router } from 'express';
import { InspectionController } from '../controllers/inspection.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { submitInspectionSchema } from '../validators/inspection.validator';

const router = Router();

router.use(authenticate);

router.get('/', InspectionController.getAll);
router.get('/:id', InspectionController.getById);
router.post('/:id/submit', validateBody(submitInspectionSchema), InspectionController.submit);

export default router;
