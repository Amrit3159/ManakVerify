import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class DashboardController {
  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getStats(req.user!);
      return sendSuccess(res, stats, 'Dashboard statistics retrieved');
    } catch (error) {
      next(error);
    }
  }
}
