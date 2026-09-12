import { Response, NextFunction } from 'express';
import { InspectionService } from '../services/inspection.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class InspectionController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const inspections = await InspectionService.getInspections(req.user!, req.query);
      return sendSuccess(res, inspections);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const inspection = await InspectionService.getInspectionById(req.params.id, req.user!);
      return sendSuccess(res, inspection);
    } catch (error) {
      next(error);
    }
  }

  static async submit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await InspectionService.submitInspection(req.params.id, req.body, req.user!);
      return sendSuccess(res, result, 'Inspection completed and recorded successfully');
    } catch (error) {
      next(error);
    }
  }
}
