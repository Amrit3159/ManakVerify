import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Clock, CheckCircle2, XCircle, ArrowRight, Calendar, Building2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { StatCard, Card, CardHeader, CardDivider } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { InspectionStatusBadge, InspectionResultBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export default function InspectorDashboardPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const { getInspectionsByInspector, getApplicationsByInspector, getBusinessById, getInstrumentById } = useData();

  const inspectorId  = user?.inspectorId ?? '';
  const inspections  = getInspectionsByInspector(inspectorId);
  const applications = getApplicationsByInspector(inspectorId);

  const scheduled  = inspections.filter(i => i.status === 'SCHEDULED');
  const completed  = inspections.filter(i => i.status === 'COMPLETED');
  const approved   = inspections.filter(i => i.overallResult === 'APPROVED');
  const rejected   = inspections.filter(i => i.overallResult === 'REJECTED');

  const upcoming   = scheduled.slice().sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)).slice(0, 5);
  const recent     = completed.slice().sort((a, b) => (b.completedDate ?? '').localeCompare(a.completedDate ?? '')).slice(0, 4);

  const firstName  = user?.name.split(' ')[0] ?? 'Inspector';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">Inspector Dashboard</h1>
        <p className="page-subtitle">Welcome, {firstName}. Here's your inspection workload.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Assigned"       value={applications.length} icon={<ClipboardList className="w-5 h-5" />} color="indigo" />
        <StatCard label="Scheduled"      value={scheduled.length}    icon={<Clock className="w-5 h-5" />}         color="orange" />
        <StatCard label="Approved"       value={approved.length}     icon={<CheckCircle2 className="w-5 h-5" />}  color="teal"   />
        <StatCard label="Rejected"       value={rejected.length}     icon={<XCircle className="w-5 h-5" />}       color="red"    />
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Upcoming */}
        <Card padding="none">
          <div className="p-5 pb-0">
            <CardHeader
              title="Upcoming Inspections"
              description="Scheduled visits pending completion"
              action={
                <Button size="xs" variant="ghost" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => navigate('/inspector/inspections')}>
                  View All
                </Button>
              }
            />
          </div>
          <CardDivider className="mx-5" />
          {upcoming.length === 0 ? (
            <EmptyState
              title="No upcoming inspections"
              description="All caught up! Check back later."
              icon={<Calendar className="w-6 h-6" />}
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {upcoming.map(insp => {
                const biz  = getBusinessById(insp.businessId);
                const inst = getInstrumentById(insp.instrumentId);
                return (
                  <div
                    key={insp.id}
                    className="flex items-start gap-4 px-5 py-3.5 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate('/inspector/inspections')}
                  >
                    <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {inst?.name ?? 'Instrument'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{biz?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">📅 {insp.scheduledDate}</p>
                    </div>
                    <InspectionStatusBadge status={insp.status} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent completed */}
        <Card padding="none">
          <div className="p-5 pb-0">
            <CardHeader
              title="Recently Completed"
              description="Inspections you have finished"
              action={
                <Button size="xs" variant="ghost" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => navigate('/inspector/history')}>
                  History
                </Button>
              }
            />
          </div>
          <CardDivider className="mx-5" />
          {recent.length === 0 ? (
            <EmptyState
              title="No completed inspections"
              description="Completed inspections will appear here."
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {recent.map(insp => {
                const biz  = getBusinessById(insp.businessId);
                const inst = getInstrumentById(insp.instrumentId);
                return (
                  <div
                    key={insp.id}
                    className="flex items-start gap-4 px-5 py-3.5 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate('/inspector/history')}
                  >
                    <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {inst?.name ?? 'Instrument'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{biz?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">✅ Completed {insp.completedDate}</p>
                    </div>
                    <InspectionResultBadge result={insp.overallResult} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
