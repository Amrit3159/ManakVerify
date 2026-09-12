import { prisma } from '../lib/prisma';
import { AuthUserPayload } from '../types';

export class CertificateService {
  static async getCertificates(user: AuthUserPayload, query?: any) {
    if (user.role === 'business') {
      const business = await prisma.business.findFirst({
        where: {
          OR: [
            { ownerId: user.id },
            ...(user.businessId ? [{ id: user.businessId }] : []),
          ],
        },
      });

      if (!business) return [];

      return await prisma.certificate.findMany({
        where: { businessId: business.id },
        include: {
          instrument: true,
          business: true,
        },
        orderBy: { issueDate: 'desc' },
      });
    }

    if (user.role === 'inspector') {
      return await prisma.certificate.findMany({
        where: {
          OR: [
            { inspectorId: user.id },
            ...(user.inspectorId ? [{ inspectorId: user.inspectorId }] : []),
          ],
        },
        include: {
          instrument: true,
          business: true,
        },
        orderBy: { issueDate: 'desc' },
      });
    }

    // Admin
    const where: any = {};
    if (query?.businessId) where.businessId = query.businessId;
    if (query?.status) where.status = query.status;

    return await prisma.certificate.findMany({
      where,
      include: {
        instrument: true,
        business: true,
      },
      orderBy: { issueDate: 'desc' },
    });
  }

  static async getCertificateById(id: string, user: AuthUserPayload) {
    const cert = await prisma.certificate.findUnique({
      where: { id },
      include: {
        instrument: true,
        business: true,
        application: true,
      },
    });

    if (!cert) {
      const error: any = new Error('Certificate not found.');
      error.statusCode = 404;
      throw error;
    }

    if (
      user.role === 'business' &&
      cert.businessId !== user.businessId &&
      cert.business.ownerId !== user.id
    ) {
      const error: any = new Error('Access denied. You do not own this certificate.');
      error.statusCode = 403;
      throw error;
    }

    return cert;
  }

  // Public Endpoint: No Auth Required, Zero Private Data Leaked
  static async verifyPublicCertificate(identifier: string) {
    const trimmed = identifier.trim();

    // Look up by certificateNumber or id
    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [
          { certificateNumber: { equals: trimmed } },
          { id: { equals: trimmed } },
        ],
      },
    });

    if (!cert) {
      const error: any = new Error(`No certificate found matching identifier: ${trimmed}`);
      error.statusCode = 404;
      throw error;
    }

    // Check expiry
    const today = new Date().toISOString().split('T')[0];
    let computedStatus = cert.status;
    if (cert.status === 'VERIFIED' && cert.expiryDate < today) {
      computedStatus = 'EXPIRED';
    }

    let parsedInstrument: any = {};
    let parsedBusiness: any = {};

    try {
      parsedInstrument = JSON.parse(cert.instrumentDetails);
    } catch {
      parsedInstrument = { name: 'Instrument details unavailable' };
    }

    try {
      parsedBusiness = JSON.parse(cert.businessDetails);
    } catch {
      parsedBusiness = { name: 'Business details unavailable' };
    }

    return {
      certificateNumber: cert.certificateNumber,
      status: computedStatus,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate,
      stampNumber: cert.stampNumber,
      issuingAuthority: cert.issuingAuthority,
      issuingOfficer: cert.issuingOfficer,
      instrumentDetails: parsedInstrument,
      businessDetails: parsedBusiness,
      isValid: computedStatus === 'VERIFIED',
    };
  }
}
