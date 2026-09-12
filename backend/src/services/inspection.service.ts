import { prisma } from '../lib/prisma';
import { AuthUserPayload } from '../types';

export class InspectionService {
  static async getInspections(user: AuthUserPayload, query?: any) {
    if (user.role === 'inspector') {
      return await prisma.inspection.findMany({
        where: {
          OR: [
            { inspectorId: user.id },
            ...(user.inspectorId ? [{ inspectorId: user.inspectorId }] : []),
          ],
        },
        include: {
          business: true,
          instrument: true,
          application: true,
          checklist: true,
          measurementTests: true,
        },
        orderBy: { scheduledDate: 'desc' },
      });
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

      if (!business) return [];

      return await prisma.inspection.findMany({
        where: { businessId: business.id },
        include: {
          instrument: true,
          application: true,
          checklist: true,
          measurementTests: true,
        },
        orderBy: { scheduledDate: 'desc' },
      });
    }

    // Admin
    const where: any = {};
    if (query?.inspectorId) where.inspectorId = query.inspectorId;
    if (query?.status) where.status = query.status;

    return await prisma.inspection.findMany({
      where,
      include: {
        business: true,
        instrument: true,
        application: true,
        inspector: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        checklist: true,
        measurementTests: true,
      },
      orderBy: { scheduledDate: 'desc' },
    });
  }

