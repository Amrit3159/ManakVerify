import { Response, NextFunction } from 'express';
import { InstrumentService } from '../services/instrument.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class InstrumentController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const instruments = await InstrumentService.getInstruments(
        req.user!,
        req.query.businessId as string | undefined
      );
      return sendSuccess(res, instruments);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const instrument = await InstrumentService.getInstrumentById(req.params.id, req.user!);
      return sendSuccess(res, instrument);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const created = await InstrumentService.createInstrument(req.body, req.user!);
      return sendSuccess(res, created, 'Instrument registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await InstrumentService.updateInstrument(req.params.id, req.body, req.user!);
      return sendSuccess(res, updated, 'Instrument updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
