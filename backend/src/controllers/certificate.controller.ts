import { Request, Response, NextFunction } from 'express';
import { CertificateService } from '../services/certificate.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class CertificateController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const certificates = await CertificateService.getCertificates(req.user!, req.query);
      return sendSuccess(res, certificates);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const certificate = await CertificateService.getCertificateById(req.params.id, req.user!);
      return sendSuccess(res, certificate);
    } catch (error) {
      next(error);
    }
  }

  // Public verification endpoint
  static async verifyPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const identifier =
        (req.query.cert as string) ||
        (req.params as any)[0] ||
        req.params.identifier ||
        '';

      if (!identifier) {
        return res.status(400).json({
          success: false,
          message: 'Certificate identifier is required',
          errors: [],
        });
      }

      const result = await CertificateService.verifyPublicCertificate(identifier);
      return sendSuccess(res, result, 'Certificate verification details retrieved');
    } catch (error) {
      next(error);
    }
  }
}