  static async getInspectionById(id: string, user: AuthUserPayload) {
    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        business: true,
        instrument: true,
        application: true,
        inspector: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        checklist: true,
        measurementTests: true,
      },
    });

    if (!inspection) {
      const error: any = new Error('Inspection not found.');
      error.statusCode = 404;
      throw error;
    }

    if (
      user.role === 'business' &&
      inspection.businessId !== user.businessId &&
      inspection.business.ownerId !== user.id
    ) {
      const error: any = new Error('Access denied. You do not own this inspection.');
      error.statusCode = 403;
      throw error;
    }

    if (
      user.role === 'inspector' &&
      inspection.inspectorId !== user.id &&
      inspection.inspectorId !== user.inspectorId
    ) {
      const error: any = new Error('Access denied. This inspection is not assigned to you.');
      error.statusCode = 403;
      throw error;
    }

    return inspection;
  }

  static async submitInspection(
    inspectionId: string,
    data: {
      decision: 'APPROVED' | 'REJECTED' | 'NEEDS_CORRECTION';
      remarks: string;
      checklist: Array<{ question: string; category?: string; result: 'PASS' | 'FAIL' | 'NA' | null; remarks?: string }>;
      measurementTests: Array<{ testName: string; nominalValue: string; measuredValue: string; tolerance: string; unit: string; result: 'PASS' | 'FAIL' | null }>;
      evidencePhotos?: string[];
    },
    user: AuthUserPayload
  ) {
    if (user.role !== 'inspector' && user.role !== 'admin') {
      const error: any = new Error('Only the assigned inspector or admin can submit inspection results.');
      error.statusCode = 403;
      throw error;
    }

    const inspection = await prisma.inspection.findUnique({
      where: { id: inspectionId },
      include: {
        application: true,
        instrument: true,
        business: true,
      },
    });

    if (!inspection) {
      const error: any = new Error('Inspection record not found.');
      error.statusCode = 404;
      throw error;
    }

    if (
      user.role === 'inspector' &&
      inspection.inspectorId !== user.id &&
      inspection.inspectorId !== user.inspectorId
    ) {
      const error: any = new Error('Access denied. You are not the assigned inspector for this inspection.');
      error.statusCode = 403;
      throw error;
    }

    if (inspection.status === 'COMPLETED') {
      const error: any = new Error('This inspection has already been finalized and cannot be re-submitted.');
      error.statusCode = 400;
      throw error;
    }

    const today = new Date().toISOString().split('T')[0];
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return await prisma.$transaction(async (tx) => {
      // 1. Delete and replace checklist and test rows
      await tx.checklistItem.deleteMany({ where: { inspectionId: inspection.id } });
      await tx.measurementTest.deleteMany({ where: { inspectionId: inspection.id } });

      if (data.checklist && data.checklist.length > 0) {
        await tx.checklistItem.createMany({
          data: data.checklist.map(c => ({
            inspectionId: inspection.id,
            question: c.question,
            category: c.category || 'PHYSICAL_CONDITION',
            result: c.result,
            remarks: c.remarks || null,
          })),
        });
      }

      if (data.measurementTests && data.measurementTests.length > 0) {
        await tx.measurementTest.createMany({
          data: data.measurementTests.map(t => ({
            inspectionId: inspection.id,
            testName: t.testName,
            nominalValue: t.nominalValue,
            measuredValue: t.measuredValue,
            tolerance: t.tolerance,
            unit: t.unit,
            result: t.result,
          })),
        });
      }

      // 2. Update Inspection
      const updatedInspection = await tx.inspection.update({
        where: { id: inspection.id },
        data: {
          status: 'COMPLETED',
          completedDate: today,
          overallResult: data.decision,
          inspectorRemarks: data.remarks,
          evidencePhotos: data.evidencePhotos ? JSON.stringify(data.evidencePhotos) : undefined,
        },
        include: {
          checklist: true,
          measurementTests: true,
        },
      });

      // 3. Update Application Status
      const appStatus =
        data.decision === 'APPROVED'
          ? 'APPROVED'
          : data.decision === 'REJECTED'
          ? 'REJECTED'
          : 'NEEDS_CORRECTION';

      const updatedApplication = await tx.application.update({
        where: { id: inspection.applicationId },
        data: {
          status: appStatus,
          lastUpdated: today,
          remarks: `Inspection completed by ${user.name}: ${data.decision}. ${data.remarks}`,
        },
      });

      let createdCertificate = null;

      if (data.decision === 'APPROVED') {
        // 4. Generate Certificate
        const year = new Date().getFullYear();
        const randomCertNum = Math.floor(100000 + Math.random() * 900000);
        const certNumber = `MV-CERT-${year}-${randomCertNum}`;
        const stampNumber = `STAMP-DL-${Math.floor(1000 + Math.random() * 9000)}`;

        createdCertificate = await tx.certificate.create({
          data: {
            certificateNumber: certNumber,
            applicationId: inspection.applicationId,
            instrumentId: inspection.instrumentId,
            businessId: inspection.businessId,
            inspectorId: inspection.inspectorId,
            issueDate: today,
            expiryDate,
            status: 'VERIFIED',
            stampNumber,
            issuingAuthority: 'Department of Legal Metrology, Government of NCT of Delhi',
            issuingOfficer: `${user.name}, Legal Metrology Officer`,
            instrumentDetails: JSON.stringify({
              name: inspection.instrument.name,
              type: inspection.instrument.type,
              make: inspection.instrument.make,
              model: inspection.instrument.model,
              serialNumber: inspection.instrument.serialNumber,
              capacity: inspection.instrument.capacity,
              accuracy: inspection.instrument.accuracy,
            }),
            businessDetails: JSON.stringify({
              name: inspection.business.name,
              address: inspection.business.address,
              city: inspection.business.city,
              state: inspection.business.state,
              gstin: inspection.business.gstin,
            }),
          },
        });

        // 5. Update Instrument
        await tx.instrument.update({
          where: { id: inspection.instrumentId },
          data: {
            status: 'CERTIFIED',
            lastVerificationDate: today,
            lastInspectionDate: today,
            nextInspectionDue: expiryDate,
            currentCertificateId: createdCertificate.id,
          },
        });

        // 6. Notify Business Owner
        await tx.notification.create({
          data: {
            userId: inspection.business.ownerId,
            title: 'Certificate Issued',
            message: `Verification certificate ${certNumber} for ${inspection.instrument.name} has been successfully issued.`,
            type: 'SUCCESS',
            link: '/business/certificates',
          },
        });
      } else {
        // If Rejected or Correction
        await tx.instrument.update({
          where: { id: inspection.instrumentId },
          data: {
            status: data.decision === 'REJECTED' ? 'REJECTED' : 'PENDING_INSPECTION',
            lastInspectionDate: today,
          },
        });

        await tx.notification.create({
          data: {
            userId: inspection.business.ownerId,
            title: `Inspection ${data.decision === 'REJECTED' ? 'Failed' : 'Needs Correction'}`,
            message: `Inspection for ${inspection.instrument.name} resulted in ${data.decision}. Remarks: ${data.remarks}`,
            type: data.decision === 'REJECTED' ? 'ERROR' : 'WARNING',
            link: `/business/applications/${inspection.applicationId}`,
          },
        });
      }

      return {
        inspection: updatedInspection,
        application: updatedApplication,
        certificate: createdCertificate,
      };
    });
  }
}
