import { prisma } from '../lib/prisma';
import { AuthUserPayload } from '../types';

export class InstrumentService {
  static async getInstruments(user: AuthUserPayload, businessIdQuery?: string) {
    if (user.role === 'business') {
      // Must derive from authenticated user's business
      const business = await prisma.business.findFirst({
        where: {
          OR: [
            { ownerId: user.id },
            ...(user.businessId ? [{ id: user.businessId }] : []),
          ],
        },
      });

      if (!business) return [];

      return await prisma.instrument.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Admin or Inspector
    const whereClause: any = {};
    if (businessIdQuery) {
      whereClause.businessId = businessIdQuery;
    }

    return await prisma.instrument.findMany({
      where: whereClause,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getInstrumentById(id: string, user: AuthUserPayload) {
    const instrument = await prisma.instrument.findUnique({
      where: { id },
      include: {
        business: true,
        applications: {
          orderBy: { createdAt: 'desc' },
        },
        certificates: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!instrument) {
      const error: any = new Error('Instrument not found.');
      error.statusCode = 404;
      throw error;
    }

    if (
      user.role === 'business' &&
      instrument.businessId !== user.businessId &&
      instrument.business.ownerId !== user.id
    ) {
      const error: any = new Error('Access denied. You do not own this instrument.');
      error.statusCode = 403;
      throw error;
    }

    return instrument;
  }

  static async createInstrument(data: any, user: AuthUserPayload) {
    if (user.role !== 'business') {
      const error: any = new Error('Only business accounts can register instruments.');
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
      const error: any = new Error('Business profile required to register an instrument.');
      error.statusCode = 400;
      throw error;
    }

    // Check unique serialNumber within this business
    const existing = await prisma.instrument.findFirst({
      where: {
        serialNumber: data.serialNumber.trim().toUpperCase(),
        businessId: business.id,
      },
    });

    if (existing) {
      const error: any = new Error(
        `An instrument with serial number "${data.serialNumber}" is already registered for your business.`
      );
      error.statusCode = 409;
      throw error;
    }

    return await prisma.instrument.create({
      data: {
        ...(data.id ? { id: data.id } : {}),
        serialNumber: data.serialNumber.trim().toUpperCase(),
        name: data.name.trim(),
        type: data.type,
        make: data.make.trim(),
        model: data.model.trim(),
        capacity: data.capacity.trim(),
        accuracy: data.accuracy.trim(),
        businessId: business.id,
        purchaseDate: data.purchaseDate,
        installationDate: data.installationDate || data.purchaseDate,
        location: data.location.trim(),
        installationAddress: data.installationAddress?.trim() || business.address,
        lastVerificationDate: data.lastVerificationDate || null,
        status: 'PENDING_INSPECTION',
      },
    });
  }

  static async updateInstrument(id: string, data: any, user: AuthUserPayload) {
    const instrument = await prisma.instrument.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!instrument) {
      const error: any = new Error('Instrument not found.');
      error.statusCode = 404;
      throw error;
    }

    if (
      user.role === 'business' &&
      instrument.businessId !== user.businessId &&
      instrument.business.ownerId !== user.id
    ) {
      const error: any = new Error('Access denied. You do not own this instrument.');
      error.statusCode = 403;
      throw error;
    }

    return await prisma.instrument.update({
      where: { id },
      data,
    });
  }
}
