import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  ShieldCheck,
  Search,
  ExternalLink,
  Printer,
  Calendar,
  Scale,
  Building2,
  Copy,
  Check,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CertificateStatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CertificatesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCertificatesByBusiness } = useData();

  const businessId = user?.businessId ?? '';
  const certificates = getCertificatesByBusiness(businessId);

  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeCount = certificates.filter(c => c.status === 'VERIFIED').length;
  const expiredCount = certificates.filter(c => c.status !== 'VERIFIED').length;

  const filteredCerts = certificates.filter(c => {
    return (
      searchTerm === '' ||
      c.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.stampNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instrumentDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instrumentDetails.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCopyLink = (certNum: string) => {
    const url = `${window.location.origin}/verify?cert=${encodeURIComponent(certNum)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(certNum);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Digital Verification Certificates</h1>
          <p className="page-subtitle">
            Statutory metrological verification certificates with tamper-evident QR verification tags.
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Certificates Issued"
          value={certificates.length}
          icon={<Award className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          label="Active & Compliant"
          value={activeCount}
          icon={<ShieldCheck className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          label="Expired / Re-verification Due"
          value={expiredCount}
          icon={<Calendar className="w-5 h-5" />}
          color="orange"
        />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Certificate No., Stamp No., or Serial..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all"
        />
      </div>

      {/* Certificates List */}
      {filteredCerts.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            title="No certificates found"
            description={
              searchTerm
                ? `No certificates matched "${searchTerm}".`
                : 'Your verified instruments will receive legal verification certificates once inspection is completed.'
            }
            icon={<Award className="w-8 h-8 text-gray-400" />}
            action={
              <Button size="sm" onClick={() => navigate('/business/instruments/register')}>
                Register Instrument for Verification
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredCerts.map(cert => {
            const verifyUrl = `${window.location.origin}/verify?cert=${encodeURIComponent(cert.certificateNumber)}`;

            return (
              <Card
                key={cert.id}
                padding="none"
                className="overflow-hidden border border-gray-200 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Status */}
                  <div className="bg-gradient-to-r from-primary-900 to-indigo-900 text-white p-4 px-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-primary-200">
                        Legal Metrology Department
                      </span>
                      <h3 className="font-mono font-bold text-sm tracking-wide mt-0.5">
                        {cert.certificateNumber}
                      </h3>
                    </div>
                    <CertificateStatusBadge status={cert.status} />
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* Instrument specs */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {cert.instrumentDetails.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {cert.instrumentDetails.make} • {cert.instrumentDetails.model}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-gray-600 font-mono">
                          <span className="bg-gray-100 px-2 py-0.5 rounded">
                            SN: {cert.instrumentDetails.serialNumber}
                          </span>
                          <span className="bg-gray-100 px-2 py-0.5 rounded">
                            Stamp: {cert.stampNumber}
                          </span>
                        </div>
                      </div>

                      {/* Working QR Code */}
                      <div className="bg-white p-1.5 rounded-lg border border-gray-200 shrink-0 shadow-sm">
                        <QRCodeSVG value={verifyUrl} size={64} level="M" />
                      </div>
                    </div>

                    {/* Dates & Authority */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Date of Verification:</span>
                        <span className="font-mono text-gray-700 font-medium">{cert.issueDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Valid Until:</span>
                        <span className="font-mono font-bold text-emerald-700">{cert.expiryDate}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-200/60">
                        <span className="text-gray-400">Verification Officer:</span>
                        <span className="text-gray-800 font-medium">{cert.issuingOfficer}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => handleCopyLink(cert.certificateNumber)}
                    leftIcon={copiedId === cert.certificateNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  >
                    {copiedId === cert.certificateNumber ? 'Link Copied' : 'Share QR Link'}
                  </Button>

                  <Button
                    size="xs"
                    rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    onClick={() => navigate(`/verify?cert=${cert.certificateNumber}`)}
                  >
                    View Official Seal
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
