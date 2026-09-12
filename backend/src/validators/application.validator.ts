import { z } from 'zod';

export const createApplicationSchema = z.object({
  id: z.string().optional(),
  applicationNumber: z.string().optional(),
  instrumentId: z.string().min(1, 'Instrument ID is required'),
  applicationType: z.enum(['INITIAL', 'RENEWAL', 'REPAIR_AFTER']).default('INITIAL'),
  status: z.enum(['DRAFT', 'SUBMITTED']).default('SUBMITTED'),
  remarks: z.string().optional(),
  fees: z.number().optional(),
  feesPaid: z.boolean().optional(),
  documents: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum([
          'PURCHASE_INVOICE',
          'CALIBRATION_REPORT',
          'BUSINESS_LICENSE',
          'IDENTITY_PROOF',
          'OTHER',
        ]),
        uploadDate: z.string().optional(),
      })
    )
    .optional(),
});

export const assignInspectorSchema = z.object({
  inspectorId: z.string().min(1, 'Inspector ID is required'),
  scheduledDate: z.string().min(1, 'Scheduled inspection date is required'),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'INSPECTOR_ASSIGNED',
    'INSPECTION_SCHEDULED',
    'INSPECTED',
    'APPROVED',
    'REJECTED',
    'NEEDS_CORRECTION',
  ]),
  remarks: z.string().optional(),
});
