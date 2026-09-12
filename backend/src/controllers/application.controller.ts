import { Response, NextFunction } from 'express';
import { ApplicationService } from '../services/application.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class ApplicationController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const applications = await ApplicationService.getApplications(req.user!, req.query);
      return sendSuccess(res, applications);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const application = await ApplicationService.getApplicationById(req.params.id, req.user!);
      return sendSuccess(res, application);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const application = await ApplicationService.createApplication(req.body, req.user!);
      return sendSuccess(res, application, 'Application created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async assignInspector(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { inspectorId, scheduledDate } = req.body;
      const result = await ApplicationService.assignInspectorAndSchedule(
        req.params.id,
        inspectorId,
        scheduledDate,
        req.user!
      );
      return sendSuccess(res, result, 'Inspector assigned and inspection scheduled successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, remarks } = req.body;
      const updated = await ApplicationService.updateStatus(req.params.id, status, remarks, req.user!);
      return sendSuccess(res, updated, 'Application status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
