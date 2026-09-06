import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CertificateStatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import type { Certificate } from '@/types';

export default function AdminCertificatesPage() {
  const navigate = useNavigate();
  const { certificates, saveCertificate, refresh } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Revoke state
  const [revokeTarget, setRevokeTarget] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  const verifiedCount = certificates.filter(c => c.status === 'VERIFIED').length;
  const expiredCount = certificates.filter(c => c.status === 'EXPIRED').length;
  const revokedCount = certificates.filter(c => c.status === 'REVOKED' || c.status === 'INVALID').length;

  const filteredCerts = useMemo(() => {
    return certificates.filter(c => {
      const matchSearch =
        searchTerm === '' ||
        c.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.stampNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.businessDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.instrumentDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.instrumentDetails.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [certificates, searchTerm, statusFilter]);

  const handleConfirmRevoke = () => {
    if (!revokeTarget) return;

    const updated = {
      ...revokeTarget,
      status: 'REVOKED' as const,
    };
    saveCertificate(updated);
    refresh();
    setRevokeTarget(null);
    setRevokeReason('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">National Certificate Authority & Registry</h1>
        <p className="page-subtitle">
          Supervise issued Legal Metrology verification certificates, verify cryptographic QR seals, and enforce statutory revocations.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Certificates Issued"
          value={certificates.length}
          icon={<Award className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          label="Active & Valid"
          value={verifiedCount}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          label="Expired"
          value={expiredCount}
          icon={<Calendar className="w-5 h-5" />}
          color="orange"
        />
        <StatCard
          label="Revoked / Suspended"
          value={revokedCount}
          icon={<XCircle className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Search & Filter */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by certificate number, stamp number, business, or serial..."
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
              <option value="VERIFIED">Verified & Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="REVOKED">Revoked / Suspended</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      {filteredCerts.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            title="No certificates found"
            description="Try changing your search terms or filter."
            icon={<Award className="w-8 h-8 text-gray-400" />}
          />
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Certificate ID</th>
                <th className="py-3 px-4">Stamp Number</th>
                <th className="py-3 px-4">Business Entity</th>
                <th className="py-3 px-4">Instrument / Serial</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Valid Until</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCerts.map(cert => (
                <tr key={cert.id} className="hover:bg-gray-50/80">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                    {cert.certificateNumber}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-primary-700">
                    {cert.stampNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-gray-900">{cert.businessDetails.name}</p>
                    <p className="text-[11px] text-gray-400 font-mono">{cert.businessDetails.gstin}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-gray-800">{cert.instrumentDetails.name}</p>
                    <p className="text-[11px] text-gray-400 font-mono">SN: {cert.instrumentDetails.serialNumber}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-600">
                    {cert.issueDate}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700">
                    {cert.expiryDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <CertificateStatusBadge status={cert.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Button
                      size="xs"
                      variant="ghost"
                      rightIcon={<ExternalLink className="w-3 h-3" />}
                      onClick={() => navigate(`/verify?cert=${cert.certificateNumber}`)}
                    >
                      Verify Seal
                    </Button>
                    {cert.status === 'VERIFIED' && (
                      <Button
                        size="xs"
                        variant="secondary"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setRevokeTarget(cert)}
                      >
                        Revoke
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Revocation Modal */}
      <Modal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title="Revoke Verification Certificate"
        description="Statutory cancellation under Legal Metrology Act, 2009 for device tampering or seal breach."
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Statutory Warning:
            </p>
            <p className="mt-1">
              Revoking Certificate <strong>{revokeTarget?.certificateNumber}</strong> will immediately mark the instrument as illegal for commercial trade and flag the business profile in the national registry.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Reason for Statutory Revocation
            </label>
            <textarea
              rows={3}
              value={revokeReason}
              onChange={e => setRevokeReason(e.target.value)}
              placeholder="e.g. Broken physical lead seal detected during surprise enforcement inspection..."
              className="w-full text-xs p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-sans"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => setRevokeTarget(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmRevoke}
            >
              Confirm Revocation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
