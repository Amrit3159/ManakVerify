import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class NotificationController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const notifications = await NotificationService.getUserNotifications(req.user!);
      return sendSuccess(res, notifications);
    } catch (error) {
      next(error);
    }
  }

  static async markRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await NotificationService.markAsRead(req.params.id, req.user!);
      return sendSuccess(res, updated, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  static async markAllRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAllAsRead(req.user!);
      return sendSuccess(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}
