// ============================================================
// Enums / Union Types
// ============================================================

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

// ============================================================
// Entity Interfaces
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // plain text for demo only
  role: UserRole;
  phone: string;
  businessId?: string;   // for business role
  inspectorId?: string;  // for inspector role
  joinedDate: string;
}

export interface Business {
  id: string;
  name: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  phone: string;
  email: string;
  ownerId: string;
  registrationDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  category: string; // e.g. "Retail Trade", "Industrial"
}

export interface Instrument {
  id: string;
  serialNumber: string;
  name: string;
  type: InstrumentType;
  make: string;
  model: string;
  capacity: string;
  accuracy: string;
  businessId: string;
  purchaseDate: string;
  installationDate: string;
  location: string; // where within the business premises
  installationAddress?: string;
  lastVerificationDate?: string;
  status: InstrumentStatus;
  lastInspectionDate?: string;
  nextInspectionDue?: string;
  currentCertificateId?: string;
}

export interface ApplicationDocument {
  id: string;
  name: string;
  type: 'PURCHASE_INVOICE' | 'CALIBRATION_REPORT' | 'BUSINESS_LICENSE' | 'IDENTITY_PROOF' | 'OTHER';
  uploadDate: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface Application {
  id: string;
  applicationNumber: string;
  businessId: string;
  instrumentId: string;
  applicationType: ApplicationType;
  status: ApplicationStatus;
  submittedDate: string;
  lastUpdated: string;
  assignedInspectorId?: string;
  scheduledInspectionDate?: string;
  remarks?: string;
  documents: ApplicationDocument[];
  fees: number;
  feesPaid: boolean;
}

export interface ChecklistItem {
  id: string;
  question: string;
  category: 'PHYSICAL_CONDITION' | 'ACCURACY' | 'DOCUMENTATION' | 'SAFETY' | 'COMPLIANCE';
  result: 'PASS' | 'FAIL' | 'NA' | null;
  remarks?: string;
}

export interface MeasurementTest {
  id: string;
  testName: string;
  nominalValue: string;
  measuredValue: string;
  tolerance: string;
  unit: string;
  result: 'PASS' | 'FAIL' | null;
}

export interface Inspection {
  id: string;
  applicationId: string;
  instrumentId: string;
  businessId: string;
  inspectorId: string;
  status: InspectionStatus;
  scheduledDate: string;
  completedDate?: string;
  checklist: ChecklistItem[];
  measurementTests: MeasurementTest[];
  overallResult: InspectionResult | null;
  inspectorRemarks: string;
  evidencePhotos: string[];
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  applicationId: string;
  instrumentId: string;
  businessId: string;
  inspectorId: string;
  issueDate: string;
  expiryDate: string;
  status: CertificateStatus;
  stampNumber: string;
  issuingAuthority: string;
  issuingOfficer: string;
  instrumentDetails: {
    name: string;
    type: string;
    make: string;
    model: string;
    serialNumber: string;
    capacity: string;
    accuracy: string;
  };
  businessDetails: {
    name: string;
    address: string;
    city: string;
    state: string;
    gstin: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// ============================================================
// Auth / Session
// ============================================================

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  businessId?: string;
  inspectorId?: string;
}

// ============================================================
// Display helpers
// ============================================================

export const INSTRUMENT_TYPE_LABELS: Record<InstrumentType, string> = {
  WEIGHING_SCALE:   'Weighing Scale',
  PLATFORM_SCALE:   'Platform Scale',
  FUEL_DISPENSER:   'Fuel Dispenser',
  WATER_METER:      'Water Meter',
  ELECTRICITY_METER:'Electricity Meter',
  BALANCE:          'Precision Balance',
  WEIGHBRIDGE:      'Weighbridge',
  MILK_METER:       'Milk Meter',
  TAPE_MEASURE:     'Tape Measure',
  PRESSURE_GAUGE:   'Pressure Gauge',
};

export const APPLICATION_TYPE_LABELS: Record<ApplicationType, string> = {
  INITIAL:      'Initial Verification',
  RENEWAL:      'Renewal Verification',
  REPAIR_AFTER: 'Post-Repair Verification',
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  DRAFT:                  'Draft',
  SUBMITTED:              'Submitted',
  UNDER_REVIEW:           'Under Review',
  INSPECTOR_ASSIGNED:     'Inspector Assigned',
  INSPECTION_SCHEDULED:   'Inspection Scheduled',
  INSPECTED:              'Inspected',
  APPROVED:               'Approved',
  REJECTED:               'Rejected',
  NEEDS_CORRECTION:       'Needs Correction',
};

export const CERTIFICATE_STATUS_LABELS: Record<CertificateStatus, string> = {
  VERIFIED: 'Verified',
  EXPIRED:  'Expired',
  INVALID:  'Invalid',
  REVOKED:  'Revoked',
};
