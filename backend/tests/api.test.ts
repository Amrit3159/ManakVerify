import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let businessToken: string;
let inspectorToken: string;
let adminToken: string;
let createdInstrumentId: string;
let createdApplicationId: string;
let createdInspectionId: string;
let issuedCertNumber: string;

describe('MaanakVerify Critical Backend Test Suite', () => {
  beforeAll(async () => {
    // Database is already seeded
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1. Registration
  it('1. POST /api/auth/register should register a new business user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Business User',
        email: `testbiz_${Date.now()}@example.com`,
        password: 'password123',
        phone: '9876543210',
        role: 'business',
        businessName: 'Test Enterprises Ltd',
        gstin: `07AAACT${Math.floor(1000 + Math.random() * 9000)}M1Z1`,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('business');
  });

  // 2. Login
  it('2. POST /api/auth/login should log in with valid credentials and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rajesh@kumarweighing.in',
        password: 'demo1234',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    businessToken = res.body.data.token;

    // Also acquire inspector and admin tokens
    const inspRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'priya.sharma@legalmetrology.gov.in',
        password: 'demo1234',
      });
    inspectorToken = inspRes.body.data.token;

    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'vikram.singh@legalmetrology.gov.in',
        password: 'demo1234',
      });
    adminToken = adminRes.body.data.token;
  });

  // 3. Invalid login
  it('3. POST /api/auth/login should reject incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rajesh@kumarweighing.in',
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 4. /auth/me
  it('4. GET /api/auth/me should return current authenticated user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${businessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('rajesh@kumarweighing.in');
  });

  // 5. Unauthorized request
  it('5. GET /api/instruments should reject request without token', async () => {
    const res = await request(app).get('/api/instruments');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 6. Role authorization
  it('6. POST /api/applications/:id/assign-inspector should reject business user', async () => {
    const res = await request(app)
      .post('/api/applications/app_1/assign-inspector')
      .set('Authorization', `Bearer ${businessToken}`)
      .send({
        inspectorId: 'user_2',
        scheduledDate: '2026-10-01',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 7. Business ownership protection
  it('7. GET /api/business/biz_2 should prevent business 1 from accessing business 2 details', async () => {
    const res = await request(app)
      .get('/api/business/biz_2')
      .set('Authorization', `Bearer ${businessToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 8. Instrument creation
  it('8. POST /api/instruments should create an instrument for the authenticated business', async () => {
    const serial = `TEST-SN-${Date.now()}`;
    const res = await request(app)
      .post('/api/instruments')
      .set('Authorization', `Bearer ${businessToken}`)
      .send({
        serialNumber: serial,
        name: 'Commercial Bench Scale 50kg',
        type: 'WEIGHING_SCALE',
        make: 'Citizen Scale',
        model: 'CS-50',
        capacity: '50 kg',
        accuracy: 'Class III',
        purchaseDate: '2024-01-01',
        location: 'Bay 1',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    createdInstrumentId = res.body.data.id;
  });

  // 9. Application creation
  it('9. POST /api/applications should create an application for the registered instrument', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${businessToken}`)
      .send({
        instrumentId: createdInstrumentId,
        applicationType: 'INITIAL',
        status: 'SUBMITTED',
        remarks: 'Verification required for commercial dispatch.',
        documents: [
          {
            name: 'Tax_Invoice.pdf',
            type: 'PURCHASE_INVOICE',
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.applicationNumber).toBeDefined();
    createdApplicationId = res.body.data.id;
  });

  // 10. Application submission / status check
  it('10. GET /api/applications/:id should retrieve submitted application', async () => {
    const res = await request(app)
      .get(`/api/applications/${createdApplicationId}`)
      .set('Authorization', `Bearer ${businessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SUBMITTED');
  });

  // 11. Invalid status transition
  it('11. PATCH /api/applications/:id/status should reject invalid direct transition to DRAFT', async () => {
    const res = await request(app)
      .patch(`/api/applications/${createdApplicationId}/status`)
      .set('Authorization', `Bearer ${businessToken}`)
      .send({ status: 'DRAFT' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 12. Inspector assignment by Admin
  it('12. POST /api/applications/:id/assign-inspector allows Admin to assign inspector', async () => {
    const res = await request(app)
      .post(`/api/applications/${createdApplicationId}/assign-inspector`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        inspectorId: 'user_2',
        scheduledDate: '2026-10-15',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.application.status).toBe('INSPECTION_SCHEDULED');
    expect(res.body.data.inspection).toBeDefined();
    createdInspectionId = res.body.data.inspection.id;
  });

  // 13. Inspection completion by Assigned Inspector
  it('13. POST /api/inspections/:id/submit allows assigned inspector to complete inspection', async () => {
    const res = await request(app)
      .post(`/api/inspections/${createdInspectionId}/submit`)
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({
        decision: 'APPROVED',
        remarks: 'Instrument verified within statutory MPE standards.',
        checklist: [
          { question: 'Serial number verified', result: 'PASS' },
          { question: 'Stamping intact', result: 'PASS' },
        ],
        measurementTests: [
          {
            testName: 'Half Load Test',
            nominalValue: '25.000',
            measuredValue: '25.002',
            tolerance: '0.010',
            unit: 'kg',
            result: 'PASS',
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.inspection.status).toBe('COMPLETED');
    expect(res.body.data.inspection.overallResult).toBe('APPROVED');
    expect(res.body.data.certificate).toBeDefined();
    issuedCertNumber = res.body.data.certificate.certificateNumber;
  });

  // 14. Certificate issuance verification
  it('14. Certificate should be created with VERIFIED status and unique stamp number', async () => {
    const res = await request(app)
      .get('/api/certificates')
      .set('Authorization', `Bearer ${businessToken}`);

    expect(res.status).toBe(200);
    const cert = res.body.data.find((c: any) => c.certificateNumber === issuedCertNumber);
    expect(cert).toBeDefined();
    expect(cert.status).toBe('VERIFIED');
    expect(cert.stampNumber).toBeDefined();
  });

  // 15. Certificate uniqueness
  it('15. Submitting already completed inspection should be rejected', async () => {
    const res = await request(app)
      .post(`/api/inspections/${createdInspectionId}/submit`)
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({
        decision: 'APPROVED',
        remarks: 'Duplicate submission attempt',
        checklist: [],
        measurementTests: [],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 16. Public certificate verification
  it('16. GET /api/public/certificates/verify/:identifier verifies certificate without auth', async () => {
    const res = await request(app)
      .get(`/api/public/certificates/verify/${encodeURIComponent(issuedCertNumber)}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.certificateNumber).toBe(issuedCertNumber);
    expect(res.body.data.isValid).toBe(true);
    expect(res.body.data.status).toBe('VERIFIED');
    // Ensure no passwords or user secrets are returned
    expect(res.body.data.password).toBeUndefined();
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  // 17. Notification access
  it('17. GET /api/notifications should return user-scoped notifications', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${businessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // 18. Admin-only endpoint protection
  it('18. GET /api/admin/dashboard should reject non-admin users', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${businessToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);

    // Should succeed for admin
    const adminRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminRes.status).toBe(200);
    expect(adminRes.body.data.totalInstruments).toBeGreaterThan(0);
    expect(adminRes.body.data.totalBusinesses).toBeGreaterThan(0);
  });

  // 19. POST /api/auth/sync - existing user link
  it('19. POST /api/auth/sync should link firebaseUid to existing user', async () => {
    const res = await request(app)
      .post('/api/auth/sync')
      .send({
        firebaseUid: 'test-firebase-uid-rajesh',
        email: 'rajesh@kumarweighing.in',
        name: 'Rajesh Kumar',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('rajesh@kumarweighing.in');
    expect(res.body.data.role).toBe('business');
    expect(res.body.data.token).toBeDefined();
  });

  // 20. POST /api/auth/sync - new user registration via Firebase
  it('20. POST /api/auth/sync should auto-create new user if not found', async () => {
    const randomEmail = `newuser_${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/sync')
      .send({
        firebaseUid: `uid_${Date.now()}`,
        email: randomEmail,
        name: 'New Google User',
        role: 'business',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(randomEmail);
    expect(res.body.data.role).toBe('business');
    expect(res.body.data.token).toBeDefined();
  });
});

