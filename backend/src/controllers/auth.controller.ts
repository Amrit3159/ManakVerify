import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { verifyFirebaseToken } from '../lib/firebaseAdmin';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  static async sync(req: Request, res: Response, next: NextFunction) {
    try {
      let decoded: any = null;
      const authHeader = req.headers.authorization;
      let token = '';
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (req.body.idToken) {
        token = req.body.idToken;
      }

      if (token) {
        decoded = await verifyFirebaseToken(token);
      } else if (process.env.NODE_ENV === 'test' && req.body.firebaseUid) {
        decoded = {
          uid: req.body.firebaseUid,
          email: req.body.email || '',
          name: req.body.name || undefined,
          emailVerified: true,
        };
      }

      if (!decoded || !decoded.uid) {
        return res.status(401).json({
          success: false,
          message: 'Firebase ID token required in Authorization header or body',
          errors: [],
        });
      }

      const user = await AuthService.syncFirebaseUser(decoded, req.body);
      return sendSuccess(res, user, 'User profile synchronized successfully');
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return sendSuccess(res, result, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async demoLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      const result = await AuthService.demoLogin(userId);
      return sendSuccess(res, result, 'Demo login successful');
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user!.id);
      return sendSuccess(res, user, 'Current user profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response) {
    return sendSuccess(res, null, 'Logged out successfully');
  }
}
