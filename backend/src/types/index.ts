import { Request } from 'express';

export type UserRole = 'business' | 'inspector' | 'admin';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'INSPECTOR_ASSIGNED'
  | 'INSPECTION_SCHEDULED'
  | 'INSPECTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_CORRECTION';

export type CertificateStatus = 'VERIFIED' | 'EXPIRED' | 'INVALID' | 'REVOKED';

export type InstrumentType =
  | 'WEIGHING_SCALE'
  | 'PLATFORM_SCALE'
  | 'FUEL_DISPENSER'
  | 'WATER_METER'
  | 'ELECTRICITY_METER'
  | 'BALANCE'
  | 'WEIGHBRIDGE'
  | 'MILK_METER'
  | 'TAPE_MEASURE'
  | 'PRESSURE_GAUGE';

export type InstrumentStatus =
  | 'REGISTERED'
  | 'PENDING_INSPECTION'
  | 'CERTIFIED'
  | 'REJECTED'
  | 'EXPIRED';

export type InspectionStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type InspectionResult = 'APPROVED' | 'REJECTED' | 'NEEDS_CORRECTION';

export type ApplicationType = 'INITIAL' | 'RENEWAL' | 'REPAIR_AFTER';

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface AuthUserPayload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  businessId?: string | null;
  inspectorId?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}
