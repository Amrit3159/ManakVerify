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
  getBusinesses, getBusinessById, getBusinessByOwnerId, saveBusiness,
  getInstruments, getInstrumentById, getInstrumentsByBusiness, saveInstrument,
  getApplications, getApplicationById, getApplicationsByBusiness,
  getApplicationsByInspector, saveApplication,
  getInspections, getInspectionById, getInspectionByApplication,
  getInspectionsByInspector, getInspectionsByBusiness, saveInspection,
  getCertificates, getCertificateById, getCertificateByNumber,
  getCertificatesByBusiness, saveCertificate,
  getNotifications, getNotificationsByUser,
  markNotificationRead, markAllNotificationsRead, saveNotification,
} from '@/data/localStorage';
import { useAuth } from '@/context/AuthContext';

// ============================================================
// Types
// ============================================================

interface DataContextValue {
  // Businesses
  businesses: Business[];
  getBusinessById: (id: string) => Business | null;
  getBusinessByOwnerId: (ownerId: string) => Business | null;
  saveBusiness: (b: Business) => void;

  // Instruments
  instruments: Instrument[];
  getInstrumentById: (id: string) => Instrument | null;
  getInstrumentsByBusiness: (bizId: string) => Instrument[];
  saveInstrument: (i: Instrument) => void;

  // Applications
  applications: Application[];
  getApplicationById: (id: string) => Application | null;
  getApplicationsByBusiness: (bizId: string) => Application[];
  getApplicationsByInspector: (inspId: string) => Application[];
  saveApplication: (a: Application) => void;

  // Inspections
  inspections: Inspection[];
  getInspectionById: (id: string) => Inspection | null;
  getInspectionByApplication: (appId: string) => Inspection | null;
  getInspectionsByInspector: (inspId: string) => Inspection[];
  getInspectionsByBusiness: (bizId: string) => Inspection[];
  saveInspection: (i: Inspection) => void;

  // Certificates
  certificates: Certificate[];
  getCertificateById: (id: string) => Certificate | null;
  getCertificateByNumber: (num: string) => Certificate | null;
  getCertificatesByBusiness: (bizId: string) => Certificate[];
  saveCertificate: (c: Certificate) => void;

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
  const { user } = useAuth();

  const [businesses,    setBusinesses]    = useState<Business[]>([]);
  const [instruments,   setInstruments]   = useState<Instrument[]>([]);
  const [applications,  setApplications]  = useState<Application[]>([]);
  const [inspections,   setInspections]   = useState<Inspection[]>([]);
  const [certificates,  setCertificates]  = useState<Certificate[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refresh = useCallback(() => {
    setBusinesses(getBusinesses());
    setInstruments(getInstruments());
    setApplications(getApplications());
    setInspections(getInspections());
    setCertificates(getCertificates());
    setNotifications(getNotifications());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Derived — reactive to notifications state
  const userNotifications = useMemo(
    () => (user ? notifications.filter(n => n.userId === user.id) : []),
    [notifications, user]
  );
  const unreadCount = useMemo(
    () => userNotifications.filter(n => !n.isRead).length,
    [userNotifications]
  );

  // Wrapped mutators that also update state
  const handleSaveBusiness = useCallback((b: Business) => {
    saveBusiness(b);
    setBusinesses(getBusinesses());
  }, []);

  const handleSaveInstrument = useCallback((i: Instrument) => {
    saveInstrument(i);
    setInstruments(getInstruments());
  }, []);

  const handleSaveApplication = useCallback((a: Application) => {
    saveApplication(a);
    setApplications(getApplications());
  }, []);

  const handleSaveInspection = useCallback((i: Inspection) => {
    saveInspection(i);
    setInspections(getInspections());
  }, []);

  const handleSaveCertificate = useCallback((c: Certificate) => {
    saveCertificate(c);
    setCertificates(getCertificates());
  }, []);

  const handleSaveNotification = useCallback((n: Notification) => {
    saveNotification(n);
    setNotifications(getNotifications());
  }, []);

  const handleMarkRead = useCallback((id: string) => {
    markNotificationRead(id);
    setNotifications(getNotifications());
  }, []);

  const handleMarkAllRead = useCallback(() => {
    if (user) markAllNotificationsRead(user.id);
    setNotifications(getNotifications());
  }, [user]);

  const value: DataContextValue = {
    businesses,
    getBusinessById,
    getBusinessByOwnerId,
    saveBusiness: handleSaveBusiness,

    instruments,
    getInstrumentById,
    getInstrumentsByBusiness,
    saveInstrument: handleSaveInstrument,

    applications,
    getApplicationById,
    getApplicationsByBusiness,
    getApplicationsByInspector,
    saveApplication: handleSaveApplication,

    inspections,
    getInspectionById,
    getInspectionByApplication,
    getInspectionsByInspector,
    getInspectionsByBusiness,
    saveInspection: handleSaveInspection,

    certificates,
    getCertificateById,
    getCertificateByNumber,
    getCertificatesByBusiness,
    saveCertificate: handleSaveCertificate,

    notifications,
    userNotifications,
    unreadCount,
    markRead: handleMarkRead,
    markAllRead: handleMarkAllRead,
    saveNotification: handleSaveNotification,

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
