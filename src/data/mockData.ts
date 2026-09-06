import type {
  User,
  Business,
  Instrument,
  Application,
  Inspection,
  Certificate,
  Notification,
  ChecklistItem,
  MeasurementTest,
  ApplicationDocument,
} from '@/types';

// ============================================================
// Users
// ============================================================

export const MOCK_USERS: User[] = [
  {
    id: 'user_1',
    name: 'Rajesh Kumar',
    email: 'rajesh@kumarweighing.in',
    password: 'demo1234',
    role: 'business',
    phone: '+91 98765 43210',
    businessId: 'biz_1',
    joinedDate: '2024-03-15',
  },
  {
    id: 'user_2',
    name: 'Priya Sharma',
    email: 'priya.sharma@legalmetrology.gov.in',
    password: 'demo1234',
    role: 'inspector',
    phone: '+91 98123 45678',
    inspectorId: 'insp_1',
    joinedDate: '2023-06-01',
  },
  {
    id: 'user_3',
    name: 'Vikram Singh',
    email: 'vikram.singh@legalmetrology.gov.in',
    password: 'demo1234',
    role: 'admin',
    phone: '+91 99887 76655',
    joinedDate: '2022-01-10',
  },
  {
    id: 'user_4',
    name: 'Sunita Mehta',
    email: 'sunita@mehtameasurements.co.in',
    password: 'demo1234',
    role: 'business',
    phone: '+91 97654 32109',
    businessId: 'biz_2',
    joinedDate: '2024-07-20',
  },
];

// ============================================================
// Businesses
// ============================================================

export const MOCK_BUSINESSES: Business[] = [
  {
    id: 'biz_1',
    name: 'Kumar Weighing Solutions Pvt. Ltd.',
    gstin: '07AAACK1234M1ZE',
    address: 'Plot No. 45, Industrial Area, Phase II',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110020',
    contactPerson: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh@kumarweighing.in',
    ownerId: 'user_1',
    registrationDate: '2024-03-15',
    status: 'ACTIVE',
    category: 'Industrial Manufacturing',
  },
  {
    id: 'biz_2',
    name: 'Mehta Measurements Pvt. Ltd.',
    gstin: '27AAACM5678N2ZF',
    address: '12-B, Commercial Complex, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400069',
    contactPerson: 'Sunita Mehta',
    phone: '+91 97654 32109',
    email: 'sunita@mehtameasurements.co.in',
    ownerId: 'user_4',
    registrationDate: '2024-07-20',
    status: 'ACTIVE',
    category: 'Retail Trade',
  },
  {
    id: 'biz_3',
    name: 'Agro Fuel Distributors',
    gstin: '29AAACA9012P3ZG',
    address: 'NH-4, Petrol Station Complex',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560100',
    contactPerson: 'Arun Patel',
    phone: '+91 96543 21098',
    email: 'arun@agrofuel.in',
    ownerId: 'user_1', // shares for demo
    registrationDate: '2023-11-05',
    status: 'ACTIVE',
    category: 'Petroleum Retail',
  },
];

// ============================================================
// Instruments
// ============================================================

