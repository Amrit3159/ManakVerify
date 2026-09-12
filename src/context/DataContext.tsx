import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type {
  Business,
  Instrument,
  Application,
  Inspection,
  Certificate,
  Notification,
} from '@/types';
import {
  businessApi,
  instrumentApi,
  applicationApi,
  inspectionApi,
  certificateApi,
  notificationApi,
} from '@/services/api';
import { useAuth } from '@/context/AuthContext';

// ============================================================
// Types
// ============================================================

interface DataContextValue {
  // Businesses
  businesses: Business[];
  getBusinessById: (id: string) => Business | null;
  getBusinessByOwnerId: (ownerId: string) => Business | null;
  saveBusiness: (b: Business) => Promise<void> | void;

  // Instruments
  instruments: Instrument[];
  getInstrumentById: (id: string) => Instrument | null;
  getInstrumentsByBusiness: (bizId: string) => Instrument[];
  saveInstrument: (i: Instrument) => Promise<void> | void;

  // Applications
  applications: Application[];
  getApplicationById: (id: string) => Application | null;
  getApplicationsByBusiness: (bizId: string) => Application[];
  getApplicationsByInspector: (inspId: string) => Application[];
  saveApplication: (a: Application) => Promise<void> | void;

  // Inspections
  inspections: Inspection[];
  getInspectionById: (id: string) => Inspection | null;
  getInspectionByApplication: (appId: string) => Inspection | null;
  getInspectionsByInspector: (inspId: string) => Inspection[];
  getInspectionsByBusiness: (bizId: string) => Inspection[];
  saveInspection: (i: Inspection) => Promise<void> | void;

  // Certificates
  certificates: Certificate[];
  getCertificateById: (id: string) => Certificate | null;
  getCertificateByNumber: (num: string) => Certificate | null;
  getCertificatesByBusiness: (bizId: string) => Certificate[];
  saveCertificate: (c: Certificate) => Promise<void> | void;

  // Notifications
  notifications: Notification[];
  userNotifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  saveNotification: (n: Notification) => void;

  // Refresh
  refresh: () => void;
}

// ============================================================
// Context
// ============================================================

const DataContext = createContext<DataContextValue | null>(null);

