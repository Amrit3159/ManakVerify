import { prisma } from '../lib/prisma';
import { AuthUserPayload } from '../types';

export class BusinessService {
  static async getMyBusiness(user: AuthUserPayload) {
    if (user.role !== 'business') {
      const error: any = new Error('Only business users have an owned business profile.');
      error.statusCode = 403;
      throw error;
    }

    const business = await prisma.business.findFirst({
      where: {
        OR: [
          { ownerId: user.id },
          ...(user.businessId ? [{ id: user.businessId }] : []),
        ],
      },
    });

    if (!business) {
      const error: any = new Error('Business profile not found.');
      error.statusCode = 404;
      throw error;
    }

    return business;
  }

  static async getBusinessById(id: string, user: AuthUserPayload) {
    const business = await prisma.business.findUnique({
      where: { id },
    });

    if (!business) {
      const error: any = new Error('Business not found.');
      error.statusCode = 404;
      throw error;
    }

    // RBAC ownership check: Business users can only view their own business
    if (user.role === 'business' && business.ownerId !== user.id && business.id !== user.businessId) {
      const error: any = new Error('Access denied. You do not have permission to view this business.');
      error.statusCode = 403;
      throw error;
    }

    return business;
  }

  static async updateBusiness(id: string, data: any, user: AuthUserPayload) {
    const business = await prisma.business.findUnique({
      where: { id },
    });

    if (!business) {
      const error: any = new Error('Business not found.');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'business' && business.ownerId !== user.id && business.id !== user.businessId) {
      const error: any = new Error('Access denied. You do not own this business.');
      error.statusCode = 403;
      throw error;
    }

    return await prisma.business.update({
      where: { id },
      data,
    });
  }

  static async getAllBusinesses(user: AuthUserPayload) {
    // Admin or inspector can view list of businesses
    if (user.role === 'business') {
      return await prisma.business.findMany({
        where: {
          OR: [
            { ownerId: user.id },
            ...(user.businessId ? [{ id: user.businessId }] : []),
          ],
        },
      });
    }

    return await prisma.business.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
