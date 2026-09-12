import { Router } from 'express';
import { InstrumentController } from '../controllers/instrument.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createInstrumentSchema, updateInstrumentSchema } from '../validators/instrument.validator';

const router = Router();

router.use(authenticate);

router.get('/', InstrumentController.getAll);
router.get('/:id', InstrumentController.getById);
router.post('/', validateBody(createInstrumentSchema), InstrumentController.create);
router.put('/:id', validateBody(updateInstrumentSchema), InstrumentController.update);

export default router;
