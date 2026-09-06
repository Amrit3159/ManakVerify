import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  UserCheck,
  Calendar,
  Building2,
  Scale,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardHeader, CardDivider } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ApplicationStatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { addNotification } from '@/data/localStorage';
import type { Certificate } from '@/types';

const INSPECTOR_OPTIONS = [
  { value: 'insp_1', label: 'Smt. Priya Sharma (Central Delhi Zone 3)' },
  { value: 'insp_2', label: 'Shri Arvind Verma (North Delhi Zone 1)' },
  { value: 'insp_3', label: 'Smt. Kavita Rao (South Delhi Zone 4)' },
];

// Map inspectorId -> display name for rendering
const INSPECTOR_NAME_MAP: Record<string, string> = {
  insp_1: 'Smt. Priya Sharma (Legal Metrology Officer)',
  insp_2: 'Shri Arvind Verma (Legal Metrology Officer)',
  insp_3: 'Smt. Kavita Rao (Legal Metrology Officer)',
};

export default function AdminApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getApplicationById,
    getBusinessById,
    getInstrumentById,
    getInspectionByApplication,
    certificates,
    saveApplication,
    saveInspection,
    saveInstrument,
    saveCertificate,
    refresh,
  } = useData();

  const application = getApplicationById(id ?? '');
  const business    = application ? getBusinessById(application.businessId) : null;
  const instrument  = application ? getInstrumentById(application.instrumentId) : null;
  const inspection  = application ? getInspectionByApplication(application.id) : null;

  const certificate = certificates.find(
    c => c.applicationId === application?.id || c.instrumentId === instrument?.id
  );

  // Assign & Schedule Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedInspector, setSelectedInspector] = useState(
    application?.assignedInspectorId ?? 'insp_1'
  );
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isAssigning, setIsAssigning] = useState(false);

  // Document preview modal
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  if (!application || !business || !instrument) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-gray-500">Application not found in central registry.</p>
        <Button size="sm" onClick={() => navigate('/admin/applications')}>
          Return to Applications
        </Button>
      </div>
    );
  }

  // Handle Assigning Inspector & Scheduling
  const handleAssignInspector = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAssigning(true);

    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];

      // Update Application
      const updatedApp = {
        ...application,
        assignedInspectorId:     selectedInspector,
        scheduledInspectionDate: scheduledDate,
        status:                  'INSPECTION_SCHEDULED' as const,
        lastUpdated:             today,
      };
      saveApplication(updatedApp);

      // Create or update Inspection record — also update inspectorId if reassigning
      const inspectionId = inspection ? inspection.id : `insp_job_${Date.now()}`;
      const newInspection = {
        id:               inspectionId,
        applicationId:    application.id,
        instrumentId:     instrument.id,
        businessId:       business.id,
        inspectorId:      selectedInspector,   // ← use selected, not hardcoded
        status:           'SCHEDULED' as const,
        scheduledDate:    scheduledDate,
        completedDate:    undefined,
        checklist:        inspection?.checklist ?? [],
        measurementTests: inspection?.measurementTests ?? [],
        overallResult:    null,
        inspectorRemarks: '',
        evidencePhotos:   inspection?.evidencePhotos ?? [],
      };
      saveInspection(newInspection);

      // Update instrument status to PENDING_INSPECTION
      saveInstrument({
        ...instrument,
        status: 'PENDING_INSPECTION' as const,
      });

      // Notify business owner
      addNotification(
        business.ownerId,
        'Inspection Scheduled',
        `An inspector has been assigned for "${instrument.name}". Scheduled: ${scheduledDate}.`,
        'INFO',
        `/business/applications/${application.id}`,
      );

      refresh();
      setIsAssigning(false);
      setShowAssignModal(false);
    }, 400);
  };

  // Direct Admin Approval
  const handleAdminDirectApprove = () => {
    const today  = new Date().toISOString().split('T')[0];
    const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const certNum  = `MV-CERT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const stampNum = `STAMP-GOV-${Math.floor(1000 + Math.random() * 9000)}`;
    const certId   = `cert_${Date.now()}`;

    // Update app
    const updatedApp = {
      ...application,
      status:      'APPROVED' as const,
      lastUpdated: today,
      remarks:     'Directly verified and approved by Central Metrology Controller.',
    };
    saveApplication(updatedApp);

    // Update instrument
    const updatedInst = {
      ...instrument,
      status:               'CERTIFIED' as const,
      lastInspectionDate:   today,
      nextInspectionDue:    expiry,
      currentCertificateId: certId,
    };
    saveInstrument(updatedInst);

    // Create Certificate
    const newCert: Certificate = {
      id:                certId,
      certificateNumber: certNum,
      applicationId:     application.id,
      instrumentId:      instrument.id,
      businessId:        business.id,
      inspectorId:       user?.id ?? 'admin',
      issueDate:         today,
      expiryDate:        expiry,
      status:            'VERIFIED',
      stampNumber:       stampNum,
      issuingAuthority:  'Department of Legal Metrology, Government of India',
      issuingOfficer:    user?.name ?? 'Central Metrology Controller',
      instrumentDetails: {
        name:         instrument.name,
        type:         instrument.type,
        make:         instrument.make,
        model:        instrument.model,
        serialNumber: instrument.serialNumber,
        capacity:     instrument.capacity,
        accuracy:     instrument.accuracy,
      },
      businessDetails: {
        name:    business.name,
        address: business.address,
        city:    business.city,
        state:   business.state,
        gstin:   business.gstin,
      },
    };
    saveCertificate(newCert);

    // Notify business owner
    addNotification(
      business.ownerId,
      'Certificate Issued',
      `Your instrument "${instrument.name}" has been approved. Certificate ${certNum} has been issued.`,
      'SUCCESS',
      '/business/certificates',
    );

    refresh();
  };

  // Resolved inspector display name
  const assignedInspectorName =
    application.assignedInspectorId
      ? (INSPECTOR_NAME_MAP[application.assignedInspectorId] ?? `Inspector ID: ${application.assignedInspectorId}`)
      : null;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto py-2">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/admin/applications')}
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
            Submitted {application.submittedDate} by {business.name}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {application.status !== 'APPROVED' && (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<UserCheck className="w-4 h-4" />}
              onClick={() => setShowAssignModal(true)}
            >
              {application.assignedInspectorId ? 'Reassign / Reschedule' : 'Assign & Schedule'}
            </Button>
          )}

          {application.status !== 'APPROVED' && application.status !== 'REJECTED' && (
            <Button
              size="sm"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleAdminDirectApprove}
            >
              Approve & Certify
            </Button>
          )}

          {certificate && (
            <Button
              size="sm"
              variant="secondary"
              rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/verify?cert=${certificate.certificateNumber}`)}
            >
              Verify Certificate
            </Button>
          )}
        </div>
      </div>

      {/* Grid of Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Business Establishment Card */}
        <Card padding="md">
          <CardHeader
            title="Commercial Establishment"
            description="Verified registered entity particulars"
          />
          <CardDivider />
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Business Name:</span>
              <span className="font-semibold text-gray-900">{business.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">GSTIN:</span>
              <span className="font-mono font-bold text-gray-800">{business.gstin}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Category:</span>
              <span className="font-medium text-gray-800">{business.category}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Contact Person:</span>
              <span className="font-medium text-gray-800">{business.contactPerson} ({business.phone})</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Premises Address:</span>
              <span className="font-medium text-gray-800 text-right max-w-[200px] truncate">
                {business.address}, {business.city}, {business.state}
              </span>
            </div>
          </div>
        </Card>

        {/* Instrument Specifications */}
        <Card padding="md">
          <CardHeader
            title="Instrument Specifications"
            description="Hardware submitted for legal verification"
          />
          <CardDivider />
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Device Name:</span>
              <span className="font-semibold text-gray-900">{instrument.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Category:</span>
              <span className="font-medium text-gray-800">{instrument.type.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Make & Model:</span>
              <span className="font-medium text-gray-800">{instrument.make} {instrument.model}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Serial Number:</span>
              <span className="font-mono font-bold text-primary-700">{instrument.serialNumber}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Capacity & Class:</span>
              <span className="font-semibold text-gray-900">{instrument.capacity} ({instrument.accuracy})</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Assigned Inspector Status Card */}
      <Card padding="md">
        <CardHeader
          title="Field Inspector Assignment & Schedule"
          description="Jurisdictional enforcement officer"
          action={
            <Button size="xs" variant="secondary" onClick={() => setShowAssignModal(true)}>
              {application.assignedInspectorId ? 'Reassign / Reschedule' : 'Assign Inspector'}
            </Button>
          }
        />
        <CardDivider />

        <div className="text-xs">
          {assignedInspectorName ? (
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-primary-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-primary-700" />
                  Assigned Officer: {assignedInspectorName}
                </p>
                <p className="text-gray-600 mt-0.5">
                  Scheduled Inspection Date: <strong className="font-mono">{application.scheduledInspectionDate}</strong>
                </p>
                {inspection && (
                  <p className="text-gray-500 mt-0.5">
                    Inspection Status: <strong>{inspection.status}</strong>
                    {inspection.overallResult && (
                      <> — Result: <strong className="capitalize">{inspection.overallResult}</strong></>
                    )}
                  </p>
                )}
              </div>
              <span className="text-[11px] font-semibold text-primary-700 bg-white px-2.5 py-1 rounded shadow-sm">
                Active Assignment
              </span>
            </div>
          ) : (
            <p className="text-gray-400 italic">No inspector assigned yet. Click Assign & Schedule to dispatch an officer.</p>
          )}
        </div>
      </Card>

      {/* Certificate Section (if approved) */}
      {certificate && (
        <Card padding="md" className="border-emerald-200 bg-emerald-50/30">
          <CardHeader
            title="Issued Verification Certificate"
            description="Digital certificate generated after successful inspection"
          />
          <CardDivider />
          <div className="text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Certificate Number:</span>
              <span className="font-mono font-bold text-emerald-800">{certificate.certificateNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Issue Date:</span>
              <span className="font-mono text-gray-800">{certificate.issueDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Valid Until:</span>
              <span className="font-mono font-semibold text-emerald-700">{certificate.expiryDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span className={`font-bold ${certificate.status === 'VERIFIED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {certificate.status}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Uploaded Documents */}
      <Card padding="md">
        <CardHeader
          title="Statutory Documents Attached"
          description="Uploaded by commercial applicant for audit"
        />
        <CardDivider />

        <div className="grid sm:grid-cols-2 gap-3">
          {application.documents.map(doc => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="flex items-center gap-2.5 truncate">
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
                Inspect
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Assign Inspector Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Field Inspector & Schedule Visit"
        description="Dispatch an authorized Legal Metrology Officer to conduct on-site verification."
      >
        <form onSubmit={handleAssignInspector} className="space-y-4">
          <Select
            label="Designate Field Inspector"
            required
            options={INSPECTOR_OPTIONS}
            value={selectedInspector}
            onChange={e => setSelectedInspector(e.target.value)}
          />

          <Input
            type="date"
            label="Schedule On-Site Inspection Date"
            required
            value={scheduledDate}
            onChange={e => setScheduledDate(e.target.value)}
          />

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isAssigning}>
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc ?? 'Document Viewer'}
        description="Legal Metrology Department Application Attachment Viewer"
      >
        <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-primary-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-800">{previewDoc}</p>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Digitally certified document under Section 24 of Legal Metrology Act, 2009.
          </p>
        </div>
      </Modal>
    </div>
  );
}
