import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  ArrowRight,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardHeader, CardDivider, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { InstrumentStatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { InstrumentStatus, InstrumentType } from '@/types';

export default function InstrumentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getInstrumentsByBusiness, getApplicationsByBusiness, getCertificateById } = useData();

  const businessId = user?.businessId ?? '';
  const instruments = getInstrumentsByBusiness(businessId);
  const applications = getApplicationsByBusiness(businessId);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Stats
  const certifiedCount = instruments.filter(i => i.status === 'CERTIFIED').length;
  const pendingCount = instruments.filter(i => i.status === 'PENDING_INSPECTION').length;
  const expiredCount = instruments.filter(i => i.status === 'EXPIRED' || i.status === 'REJECTED').length;

  // Filtered instruments
  const filteredInstruments = useMemo(() => {
    return instruments.filter(inst => {
      const matchSearch =
        searchTerm === '' ||
        inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || inst.status === statusFilter;
      const matchType = typeFilter === 'ALL' || inst.type === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [instruments, searchTerm, statusFilter, typeFilter]);

  // Unique types from instruments for filter
  const instrumentTypes = useMemo(() => {
    const set = new Set(instruments.map(i => i.type));
    return Array.from(set);
  }, [instruments]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Commercial Instruments</h1>
          <p className="page-subtitle">
            Manage and monitor all weighing and measuring devices registered under your establishment.
          </p>
        </div>
        <Button
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/business/instruments/register')}
        >
          Register Instrument
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Registered"
          value={instruments.length}
          icon={<Scale className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          label="Certified & Valid"
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
          label="Expired / Rejected"
          value={expiredCount}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Filter and Search Bar */}
      <Card padding="sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, manufacturer, model, or serial number..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white transition-all"
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
              <option value="ALL">All Device Types</option>
              {instrumentTypes.map(t => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Instruments Grid / List */}
      {filteredInstruments.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            title="No instruments found"
            description={
              searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                ? 'Try adjusting your search query or status filters.'
                : 'No instruments registered yet. Begin by registering your first commercial device.'
            }
            icon={<Scale className="w-8 h-8 text-gray-400" />}
            action={
              <Button size="sm" onClick={() => navigate('/business/instruments/register')}>
                Register Instrument
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInstruments.map(inst => {
            // Find active application for this instrument
            const app = applications.find(a => a.instrumentId === inst.id);
            const cert = inst.currentCertificateId
              ? getCertificateById(inst.currentCertificateId)
              : null;

            return (
              <Card key={inst.id} padding="md" className="flex flex-col justify-between hover:border-gray-300 transition-colors">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        {inst.type.replace(/_/g, ' ')}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-1">{inst.name}</h3>
                      <p className="text-xs text-gray-500">
                        {inst.make} • {inst.model}
                      </p>
                    </div>
                    <InstrumentStatusBadge status={inst.status} />
                  </div>

                  {/* Specs Pill Box */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs text-gray-600 mb-4 border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Serial Number:</span>
                      <span className="font-mono font-semibold text-gray-800">{inst.serialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Capacity & Class:</span>
                      <span className="font-medium text-gray-800">{inst.capacity} ({inst.accuracy})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Premises Location:</span>
                      <span className="font-medium text-gray-800 truncate max-w-[170px]" title={inst.installationAddress ?? inst.location}>
                        {inst.installationAddress ?? inst.location}
                      </span>
                    </div>
                    {inst.nextInspectionDue && (
                      <div className="flex justify-between pt-1 border-t border-gray-200/60">
                        <span className="text-gray-400">Next Due:</span>
                        <span className="font-medium text-amber-700 font-mono">📅 {inst.nextInspectionDue}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  {inst.status === 'CERTIFIED' && cert ? (
                    <Button
                      size="xs"
                      variant="secondary"
                      leftIcon={<Award className="w-3.5 h-3.5 text-emerald-600" />}
                      onClick={() => navigate(`/verify?cert=${cert.certificateNumber}`)}
                    >
                      View Certificate
                    </Button>
                  ) : app ? (
                    <Button
                      size="xs"
                      variant="secondary"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => navigate(`/business/applications/${app.id}`)}
                    >
                      Track Application
                    </Button>
                  ) : (
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={() => navigate('/business/instruments/register')}
                    >
                      Apply Verification
                    </Button>
                  )}

                  <span className="text-[11px] text-gray-400">
                    Purchased: {inst.purchaseDate}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
