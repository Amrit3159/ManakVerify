import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  ExternalLink,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { InstrumentStatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { InstrumentStatus, InstrumentType } from '@/types';

export default function AdminInstrumentsPage() {
  const navigate = useNavigate();
  const { instruments, getBusinessById, certificates } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const certifiedCount = instruments.filter(i => i.status === 'CERTIFIED').length;
  const pendingCount = instruments.filter(i => i.status === 'PENDING_INSPECTION').length;
  const expiredCount = instruments.filter(i => i.status === 'EXPIRED' || i.status === 'REJECTED').length;

  const instrumentTypes = useMemo(() => {
    const set = new Set(instruments.map(i => i.type));
    return Array.from(set);
  }, [instruments]);

  const filteredInstruments = useMemo(() => {
    return instruments.filter(inst => {
      const biz = getBusinessById(inst.businessId);

      const matchSearch =
        searchTerm === '' ||
        inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (biz?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || inst.status === statusFilter;
      const matchType = typeFilter === 'ALL' || inst.type === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [instruments, searchTerm, statusFilter, typeFilter, getBusinessById]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">National Instrument Registry</h1>
        <p className="page-subtitle">
          Central statutory database of commercial weighing, measuring, and volumetric metering hardware.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Registered Devices"
          value={instruments.length}
          icon={<Scale className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          label="Certified & Compliant"
          value={certifiedCount}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          label="Inspection Pending"
          value={pendingCount}
          icon={<Clock className="w-5 h-5" />}
          color="orange"
        />
        <StatCard
          label="Expired / Non-Compliant"
          value={expiredCount}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search serial number, make, model, or commercial owner..."
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
              <option value="CERTIFIED">Certified</option>
              <option value="PENDING_INSPECTION">Pending Inspection</option>
              <option value="REGISTERED">Registered</option>
              <option value="EXPIRED">Expired</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="ALL">All Types</option>
              {instrumentTypes.map(t => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Instruments Table */}
      {filteredInstruments.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            title="No instruments found"
            description="Try changing your search terms or filters."
            icon={<Scale className="w-8 h-8 text-gray-400" />}
          />
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Device & Category</th>
                <th className="py-3 px-4">Make / Model</th>
                <th className="py-3 px-4">Commercial Owner</th>
                <th className="py-3 px-4">Capacity & Class</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Next Inspection</th>
                <th className="py-3 px-4 text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInstruments.map(inst => {
                const biz = getBusinessById(inst.businessId);
                const cert = certificates.find(c => c.instrumentId === inst.id);

                return (
                  <tr key={inst.id} className="hover:bg-gray-50/80">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary-700">
                      {inst.serialNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900">{inst.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                        {inst.type.replace(/_/g, ' ')}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      {inst.make} • {inst.model}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-gray-800">{biz?.name ?? '—'}</p>
                      <p className="text-[11px] text-gray-400">{biz?.city}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-800">
                      {inst.capacity} ({inst.accuracy})
                    </td>
                    <td className="py-3.5 px-4">
                      <InstrumentStatusBadge status={inst.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">
                      {inst.nextInspectionDue ?? '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {cert ? (
                        <Button
                          size="xs"
                          variant="ghost"
                          rightIcon={<ExternalLink className="w-3 h-3" />}
                          onClick={() => navigate(`/verify?cert=${cert.certificateNumber}`)}
                        >
                          Verify
                        </Button>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">Unissued</span>
                      )}
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
