import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateBody } from '../middleware/validate';
import {
  createApplicationSchema,
  assignInspectorSchema,
  updateApplicationStatusSchema,
} from '../validators/application.validator';

const router = Router();

router.use(authenticate);

router.get('/', ApplicationController.getAll);
router.get('/:id', ApplicationController.getById);
router.post('/', validateBody(createApplicationSchema), ApplicationController.create);
router.post(
  '/:id/assign-inspector',
  requireRole('admin'),
  validateBody(assignInspectorSchema),
  ApplicationController.assignInspector
);
router.patch(
  '/:id/status',
  validateBody(updateApplicationStatusSchema),
  ApplicationController.updateStatus
);

export default router;
