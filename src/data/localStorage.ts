import type {
  User,
  Business,
  Instrument,
  Application,
  Inspection,
  Certificate,
  Notification,
} from '@/types';
import {
  MOCK_USERS,
  MOCK_BUSINESSES,
  MOCK_INSTRUMENTS,
  MOCK_APPLICATIONS,
  MOCK_INSPECTIONS,
  MOCK_CERTIFICATES,
  MOCK_NOTIFICATIONS,
} from '@/data/mockData';

// ============================================================
// Storage Keys
// ============================================================

const KEYS = {
  AUTH_USER:     'mv_auth_user',
  USERS:         'mv_users',
  BUSINESSES:    'mv_businesses',
  INSTRUMENTS:   'mv_instruments',
  APPLICATIONS:  'mv_applications',
  INSPECTIONS:   'mv_inspections',
  CERTIFICATES:  'mv_certificates',
  NOTIFICATIONS: 'mv_notifications',
  SEEDED:        'mv_seeded',
} as const;

// ============================================================
// Generic helpers
// ============================================================

function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function getList<T>(key: string, fallback: T[]): T[] {
  return getItem<T[]>(key) ?? fallback;
}

// ============================================================
// Seed / Init
// ============================================================

/**
 * Call once on app start. Seeds localStorage with mock data
 * if it has not been seeded before.
 */
export function seedIfNeeded(): void {
  if (localStorage.getItem(KEYS.SEEDED)) return;
  setItem(KEYS.USERS,         MOCK_USERS);
  setItem(KEYS.BUSINESSES,    MOCK_BUSINESSES);
  setItem(KEYS.INSTRUMENTS,   MOCK_INSTRUMENTS);
  setItem(KEYS.APPLICATIONS,  MOCK_APPLICATIONS);
  setItem(KEYS.INSPECTIONS,   MOCK_INSPECTIONS);
  setItem(KEYS.CERTIFICATES,  MOCK_CERTIFICATES);
  setItem(KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS);
  localStorage.setItem(KEYS.SEEDED, 'true');
}

/** Wipe all app data and re-seed (useful for demo reset). */
export function resetAndReseed(): void {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  seedIfNeeded();
}

// ============================================================
// Auth
// ============================================================

export function getAuthUser(): User | null {
  return getItem<User>(KEYS.AUTH_USER);
}

export function setAuthUser(user: User): void {
  // Store only non-sensitive fields
  const safeUser = { ...user, password: '' };
  setItem(KEYS.AUTH_USER, safeUser);
}

export function clearAuthUser(): void {
  localStorage.removeItem(KEYS.AUTH_USER);
}

export function findUserByCredentials(email: string, password: string): User | null {
  const users = getList<User>(KEYS.USERS, MOCK_USERS);
  return users.find(u => u.email === email && u.password === password) ?? null;
}

export function findUserById(id: string): User | null {
  const users = getList<User>(KEYS.USERS, MOCK_USERS);
  return users.find(u => u.id === id) ?? null;
}

// ============================================================
// Businesses
// ============================================================

export function getBusinesses(): Business[] {
  return getList<Business>(KEYS.BUSINESSES, MOCK_BUSINESSES);
}

export function getBusinessById(id: string): Business | null {
  return getBusinesses().find(b => b.id === id) ?? null;
}

export function getBusinessByOwnerId(ownerId: string): Business | null {
  return getBusinesses().find(b => b.ownerId === ownerId) ?? null;
}

export function saveBusiness(business: Business): void {
  const list = getBusinesses();
  const idx = list.findIndex(b => b.id === business.id);
  if (idx >= 0) list[idx] = business;
  else list.push(business);
  setItem(KEYS.BUSINESSES, list);
}

// ============================================================
// Instruments
// ============================================================

export function getInstruments(): Instrument[] {
  return getList<Instrument>(KEYS.INSTRUMENTS, MOCK_INSTRUMENTS);
}

export function getInstrumentById(id: string): Instrument | null {
  return getInstruments().find(i => i.id === id) ?? null;
}

export function getInstrumentsByBusiness(businessId: string): Instrument[] {
  return getInstruments().filter(i => i.businessId === businessId);
}

export function saveInstrument(instrument: Instrument): void {
  const list = getInstruments();
  const idx = list.findIndex(i => i.id === instrument.id);
  if (idx >= 0) list[idx] = instrument;
  else list.push(instrument);
  setItem(KEYS.INSTRUMENTS, list);
}

