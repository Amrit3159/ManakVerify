import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { sendError } from '../utils/response';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
        403
      );
    }

    next();
  };
}
