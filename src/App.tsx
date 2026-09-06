import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { FullPageSpinner } from '@/components/ui/Spinner';
import type { UserRole } from '@/types';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
// Business Pages
import BusinessDashboardPage from '@/pages/business/DashboardPage';
import InstrumentsPage from '@/pages/business/InstrumentsPage';
import RegisterInstrumentPage from '@/pages/business/RegisterInstrumentPage';
import ApplicationsPage from '@/pages/business/ApplicationsPage';
import ApplicationDetailPage from '@/pages/business/ApplicationDetailPage';
import CertificatesPage from '@/pages/business/CertificatesPage';
import NotificationsPage from '@/pages/business/NotificationsPage';

import InspectorDashboardPage from '@/pages/inspector/DashboardPage';
import InspectorInspectionsPage from '@/pages/inspector/InspectionsPage';
import InspectionConductPage from '@/pages/inspector/InspectionConductPage';
import InspectorHistoryPage from '@/pages/inspector/HistoryPage';

// Admin Pages
import AdminDashboardPage from '@/pages/admin/DashboardPage';
import AdminApplicationsPage from '@/pages/admin/ApplicationsPage';
import AdminApplicationDetailPage from '@/pages/admin/ApplicationDetailPage';
import AdminBusinessesPage from '@/pages/admin/BusinessesPage';
import AdminInstrumentsPage from '@/pages/admin/InstrumentsPage';
import AdminInspectionsPage from '@/pages/admin/InspectionsPage';
import AdminCertificatesPage from '@/pages/admin/CertificatesPage';
import AdminAnalyticsPage from '@/pages/admin/AnalyticsPage';

import VerifyPage from '@/pages/public/VerifyPage';

// Protected Route Guard
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/verify/:certificateId" element={<VerifyPage />} />

            {/* Business Routes */}
            <Route
              path="/business"
              element={
                <ProtectedRoute allowedRoles={['business']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/business/dashboard" replace />} />
              <Route path="dashboard" element={<BusinessDashboardPage />} />
              <Route path="instruments" element={<InstrumentsPage />} />
              <Route path="instruments/register" element={<RegisterInstrumentPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="applications/:id" element={<ApplicationDetailPage />} />
              <Route path="inspections" element={<ApplicationsPage />} />
              <Route path="certificates" element={<CertificatesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Inspector Routes */}
            <Route
              path="/inspector"
              element={
                <ProtectedRoute allowedRoles={['inspector']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/inspector/dashboard" replace />} />
              <Route path="dashboard" element={<InspectorDashboardPage />} />
              <Route path="inspections" element={<InspectorInspectionsPage />} />
              <Route path="inspections/:id" element={<InspectionConductPage />} />
              <Route path="history" element={<InspectorHistoryPage />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="applications" element={<AdminApplicationsPage />} />
              <Route path="applications/:id" element={<AdminApplicationDetailPage />} />
              <Route path="businesses" element={<AdminBusinessesPage />} />
              <Route path="instruments" element={<AdminInstrumentsPage />} />
              <Route path="inspections" element={<AdminInspectionsPage />} />
              <Route path="certificates" element={<AdminCertificatesPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