// ============================================================
// Applications
// ============================================================

export function getApplications(): Application[] {
  return getList<Application>(KEYS.APPLICATIONS, MOCK_APPLICATIONS);
}

export function getApplicationById(id: string): Application | null {
  return getApplications().find(a => a.id === id) ?? null;
}

export function getApplicationsByBusiness(businessId: string): Application[] {
  return getApplications().filter(a => a.businessId === businessId);
}

export function getApplicationsByInspector(inspectorId: string): Application[] {
  return getApplications().filter(a => a.assignedInspectorId === inspectorId);
}

export function saveApplication(application: Application): void {
  const list = getApplications();
  const idx = list.findIndex(a => a.id === application.id);
  if (idx >= 0) list[idx] = application;
  else list.push(application);
  setItem(KEYS.APPLICATIONS, list);
}

// ============================================================
// Inspections
// ============================================================

export function getInspections(): Inspection[] {
  return getList<Inspection>(KEYS.INSPECTIONS, MOCK_INSPECTIONS);
}

export function getInspectionById(id: string): Inspection | null {
  return getInspections().find(i => i.id === id) ?? null;
}

export function getInspectionByApplication(applicationId: string): Inspection | null {
  return getInspections().find(i => i.applicationId === applicationId) ?? null;
}

export function getInspectionsByInspector(inspectorId: string): Inspection[] {
  return getInspections().filter(i => i.inspectorId === inspectorId);
}

export function getInspectionsByBusiness(businessId: string): Inspection[] {
  return getInspections().filter(i => i.businessId === businessId);
}

export function saveInspection(inspection: Inspection): void {
  const list = getInspections();
  const idx = list.findIndex(i => i.id === inspection.id);
  if (idx >= 0) list[idx] = inspection;
  else list.push(inspection);
  setItem(KEYS.INSPECTIONS, list);
}

// ============================================================
// Certificates
// ============================================================

export function getCertificates(): Certificate[] {
  return getList<Certificate>(KEYS.CERTIFICATES, MOCK_CERTIFICATES);
}

export function getCertificateById(id: string): Certificate | null {
  return getCertificates().find(c => c.id === id) ?? null;
}

export function getCertificateByNumber(certNumber: string): Certificate | null {
  return getCertificates().find(c => c.certificateNumber === certNumber) ?? null;
}

export function getCertificatesByBusiness(businessId: string): Certificate[] {
  return getCertificates().filter(c => c.businessId === businessId);
}

export function saveCertificate(certificate: Certificate): void {
  const list = getCertificates();
  const idx = list.findIndex(c => c.id === certificate.id);
  if (idx >= 0) list[idx] = certificate;
  else list.push(certificate);
  setItem(KEYS.CERTIFICATES, list);
}

// ============================================================
// Notifications
// ============================================================

export function getNotifications(): Notification[] {
  return getList<Notification>(KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS);
}

export function getNotificationsByUser(userId: string): Notification[] {
  return getNotifications().filter(n => n.userId === userId);
}

export function markNotificationRead(id: string): void {
  const list = getNotifications();
  const idx = list.findIndex(n => n.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], isRead: true };
    setItem(KEYS.NOTIFICATIONS, list);
  }
}

export function markAllNotificationsRead(userId: string): void {
  const list = getNotifications().map(n =>
    n.userId === userId ? { ...n, isRead: true } : n
  );
  setItem(KEYS.NOTIFICATIONS, list);
}

export function saveNotification(notification: Notification): void {
  const list = getNotifications();
  const idx = list.findIndex(n => n.id === notification.id);
  if (idx >= 0) list[idx] = notification;
  else list.push(notification);
  setItem(KEYS.NOTIFICATIONS, list);
}

/** Convenience: push a brand-new notification */
export function addNotification(
  userId: string,
  title: string,
  message: string,
  type: Notification['type'],
  link?: string,
): void {
  const notif: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId,
    title,
    message,
    type,
    isRead: false,
    createdAt: new Date().toISOString(),
    link,
  };
  saveNotification(notif);
}

// ============================================================
// ID Generators
// ============================================================

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function generateApplicationNumber(state: string): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 90000) + 10000;
  return `MV/${state}/${year}/${seq}`;
}

export function generateCertificateNumber(state: string): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 90000) + 10000;
  return `MV/${state}/CERT/${year}/${seq}`;
}

export function generateStampNumber(stateCode: string): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `${stateCode}-LM-${year}-${seq}`;
}
