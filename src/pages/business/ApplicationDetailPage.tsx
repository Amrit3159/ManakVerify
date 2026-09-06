import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Clock,
  UserCheck,
  Calendar,
  Award,
  AlertTriangle,
  XCircle,
  Scale,
  Building2,
  Download,
  ExternalLink,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardHeader, CardDivider } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ApplicationStatusBadge, InspectionResultBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { ApplicationStatus } from '@/types';

// Inspector name lookup (mirrors admin portal)
const INSPECTOR_NAME_MAP: Record<string, string> = {
  insp_1: 'Smt. Priya Sharma (Legal Metrology Officer)',
  insp_2: 'Shri Arvind Verma (Legal Metrology Officer)',
  insp_3: 'Smt. Kavita Rao (Legal Metrology Officer)',
};

// Workflow step definition
interface WorkflowStep {
  key: string;
  label: string;
  description: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { key: 'SUBMITTED', label: 'Submitted', description: 'Application received in central metrology registry' },
  { key: 'UNDER_REVIEW', label: 'Under Review', description: 'Document verification and fee reconciliation' },
  { key: 'INSPECTOR_ASSIGNED', label: 'Inspector Assigned', description: 'Legal Metrology Officer assigned to jurisdiction' },
  { key: 'INSPECTION_SCHEDULED', label: 'Inspection Scheduled', description: 'Physical calibration and on-site audit scheduled' },
  { key: 'INSPECTED', label: 'Inspection Completed', description: 'Physical testing and tolerance calibration recorded' },
  { key: 'APPROVED', label: 'Approved & Certified', description: 'Statutory verification stamp and certificate granted' },
];

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getApplicationById,
    getInstrumentById,
    getInspectionByApplication,
    getCertificatesByBusiness,
  } = useData();

  const application = getApplicationById(id ?? '');
  const instrument = application ? getInstrumentById(application.instrumentId) : null;
  const inspection = application ? getInspectionByApplication(application.id) : null;

  // Find certificate if approved
  const certificates = user?.businessId ? getCertificatesByBusiness(user.businessId) : [];
  const certificate = certificates.find(
    c => c.applicationId === application?.id || c.instrumentId === instrument?.id
  );

  // Document preview modal
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  if (!application) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-gray-500">Application not found or inaccessible.</p>
        <Button size="sm" onClick={() => navigate('/business/applications')}>
          Return to Applications
        </Button>
      </div>
    );
  }

  // Calculate workflow progress index
  const getStepStatus = (stepKey: string) => {
    const order = [
      'SUBMITTED',
      'UNDER_REVIEW',
      'INSPECTOR_ASSIGNED',
      'INSPECTION_SCHEDULED',
      'INSPECTED',
      'APPROVED',
    ];

    let currentStatusIndex = order.indexOf(application.status);
    if (application.status === 'REJECTED' || application.status === 'NEEDS_CORRECTION') {
      currentStatusIndex = 4; // after inspection
    }

    const thisIndex = order.indexOf(stepKey);

    if (thisIndex < currentStatusIndex) return 'COMPLETED';
    if (thisIndex === currentStatusIndex) return 'CURRENT';
    return 'PENDING';
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto py-2">
      {/* Back button & top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/business/applications')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to All Applications
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-gray-900">
              {application.applicationNumber}
            </h1>
            <ApplicationStatusBadge status={application.status} />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Submitted on {application.submittedDate} • Last updated {application.lastUpdated}
          </p>
        </div>

        {/* Header Action Button */}
        {application.status === 'APPROVED' && certificate && (
          <Button
            size="sm"
            leftIcon={<Award className="w-4 h-4" />}
            onClick={() => navigate(`/verify?cert=${certificate.certificateNumber}`)}
          >
            View Official Certificate
          </Button>
        )}
      </div>

      {/* Certificate Celebration Banner (if Approved) */}
      {application.status === 'APPROVED' && certificate && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-950">
                Official Verification Certificate Issued
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Certificate No: <strong className="font-mono">{certificate.certificateNumber}</strong> • Stamp No: <strong className="font-mono">{certificate.stampNumber}</strong>
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Valid until {certificate.expiryDate} under Central Legal Metrology Rules.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/verify?cert=${certificate.certificateNumber}`)}
          >
            Public Verify Link
          </Button>
        </div>
      )}

      {/* Rejection / Correction Banner */}
      {(application.status === 'REJECTED' || application.status === 'NEEDS_CORRECTION') && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-950">
              {application.status === 'REJECTED' ? 'Verification Rejected' : 'Action Required / Needs Correction'}
            </h3>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
              {application.remarks ?? 'Instrument calibration fell outside statutory maximum permissible error limits or serial marking was illegible. Please review inspection findings.'}
            </p>
          </div>
        </div>
      )}

      {/* Visual Workflow Timeline */}
      <Card padding="lg">
        <CardHeader
          title="Application Status & Progression Workflow"
          description="Live milestone tracker following the Legal Metrology statutory lifecycle"
        />
        <CardDivider />

        <div className="space-y-6 pt-2">
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
            {WORKFLOW_STEPS.map((step) => {
              const state = getStepStatus(step.key);
              const isCompleted = state === 'COMPLETED';
              const isCurrent = state === 'CURRENT';

              return (
                <div key={step.key} className="relative flex items-start gap-4">
                  {/* Step marker */}
                  <div
                    className={[
                      'absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0',
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-primary-700 text-white ring-4 ring-primary-100 animate-pulse'
                        : 'bg-white border-2 border-gray-300 text-gray-400',
                    ].join(' ')}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : null}
                    {isCurrent ? <Clock className="w-4 h-4" /> : null}
                    {!isCompleted && !isCurrent ? <span className="w-2 h-2 rounded-full bg-gray-300" /> : null}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={[
                          'text-sm font-bold',
                          isCurrent ? 'text-primary-700' : isCompleted ? 'text-gray-900' : 'text-gray-400',
                        ].join(' ')}
                      >
                        {step.label}
                      </h4>

                      {/* Timestamps or annotations */}
                      {step.key === 'SUBMITTED' && (
                        <span className="text-[11px] text-gray-400 font-mono">
                          {application.submittedDate}
                        </span>
                      )}
                      {step.key === 'INSPECTION_SCHEDULED' && application.scheduledInspectionDate && (
                        <span className="text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded font-mono">
                          📅 {application.scheduledInspectionDate}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Two Column Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column: Instrument Technical Details */}
        <Card padding="md">
          <CardHeader
            title="Instrument Technical Details"
            description="Hardware specifications registered under test"
          />
          <CardDivider />

          {instrument ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Device Name:</span>
                <span className="font-semibold text-gray-900">{instrument.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Category / Type:</span>
                <span className="font-medium text-gray-800">{instrument.type.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Make & Model:</span>
                <span className="font-medium text-gray-800">{instrument.make} • {instrument.model}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Serial Number:</span>
                <span className="font-mono font-bold text-primary-700">{instrument.serialNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Rated Capacity:</span>
                <span className="font-semibold text-gray-900">{instrument.capacity}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Accuracy Class:</span>
                <span className="font-medium text-gray-800">{instrument.accuracy}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Premises Location:</span>
                <span className="font-medium text-gray-800 text-right max-w-[200px] truncate" title={instrument.installationAddress ?? instrument.location}>
                  {instrument.installationAddress ?? instrument.location}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400">No instrument metadata attached.</p>
          )}
        </Card>

        {/* Right Column: Inspector & Inspection Information */}
        <Card padding="md">
          <CardHeader
            title="Assigned Inspector & Schedule"
            description="Legal Metrology verification officer credentials"
          />
          <CardDivider />

          <div className="space-y-4 text-xs">
            {application.assignedInspectorId ? (
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1.5">
                <div className="flex items-center gap-2 text-primary-900 font-bold">
                  <UserCheck className="w-4 h-4 text-primary-700" />
                  <span>
                    {INSPECTOR_NAME_MAP[application.assignedInspectorId] ?? `Inspector ID: ${application.assignedInspectorId}`}
                  </span>
                </div>
                <p className="text-gray-600">
                  Scheduled Inspection: <strong>{application.scheduledInspectionDate ?? 'To be scheduled'}</strong>
                </p>
                {inspection && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Inspection Status:</span>
                    <span className="font-semibold text-gray-800">{inspection.status}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-100 text-amber-900">
                <p className="font-semibold">Inspector Assignment Pending</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Your application is undergoing initial document clearance. An inspector will be assigned automatically based on your jurisdiction.
                </p>
              </div>
            )}

            {/* Inspection Findings (if inspected) */}
            {inspection && inspection.status === 'COMPLETED' && (
              <div className="pt-2 space-y-2 border-t border-gray-100">
                <h5 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                  Physical Inspection Report
                </h5>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Result:</span>
                    <InspectionResultBadge result={inspection.overallResult} />
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {inspection.inspectorRemarks || 'Calibration within permissible statutory error limits.'}
                  </p>
                  <p className="text-[11px] text-gray-400 font-mono">Completed: {inspection.completedDate}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Attached Documents & Challan */}
      <Card padding="md">
        <CardHeader
          title="Attached Verification Documents & Challan"
          description="Statutory documents filed with this application"
        />
        <CardDivider />

        <div className="grid sm:grid-cols-2 gap-3">
          {application.documents.map(doc => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-primary-700 shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-semibold text-gray-900 truncate">{doc.name}</p>
                  <p className="text-[10px] text-gray-500">{doc.type.replace(/_/g, ' ')}</p>
                </div>
              </div>

              <Button
                size="xs"
                variant="ghost"
                leftIcon={<Eye className="w-3 h-3" />}
                onClick={() => setPreviewDoc(doc.name)}
              >
                View
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal for Mock Document Preview */}
      <Modal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc ?? 'Document Preview'}
        description="Legal Metrology Department Application Attachment Viewer"
      >
        <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-primary-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-800">{previewDoc}</p>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Verified digitally with SHA-256 integrity seal under the National Metrology Registry.
          </p>
          <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Authentic Document
          </div>
        </div>
      </Modal>
    </div>
  );
}
