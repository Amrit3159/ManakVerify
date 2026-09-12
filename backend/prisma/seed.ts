import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MaanakVerify database...');

  // 1. Clean existing records (in dependency order)
  await prisma.notification.deleteMany({});
  await prisma.measurementTest.deleteMany({});
  await prisma.checklistItem.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.inspection.deleteMany({});
  await prisma.applicationDocument.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.instrument.deleteMany({});
  await prisma.business.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPasswordHash = await bcrypt.hash('demo1234', 10);

  // 2. Create Users
  const user1 = await prisma.user.create({
    data: {
      id: 'user_1',
      name: 'Rajesh Kumar',
      email: 'rajesh@kumarweighing.in',
      passwordHash: defaultPasswordHash,
      role: 'business',
      phone: '+91 98765 43210',
      businessId: 'biz_1',
      joinedDate: '2024-03-15',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: 'user_2',
      name: 'Priya Sharma',
      email: 'priya.sharma@legalmetrology.gov.in',
      passwordHash: defaultPasswordHash,
      role: 'inspector',
      phone: '+91 98123 45678',
      inspectorId: 'insp_1',
      joinedDate: '2023-06-01',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      id: 'user_3',
      name: 'Vikram Singh',
      email: 'vikram.singh@legalmetrology.gov.in',
      passwordHash: defaultPasswordHash,
      role: 'admin',
      phone: '+91 99887 76655',
      joinedDate: '2022-01-10',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      id: 'user_4',
      name: 'Sunita Mehta',
      email: 'sunita@mehtameasurements.co.in',
      passwordHash: defaultPasswordHash,
      role: 'business',
      phone: '+91 97654 32109',
      businessId: 'biz_2',
      joinedDate: '2024-07-20',
    },
  });

  console.log('✓ Users created');

  // 3. Create Businesses
  const biz1 = await prisma.business.create({
    data: {
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
      ownerId: user1.id,
      registrationDate: '2024-03-15',
      status: 'ACTIVE',
      category: 'Industrial Manufacturing',
    },
  });

  const biz2 = await prisma.business.create({
    data: {
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
      ownerId: user4.id,
      registrationDate: '2024-07-20',
      status: 'ACTIVE',
      category: 'Retail Trade',
    },
  });

  console.log('✓ Businesses created');

  // 4. Create Instruments
  const inst1 = await prisma.instrument.create({
    data: {
      id: 'inst_1',
      serialNumber: 'SN-2024-WS-001',
      name: 'Electronic Platform Scale 500kg',
      type: 'PLATFORM_SCALE',
      make: 'Avery Weigh-Tronix',
      model: 'Z205',
      capacity: '500 kg',
      accuracy: 'Class III (e=100g)',
      businessId: biz1.id,
      purchaseDate: '2023-11-10',
      installationDate: '2023-11-20',
      location: 'Warehouse Bay 2',
      installationAddress: 'Plot No. 45, Industrial Area, Phase II, New Delhi',
      lastVerificationDate: '2024-04-15',
      status: 'CERTIFIED',
      lastInspectionDate: '2024-04-15',
      nextInspectionDue: '2025-04-14',
      currentCertificateId: 'cert_1',
    },
  });

  const inst2 = await prisma.instrument.create({
    data: {
      id: 'inst_2',
      serialNumber: 'SN-2024-WB-002',
      name: 'Heavy-Duty Pitless Weighbridge 60T',
      type: 'WEIGHBRIDGE',
      make: 'Essae-Teraoka',
      model: 'WB-60T',
      capacity: '60 Tonne',
      accuracy: 'Class IV (e=10kg)',
      businessId: biz1.id,
      purchaseDate: '2023-08-05',
      installationDate: '2023-09-01',
      location: 'Main Entry Gate',
      installationAddress: 'Plot No. 45, Industrial Area, Phase II, New Delhi',
      status: 'PENDING_INSPECTION',
      nextInspectionDue: '2024-09-15',
    },
  });

  const inst3 = await prisma.instrument.create({
    data: {
      id: 'inst_3',
      serialNumber: 'SN-2024-CS-003',
      name: 'Digital Counter Scale 30kg',
      type: 'WEIGHING_SCALE',
      make: 'Citizen Scales',
      model: 'CY-30P',
      capacity: '30 kg',
      accuracy: 'Class III (e=5g)',
      businessId: biz1.id,
      purchaseDate: '2024-01-15',
      installationDate: '2024-01-20',
      location: 'Packaging Counter',
      installationAddress: 'Plot No. 45, Industrial Area, Phase II, New Delhi',
      status: 'REGISTERED',
    },
  });

  const inst4 = await prisma.instrument.create({
    data: {
      id: 'inst_4',
      serialNumber: 'SN-2023-FD-004',
      name: 'Dual Hose Fuel Dispenser',
      type: 'FUEL_DISPENSER',
      make: 'Gilbarco Veeder-Root',
      model: 'SK700-2',
      capacity: '70 L/min',
      accuracy: 'Class 0.5',
      businessId: biz2.id,
      purchaseDate: '2023-04-10',
      installationDate: '2023-05-01',
      location: 'Dispensing Island 1',
      installationAddress: '12-B, Commercial Complex, Andheri East, Mumbai',
      lastVerificationDate: '2023-06-20',
      status: 'CERTIFIED',
      lastInspectionDate: '2023-06-20',
      nextInspectionDue: '2024-06-19',
      currentCertificateId: 'cert_2',
    },
  });

  console.log('✓ Instruments created');

  // 5. Create Applications
  const app1 = await prisma.application.create({
    data: {
      id: 'app_1',
      applicationNumber: 'MV/DL/2024/00123',
      businessId: biz1.id,
      instrumentId: inst1.id,
      applicationType: 'INITIAL',
      status: 'APPROVED',
      submittedDate: '2024-03-20',
      lastUpdated: '2024-04-15',
      assignedInspectorId: user2.id,
      scheduledInspectionDate: '2024-04-10',
      remarks: 'Application verified and approved. Certificate issued.',
      fees: 2500,
      feesPaid: true,
      documents: {
        create: [
          {
            name: 'Purchase_Invoice_WS001.pdf',
            type: 'PURCHASE_INVOICE',
            uploadDate: '2024-03-20',
            status: 'VERIFIED',
          },
          {
            name: 'Model_Approval_Cert.pdf',
            type: 'CALIBRATION_REPORT',
            uploadDate: '2024-03-20',
            status: 'VERIFIED',
          },
        ],
      },
    },
  });

  const app2 = await prisma.application.create({
    data: {
      id: 'app_2',
      applicationNumber: 'MV/DL/2024/00187',
      businessId: biz1.id,
      instrumentId: inst2.id,
      applicationType: 'INITIAL',
      status: 'INSPECTION_SCHEDULED',
      submittedDate: '2024-08-10',
      lastUpdated: '2024-09-03',
      assignedInspectorId: user2.id,
      scheduledInspectionDate: '2024-09-10',
      remarks: 'Physical inspection scheduled with Inspector Priya Sharma.',
      fees: 5000,
      feesPaid: true,
      documents: {
        create: [
          {
            name: 'Weighbridge_Invoice.pdf',
            type: 'PURCHASE_INVOICE',
            uploadDate: '2024-08-10',
            status: 'VERIFIED',
          },
          {
            name: 'Civil_Foundation_Plan.pdf',
            type: 'OTHER',
            uploadDate: '2024-08-10',
            status: 'VERIFIED',
          },
        ],
      },
    },
  });

  const app3 = await prisma.application.create({
    data: {
      id: 'app_3',
      applicationNumber: 'MV/DL/2024/00203',
      businessId: biz1.id,
      instrumentId: inst3.id,
      applicationType: 'INITIAL',
      status: 'SUBMITTED',
      submittedDate: '2024-09-04',
      lastUpdated: '2024-09-04',
      remarks: 'Application under preliminary administrative scrutiny.',
      fees: 1500,
      feesPaid: true,
      documents: {
        create: [
          {
            name: 'Counter_Scale_Invoice.pdf',
            type: 'PURCHASE_INVOICE',
            uploadDate: '2024-09-04',
            status: 'PENDING',
          },
        ],
      },
    },
  });

  const appHistoric = await prisma.application.create({
    data: {
      id: 'app_historic_1',
      applicationNumber: 'MV/MH/2023/00882',
      businessId: biz2.id,
      instrumentId: inst4.id,
      applicationType: 'INITIAL',
      status: 'APPROVED',
      submittedDate: '2023-05-15',
      lastUpdated: '2023-06-20',
      assignedInspectorId: user2.id,
      scheduledInspectionDate: '2023-06-18',
      remarks: 'Historic verification completed.',
      fees: 3500,
      feesPaid: true,
    },
  });

  console.log('✓ Applications created');

  // 6. Create Inspections
  const insp1 = await prisma.inspection.create({
    data: {
      id: 'insp_1',
      applicationId: app1.id,
      instrumentId: inst1.id,
      businessId: biz1.id,
      inspectorId: user2.id,
      status: 'COMPLETED',
      scheduledDate: '2024-04-10',
      completedDate: '2024-04-15',
      overallResult: 'APPROVED',
      inspectorRemarks: 'Instrument is in excellent physical condition. Error within MPE. Lead seal applied.',
      evidencePhotos: JSON.stringify([
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&q=80',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80',
      ]),
      checklist: {
        create: [
          { question: 'Serial number matches physical stamping & application', category: 'PHYSICAL_CONDITION', result: 'PASS' },
          { question: 'Manufacturer and model match type approval specifications', category: 'PHYSICAL_CONDITION', result: 'PASS' },
          { question: 'Instrument physically present at verified commercial premises', category: 'COMPLIANCE', result: 'PASS' },
          { question: 'Security seal intact and tamper-evident wire intact', category: 'SECURITY', result: 'PASS' },
          { question: 'Calibration acceptable across low, medium & high test points', category: 'ACCURACY', result: 'PASS' },
          { question: 'Zero error acceptable under no-load condition', category: 'ACCURACY', result: 'PASS' },
        ],
      },
      measurementTests: {
        create: [
          { testName: 'Zero Load Test', nominalValue: '0.000', measuredValue: '0.000', tolerance: '0.050', unit: 'kg', result: 'PASS' },
          { testName: '1/3 Max Capacity Test', nominalValue: '166.660', measuredValue: '166.680', tolerance: '0.100', unit: 'kg', result: 'PASS' },
          { testName: '2/3 Max Capacity Test', nominalValue: '333.330', measuredValue: '333.350', tolerance: '0.150', unit: 'kg', result: 'PASS' },
          { testName: 'Full Capacity Test (500kg)', nominalValue: '500.000', measuredValue: '500.040', tolerance: '0.200', unit: 'kg', result: 'PASS' },
        ],
      },
    },
  });

  const insp2 = await prisma.inspection.create({
    data: {
      id: 'insp_2',
      applicationId: app2.id,
      instrumentId: inst2.id,
      businessId: biz1.id,
      inspectorId: user2.id,
      status: 'SCHEDULED',
      scheduledDate: '2024-09-10',
      checklist: {
        create: [
          { question: 'Serial number matches physical stamping & application', category: 'PHYSICAL_CONDITION', result: null },
          { question: 'Load cells free from moisture ingress & mechanical deflection', category: 'PHYSICAL_CONDITION', result: null },
          { question: 'Foundation pit drainage operational', category: 'SAFETY', result: null },
        ],
      },
      measurementTests: {
        create: [
          { testName: 'Corner Load Test', nominalValue: '15.000', measuredValue: '0.000', tolerance: '0.020', unit: 'T', result: null },
          { testName: 'Standard Test Truck Load', nominalValue: '30.000', measuredValue: '0.000', tolerance: '0.030', unit: 'T', result: null },
        ],
      },
    },
  });

  console.log('✓ Inspections created');

  // 7. Create Certificates
  const cert1 = await prisma.certificate.create({
    data: {
      id: 'cert_1',
      certificateNumber: 'MV/DL/CERT/2024/00123',
      applicationId: app1.id,
      instrumentId: inst1.id,
      businessId: biz1.id,
      inspectorId: user2.id,
      issueDate: '2024-04-15',
      expiryDate: '2025-04-14',
      status: 'VERIFIED',
      stampNumber: 'STAMP-DL-2024-0891',
      issuingAuthority: 'Department of Legal Metrology, Government of NCT of Delhi',
      issuingOfficer: 'Smt. Priya Sharma, Legal Metrology Officer',
      instrumentDetails: JSON.stringify({
        name: inst1.name,
        type: inst1.type,
        make: inst1.make,
        model: inst1.model,
        serialNumber: inst1.serialNumber,
        capacity: inst1.capacity,
        accuracy: inst1.accuracy,
      }),
      businessDetails: JSON.stringify({
        name: biz1.name,
        address: biz1.address,
        city: biz1.city,
        state: biz1.state,
        gstin: biz1.gstin,
      }),
    },
  });

  const cert2 = await prisma.certificate.create({
    data: {
      id: 'cert_2',
      certificateNumber: 'MV/MH/CERT/2023/00882',
      applicationId: 'app_historic_1',
      instrumentId: inst4.id,
      businessId: biz2.id,
      inspectorId: user2.id,
      issueDate: '2023-06-20',
      expiryDate: '2024-06-19',
      status: 'EXPIRED',
      stampNumber: 'STAMP-MH-2023-1044',
      issuingAuthority: 'Controller of Legal Metrology, Maharashtra State',
      issuingOfficer: 'Shri S. K. Kulkarni, Assistant Controller',
      instrumentDetails: JSON.stringify({
        name: inst4.name,
        type: inst4.type,
        make: inst4.make,
        model: inst4.model,
        serialNumber: inst4.serialNumber,
        capacity: inst4.capacity,
        accuracy: inst4.accuracy,
      }),
      businessDetails: JSON.stringify({
        name: biz2.name,
        address: biz2.address,
        city: biz2.city,
        state: biz2.state,
        gstin: biz2.gstin,
      }),
    },
  });

  console.log('✓ Certificates created');

  // 8. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user1.id,
        title: 'Certificate Issued',
        message: 'Your certificate MV/DL/CERT/2024/00123 for Electronic Platform Scale has been issued.',
        type: 'SUCCESS',
        isRead: false,
        link: '/business/certificates',
        createdAt: new Date('2024-04-15T10:30:00Z'),
      },
      {
        userId: user1.id,
        title: 'Inspection Scheduled',
        message: 'Inspection for Industrial Weighbridge (MV/DL/2024/00187) scheduled for September 10, 2026.',
        type: 'INFO',
        isRead: false,
        link: '/business/inspections',
        createdAt: new Date('2024-09-03T14:00:00Z'),
      },
      {
        userId: user1.id,
        title: 'Application Submitted',
        message: 'Application MV/DL/2024/00203 for Counter Weighing Scale has been submitted.',
        type: 'INFO',
        isRead: true,
        link: '/business/applications',
        createdAt: new Date('2024-09-04T09:15:00Z'),
      },
      {
        userId: user2.id,
        title: 'New Inspection Assigned',
        message: 'You have been assigned to inspect Industrial Weighbridge at Kumar Weighing Solutions on Sep 10, 2026.',
        type: 'INFO',
        isRead: false,
        link: '/inspector/inspections',
        createdAt: new Date('2024-09-03T14:00:00Z'),
      },
    ],
  });

  console.log('✓ Notifications created');
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