export const MOCK_INSTRUMENTS: Instrument[] = [
  {
    id: 'inst_1',
    serialNumber: 'KWS-2024-001',
    name: 'Electronic Platform Scale',
    type: 'PLATFORM_SCALE',
    make: 'Essae-Teraoka',
    model: 'DS-852',
    capacity: '150 kg',
    accuracy: '±50 g',
    businessId: 'biz_1',
    purchaseDate: '2024-01-10',
    installationDate: '2024-01-20',
    location: 'Dispatch Area, Warehouse B',
    status: 'CERTIFIED',
    lastInspectionDate: '2024-04-10',
    nextInspectionDue: '2025-04-10',
    currentCertificateId: 'cert_1',
  },
  {
    id: 'inst_2',
    serialNumber: 'KWS-2024-002',
    name: 'Industrial Weighbridge',
    type: 'WEIGHBRIDGE',
    make: 'Avery Weigh-Tronix',
    model: 'ZM510',
    capacity: '60 Tonnes',
    accuracy: '±20 kg',
    businessId: 'biz_1',
    purchaseDate: '2023-09-15',
    installationDate: '2023-10-01',
    location: 'Main Gate, Entry Point',
    status: 'PENDING_INSPECTION',
    lastInspectionDate: undefined,
    nextInspectionDue: undefined,
    currentCertificateId: undefined,
  },
  {
    id: 'inst_3',
    serialNumber: 'KWS-2024-003',
    name: 'Counter Weighing Scale',
    type: 'WEIGHING_SCALE',
    make: 'Mettler Toledo',
    model: 'BC-60',
    capacity: '6 kg',
    accuracy: '±2 g',
    businessId: 'biz_1',
    purchaseDate: '2024-05-05',
    installationDate: '2024-05-10',
    location: 'Sales Counter, Ground Floor',
    status: 'REGISTERED',
    lastInspectionDate: undefined,
    nextInspectionDue: undefined,
    currentCertificateId: undefined,
  },
  {
    id: 'inst_4',
    serialNumber: 'MMM-2024-101',
    name: 'Water Flow Meter',
    type: 'WATER_METER',
    make: 'Krohne',
    model: 'OPTIFLUX 4300',
    capacity: '500 m³/h',
    accuracy: '±0.3%',
    businessId: 'biz_2',
    purchaseDate: '2024-06-01',
    installationDate: '2024-06-15',
    location: 'Utility Room, Floor 1',
    status: 'CERTIFIED',
    lastInspectionDate: '2024-08-05',
    nextInspectionDue: '2025-08-05',
    currentCertificateId: 'cert_2',
  },
  {
    id: 'inst_5',
    serialNumber: 'AFD-2023-501',
    name: 'Petrol Fuel Dispenser',
    type: 'FUEL_DISPENSER',
    make: 'Tokheim',
    model: 'Quantium 510',
    capacity: '100 L/min',
    accuracy: '±0.5%',
    businessId: 'biz_3',
    purchaseDate: '2023-08-20',
    installationDate: '2023-09-01',
    location: 'Forecourt, Pump Island 2',
    status: 'EXPIRED',
    lastInspectionDate: '2023-10-15',
    nextInspectionDue: '2024-10-15',
    currentCertificateId: 'cert_3',
  },
];

// ============================================================
// Application Documents (reusable)
// ============================================================

const DOCS_VERIFIED: ApplicationDocument[] = [
  {
    id: 'doc_1',
    name: 'Purchase Invoice.pdf',
    type: 'PURCHASE_INVOICE',
    uploadDate: '2024-04-01',
    status: 'VERIFIED',
  },
  {
    id: 'doc_2',
    name: 'Business License.pdf',
    type: 'BUSINESS_LICENSE',
    uploadDate: '2024-04-01',
    status: 'VERIFIED',
  },
];

const DOCS_PENDING: ApplicationDocument[] = [
  {
    id: 'doc_3',
    name: 'Purchase Invoice.pdf',
    type: 'PURCHASE_INVOICE',
    uploadDate: '2024-09-01',
    status: 'PENDING',
  },
  {
    id: 'doc_4',
    name: 'Calibration Report.pdf',
    type: 'CALIBRATION_REPORT',
    uploadDate: '2024-09-01',
    status: 'PENDING',
  },
];

// ============================================================
// Applications
// ============================================================

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app_1',
    applicationNumber: 'MV/DL/2024/00123',
    businessId: 'biz_1',
    instrumentId: 'inst_1',
    applicationType: 'INITIAL',
    status: 'APPROVED',
    submittedDate: '2024-04-01',
    lastUpdated: '2024-04-15',
    assignedInspectorId: 'insp_1',
    scheduledInspectionDate: '2024-04-10',
    remarks: 'All parameters within acceptable limits. Approved.',
    documents: DOCS_VERIFIED,
    fees: 500,
    feesPaid: true,
  },
  {
    id: 'app_2',
    applicationNumber: 'MV/DL/2024/00187',
    businessId: 'biz_1',
    instrumentId: 'inst_2',
    applicationType: 'INITIAL',
    status: 'INSPECTION_SCHEDULED',
    submittedDate: '2024-09-01',
    lastUpdated: '2024-09-03',
    assignedInspectorId: 'insp_1',
    scheduledInspectionDate: '2026-09-10',
    remarks: undefined,
    documents: DOCS_PENDING,
    fees: 2000,
    feesPaid: true,
  },
  {
    id: 'app_3',
    applicationNumber: 'MV/DL/2024/00203',
    businessId: 'biz_1',
    instrumentId: 'inst_3',
    applicationType: 'INITIAL',
    status: 'SUBMITTED',
    submittedDate: '2024-09-04',
    lastUpdated: '2024-09-04',
    assignedInspectorId: undefined,
    scheduledInspectionDate: undefined,
    remarks: undefined,
    documents: [
      {
        id: 'doc_5',
        name: 'Purchase Invoice.pdf',
        type: 'PURCHASE_INVOICE',
        uploadDate: '2024-09-04',
        status: 'PENDING',
      },
    ],
    fees: 250,
    feesPaid: false,
  },
  {
    id: 'app_4',
    applicationNumber: 'MV/MH/2024/00088',
    businessId: 'biz_2',
    instrumentId: 'inst_4',
    applicationType: 'INITIAL',
    status: 'APPROVED',
    submittedDate: '2024-07-25',
    lastUpdated: '2024-08-10',
    assignedInspectorId: 'insp_1',
    scheduledInspectionDate: '2024-08-05',
    remarks: 'Meter readings accurate. Certificate issued.',
    documents: DOCS_VERIFIED,
    fees: 1500,
    feesPaid: true,
  },
  {
    id: 'app_5',
    applicationNumber: 'MV/KA/2023/00456',
    businessId: 'biz_3',
    instrumentId: 'inst_5',
    applicationType: 'INITIAL',
    status: 'APPROVED',
    submittedDate: '2023-09-20',
    lastUpdated: '2023-10-20',
    assignedInspectorId: 'insp_1',
    scheduledInspectionDate: '2023-10-15',
    remarks: 'Dispenser calibrated correctly.',
    documents: DOCS_VERIFIED,
    fees: 1000,
    feesPaid: true,
  },
];

