import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Building2,
  Scale,
  Search,
  Calendar,
  Award,
  ExternalLink,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { InspectionResultBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { InspectionResult } from '@/types';

export default function InspectorHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getInspectionsByInspector,
    getBusinessById,
    getInstrumentById,
    certificates,
  } = useData();

  const inspectorId = user?.inspectorId ?? '';
  const inspections = getInspectionsByInspector(inspectorId);

  // Completed inspections only
  const completedInspections = useMemo(() => {
    return inspections.filter(i => i.status === 'COMPLETED');
  }, [inspections]);

  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<'ALL' | 'APPROVED' | 'REJECTED' | 'NEEDS_CORRECTION'>('ALL');

  const approvedCount = completedInspections.filter(i => i.overallResult === 'APPROVED').length;
  const rejectedCount = completedInspections.filter(i => i.overallResult === 'REJECTED').length;
  const correctionCount = completedInspections.filter(i => i.overallResult === 'NEEDS_CORRECTION').length;

  const filteredHistory = useMemo(() => {
    return completedInspections.filter(insp => {
      const biz = getBusinessById(insp.businessId);
      const inst = getInstrumentById(insp.instrumentId);

      const matchSearch =
        searchTerm === '' ||
        (biz?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inst?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inst?.serialNumber ?? '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchResult = resultFilter === 'ALL' || insp.overallResult === resultFilter;

      return matchSearch && matchResult;
    });
  }, [completedInspections, searchTerm, resultFilter, getBusinessById, getInstrumentById]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Inspection Audit History</h1>
          <p className="page-subtitle">
            Historical log of all on-site calibration audits, verification decisions, and statutory actions performed.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Audited"
          value={completedInspections.length}
          icon={<History className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          label="Approved & Certified"
          value={approvedCount}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          label="Corrections Ordered"
          value={correctionCount}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="orange"
        />
        <StatCard
          label="Rejected / Seized"
          value={rejectedCount}
          icon={<XCircle className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-full sm:w-auto">
          {[
            { id: 'ALL', label: `All (${completedInspections.length})` },
            { id: 'APPROVED', label: `Approved (${approvedCount})` },
            { id: 'NEEDS_CORRECTION', label: `Correction (${correctionCount})` },
            { id: 'REJECTED', label: `Rejected (${rejectedCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setResultFilter(tab.id as typeof resultFilter)}
              className={[
                'flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                resultFilter === tab.id
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

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            title="No inspection records found"
            description={
              searchTerm
                ? `No inspection matched "${searchTerm}".`
                : 'No historical inspection records in this category.'
            }
            icon={<History className="w-8 h-8 text-gray-400" />}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map(insp => {
            const biz = getBusinessById(insp.businessId);
            const inst = getInstrumentById(insp.instrumentId);
            const cert = certificates.find(c => c.instrumentId === insp.instrumentId);

            return (
              <Card
                key={insp.id}
                padding="md"
                className="hover:border-gray-300 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Scale className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-gray-900">
                          {inst?.name ?? 'Measuring Device'}
                        </span>
                        <InspectionResultBadge result={insp.overallResult} />
                        <span className="text-[11px] font-mono text-gray-400">
                          Completed: {insp.completedDate}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <strong className="text-gray-900">{biz?.name}</strong> • {biz?.city}
                      </p>

                      <p className="text-xs text-gray-500 italic">
                        "{insp.inspectorRemarks || 'Statutory calibration tolerance audit completed.'}"
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-400 font-mono pt-1">
                        <span>Serial: <strong className="text-gray-700">{inst?.serialNumber}</strong></span>
                        {cert && (
                          <>
                            <span>•</span>
                            <span className="text-primary-700 font-bold">
                              Cert No: {cert.certificateNumber}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                    <Button
                      size="xs"
                      variant="secondary"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => navigate(`/inspector/inspections/${insp.id}`)}
                    >
                      Audit Details
                    </Button>

                    {cert && (
                      <Button
                        size="xs"
                        variant="secondary"
                        rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                        onClick={() => navigate(`/verify?cert=${cert.certificateNumber}`)}
                      >
                        Verify Certificate
                      </Button>
                    )}
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
