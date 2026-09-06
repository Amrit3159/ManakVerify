import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Microscope,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scale,
  Building2,
  Calendar,
  Camera,
  Plus,
  Trash2,
  ShieldCheck,
  FileText,
  Award,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardHeader, CardDivider } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { InspectionStatusBadge, InspectionResultBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { addNotification } from '@/data/localStorage';
import type {
  ChecklistItem,
  MeasurementTest,
  InspectionResult,
  Certificate,
} from '@/types';

const STATUTORY_CHECKLIST_ITEMS = [
  { id: 'chk_1', question: 'Serial number matches physical stamping & application' },
  { id: 'chk_2', question: 'Manufacturer and model match type approval specifications' },
  { id: 'chk_3', question: 'Instrument physically present at verified commercial premises' },
  { id: 'chk_4', question: 'Physical condition sound with no mechanical tampering' },
  { id: 'chk_5', question: 'Digital / Analog display functioning without segment defects' },
  { id: 'chk_6', question: 'Security seal intact and tamper-evident wire intact' },
  { id: 'chk_7', question: 'Calibration acceptable across low, medium & high test points' },
  { id: 'chk_8', question: 'Zero error acceptable under no-load condition' },
];

export default function InspectionConductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getInspectionById,
    getBusinessById,
    getInstrumentById,
    getApplicationById,
    saveInspection,
    saveApplication,
    saveInstrument,
    saveCertificate,
    refresh,
  } = useData();

  const inspection = getInspectionById(id ?? '');
  const instrument = inspection ? getInstrumentById(inspection.instrumentId) : null;
  const business   = inspection ? getBusinessById(inspection.businessId) : null;
  const application = inspection ? getApplicationById(inspection.applicationId) : null;

  // Determine if read-only (already completed)
  const isReadOnly = inspection?.status === 'COMPLETED';

  // -------------------------------------------------------
  // All hooks must be declared before any conditional return
  // -------------------------------------------------------

  // Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    if (inspection?.checklist && inspection.checklist.length > 0) {
      return inspection.checklist;
    }
    return STATUTORY_CHECKLIST_ITEMS.map(item => ({
      id: item.id,
      question: item.question,
      category: 'ACCURACY' as const,
      result: null,
      remarks: '',
    }));
  });

  // Measurement Tests State
  const [tests, setTests] = useState<MeasurementTest[]>(() => {
    if (inspection?.measurementTests && inspection.measurementTests.length > 0) {
      return inspection.measurementTests;
    }
    return [
      {
        id: 'test_1',
        testName: 'Zero Load Test',
        nominalValue: '0.000',
        measuredValue: '0.000',
        tolerance: '0.005',
        unit: 'kg',
        result: 'PASS',
      },
      {
        id: 'test_2',
        testName: 'Half Capacity Test (50%)',
        nominalValue: '15.000',
        measuredValue: '15.002',
        tolerance: '0.010',
        unit: 'kg',
        result: 'PASS',
      },
      {
        id: 'test_3',
        testName: 'Maximum Capacity Test (100%)',
        nominalValue: '30.000',
        measuredValue: '30.004',
        tolerance: '0.015',
        unit: 'kg',
        result: 'PASS',
      },
    ];
  });

  // Evidence photos
  const [photos, setPhotos] = useState<string[]>(() => {
    return inspection?.evidencePhotos && inspection.evidencePhotos.length > 0
      ? inspection.evidencePhotos
      : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80'];
  });

  // Remarks & Decision
  const [remarks, setRemarks] = useState(
    inspection?.inspectorRemarks ||
      'Calibration tests completed under standard room temperature. Measurement deviation within maximum permissible limits.'
  );
  const [decision, setDecision] = useState<InspectionResult>(
    inspection?.overallResult || 'APPROVED'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCertNumber, setGeneratedCertNumber] = useState('');

  // -------------------------------------------------------
  // Sync state when inspection loads (e.g. navigation change)
  // -------------------------------------------------------
  useEffect(() => {
    if (inspection?.checklist && inspection.checklist.length > 0) {
      setChecklist(inspection.checklist);
    }
    if (inspection?.measurementTests && inspection.measurementTests.length > 0) {
      setTests(inspection.measurementTests);
    }
    if (inspection?.evidencePhotos && inspection.evidencePhotos.length > 0) {
      setPhotos(inspection.evidencePhotos);
    }
    if (inspection?.inspectorRemarks) {
      setRemarks(inspection.inspectorRemarks);
    }
    if (inspection?.overallResult) {
      setDecision(inspection.overallResult);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // -------------------------------------------------------
  // Guard — must be AFTER all hooks
  // -------------------------------------------------------
  if (!inspection || !instrument || !business) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-gray-500">Inspection record not found.</p>
        <Button size="sm" onClick={() => navigate('/inspector/inspections')}>
          Return to Inspections
        </Button>
      </div>
    );
  }

  // -------------------------------------------------------
  // Checklist helpers
  // -------------------------------------------------------
  const handleSetChecklistResult = (itemId: string, res: 'PASS' | 'FAIL' | 'NA') => {
    if (isReadOnly) return;
    setChecklist(prev =>
      prev.map(c => (c.id === itemId ? { ...c, result: res } : c))
    );
  };

  const handleMarkAllPass = () => {
    if (isReadOnly) return;
    setChecklist(prev => prev.map(c => ({ ...c, result: 'PASS' })));
  };

  // -------------------------------------------------------
  // Measurement helpers
  // -------------------------------------------------------
  const handleUpdateTest = (index: number, field: keyof MeasurementTest, val: string) => {
    if (isReadOnly) return;
    const next = [...tests];
    next[index] = { ...next[index], [field]: val };

    // Recalculate result
    const expected = parseFloat(next[index].nominalValue);
    const observed = parseFloat(next[index].measuredValue);
    const tol      = parseFloat(next[index].tolerance);

    if (!isNaN(expected) && !isNaN(observed) && !isNaN(tol)) {
      const err = Math.abs(observed - expected);
      next[index].result = err <= tol ? 'PASS' : 'FAIL';
    }

    setTests(next);
  };

  const handleAddTestRow = () => {
    if (isReadOnly) return;
    const newTest: MeasurementTest = {
      id: `test_${Date.now()}`,
      testName: `Test Point #${tests.length + 1}`,
      nominalValue: '10.000',
      measuredValue: '10.000',
      tolerance: '0.010',
      unit: 'kg',
      result: 'PASS',
    };
    setTests(prev => [...prev, newTest]);
  };

  const handleRemoveTestRow = (index: number) => {
    if (isReadOnly) return;
    setTests(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddMockPhoto = () => {
    if (isReadOnly) return;
    setPhotos(prev => [
      ...prev,
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=300&q=80',
    ]);
  };

  // -------------------------------------------------------
  // Submit Inspection
  // -------------------------------------------------------
  const handleSubmitInspection = () => {
    if (isReadOnly) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const today  = new Date().toISOString().split('T')[0];
      const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      // 1. Update Inspection
      const updatedInspection = {
        ...inspection,
        status:          'COMPLETED' as const,
        completedDate:   today,
        overallResult:   decision,
        inspectorRemarks: remarks,
        checklist:       checklist,
        measurementTests: tests,
        evidencePhotos:  photos,
      };
      saveInspection(updatedInspection);

      // 2. Update Application
      const appStatus = decision === 'APPROVED'
        ? 'APPROVED'
        : decision === 'REJECTED'
        ? 'REJECTED'
        : 'NEEDS_CORRECTION';

      if (application) {
        const updatedApp = {
          ...application,
          status:      appStatus as typeof application.status,
          lastUpdated: today,
          remarks:     `Inspection completed by ${user?.name ?? 'Inspector'}: ${decision}. ${remarks}`,
        };
        saveApplication(updatedApp);
      }

      // 3. Update Instrument & (if approved) generate Certificate
      let certId: string | undefined = undefined;
      let certNum = '';

      if (decision === 'APPROVED') {
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        certNum   = `MV-CERT-${new Date().getFullYear()}-${randomNum}`;
        const stampNum = `STAMP-DL-${Math.floor(1000 + Math.random() * 9000)}`;
        certId = `cert_${Date.now()}`;

        // 4. Generate Certificate
        const newCert: Certificate = {
          id:                certId,
          certificateNumber: certNum,
          applicationId:     inspection.applicationId,
          instrumentId:      inspection.instrumentId,
          businessId:        inspection.businessId,
          inspectorId:       inspection.inspectorId,
          issueDate:         today,
          expiryDate:        expiry,
          status:            'VERIFIED',
          stampNumber:       stampNum,
          issuingAuthority:  'Department of Legal Metrology, Government of India',
          issuingOfficer:    user?.name ?? 'Legal Metrology Officer',
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
        setGeneratedCertNumber(certNum);

        // Notify business owner — approved
        if (application) {
          addNotification(
            business.ownerId,
            'Certificate Issued',
            `Your instrument "${instrument.name}" has been verified. Certificate ${certNum} has been issued.`,
            'SUCCESS',
            '/business/certificates',
          );
        }
      } else if (decision === 'NEEDS_CORRECTION') {
        // Notify business owner — correction required
        if (application) {
          addNotification(
            business.ownerId,
            'Correction Required',
            `Inspection for "${instrument.name}" requires correction. Please review remarks and resubmit within 14 days.`,
            'WARNING',
            `/business/applications/${application.id}`,
          );
        }
      } else if (decision === 'REJECTED') {
        // Notify business owner — rejected
        if (application) {
          addNotification(
            business.ownerId,
            'Application Rejected',
            `Inspection for "${instrument.name}" was rejected. Reason: ${remarks.slice(0, 100)}`,
            'ERROR',
            `/business/applications/${application.id}`,
          );
        }
      }

      // 5. Update Instrument status
      const updatedInstrument = {
        ...instrument,
        status: (decision === 'APPROVED' ? 'CERTIFIED' : decision === 'REJECTED' ? 'REJECTED' : 'PENDING_INSPECTION') as typeof instrument.status,
        lastInspectionDate:   today,
        nextInspectionDue:    decision === 'APPROVED' ? expiry : undefined,
        currentCertificateId: certId ?? instrument.currentCertificateId,
      };
      saveInstrument(updatedInstrument);

      refresh();
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 600);
  };

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto py-2">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/inspector/inspections')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Assigned Inspections
          </button>
          <div className="flex items-center gap-3">
            <h1 className="page-title">On-Site Inspection & Verification</h1>
            <InspectionStatusBadge status={inspection.status} />
          </div>
          <p className="page-subtitle">
            Visit Date: <strong>{inspection.scheduledDate}</strong> • Inspector: {user?.name}
          </p>
        </div>

        {inspection.status === 'COMPLETED' && (
          <div className="flex items-center gap-2">
            <InspectionResultBadge result={inspection.overallResult} />
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              <Lock className="w-3 h-3" /> Read-Only
            </span>
          </div>
        )}
      </div>

      {/* Read-only banner */}
      {isReadOnly && (
        <div className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600">
          <Lock className="w-4 h-4 text-gray-400 shrink-0" />
          <span>
            This inspection was completed on <strong>{inspection.completedDate}</strong>. The record is locked and cannot be modified.
          </span>
        </div>
      )}

      {/* Commercial Instrument & Business Header Card */}
      <Card padding="md" className="bg-slate-50/70 border-gray-200">
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Premises & Commercial Establishment
            </span>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{business.name}</p>
            <p className="text-gray-600 mt-0.5">{business.address}, {business.city}, {business.state}</p>
            <p className="text-gray-400 font-mono mt-0.5">GSTIN: {business.gstin}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Device Under Inspection
            </span>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{instrument.name}</p>
            <p className="text-gray-600 mt-0.5">
              {instrument.make} • {instrument.model} ({instrument.capacity}, {instrument.accuracy})
            </p>
            <p className="text-primary-700 font-mono font-bold mt-0.5">
              Serial No: {instrument.serialNumber}
            </p>
          </div>
        </div>
      </Card>

      {/* SECTION 1: Statutory Verification Checklist */}
      <Card padding="lg">
        <div className="flex items-center justify-between gap-4">
          <CardHeader
            title="1. Physical & Operational Verification Checklist"
            description="Inspect the physical device against statutory requirements of the Legal Metrology Act, 2009."
          />
          {!isReadOnly && (
            <Button size="xs" variant="secondary" onClick={handleMarkAllPass}>
              Mark All Pass
            </Button>
          )}
        </div>
        <CardDivider />

        <div className="space-y-3">
          {checklist.map(item => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50/70 rounded-xl border border-gray-200"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-primary-600 mt-1.5 shrink-0" />
                <span className="text-xs font-semibold text-gray-800 leading-relaxed">
                  {item.question}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {(['PASS', 'FAIL', 'NA'] as const).map(val => (
                  <button
                    key={val}
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => handleSetChecklistResult(item.id, val)}
                    className={[
                      'px-3 py-1 text-xs font-bold rounded-lg transition-all',
                      isReadOnly ? 'cursor-not-allowed opacity-70' : '',
                      item.result === val
                        ? val === 'PASS'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : val === 'FAIL'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-gray-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-600',
                    ].join(' ')}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* SECTION 2: Measurement Calibration Tests Table */}
      <Card padding="lg">
        <div className="flex items-center justify-between gap-4">
          <CardHeader
            title="2. Measurement & Tolerance Tests"
            description="Enter expected test weights/volumes vs. observed instrument readings. Error is calculated automatically."
          />
          {!isReadOnly && (
            <Button
              size="xs"
              variant="secondary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleAddTestRow}
            >
              Add Test Point
            </Button>
          )}
        </div>
        <CardDivider />

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-3">Test Point</th>
                <th className="py-3 px-3">Expected Load</th>
                <th className="py-3 px-3">Observed Value</th>
                <th className="py-3 px-3">Calculated Error</th>
                <th className="py-3 px-3">Tolerance Limit (±)</th>
                <th className="py-3 px-3">Result</th>
                {!isReadOnly && <th className="py-3 px-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white font-mono">
              {tests.map((t, idx) => {
                const exp     = parseFloat(t.nominalValue) || 0;
                const obs     = parseFloat(t.measuredValue) || 0;
                const err     = (obs - exp).toFixed(3);
                const isPass  = t.result === 'PASS';

                return (
                  <tr key={t.id} className="hover:bg-gray-50/80">
                    <td className="py-2.5 px-3">
                      {isReadOnly ? (
                        <span className="font-sans font-medium text-gray-800">{t.testName}</span>
                      ) : (
                        <input
                          type="text"
                          value={t.testName}
                          onChange={e => handleUpdateTest(idx, 'testName', e.target.value)}
                          className="w-36 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-sans font-medium"
                        />
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {isReadOnly ? (
                        <span>{t.nominalValue}</span>
                      ) : (
                        <input
                          type="text"
                          value={t.nominalValue}
                          onChange={e => handleUpdateTest(idx, 'nominalValue', e.target.value)}
                          className="w-20 px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                        />
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {isReadOnly ? (
                        <span className="font-bold text-gray-900">{t.measuredValue}</span>
                      ) : (
                        <input
                          type="text"
                          value={t.measuredValue}
                          onChange={e => handleUpdateTest(idx, 'measuredValue', e.target.value)}
                          className="w-20 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-900"
                        />
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-bold">
                      <span className={parseFloat(err) === 0 ? 'text-gray-700' : 'text-primary-700'}>
                        {parseFloat(err) > 0 ? `+${err}` : err} {t.unit}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-500">
                      ±{t.tolerance} {t.unit}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={[
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold',
                          isPass
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200',
                        ].join(' ')}
                      >
                        {isPass ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {t.result}
                      </span>
                    </td>
                    {!isReadOnly && (
                      <td className="py-2.5 px-3 text-right">
                        {tests.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTestRow(idx)}
                            className="text-gray-400 hover:text-red-600 p-1"
                            title="Remove test"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SECTION 3: Evidence Photos */}
      <Card padding="lg">
        <div className="flex items-center justify-between gap-4">
          <CardHeader
            title="3. Photographic Evidence"
            description="Upload or verify photos of the serial tag, physical lead seal, and test load displays."
          />
          {!isReadOnly && (
            <Button
              size="xs"
              variant="secondary"
              leftIcon={<Camera className="w-3.5 h-3.5" />}
              onClick={handleAddMockPhoto}
            >
              Attach Photo
            </Button>
          )}
        </div>
        <CardDivider />

        <div className="flex flex-wrap gap-3">
          {photos.map((url, i) => (
            <div key={i} className="relative group w-28 h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
              <img src={url} alt={`Evidence #${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">Photo #{i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* SECTION 4: Inspector Remarks & Official Decision */}
      <Card padding="lg">
        <CardHeader
          title="4. Official Remarks & Statutory Decision"
          description={
            isReadOnly
              ? 'Inspection findings are finalised and locked.'
              : 'Record your enforcement remarks and grant/deny statutory verification certification.'
          }
        />
        <CardDivider />

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Inspector Observations & Remarks
            </label>
            <textarea
              rows={3}
              value={remarks}
              disabled={isReadOnly}
              onChange={e => setRemarks(e.target.value)}
              className={[
                'w-full text-xs p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 font-sans leading-relaxed',
                isReadOnly ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : '',
              ].join(' ')}
              placeholder="Enter calibration observations, conditions of testing, or reasons for rejection..."
            />
          </div>

          {/* Decision Radio Cards */}
          <div>
            <label className="text-xs font-bold text-gray-900 block mb-2 uppercase tracking-wide">
              Statutory Inspection Decision:
            </label>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'APPROVED' as InspectionResult,
                  label: 'APPROVE & CERTIFY',
                  desc: 'Device compliant with Legal Metrology tolerances. Generates official digital certificate & stamp.',
                  color: 'border-emerald-300 bg-emerald-50/50 text-emerald-900',
                  icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
                },
                {
                  id: 'NEEDS_CORRECTION' as InspectionResult,
                  label: 'NEEDS CORRECTION',
                  desc: 'Minor calibration offset. 14-day rectification period granted to the business owner.',
                  color: 'border-amber-300 bg-amber-50/50 text-amber-900',
                  icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
                },
                {
                  id: 'REJECTED' as InspectionResult,
                  label: 'REJECT & SEIZE',
                  desc: 'Major non-compliance or tampering. Certificate denied and marked invalid.',
                  color: 'border-rose-300 bg-rose-50/50 text-rose-900',
                  icon: <XCircle className="w-5 h-5 text-rose-600" />,
                },
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => !isReadOnly && setDecision(item.id)}
                  className={[
                    'p-4 rounded-xl border-2 transition-all flex flex-col justify-between',
                    isReadOnly ? 'cursor-not-allowed opacity-80' : 'cursor-pointer',
                    decision === item.id
                      ? item.color + ' ring-2 ring-primary-500 shadow-sm'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {item.icon}
                    <span className="text-xs font-bold">{item.label}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          {!isReadOnly && (
            <div className="pt-4 flex items-center justify-between border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => navigate('/inspector/inspections')}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="md"
                isLoading={isSubmitting}
                onClick={handleSubmitInspection}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Complete & Sign Inspection
              </Button>
            </div>
          )}

          {/* Read-only action row */}
          {isReadOnly && (
            <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => navigate('/inspector/inspections')}
              >
                Back to Inspections
              </Button>
              {inspection.overallResult === 'APPROVED' && (
                <Button
                  type="button"
                  size="sm"
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  onClick={() => {
                    const cert = instrument.currentCertificateId;
                    if (cert) navigate(`/verify?cert=${cert}`);
                    else navigate('/inspector/history');
                  }}
                >
                  View Certificate
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Success Confirmation Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => navigate('/inspector/inspections')}
        title="Inspection Completed Successfully"
        description="Official inspection findings have been synchronized to the Central Legal Metrology Database."
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-gray-900">
            {decision === 'APPROVED'
              ? 'Verification Certificate Issued!'
              : `Inspection Recorded: ${decision}`}
          </h3>

          {decision === 'APPROVED' && generatedCertNumber && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl max-w-xs mx-auto">
              <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                Issued Certificate ID
              </p>
              <p className="font-mono font-bold text-base text-emerald-950 mt-0.5">
                {generatedCertNumber}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            The business owner and administrative oversight portal have received real-time updates regarding this decision.
          </p>

          <div className="pt-4 flex justify-center gap-3">
            {decision === 'APPROVED' && generatedCertNumber ? (
              <Button
                size="sm"
                onClick={() => navigate(`/verify?cert=${generatedCertNumber}`)}
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                View Public Verification Seal
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate('/inspector/inspections')}>
                Return to Inspections List
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
