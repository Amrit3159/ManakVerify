import { prisma } from '../lib/prisma';
import { AuthUserPayload } from '../types';

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['UNDER_REVIEW', 'INSPECTOR_ASSIGNED', 'INSPECTION_SCHEDULED', 'REJECTED'],
  UNDER_REVIEW: ['INSPECTOR_ASSIGNED', 'INSPECTION_SCHEDULED', 'NEEDS_CORRECTION', 'REJECTED'],
  INSPECTOR_ASSIGNED: ['INSPECTION_SCHEDULED', 'NEEDS_CORRECTION', 'REJECTED'],
  INSPECTION_SCHEDULED: ['INSPECTED', 'APPROVED', 'REJECTED', 'NEEDS_CORRECTION'],
  INSPECTED: ['APPROVED', 'REJECTED', 'NEEDS_CORRECTION'],
  NEEDS_CORRECTION: ['SUBMITTED', 'UNDER_REVIEW', 'REJECTED'],
  APPROVED: [],
  REJECTED: [],
};

export class ApplicationService {
  static async getApplications(user: AuthUserPayload, query?: any) {
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

      return await prisma.application.findMany({
        where: { businessId: business.id },
        include: {
          instrument: true,
          documents: true,
          inspection: true,
          certificate: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (user.role === 'inspector') {
      return await prisma.application.findMany({
        where: {
          OR: [
            { assignedInspectorId: user.id },
            ...(user.inspectorId ? [{ assignedInspectorId: user.inspectorId }] : []),
          ],
        },
        include: {
          business: true,
          instrument: true,
          documents: true,
          inspection: true,
          certificate: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Admin: can see all applications
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.businessId) where.businessId = query.businessId;
    if (query?.inspectorId) where.assignedInspectorId = query.inspectorId;

    return await prisma.application.findMany({
      where,
      include: {
        business: true,
        instrument: true,
        documents: true,
        inspection: true,
        certificate: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getApplicationById(id: string, user: AuthUserPayload) {
    const app = await prisma.application.findUnique({
      where: { id },
      include: {
        business: true,
        instrument: true,
        documents: true,
        inspection: {
          include: {
            checklist: true,
            measurementTests: true,
          },
        },
        certificate: true,
      },
    });

    if (!app) {
      const error: any = new Error('Application not found.');
      error.statusCode = 404;
      throw error;
    }

    // RBAC: business user can only view their own
    if (
      user.role === 'business' &&
      app.businessId !== user.businessId &&
      app.business.ownerId !== user.id
    ) {
      const error: any = new Error('Access denied. You do not own this application.');
      error.statusCode = 403;
      throw error;
    }

    // RBAC: inspector can only view assigned applications
    if (
      user.role === 'inspector' &&
      app.assignedInspectorId !== user.id &&
      app.assignedInspectorId !== user.inspectorId
    ) {
      const error: any = new Error('Access denied. This application is not assigned to you.');
      error.statusCode = 403;
      throw error;
    }

    return app;
  }

  static async createApplication(data: any, user: AuthUserPayload) {
    if (user.role !== 'business') {
      const error: any = new Error('Only business users can create applications.');
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
      const error: any = new Error('Business profile required to submit an application.');
      error.statusCode = 400;
      throw error;
    }

    // Verify instrument exists and belongs to this business
    const instrument = await prisma.instrument.findUnique({
      where: { id: data.instrumentId },
    });

    if (!instrument || instrument.businessId !== business.id) {
      const error: any = new Error('Instrument not found or does not belong to your business.');
      error.statusCode = 400;
      throw error;
    }

    const today = new Date().toISOString().split('T')[0];
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(10000 + Math.random() * 90000);
    const applicationNumber = `MV/DL/${year}/${randomSeq}`;

    const application = await prisma.$transaction(async (tx) => {
      const createdApp = await tx.application.create({
        data: {
          ...(data.id ? { id: data.id } : {}),
          applicationNumber: data.applicationNumber || applicationNumber,
          businessId: business.id,
          instrumentId: instrument.id,
          applicationType: data.applicationType || 'INITIAL',
          status: data.status || 'SUBMITTED',
          submittedDate: today,
          lastUpdated: today,
          remarks: data.remarks || 'Initial verification application submitted.',
          fees: data.fees ?? 2065,
          feesPaid: data.feesPaid ?? true,
          documents: data.documents
            ? {
                create: data.documents.map((doc: any) => ({
                  name: doc.name,
                  type: doc.type,
                  uploadDate: doc.uploadDate || today,
                  status: 'PENDING',
                })),
              }
            : undefined,
        },
        include: {
          documents: true,
          instrument: true,
        },
      });

      // Notification
      if (data.status === 'SUBMITTED') {
        await tx.notification.create({
          data: {
            userId: user.id,
            title: 'Application Submitted',
            message: `Application ${applicationNumber} for ${instrument.name} has been submitted successfully.`,
            type: 'INFO',
            link: `/business/applications/${createdApp.id}`,
          },
        });
      }

      return createdApp;
    });

    return application;
  }

  static async assignInspectorAndSchedule(
    applicationId: string,
    inspectorId: string,
    scheduledDate: string,
    adminUser: AuthUserPayload
  ) {
    if (adminUser.role !== 'admin') {
      const error: any = new Error('Only administrators can assign inspectors and schedule inspections.');
      error.statusCode = 403;
      throw error;
    }

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        business: true,
        instrument: true,
      },
    });

    if (!app) {
      const error: any = new Error('Application not found.');
      error.statusCode = 404;
      throw error;
    }

    // Verify inspector exists
    const inspector = await prisma.user.findFirst({
      where: {
        OR: [
          { id: inspectorId },
          { inspectorId: inspectorId },
        ],
        role: 'inspector',
      },
    });

    if (!inspector) {
      const error: any = new Error('Selected inspector not found.');
      error.statusCode = 400;
      throw error;
    }

    const today = new Date().toISOString().split('T')[0];

    return await prisma.$transaction(async (tx) => {
      // 1. Update Application status
      const updatedApp = await tx.application.update({
        where: { id: applicationId },
        data: {
          assignedInspectorId: inspector.id,
          scheduledInspectionDate: scheduledDate,
          status: 'INSPECTION_SCHEDULED',
          lastUpdated: today,
          remarks: `Inspection scheduled for ${scheduledDate} with ${inspector.name}.`,
        },
      });

      // 2. Create or Update Inspection record
      const existingInsp = await tx.inspection.findUnique({
        where: { applicationId },
      });

      let inspection;
      if (existingInsp) {
        inspection = await tx.inspection.update({
          where: { id: existingInsp.id },
          data: {
            inspectorId: inspector.id,
            scheduledDate,
            status: 'SCHEDULED',
          },
        });
      } else {
        inspection = await tx.inspection.create({
          data: {
            applicationId: app.id,
            instrumentId: app.instrumentId,
            businessId: app.businessId,
            inspectorId: inspector.id,
            status: 'SCHEDULED',
            scheduledDate,
          },
        });
      }

      // 3. Notify Business Owner
      await tx.notification.create({
        data: {
          userId: app.business.ownerId,
          title: 'Inspection Scheduled',
          message: `Inspection for ${app.instrument.name} (${app.applicationNumber}) has been scheduled for ${scheduledDate}.`,
          type: 'INFO',
          link: `/business/applications/${app.id}`,
        },
      });

      // 4. Notify Assigned Inspector
      await tx.notification.create({
        data: {
          userId: inspector.id,
          title: 'New Inspection Assigned',
          message: `You have been assigned to inspect ${app.instrument.name} at ${app.business.name} on ${scheduledDate}.`,
          type: 'INFO',
          link: `/inspector/inspections/${inspection.id}`,
        },
      });

      return {
        application: updatedApp,
        inspection,
      };
    });
  }

  static async updateStatus(
    applicationId: string,
    newStatus: string,
    remarks: string | undefined,
    user: AuthUserPayload
  ) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { business: true },
    });

    if (!app) {
      const error: any = new Error('Application not found.');
      error.statusCode = 404;
      throw error;
    }

    // If status is already the same, just update remarks
    if (app.status === newStatus) {
      return await prisma.application.update({
        where: { id: applicationId },
        data: {
          remarks: remarks || app.remarks,
        },
      });
    }

    // Validate workflow transition
    const allowed = VALID_TRANSITIONS[app.status] || [];
    if (!allowed.includes(newStatus)) {
      const error: any = new Error(
        `Invalid status transition from "${app.status}" to "${newStatus}". Allowed transitions: ${allowed.join(', ') || 'None'}`
      );
      error.statusCode = 400;
      throw error;
    }

    const today = new Date().toISOString().split('T')[0];

    return await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        lastUpdated: today,
        remarks: remarks || app.remarks,
      },
    });
  }
}