// ============================================================
// Inspection Checklist (reusable template)
// ============================================================

const COMPLETED_CHECKLIST: ChecklistItem[] = [
  { id: 'cl_1', question: 'Is the instrument free from visible damage or corrosion?', category: 'PHYSICAL_CONDITION', result: 'PASS', remarks: '' },
  { id: 'cl_2', question: 'Are all seals and stamps intact?', category: 'PHYSICAL_CONDITION', result: 'PASS', remarks: '' },
  { id: 'cl_3', question: 'Does the instrument zero correctly before measurement?', category: 'ACCURACY', result: 'PASS', remarks: '' },
  { id: 'cl_4', question: 'Is the display legible and functioning?', category: 'PHYSICAL_CONDITION', result: 'PASS', remarks: '' },
  { id: 'cl_5', question: 'Are all required documents present and valid?', category: 'DOCUMENTATION', result: 'PASS', remarks: '' },
  { id: 'cl_6', question: 'Is the instrument installed as per manufacturer guidelines?', category: 'COMPLIANCE', result: 'PASS', remarks: '' },
  { id: 'cl_7', question: 'Does the instrument meet Legal Metrology Act requirements?', category: 'COMPLIANCE', result: 'PASS', remarks: '' },
  { id: 'cl_8', question: 'Is the instrument grounded and safe?', category: 'SAFETY', result: 'PASS', remarks: '' },
];

const PENDING_CHECKLIST: ChecklistItem[] = [
  { id: 'cl_9', question: 'Is the instrument free from visible damage or corrosion?', category: 'PHYSICAL_CONDITION', result: null, remarks: '' },
  { id: 'cl_10', question: 'Are all seals and stamps intact?', category: 'PHYSICAL_CONDITION', result: null, remarks: '' },
  { id: 'cl_11', question: 'Does the instrument zero correctly before measurement?', category: 'ACCURACY', result: null, remarks: '' },
  { id: 'cl_12', question: 'Is the display legible and functioning?', category: 'PHYSICAL_CONDITION', result: null, remarks: '' },
  { id: 'cl_13', question: 'Are all required documents present and valid?', category: 'DOCUMENTATION', result: null, remarks: '' },
  { id: 'cl_14', question: 'Is the instrument installed as per manufacturer guidelines?', category: 'COMPLIANCE', result: null, remarks: '' },
  { id: 'cl_15', question: 'Does the instrument meet Legal Metrology Act requirements?', category: 'COMPLIANCE', result: null, remarks: '' },
  { id: 'cl_16', question: 'Is the instrument grounded and safe?', category: 'SAFETY', result: null, remarks: '' },
];

// ============================================================
// Measurement Tests (reusable)
// ============================================================

const COMPLETED_TESTS: MeasurementTest[] = [
  { id: 'mt_1', testName: 'Tare Weight Test', nominalValue: '0', measuredValue: '0.02', tolerance: '±0.05', unit: 'kg', result: 'PASS' },
  { id: 'mt_2', testName: 'Span Test (50%)', nominalValue: '75', measuredValue: '75.03', tolerance: '±0.05', unit: 'kg', result: 'PASS' },
  { id: 'mt_3', testName: 'Span Test (100%)', nominalValue: '150', measuredValue: '149.98', tolerance: '±0.05', unit: 'kg', result: 'PASS' },
  { id: 'mt_4', testName: 'Repeatability Test', nominalValue: '100', measuredValue: '100.01', tolerance: '±0.05', unit: 'kg', result: 'PASS' },
  { id: 'mt_5', testName: 'Eccentricity Test', nominalValue: '50', measuredValue: '50.02', tolerance: '±0.05', unit: 'kg', result: 'PASS' },
];

