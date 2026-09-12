import { Response, NextFunction } from 'express';
import { BusinessService } from '../services/business.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class BusinessController {
  static async getMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const business = await BusinessService.getMyBusiness(req.user!);
      return sendSuccess(res, business);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const business = await BusinessService.getBusinessById(req.params.id, req.user!);
      return sendSuccess(res, business);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await BusinessService.updateBusiness(req.params.id, req.body, req.user!);
      return sendSuccess(res, updated, 'Business profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businesses = await BusinessService.getAllBusinesses(req.user!);
      return sendSuccess(res, businesses);
    } catch (error) {
      next(error);
    }
  }
}