// ============================================================
// Provider
// ============================================================

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  const [businesses,    setBusinesses]    = useState<Business[]>([]);
  const [instruments,   setInstruments]   = useState<Instrument[]>([]);
  const [applications,  setApplications]  = useState<Application[]>([]);
  const [inspections,   setInspections]   = useState<Inspection[]>([]);
  const [certificates,  setCertificates]  = useState<Certificate[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refresh = useCallback(async () => {
    // If not authenticated, load public/sample certificates
    if (!isAuthenticated) {
      try {
        const certs = await certificateApi.getAll().catch(() => []);
        setCertificates(
          certs.map((c: any) => ({
            ...c,
            instrumentDetails:
              typeof c.instrumentDetails === 'string'
                ? JSON.parse(c.instrumentDetails)
                : c.instrumentDetails,
            businessDetails:
              typeof c.businessDetails === 'string'
                ? JSON.parse(c.businessDetails)
                : c.businessDetails,
          }))
        );
      } catch {
        // ignore
      }
      return;
    }

    try {
      const [
        bizData,
        instData,
        appData,
        inspData,
        certData,
        notifData,
      ] = await Promise.all([
        businessApi.getAll().catch(() => []),
        instrumentApi.getAll().catch(() => []),
        applicationApi.getAll().catch(() => []),
        inspectionApi.getAll().catch(() => []),
        certificateApi.getAll().catch(() => []),
        notificationApi.getAll().catch(() => []),
      ]);

      setBusinesses(bizData);
      setInstruments(instData);
      setApplications(appData);

      // Parse JSON fields in inspections
      setInspections(
        inspData.map((i: any) => ({
          ...i,
          evidencePhotos:
            typeof i.evidencePhotos === 'string'
              ? JSON.parse(i.evidencePhotos)
              : i.evidencePhotos || [],
        }))
      );

      // Parse JSON fields in certificates
      setCertificates(
        certData.map((c: any) => ({
          ...c,
          instrumentDetails:
            typeof c.instrumentDetails === 'string'
              ? JSON.parse(c.instrumentDetails)
              : c.instrumentDetails,
          businessDetails:
            typeof c.businessDetails === 'string'
              ? JSON.parse(c.businessDetails)
              : c.businessDetails,
        }))
      );

      setNotifications(notifData);
    } catch (err) {
      console.error('Failed to refresh backend data:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Business accessors
  const getBusinessById = useCallback(
    (id: string): Business | null => businesses.find(b => b.id === id) ?? null,
    [businesses]
  );

  const getBusinessByOwnerId = useCallback(
    (ownerId: string): Business | null => businesses.find(b => b.ownerId === ownerId) ?? null,
    [businesses]
  );

  const saveBusiness = useCallback(
    async (b: Business) => {
      try {
        await businessApi.update(b.id, b);
        refresh();
      } catch (e) {
        console.error('Failed to save business:', e);
      }
    },
    [refresh]
  );

  // Instrument accessors
  const getInstrumentById = useCallback(
    (id: string): Instrument | null => instruments.find(i => i.id === id) ?? null,
    [instruments]
  );

  const getInstrumentsByBusiness = useCallback(
    (bizId: string): Instrument[] =>
      instruments.filter(i => i.businessId === bizId),
    [instruments]
  );

  const saveInstrument = useCallback(
    async (i: Instrument) => {
      try {
        const existing = instruments.find(inst => inst.id === i.id);
        if (existing) {
          await instrumentApi.update(i.id, i);
        } else {
          await instrumentApi.create(i);
        }
        refresh();
      } catch (e) {
        console.error('Failed to save instrument:', e);
      }
    },
    [instruments, refresh]
  );

  // Application accessors
  const getApplicationById = useCallback(
    (id: string): Application | null => applications.find(a => a.id === id) ?? null,
    [applications]
  );

  const getApplicationsByBusiness = useCallback(
    (bizId: string): Application[] =>
      applications.filter(a => a.businessId === bizId),
    [applications]
  );

  const getApplicationsByInspector = useCallback(
    (inspId: string): Application[] =>
      applications.filter(a => a.assignedInspectorId === inspId),
    [applications]
  );

  const saveApplication = useCallback(
    async (a: Application) => {
      try {
        const existing = applications.find(app => app.id === a.id);
        if (existing) {
          if (a.assignedInspectorId && a.scheduledInspectionDate && user?.role === 'admin') {
            await applicationApi.assignInspector(a.id, a.assignedInspectorId, a.scheduledInspectionDate);
          } else {
            await applicationApi.updateStatus(a.id, a.status, a.remarks);
          }
        } else {
          await applicationApi.create(a);
        }
        refresh();
      } catch (e) {
        console.error('Failed to save application:', e);
      }
    },
    [applications, user, refresh]
  );

  // Inspection accessors
  const getInspectionById = useCallback(
    (id: string): Inspection | null => inspections.find(i => i.id === id) ?? null,
    [inspections]
  );

  const getInspectionByApplication = useCallback(
    (appId: string): Inspection | null => inspections.find(i => i.applicationId === appId) ?? null,
    [inspections]
  );

  const getInspectionsByInspector = useCallback(
    (inspId: string): Inspection[] =>
      inspections.filter(i => i.inspectorId === inspId),
    [inspections]
  );

  const getInspectionsByBusiness = useCallback(
    (bizId: string): Inspection[] =>
      inspections.filter(i => i.businessId === bizId),
    [inspections]
  );

  const saveInspection = useCallback(
    async (i: Inspection) => {
      try {
        if (i.status === 'COMPLETED' && i.overallResult) {
          await inspectionApi.submit(i.id, {
            decision: i.overallResult,
            remarks: i.inspectorRemarks || '',
            checklist: i.checklist || [],
            measurementTests: i.measurementTests || [],
            evidencePhotos: i.evidencePhotos || [],
          });
        }
        refresh();
      } catch (e) {
        console.error('Failed to submit inspection:', e);
      }
    },
    [refresh]
  );

  // Certificate accessors
  const getCertificateById = useCallback(
    (id: string): Certificate | null => certificates.find(c => c.id === id) ?? null,
    [certificates]
  );

  const getCertificateByNumber = useCallback(
    (num: string): Certificate | null =>
      certificates.find(
        c => c.certificateNumber.toLowerCase() === num.trim().toLowerCase()
      ) ?? null,
    [certificates]
  );

  const getCertificatesByBusiness = useCallback(
    (bizId: string): Certificate[] =>
      certificates.filter(c => c.businessId === bizId),
    [certificates]
  );

  const saveCertificate = useCallback(
    async (_c: Certificate) => {
      // In the real backend, certificates are generated automatically by inspection submission or admin approval
      refresh();
    },
    [refresh]
  );

  // Notifications
  const userNotifications = useMemo(() => {
    if (!user) return [];
    return notifications.filter(n => n.userId === user.id);
  }, [notifications, user]);

  const unreadCount = useMemo(
    () => userNotifications.filter(n => !n.isRead).length,
    [userNotifications]
  );

  const markRead = useCallback(
    async (id: string) => {
      try {
        await notificationApi.markRead(id);
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
      } catch (e) {
        console.error('Failed to mark notification read:', e);
      }
    },
    []
  );

  const markAllRead = useCallback(async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error('Failed to mark all read:', e);
    }
  }, []);

  const saveNotification = useCallback(
    async (_n: Notification) => {
      refresh();
    },
    [refresh]
  );

  const value: DataContextValue = {
    businesses,
    getBusinessById,
    getBusinessByOwnerId,
    saveBusiness,

    instruments,
    getInstrumentById,
    getInstrumentsByBusiness,
    saveInstrument,

    applications,
    getApplicationById,
    getApplicationsByBusiness,
    getApplicationsByInspector,
    saveApplication,

    inspections,
    getInspectionById,
    getInspectionByApplication,
    getInspectionsByInspector,
    getInspectionsByBusiness,
    saveInspection,

    certificates,
    getCertificateById,
    getCertificateByNumber,
    getCertificatesByBusiness,
    saveCertificate,

    notifications,
    userNotifications,
    unreadCount,
    markRead,
    markAllRead,
    saveNotification,

    refresh,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// ============================================================
// Hook
// ============================================================

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