// ============================================================
// Inspections
// ============================================================

export const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: 'insp_record_1',
    applicationId: 'app_1',
    instrumentId: 'inst_1',
    businessId: 'biz_1',
    inspectorId: 'insp_1',
    status: 'COMPLETED',
    scheduledDate: '2024-04-10',
    completedDate: '2024-04-10',
    checklist: COMPLETED_CHECKLIST,
    measurementTests: COMPLETED_TESTS,
    overallResult: 'APPROVED',
    inspectorRemarks: 'Instrument is in excellent condition. All measurement tests passed within tolerance limits. Certificate recommended.',
    evidencePhotos: ['photo_front.jpg', 'photo_display.jpg', 'photo_calibration.jpg'],
  },
  {
    id: 'insp_record_2',
    applicationId: 'app_2',
    instrumentId: 'inst_2',
    businessId: 'biz_1',
    inspectorId: 'insp_1',
    status: 'SCHEDULED',
    scheduledDate: '2026-09-10',
    completedDate: undefined,
    checklist: PENDING_CHECKLIST,
    measurementTests: [],
    overallResult: null,
    inspectorRemarks: '',
    evidencePhotos: [],
  },
  {
    id: 'insp_record_3',
    applicationId: 'app_4',
    instrumentId: 'inst_4',
    businessId: 'biz_2',
    inspectorId: 'insp_1',
    status: 'COMPLETED',
    scheduledDate: '2024-08-05',
    completedDate: '2024-08-05',
    checklist: COMPLETED_CHECKLIST,
    measurementTests: [
      { id: 'mt_6', testName: 'Flow Rate Test (25%)', nominalValue: '125', measuredValue: '124.8', tolerance: '±1.5', unit: 'm³/h', result: 'PASS' },
      { id: 'mt_7', testName: 'Flow Rate Test (100%)', nominalValue: '500', measuredValue: '499.2', tolerance: '±1.5', unit: 'm³/h', result: 'PASS' },
    ],
    overallResult: 'APPROVED',
    inspectorRemarks: 'Flow meter calibrated within tolerance. All documentation verified.',
    evidencePhotos: ['meter_photo1.jpg', 'meter_reading.jpg'],
  },
  {
    id: 'insp_record_4',
    applicationId: 'app_5',
    instrumentId: 'inst_5',
    businessId: 'biz_3',
    inspectorId: 'insp_1',
    status: 'COMPLETED',
    scheduledDate: '2023-10-15',
    completedDate: '2023-10-15',
    checklist: COMPLETED_CHECKLIST,
    measurementTests: [
      { id: 'mt_8', testName: 'Dispense Accuracy Test (5L)', nominalValue: '5', measuredValue: '5.012', tolerance: '±0.025', unit: 'L', result: 'PASS' },
      { id: 'mt_9', testName: 'Dispense Accuracy Test (20L)', nominalValue: '20', measuredValue: '20.018', tolerance: '±0.10', unit: 'L', result: 'PASS' },
    ],
    overallResult: 'APPROVED',
    inspectorRemarks: 'Dispenser accuracy within legal limits. Stamp applied.',
    evidencePhotos: ['dispenser_front.jpg'],
  },
];

// ============================================================
// Certificates
// ============================================================

