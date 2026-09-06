import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Filter,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ApplicationStatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { ApplicationStatus } from '@/types';

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getApplicationsByBusiness, getInstrumentById } = useData();

  const businessId = user?.businessId ?? '';
  const applications = getApplicationsByBusiness(businessId);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'APPROVED' | 'REJECTED'>('ALL');

  // Stats
  const activeCount = applications.filter(a =>
    ['SUBMITTED', 'UNDER_REVIEW', 'INSPECTOR_ASSIGNED', 'INSPECTION_SCHEDULED', 'INSPECTED'].includes(a.status)
  ).length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = applications.filter(a => a.status === 'REJECTED' || a.status === 'NEEDS_CORRECTION').length;

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const inst = getInstrumentById(app.instrumentId);
      const matchSearch =
        searchTerm === '' ||
        app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inst?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inst?.serialNumber ?? '').toLowerCase().includes(searchTerm.toLowerCase());

      let matchTab = true;
      if (activeTab === 'ACTIVE') {
        matchTab = ['SUBMITTED', 'UNDER_REVIEW', 'INSPECTOR_ASSIGNED', 'INSPECTION_SCHEDULED', 'INSPECTED'].includes(app.status);
      } else if (activeTab === 'APPROVED') {
        matchTab = app.status === 'APPROVED';
      } else if (activeTab === 'REJECTED') {
        matchTab = app.status === 'REJECTED' || app.status === 'NEEDS_CORRECTION';
      }

      return matchSearch && matchTab;
    });
  }, [applications, searchTerm, activeTab, getInstrumentById]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Verification Applications</h1>
          <p className="page-subtitle">
            Track statutory verification requests submitted for Legal Metrology inspection and certification.
          </p>
        </div>
        <Button
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/business/instruments/register')}
        >
          New Application
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Applications"
          value={applications.length}
          icon={<FileText className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          label="In Progress / Scheduled"
          value={activeCount}
          icon={<Clock className="w-5 h-5" />}
          color="orange"
        />
        <StatCard
          label="Approved & Stamped"
          value={approvedCount}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          label="Rejected / Action Needed"
          value={rejectedCount}
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl w-full sm:w-auto">
          {[
            { id: 'ALL', label: `All (${applications.length})` },
            { id: 'ACTIVE', label: `In Progress (${activeCount})` },
            { id: 'APPROVED', label: `Approved (${approvedCount})` },
            { id: 'REJECTED', label: `Action Needed (${rejectedCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={[
                'flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search application or serial..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all"
          />
        </div>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            title="No applications found"
            description={
              searchTerm
                ? `No application matches your query "${searchTerm}".`
                : 'No applications in this category.'
            }
            icon={<FileText className="w-8 h-8 text-gray-400" />}
            action={
              <Button size="sm" onClick={() => navigate('/business/instruments/register')}>
                Submit New Application
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredApps.map(app => {
            const inst = getInstrumentById(app.instrumentId);

            return (
              <Card
                key={app.id}
                padding="md"
                className="hover:border-primary-200 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/business/applications/${app.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-primary-700 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-gray-900">
                          {app.applicationNumber}
                        </span>
                        <ApplicationStatusBadge status={app.status} />
                        {app.feesPaid && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Challan Cleared
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium text-gray-700 mt-1">
                        {inst?.name ?? 'Measuring Device'} — {inst?.make} {inst?.model}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[11px] text-gray-400">
                        <span>Serial: <strong className="font-mono text-gray-600">{inst?.serialNumber}</strong></span>
                        <span>•</span>
                        <span>Submitted: {app.submittedDate}</span>
                        {app.scheduledInspectionDate && (
                          <>
                            <span>•</span>
                            <span className="text-orange-600 font-semibold flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Scheduled: {app.scheduledInspectionDate}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center justify-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/business/applications/${app.id}`);
                      }}
                    >
                      Track Details
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
