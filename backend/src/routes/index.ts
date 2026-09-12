import { Router } from 'express';
import authRoutes from './auth.routes';
import businessRoutes from './business.routes';
import instrumentRoutes from './instrument.routes';
import applicationRoutes from './application.routes';
import inspectionRoutes from './inspection.routes';
import certificateRoutes from './certificate.routes';
import notificationRoutes from './notification.routes';
import dashboardRoutes from './dashboard.routes';
import publicRoutes from './public.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/business', businessRoutes);
router.use('/instruments', instrumentRoutes);
router.use('/applications', applicationRoutes);
router.use('/inspections', inspectionRoutes);
router.use('/certificates', certificateRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/public', publicRoutes);
router.use('/admin', adminRoutes);

export default router;