export const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: 'cert_1',
    certificateNumber: 'MV/DL/CERT/2024/00123',
    applicationId: 'app_1',
    instrumentId: 'inst_1',
    businessId: 'biz_1',
    inspectorId: 'insp_1',
    issueDate: '2024-04-15',
    expiryDate: '2025-04-14',
    status: 'VERIFIED',
    stampNumber: 'DL-LM-2024-4521',
    issuingAuthority: 'Department of Legal Metrology, Government of Delhi',
    issuingOfficer: 'Priya Sharma, Inspector of Weights and Measures',
    instrumentDetails: {
      name: 'Electronic Platform Scale',
      type: 'Platform Scale',
      make: 'Essae-Teraoka',
      model: 'DS-852',
      serialNumber: 'KWS-2024-001',
      capacity: '150 kg',
      accuracy: '±50 g',
    },
    businessDetails: {
      name: 'Kumar Weighing Solutions Pvt. Ltd.',
      address: 'Plot No. 45, Industrial Area, Phase II, New Delhi - 110020',
      city: 'New Delhi',
      state: 'Delhi',
      gstin: '07AAACK1234M1ZE',
    },
  },
  {
    id: 'cert_2',
    certificateNumber: 'MV/MH/CERT/2024/00088',
    applicationId: 'app_4',
    instrumentId: 'inst_4',
    businessId: 'biz_2',
    inspectorId: 'insp_1',
    issueDate: '2024-08-10',
    expiryDate: '2025-08-09',
    status: 'VERIFIED',
    stampNumber: 'MH-LM-2024-8834',
    issuingAuthority: 'Department of Legal Metrology, Government of Maharashtra',
    issuingOfficer: 'Priya Sharma, Inspector of Weights and Measures',
    instrumentDetails: {
      name: 'Water Flow Meter',
      type: 'Water Meter',
      make: 'Krohne',
      model: 'OPTIFLUX 4300',
      serialNumber: 'MMM-2024-101',
      capacity: '500 m³/h',
      accuracy: '±0.3%',
    },
    businessDetails: {
      name: 'Mehta Measurements Pvt. Ltd.',
      address: '12-B, Commercial Complex, Andheri East, Mumbai - 400069',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstin: '27AAACM5678N2ZF',
    },
  },
  {
    id: 'cert_3',
    certificateNumber: 'MV/KA/CERT/2023/00456',
    applicationId: 'app_5',
    instrumentId: 'inst_5',
    businessId: 'biz_3',
    inspectorId: 'insp_1',
    issueDate: '2023-10-20',
    expiryDate: '2024-10-19',
    status: 'EXPIRED',
    stampNumber: 'KA-LM-2023-6712',
    issuingAuthority: 'Department of Legal Metrology, Government of Karnataka',
    issuingOfficer: 'Priya Sharma, Inspector of Weights and Measures',
    instrumentDetails: {
      name: 'Petrol Fuel Dispenser',
      type: 'Fuel Dispenser',
      make: 'Tokheim',
      model: 'Quantium 510',
      serialNumber: 'AFD-2023-501',
      capacity: '100 L/min',
      accuracy: '±0.5%',
    },
    businessDetails: {
      name: 'Agro Fuel Distributors',
      address: 'NH-4, Petrol Station Complex, Bengaluru - 560100',
      city: 'Bengaluru',
      state: 'Karnataka',
      gstin: '29AAACA9012P3ZG',
    },
  },
];

// ============================================================
// Notifications
// ============================================================

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    userId: 'user_1',
    title: 'Certificate Issued',
    message: 'Your certificate MV/DL/CERT/2024/00123 for Electronic Platform Scale has been issued.',
    type: 'SUCCESS',
    isRead: false,
    createdAt: '2024-04-15T10:30:00Z',
    link: '/business/certificates',
  },
  {
    id: 'notif_2',
    userId: 'user_1',
    title: 'Inspection Scheduled',
    message: 'Inspection for Industrial Weighbridge (MV/DL/2024/00187) scheduled for September 10, 2026.',
    type: 'INFO',
    isRead: false,
    createdAt: '2024-09-03T14:00:00Z',
    link: '/business/inspections',
  },
  {
    id: 'notif_3',
    userId: 'user_1',
    title: 'Application Submitted',
    message: 'Application MV/DL/2024/00203 for Counter Weighing Scale has been submitted.',
    type: 'INFO',
    isRead: true,
    createdAt: '2024-09-04T09:15:00Z',
    link: '/business/applications',
  },
  {
    id: 'notif_4',
    userId: 'user_2',
    title: 'New Inspection Assigned',
    message: 'You have been assigned to inspect Industrial Weighbridge at Kumar Weighing Solutions on Sep 10, 2026.',
    type: 'INFO',
    isRead: false,
    createdAt: '2024-09-03T14:00:00Z',
    link: '/inspector/inspections',
  },
];

// ============================================================
// Demo login cards data
// ============================================================

export const DEMO_USERS = [
  {
    role: 'business' as const,
    label: 'Business Owner',
    name: 'Rajesh Kumar',
    email: 'rajesh@kumarweighing.in',
    description: 'Manage instruments, submit applications, track certificates',
    userId: 'user_1',
  },
  {
    role: 'inspector' as const,
    label: 'Inspector',
    name: 'Priya Sharma',
    email: 'priya.sharma@legalmetrology.gov.in',
    description: 'Review applications, conduct inspections, issue approvals',
    userId: 'user_2',
  },
  {
    role: 'admin' as const,
    label: 'Government Admin',
    name: 'Vikram Singh',
    email: 'vikram.singh@legalmetrology.gov.in',
    description: 'Oversee all operations, analytics, compliance dashboard',
    userId: 'user_3',
  },
];
