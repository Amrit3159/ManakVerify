import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, FileText, Award, Bell, Plus, ArrowRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { StatCard, Card, CardHeader, CardDivider } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ApplicationStatusBadge, InstrumentStatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export default function BusinessDashboardPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const { getInstrumentsByBusiness, getApplicationsByBusiness, getCertificatesByBusiness, userNotifications } = useData();

  const businessId   = user?.businessId ?? '';
  const instruments  = getInstrumentsByBusiness(businessId);
  const applications = getApplicationsByBusiness(businessId);
  const certificates = getCertificatesByBusiness(businessId);
  const unread       = userNotifications.filter(n => !n.isRead).length;

  const certifiedCount = instruments.filter(i => i.status === 'CERTIFIED').length;
  const pendingApps    = applications.filter(a => !['APPROVED', 'REJECTED'].includes(a.status));
  const recentApps     = applications.slice().sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, 4);

  const firstName = user?.name.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Welcome back, {firstName} 👋</h1>
          <p className="page-subtitle">Here's an overview of your instruments and applications.</p>
        </div>
        <Button
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/business/instruments/register')}
        >
          Register Instrument
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="cursor-pointer" onClick={() => navigate('/business/instruments')}>
          <StatCard
            label="Total Instruments"
            value={instruments.length}
            icon={<Scale className="w-5 h-5" />}
            color="indigo"
          />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/business/instruments')}>
          <StatCard
            label="Certified"
            value={certifiedCount}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="teal"
          />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/business/applications')}>
          <StatCard
            label="Pending Applications"
            value={pendingApps.length}
            icon={<Clock className="w-5 h-5" />}
            color="orange"
          />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/business/certificates')}>
          <StatCard
            label="Certificates Issued"
            value={certificates.length}
            icon={<Award className="w-5 h-5" />}
            color="green"
          />
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="p-5 pb-0">
              <CardHeader
                title="Recent Applications"
                description="Your latest verification applications"
                action={
                  <Button size="xs" variant="ghost" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => navigate('/business/applications')}>
                    View All
                  </Button>
                }
              />
            </div>
            <CardDivider className="mx-5" />
            {recentApps.length === 0 ? (
              <EmptyState
                title="No applications yet"
                description="Submit your first instrument verification application."
                action={
                  <Button size="sm" onClick={() => navigate('/business/instruments/register')}>
                    New Application
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {recentApps.map(app => (
                  <div
                    key={app.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/business/applications/${app.id}`)}
                  >
                    <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{app.applicationNumber}</p>
                      <p className="text-xs text-gray-500">
                        {app.applicationType === 'INITIAL' ? 'Initial Verification' : 'Renewal'} &bull; Updated {app.lastUpdated}
                      </p>
                    </div>
                    <ApplicationStatusBadge status={app.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Instruments overview */}
          <Card padding="none">
            <div className="p-5 pb-0">
              <CardHeader
                title="My Instruments"
                action={
                  <Button size="xs" variant="ghost" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => navigate('/business/instruments')}>
                    View All
                  </Button>
                }
              />
            </div>
            <CardDivider className="mx-5" />
            {instruments.length === 0 ? (
              <EmptyState
                title="No instruments registered"
                icon={<Scale className="w-6 h-6" />}
                action={
                  <Button size="sm" onClick={() => navigate('/business/instruments/register')}>
                    Add Instrument
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {instruments.slice(0, 4).map(inst => (
                  <div
                    key={inst.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate('/business/instruments')}
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <Scale className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{inst.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{inst.serialNumber}</p>
                    </div>
                    <InstrumentStatusBadge status={inst.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader
              title="Notifications"
              description={`${unread} unread`}
              action={
                <Button size="xs" variant="ghost" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => navigate('/business/notifications')}>
                  All
                </Button>
              }
            />
            <CardDivider />
            {userNotifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No notifications</p>
            ) : (
              <div className="space-y-3">
                {userNotifications.slice(0, 3).map(n => (
                  <div key={n.id} className={['flex gap-3', !n.isRead ? 'opacity-100' : 'opacity-60'].join(' ')}>
                    <div className="mt-0.5 shrink-0">
                      {n.type === 'SUCCESS' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : n.type === 'WARNING' ? (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <Bell className="w-4 h-4 text-indigo-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
