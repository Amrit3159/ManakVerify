import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Building2,
  Scale,
  Calendar,
  UserCheck,
  Eye,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { InspectionStatusBadge, InspectionResultBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminInspectionsPage() {
  const navigate = useNavigate();
  const { inspections, getBusinessById, getInstrumentById } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const scheduledCount = inspections.filter(i => i.status === 'SCHEDULED' || i.status === 'IN_PROGRESS').length;
  const completedCount = inspections.filter(i => i.status === 'COMPLETED').length;
  const approvedCount = inspections.filter(i => i.overallResult === 'APPROVED').length;

  const filteredInspections = useMemo(() => {
    return inspections.filter(insp => {
      const biz = getBusinessById(insp.businessId);
      const inst = getInstrumentById(insp.instrumentId);

      const matchSearch =
        searchTerm === '' ||
        insp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (biz?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inst?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inst?.serialNumber ?? '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || insp.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [inspections, searchTerm, statusFilter, getBusinessById, getInstrumentById]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">National Inspection Oversight</h1>
        <p className="page-subtitle">
          Supervise assigned field visits, monitor inspector calibration findings, and review statutory approvals.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Field Inspections"
          value={inspections.length}
          icon={<ClipboardList className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          label="Visits Pending"
          value={scheduledCount}
          icon={<Clock className="w-5 h-5" />}
          color="orange"
        />
        <StatCard
          label="Completed & Audited"
          value={completedCount}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          label="Verification Clearances"
          value={approvedCount}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
        />
      </div>

      {/* Filter and Search */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by business name, serial number, or device..."
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
              <option value="ALL">All Inspection Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      {filteredInspections.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            title="No inspection records found"
            description="Try changing your search terms or filter."
            icon={<ClipboardList className="w-8 h-8 text-gray-400" />}
          />
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Inspection ID</th>
                <th className="py-3 px-4">Commercial Entity</th>
                <th className="py-3 px-4">Instrument Under Test</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Audit Result</th>
                <th className="py-3 px-4">Inspector Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInspections.map(insp => {
                const biz = getBusinessById(insp.businessId);
                const inst = getInstrumentById(insp.instrumentId);

                return (
                  <tr key={insp.id} className="hover:bg-gray-50/80">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      {insp.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900">{biz?.name ?? '—'}</p>
                      <p className="text-[11px] text-gray-400">{biz?.city}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-gray-800">{inst?.name}</p>
                      <p className="text-[11px] text-gray-400 font-mono">SN: {inst?.serialNumber}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">
                      {insp.scheduledDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <InspectionStatusBadge status={insp.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <InspectionResultBadge result={insp.overallResult} />
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate" title={insp.inspectorRemarks}>
                      {insp.inspectorRemarks || '—'}
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
