import { prisma } from '../lib/prisma';
import { AuthUserPayload } from '../types';

export class DashboardService {
  static async getStats(user: AuthUserPayload) {
    if (user.role === 'admin') {
      const [
        totalBusinesses,
        totalInstruments,
        certifiedInstruments,
        pendingInspections,
        expiredCertificates,
        nonCompliantInstruments,
        totalApplications,
        approvedApplications,
        rejectedApplications,
        pendingApplications,
        completedInspections,
        totalCertificates,
        applicationsByStatus,
        instrumentsByType,
      ] = await Promise.all([
        prisma.business.count(),
        prisma.instrument.count(),
        prisma.instrument.count({ where: { status: 'CERTIFIED' } }),
        prisma.inspection.count({ where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } } }),
        prisma.certificate.count({ where: { status: 'EXPIRED' } }),
        prisma.instrument.count({ where: { status: { in: ['REJECTED', 'EXPIRED'] } } }),
        prisma.application.count(),
        prisma.application.count({ where: { status: 'APPROVED' } }),
        prisma.application.count({ where: { status: 'REJECTED' } }),
        prisma.application.count({ where: { status: { notIn: ['APPROVED', 'REJECTED'] } } }),
        prisma.inspection.count({ where: { status: 'COMPLETED' } }),
        prisma.certificate.count(),
        prisma.application.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        prisma.instrument.groupBy({
          by: ['type'],
          _count: { _all: true },
        }),
      ]);

      const complianceRate =
        totalInstruments > 0
          ? Math.round((certifiedInstruments / totalInstruments) * 100)
          : 100;

      return {
        totalBusinesses,
        totalInstruments,
        certifiedInstruments,
        pendingInspections,
        expiredCertificates,
        nonCompliantInstruments,
        totalApplications,
        approvedApplications,
        rejectedApplications,
        pendingApplications,
        completedInspections,
        totalCertificates,
        complianceRate,
        pipelineStatus: applicationsByStatus.map(s => ({
          status: s.status,
          count: s._count._all,
        })),
        instrumentsByType: instrumentsByType.map(t => ({
          type: t.type,
          count: t._count._all,
        })),
      };
    }

    if (user.role === 'business') {
      const business = await prisma.business.findFirst({
        where: {
          OR: [
            { ownerId: user.id },
            ...(user.businessId ? [{ id: user.businessId }] : []),
          ],
        },
      });

      if (!business) {
        return {
          totalInstruments: 0,
          certifiedInstruments: 0,
          pendingApplications: 0,
          totalCertificates: 0,
        };
      }

      const [totalInstruments, certifiedInstruments, pendingApplications, totalCertificates] =
        await Promise.all([
          prisma.instrument.count({ where: { businessId: business.id } }),
          prisma.instrument.count({ where: { businessId: business.id, status: 'CERTIFIED' } }),
          prisma.application.count({
            where: {
              businessId: business.id,
              status: { notIn: ['APPROVED', 'REJECTED'] },
            },
          }),
          prisma.certificate.count({ where: { businessId: business.id } }),
        ]);

      return {
        totalInstruments,
        certifiedInstruments,
        pendingApplications,
        totalCertificates,
      };
    }

    if (user.role === 'inspector') {
      const [assignedApplications, scheduledInspections, completedInspections, approvedInspections, rejectedInspections] =
        await Promise.all([
          prisma.application.count({
            where: {
              OR: [
                { assignedInspectorId: user.id },
                ...(user.inspectorId ? [{ assignedInspectorId: user.inspectorId }] : []),
              ],
            },
          }),
          prisma.inspection.count({
            where: {
              OR: [
                { inspectorId: user.id },
                ...(user.inspectorId ? [{ inspectorId: user.inspectorId }] : []),
              ],
              status: 'SCHEDULED',
            },
          }),
          prisma.inspection.count({
            where: {
              OR: [
                { inspectorId: user.id },
                ...(user.inspectorId ? [{ inspectorId: user.inspectorId }] : []),
              ],
              status: 'COMPLETED',
            },
          }),
          prisma.inspection.count({
            where: {
              OR: [
                { inspectorId: user.id },
                ...(user.inspectorId ? [{ inspectorId: user.inspectorId }] : []),
              ],
              overallResult: 'APPROVED',
            },
          }),
          prisma.inspection.count({
            where: {
              OR: [
                { inspectorId: user.id },
                ...(user.inspectorId ? [{ inspectorId: user.inspectorId }] : []),
              ],
              overallResult: 'REJECTED',
            },
          }),
        ]);

      return {
        assignedApplications,
        scheduledInspections,
        completedInspections,
        approvedInspections,
        rejectedInspections,
      };
    }

    return {};
  }
}
