import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Microscope,
  Calendar,
  Building2,
  Scale,
  Search,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { InspectionStatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export default function InspectorInspectionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getInspectionsByInspector,
    getApplicationsByInspector,
    getBusinessById,
    getInstrumentById,
    getApplicationById,
  } = useData();

  const inspectorId = user?.inspectorId ?? '';
  const inspections = getInspectionsByInspector(inspectorId);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SCHEDULED' | 'COMPLETED'>('SCHEDULED');

  const scheduledCount = inspections.filter(i => i.status === 'SCHEDULED' || i.status === 'IN_PROGRESS').length;
  const completedCount = inspections.filter(i => i.status === 'COMPLETED').length;

  const filteredInspections = useMemo(() => {
    return inspections.filter(insp => {
      const biz = getBusinessById(insp.businessId);
      const inst = getInstrumentById(insp.instrumentId);

      const matchSearch =
        searchTerm === '' ||
        (biz?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inst?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inst?.serialNumber ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        insp.id.toLowerCase().includes(searchTerm.toLowerCase());

      let matchStatus = true;
      if (statusFilter === 'SCHEDULED') {
        matchStatus = insp.status === 'SCHEDULED' || insp.status === 'IN_PROGRESS';
      } else if (statusFilter === 'COMPLETED') {
        matchStatus = insp.status === 'COMPLETED';
      }

      return matchSearch && matchStatus;
    });
  }, [inspections, searchTerm, statusFilter, getBusinessById, getInstrumentById]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Assigned Field Inspections</h1>
          <p className="page-subtitle">
            Perform on-site metrological calibrations, statutory checklist audits, and issue verification clearances.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Assigned"
          value={inspections.length}
          icon={<Microscope className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          label="Pending Visits / Scheduled"
          value={scheduledCount}
          icon={<Clock className="w-5 h-5" />}
          color="orange"
        />
        <StatCard
          label="Inspections Completed"
          value={completedCount}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="teal"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-full sm:w-auto">
          {[
            { id: 'SCHEDULED', label: `Pending Visits (${scheduledCount})` },
            { id: 'COMPLETED', label: `Completed (${completedCount})` },
            { id: 'ALL', label: `All Inspections (${inspections.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
              className={[
                'flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                statusFilter === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search business, serial, or device..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all"
          />
        </div>
      </div>

      {/* Inspections List */}
      {filteredInspections.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            title="No inspections found"
            description={
              searchTerm
                ? `No inspection matched "${searchTerm}".`
                : statusFilter === 'SCHEDULED'
                ? 'No pending visits assigned right now.'
                : 'No inspection records found.'
            }
            icon={<Microscope className="w-8 h-8 text-gray-400" />}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInspections.map(insp => {
            const biz = getBusinessById(insp.businessId);
            const inst = getInstrumentById(insp.instrumentId);
            const app = getApplicationById(insp.applicationId);

            return (
              <Card
                key={insp.id}
                padding="md"
                className="hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Column: Details */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-gray-900">
                          {inst?.name ?? 'Commercial Device'}
                        </span>
                        <InspectionStatusBadge status={insp.status} />
                        <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {app?.applicationNumber ?? insp.applicationId}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <strong className="text-gray-900">{biz?.name}</strong> • {biz?.address}, {biz?.city}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-400 font-mono pt-1">
                        <span>Make: {inst?.make} ({inst?.model})</span>
                        <span>•</span>
                        <span>Serial: <strong className="text-gray-700">{inst?.serialNumber}</strong></span>
                        <span>•</span>
                        <span>Capacity: {inst?.capacity}</span>
                        <span>•</span>
                        <span className="text-orange-700 font-bold">
                          📅 Scheduled: {insp.scheduledDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Action CTA */}
                  <div className="flex items-center justify-end shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                    <Button
                      size="sm"
                      variant={insp.status === 'COMPLETED' ? 'secondary' : 'primary'}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      onClick={() => navigate(`/inspector/inspections/${insp.id}`)}
                    >
                      {insp.status === 'COMPLETED' ? 'Review Report' : 'Conduct Inspection'}
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
