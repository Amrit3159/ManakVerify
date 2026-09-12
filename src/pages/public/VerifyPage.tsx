import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Scale,
  Calendar,
  Award,
  Printer,
  Copy,
  Check,
  ArrowLeft,
  ExternalLink,
  Ban,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useData } from '@/context/DataContext';
import { certificateApi } from '@/services/api';
import { CertificateStatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function VerifyPage() {
  const { certificateId } = useParams<{ certificateId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Support both /verify/:certificateId and /verify?cert=
  const certQuery = certificateId ?? searchParams.get('cert') ?? '';

  const { certificates, getCertificateByNumber, getCertificateById } = useData();

  const [inputVal, setInputVal] = useState(certQuery);
  const [copied, setCopied] = useState(false);
  const [remoteCert, setRemoteCert] = useState<any>(null);

  // If using /:certificateId URL param, redirect to search-params style for consistency
  useEffect(() => {
    if (certificateId) {
      navigate(`/verify?cert=${certificateId}`, { replace: true });
    }
  }, [certificateId, navigate]);

  useEffect(() => {
    if (certQuery) {
      setInputVal(certQuery);
      const local = getCertificateByNumber(certQuery.trim()) || getCertificateById(certQuery.trim());
      if (local) {
        setRemoteCert(local);
      } else {
        certificateApi.verifyPublic(certQuery.trim())
          .then(data => setRemoteCert(data))
          .catch(() => setRemoteCert(null));
      }
    } else {
      setRemoteCert(null);
    }
  }, [certQuery, getCertificateByNumber, getCertificateById]);

  const activeCert = remoteCert || (certQuery
    ? (getCertificateByNumber(certQuery.trim()) || getCertificateById(certQuery.trim()))
    : null);

  const sampleCerts = certificates.slice(0, 3);

  // Canonical public URL for the QR code
  const certVerifyUrl = activeCert
    ? `${window.location.origin}/verify?cert=${encodeURIComponent(activeCert.certificateNumber)}`
    : window.location.href;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ cert: inputVal.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(certVerifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // ----------------------------------------------------------------
  // Status colour helpers
  // ----------------------------------------------------------------
  const statusBannerClass = activeCert
    ? activeCert.status === 'VERIFIED'
      ? 'bg-emerald-600'
      : activeCert.status === 'EXPIRED'
      ? 'bg-amber-600'
      : 'bg-rose-600'
    : '';

  const statusLabel = activeCert
    ? activeCert.status === 'VERIFIED'
      ? '✓ CERTIFICATE VERIFIED'
      : activeCert.status === 'EXPIRED'
      ? '⚠ CERTIFICATE EXPIRED'
      : activeCert.status === 'REVOKED'
      ? '✕ CERTIFICATE REVOKED'
      : '✕ CERTIFICATE INVALID'
    : '';

  const StatusIcon = activeCert
    ? activeCert.status === 'VERIFIED'
      ? CheckCircle2
      : activeCert.status === 'EXPIRED'
      ? AlertTriangle
      : activeCert.status === 'REVOKED'
      ? Ban
      : XCircle
    : XCircle;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation / Back */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors no-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <span className="text-xs text-gray-400 font-mono">LM-ACT-2009-SEC24</span>
        </div>

        {/* Verification Header & Search Box */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 text-primary-700 mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Public Certificate Verification
          </h1>
          <p className="text-sm text-gray-600 max-w-lg mx-auto">
            Verify the authenticity and legal metrological compliance of measuring and weighing instruments.
          </p>
        </div>

        {/* Search Input Bar */}
        <Card padding="md" className="shadow-md">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter Certificate No. (e.g. MV/DL/CERT/2024/00123)"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white transition-all font-mono"
              />
            </div>
            <Button type="submit" size="md">
              Verify Certificate
            </Button>
          </form>

          {/* Quick suggestions */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>Try sample certificates:</span>
            {sampleCerts.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setInputVal(c.certificateNumber);
                  setSearchParams({ cert: c.certificateNumber });
                }}
                className="font-mono px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                {c.certificateNumber}
              </button>
            ))}
          </div>
        </Card>

        {/* Search Results */}
        {certQuery ? (
          activeCert ? (
            /* Valid Certificate Document */
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden print:shadow-none print:border-none">
              {/* Top Banner Status */}
              <div className={`px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-white ${statusBannerClass}`}>
                <div className="flex items-center gap-3">
                  <StatusIcon className="w-6 h-6 shrink-0" />
                  <div>
                    <h3 className="text-base font-bold tracking-wide uppercase">
                      {statusLabel}
                    </h3>
                    <p className="text-xs text-white/80 font-mono">
                      Certificate ID: {activeCert.certificateNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={handleCopyLink}
                    leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  >
                    {copied ? 'Copied' : 'Share Link'}
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={handlePrint}
                    leftIcon={<Printer className="w-3.5 h-3.5" />}
                  >
                    Print
                  </Button>
                </div>
              </div>

              {/* Certificate Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Official Header */}
                <div className="text-center pb-6 border-b border-gray-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary-800">
                    GOVERNMENT OF INDIA
                  </p>
                  <p className="text-sm font-semibold text-gray-700 uppercase">
                    Department of Legal Metrology
                  </p>
                  <h2 className="text-lg font-bold text-gray-900 mt-1">
                    CERTIFICATE OF VERIFICATION
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Issued under Rule 14 of the Legal Metrology (General) Rules, 2011
                  </p>
                </div>

                {/* Details Grid & QR Code */}
                <div className="grid sm:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Details */}
                  <div className="sm:col-span-2 space-y-4">
                    {/* Instrument Info */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Instrument Information
                      </h4>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Instrument:</span>
                          <span className="font-semibold text-gray-900">{activeCert.instrumentDetails.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type:</span>
                          <span className="font-medium text-gray-800">{activeCert.instrumentDetails.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Make / Model:</span>
                          <span className="font-medium text-gray-800">
                            {activeCert.instrumentDetails.make} {activeCert.instrumentDetails.model}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Serial Number:</span>
                          <span className="font-mono font-bold text-gray-900">
                            {activeCert.instrumentDetails.serialNumber}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Capacity & Accuracy:</span>
                          <span className="font-medium text-gray-800">
                            {activeCert.instrumentDetails.capacity} ({activeCert.instrumentDetails.accuracy})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Business Info */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Verified Business & Location
                      </h4>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Business Name:</span>
                          <span className="font-semibold text-gray-900">{activeCert.businessDetails.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">GSTIN:</span>
                          <span className="font-mono text-gray-800">{activeCert.businessDetails.gstin}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-500 shrink-0">Address:</span>
                          <span className="text-gray-800 text-right">
                            {activeCert.businessDetails.address}, {activeCert.businessDetails.city}, {activeCert.businessDetails.state}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Col: QR Code & Stamp */}
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
                      <QRCodeSVG
                        value={certVerifyUrl}
                        size={128}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2 font-mono">
                      Scan to verify live
                    </p>
                    <div className="mt-4 pt-3 border-t border-gray-200 w-full space-y-1">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">
                        Verification Stamp
                      </p>
                      <p className="text-xs font-mono font-bold text-primary-700">
                        {activeCert.stampNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Validity Dates & Issuing Authority */}
                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
                  <div className="space-y-1">
                    <p className="text-gray-500">Date of Verification / Issue:</p>
                    <p className="font-semibold text-gray-900 font-mono">{activeCert.issueDate}</p>
                    <p className="text-gray-500 pt-1">Next Verification Due Before:</p>
                    <p className={`font-semibold font-mono ${activeCert.status === 'EXPIRED' ? 'text-rose-700' : 'text-amber-700'}`}>
                      {activeCert.expiryDate}
                    </p>
                  </div>
                  <div className="space-y-1 sm:text-right">
                    <p className="text-gray-500">Issuing Officer / Inspector:</p>
                    <p className="font-semibold text-gray-900">{activeCert.issuingOfficer}</p>
                    <p className="text-gray-500 pt-1">Department Authority:</p>
                    <p className="font-medium text-gray-800">{activeCert.issuingAuthority}</p>
                  </div>
                </div>

                {/* Expired / Revoked warning */}
                {(activeCert.status === 'EXPIRED' || activeCert.status === 'REVOKED') && (
                  <div className={[
                    'flex items-start gap-3 p-4 rounded-xl border text-xs',
                    activeCert.status === 'EXPIRED'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900',
                  ].join(' ')}>
                    {activeCert.status === 'EXPIRED' ? (
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    ) : (
                      <Ban className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    )}
                    <div>
                      <p className="font-bold">
                        {activeCert.status === 'EXPIRED'
                          ? 'This certificate has expired.'
                          : 'This certificate has been revoked.'}
                      </p>
                      <p className="mt-0.5 opacity-80">
                        {activeCert.status === 'EXPIRED'
                          ? `The instrument's verification period ended on ${activeCert.expiryDate}. The business must renew its verification before using this instrument for commercial measurement.`
                          : 'This certificate was revoked by the Department of Legal Metrology. The instrument is no longer authorised for commercial use.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Not Found State */
            <Card padding="lg" className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-rose-600">
                ✕ CERTIFICATE NOT FOUND
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 font-mono">
                No verified certificate record found for "{certQuery}".
              </p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mt-2">
                Please check the certificate number and try again. Certificate numbers follow the format: MV/DL/CERT/2024/00123
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button variant="secondary" size="sm" onClick={() => {
                  setInputVal('');
                  setSearchParams({});
                }}>
                  Clear Search
                </Button>
                <Button size="sm" onClick={() => {
                  const first = sampleCerts[0]?.certificateNumber;
                  if (first) {
                    setInputVal(first);
                    setSearchParams({ cert: first });
                  }
                }}>
                  Load Sample Certificate
                </Button>
              </div>
            </Card>
          )
        ) : (
          /* Initial instructions */
          <Card padding="lg" className="border-dashed">
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-primary-700 flex items-center justify-center mx-auto font-bold text-sm">
                  1
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Locate Certificate ID</h4>
                <p className="text-xs text-gray-500">
                  Find the certificate number stamped on the physical instrument or inspection seal.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-primary-700 flex items-center justify-center mx-auto font-bold text-sm">
                  2
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Enter or Scan</h4>
                <p className="text-xs text-gray-500">
                  Input the number in the search bar above or scan the QR code using your mobile camera.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-primary-700 flex items-center justify-center mx-auto font-bold text-sm">
                  3
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Instant Verification</h4>
                <p className="text-xs text-gray-500">
                  Review legal validity, calibration tolerances, business credentials, and expiry dates.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
