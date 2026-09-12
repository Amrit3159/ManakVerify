import { Response, NextFunction } from 'express';
import { verifyFirebaseToken } from '../lib/firebaseAdmin';
import { AuthenticatedRequest } from '../types';
import { sendError } from '../utils/response';
import { prisma } from '../lib/prisma';

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').map(c => c.trim());
      const tokenCookie = cookies.find(c => c.startsWith('token='));
      if (tokenCookie) {
        token = tokenCookie.split('=')[1];
      }
    }

    if (!token) {
      return sendError(res, 'Authentication required. No token provided.', 401);
    }

    const decoded = await verifyFirebaseToken(token);
    if (!decoded || !decoded.uid) {
      return sendError(res, 'Invalid or expired authentication token.', 401);
    }

    // Lookup user by firebaseUid, email, or id
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { firebaseUid: decoded.uid },
          ...(decoded.email ? [{ email: decoded.email.toLowerCase() }] : []),
          { id: decoded.uid },
        ],
      },
      select: {
        id: true,
        firebaseUid: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        businessId: true,
        inspectorId: true,
      },
    });

    // If user exists by email but doesn't have firebaseUid set, link it!
    if (user && !user.firebaseUid && decoded.uid) {
      await prisma.user.update({
        where: { id: user.id },
        data: { firebaseUid: decoded.uid },
      });
      user.firebaseUid = decoded.uid;
    }

    if (!user) {
      return sendError(res, 'User profile not found. Please sync your account.', 401);
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
      phone: user.phone,
      businessId: user.businessId,
      inspectorId: user.inspectorId,
    };

    next();
  } catch (error) {
    return sendError(res, 'Authentication failed.', 401);
  }
}
