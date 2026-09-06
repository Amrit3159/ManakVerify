import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ApplicationStatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminApplicationsPage() {
  const navigate = useNavigate();
  const { applications, getBusinessById, getInstrumentById } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const pendingCount = applications.filter(a =>
    ['SUBMITTED', 'UNDER_REVIEW', 'INSPECTOR_ASSIGNED', 'INSPECTION_SCHEDULED'].includes(a.status)
  ).length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = applications.filter(a => a.status === 'REJECTED').length;

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const biz = getBusinessById(app.businessId);
      const inst = getInstrumentById(app.instrumentId);

      const matchSearch =
        searchTerm === '' ||
        app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (biz?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inst?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inst?.serialNumber ?? '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || app.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [applications, searchTerm, statusFilter, getBusinessById, getInstrumentById]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">National Application Management</h1>
          <p className="page-subtitle">
            Review submissions across all jurisdictions, assign field inspectors, and supervise certification.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Submissions"
          value={applications.length}
          icon={<FileText className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          label="Pending Review / Scheduled"
          value={pendingCount}
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
          label="Rejected Applications"
          value={rejectedCount}
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Search and Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by application number, business name, or serial..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="INSPECTOR_ASSIGNED">Inspector Assigned</option>
              <option value="INSPECTION_SCHEDULED">Inspection Scheduled</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Applications Table */}
      {filteredApps.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            title="No applications found"
            description="Try clearing your search query or selecting a different status filter."
            icon={<FileText className="w-8 h-8 text-gray-400" />}
          />
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Commercial Entity</th>
                <th className="py-3 px-4">Instrument Particulars</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Inspector</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApps.map(app => {
                const biz = getBusinessById(app.businessId);
                const inst = getInstrumentById(app.instrumentId);

                return (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/applications/${app.id}`)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {app.applicationNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">{biz?.name ?? '—'}</p>
                      <p className="text-[11px] text-gray-400">{biz?.city}, {biz?.state}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-800">{inst?.name}</p>
                      <p className="text-[11px] text-gray-400 font-mono">SN: {inst?.serialNumber}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono">
                      {app.submittedDate}
                    </td>
                    <td className="py-3 px-4">
                      <ApplicationStatusBadge status={app.status} />
                    </td>
                    <td className="py-3 px-4">
                      {app.assignedInspectorId ? (
                        <span className="inline-flex items-center gap-1 text-primary-700 font-semibold">
                          <UserCheck className="w-3.5 h-3.5" />
                          Assigned
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="xs"
                        variant="secondary"
                        rightIcon={<ArrowRight className="w-3 h-3" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/applications/${app.id}`);
                        }}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
