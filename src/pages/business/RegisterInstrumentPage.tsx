import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  FileCheck,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Building2,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardHeader, CardDivider } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { InstrumentType, ApplicationDocument } from '@/types';

const INSTRUMENT_TYPES: { value: InstrumentType; label: string }[] = [
  { value: 'WEIGHING_SCALE', label: 'Commercial Weighing Scale' },
  { value: 'PLATFORM_SCALE', label: 'Heavy Duty Platform Scale' },
  { value: 'FUEL_DISPENSER', label: 'Fuel / Petrol Dispensing Unit' },
  { value: 'WATER_METER', label: 'Commercial Water Flow Meter' },
  { value: 'ELECTRICITY_METER', label: 'Electricity Consumption Meter' },
  { value: 'BALANCE', label: 'High Precision Precision Balance' },
  { value: 'WEIGHBRIDGE', label: 'Industrial Weighbridge' },
  { value: 'MILK_METER', label: 'Dairy Milk Measuring Apparatus' },
  { value: 'PRESSURE_GAUGE', label: 'Pressure / Vacuum Gauge' },
  { value: 'TAPE_MEASURE', label: 'Standard Calibrated Measure' },
];

export default function RegisterInstrumentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveInstrument, saveApplication, refresh } = useData();

  const businessId = user?.businessId ?? 'biz_1';

  // Multi-step form step: 1 = Details, 2 = Documents, 3 = Review, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [formData, setFormData] = useState({
    type: 'WEIGHING_SCALE' as InstrumentType,
    name: '',
    make: '',
    model: '',
    serialNumber: '',
    capacity: '',
    accuracy: 'Class III (Commercial)',
    installationAddress: '',
    purchaseDate: '',
    lastVerificationDate: '',
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Documents
  const [documents, setDocuments] = useState<ApplicationDocument[]>([
    {
      id: 'doc_inv_1',
      name: 'Invoice_and_Purchase_Bill.pdf',
      type: 'PURCHASE_INVOICE',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'PENDING',
    },
    {
      id: 'doc_cal_1',
      name: 'OEM_Factory_Calibration_Report.pdf',
      type: 'CALIBRATION_REPORT',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'PENDING',
    },
  ]);

  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string>('');
  const [submittedAppDbId, setSubmittedAppDbId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Validate step 1
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Instrument name is required';
    if (!formData.make.trim()) errs.make = 'Manufacturer name is required';
    if (!formData.model.trim()) errs.model = 'Model designation is required';
    if (!formData.serialNumber.trim()) errs.serialNumber = 'Unique Serial Number is required';
    if (!formData.capacity.trim()) errs.capacity = 'Capacity specification is required (e.g. 30 kg)';
    if (!formData.accuracy.trim()) errs.accuracy = 'Accuracy class is required';
    if (!formData.installationAddress.trim()) errs.installationAddress = 'Installation address / location is required';
    if (!formData.purchaseDate) errs.purchaseDate = 'Purchase date is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleNextToStep3 = () => {
    if (documents.length === 0) {
      alert('Please attach at least one supporting document.');
      return;
    }
    setStep(3);
  };

  const handleAddMockDoc = (docType: ApplicationDocument['type'], defaultName: string) => {
    const newDoc: ApplicationDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: defaultName,
      type: docType,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'PENDING',
    };
    setDocuments(prev => [...prev, newDoc]);
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Final submission
  const handleSubmitApplication = () => {
    if (!declarationAgreed) {
      alert('Please check and accept the statutory declaration before submitting.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Generate IDs
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const appNumber = `MV-APP-2026-${randomNum}`;
      const appDbId = `app_${Date.now()}`;
      const instId = `inst_${Date.now()}`;

      // Create new instrument
      const newInstrument = {
        id: instId,
        serialNumber: formData.serialNumber.trim().toUpperCase(),
        name: formData.name.trim(),
        type: formData.type,
        make: formData.make.trim(),
        model: formData.model.trim(),
        capacity: formData.capacity.trim(),
        accuracy: formData.accuracy.trim(),
        businessId: businessId,
        purchaseDate: formData.purchaseDate,
        installationDate: formData.purchaseDate,
        location: formData.installationAddress.trim(),
        installationAddress: formData.installationAddress.trim(),
        lastVerificationDate: formData.lastVerificationDate || undefined,
        status: 'PENDING_INSPECTION' as const,
      };

      // Create new application
      const newApplication = {
        id: appDbId,
        applicationNumber: appNumber,
        businessId: businessId,
        instrumentId: instId,
        applicationType: 'INITIAL' as const,
        status: 'SUBMITTED' as const,
        submittedDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        remarks: 'Initial verification application submitted by business owner.',
        documents: documents,
        fees: 2065,
        feesPaid: true,
      };

      // Save to localStorage & refresh context
      saveInstrument(newInstrument);
      saveApplication(newApplication);
      refresh();

      setSubmittedAppId(appNumber);
      setSubmittedAppDbId(appDbId);
      setIsSubmitting(false);
      setStep(4);
    }, 600);
  };

  const handleCopyAppId = () => {
    navigator.clipboard.writeText(submittedAppId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in py-2">
      {/* Top Header */}
      <div>
        <button
          onClick={() => navigate('/business/instruments')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Instruments
        </button>
        <h1 className="page-title">Register & Verify Instrument</h1>
        <p className="page-subtitle">
          Submit technical specifications and documentation for official Legal Metrology verification.
        </p>
      </div>

      {/* Stepper indicator */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Instrument Details' },
            { num: 2, label: 'Supporting Documents' },
            { num: 3, label: 'Review & Payment' },
            { num: 4, label: 'Confirmation' },
          ].map((s, idx) => {
            const isCurrent = step === s.num;
            const isCompleted = step > s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2.5">
                  <div
                    className={[
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors',
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-primary-700 text-white ring-4 ring-primary-100'
                        : 'bg-gray-100 text-gray-400',
                    ].join(' ')}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={[
                      'text-xs font-semibold hidden sm:inline',
                      isCurrent ? 'text-gray-900' : 'text-gray-400',
                    ].join(' ')}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 3 && <div className="flex-1 h-0.5 bg-gray-200 mx-3 hidden sm:block" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Instrument Details */}
      {step === 1 && (
        <Card padding="lg">
          <CardHeader
            title="Step 1: Instrument Technical Specifications"
            description="Enter the legal metrological calibration details as stated on the manufacturer tag."
          />
          <CardDivider />

          <form onSubmit={handleNextToStep2} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Instrument Category / Type"
                required
                options={INSTRUMENT_TYPES}
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as InstrumentType })}
              />

              <Input
                label="Instrument Model / Common Name"
                placeholder="e.g. Counter Scale (Counter #1)"
                required
                value={formData.name}
                error={errors.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Manufacturer / Make"
                placeholder="e.g. Essae-Teraoka Ltd."
                required
                value={formData.make}
                error={errors.make}
                onChange={e => setFormData({ ...formData, make: e.target.value })}
              />

              <Input
                label="Model Number / Series"
                placeholder="e.g. DS-215 / PR-Series"
                required
                value={formData.model}
                error={errors.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label="Serial Number"
                placeholder="e.g. SN-8839210-ET"
                required
                value={formData.serialNumber}
                error={errors.serialNumber}
                onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
              />

              <Input
                label="Maximum Capacity"
                placeholder="e.g. 30 kg / 500 L"
                required
                value={formData.capacity}
                error={errors.capacity}
                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
              />

              <Input
                label="Accuracy Class / Tolerance"
                placeholder="e.g. Class III (Commercial)"
                required
                value={formData.accuracy}
                error={errors.accuracy}
                onChange={e => setFormData({ ...formData, accuracy: e.target.value })}
              />
            </div>

            <Input
              label="Physical Installation Address / Premises Location"
              placeholder="e.g. Billing Counter #1, Shop 4, Main Bazaar, Connaught Place, New Delhi"
              required
              value={formData.installationAddress}
              error={errors.installationAddress}
              onChange={e => setFormData({ ...formData, installationAddress: e.target.value })}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Date of Purchase"
                required
                value={formData.purchaseDate}
                error={errors.purchaseDate}
                onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
              />

              <Input
                type="date"
                label="Last Official Verification Date (If renewal)"
                value={formData.lastVerificationDate}
                hint="Leave empty if this is a brand new instrument registration."
                onChange={e => setFormData({ ...formData, lastVerificationDate: e.target.value })}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue to Documents
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* STEP 2: Supporting Documents */}
      {step === 2 && (
        <Card padding="lg">
          <CardHeader
            title="Step 2: Upload Supporting Documents"
            description="Provide proof of purchase, calibration test sheets, or manufacturer compliance certificates."
          />
          <CardDivider />

          <div className="space-y-4">
            {/* Uploaded Documents List */}
            <div className="space-y-2">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-primary-700 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {doc.type.replace(/_/g, ' ')} • Uploaded {doc.uploadDate}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(doc.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Mock Document Options */}
            <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl bg-slate-50/50 text-center space-y-3">
              <UploadCloud className="w-8 h-8 text-primary-700 mx-auto" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Add Supporting Attachments</p>
                <p className="text-xs text-gray-500">PDF, JPG, PNG accepted (Simulated for Demo)</p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => handleAddMockDoc('PURCHASE_INVOICE', 'GST_Tax_Invoice.pdf')}
                >
                  + Add Tax Invoice
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => handleAddMockDoc('CALIBRATION_REPORT', 'Calibration_Test_Sheet.pdf')}
                >
                  + Add Calibration Sheet
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => handleAddMockDoc('IDENTITY_PROOF', 'Owner_ID_GST_Proof.pdf')}
                >
                  + Add Business License
                </Button>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button
                type="button"
                variant="secondary"
                size="md"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setStep(1)}
              >
                Back to Details
              </Button>
              <Button
                type="button"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={handleNextToStep3}
              >
                Review & Statutory Fees
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: Review & Fees */}
      {step === 3 && (
        <Card padding="lg">
          <CardHeader
            title="Step 3: Review Application & Fees"
            description="Verify all legal metrology particulars before final submission to the enforcement portal."
          />
          <CardDivider />

          <div className="space-y-6">
            {/* Specs Summary */}
            <div className="bg-gray-50 rounded-xl p-5 space-y-3 border border-gray-200/80 text-xs">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Instrument Summary
              </h4>
              <div className="grid sm:grid-cols-2 gap-y-2 gap-x-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-semibold text-gray-900">{formData.type.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Model Name:</span>
                  <span className="font-semibold text-gray-900">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Make & Model:</span>
                  <span className="font-medium text-gray-900">{formData.make} ({formData.model})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Serial Number:</span>
                  <span className="font-mono font-bold text-primary-700">{formData.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Capacity & Class:</span>
                  <span className="font-medium text-gray-900">{formData.capacity} • {formData.accuracy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Purchase Date:</span>
                  <span className="font-medium text-gray-900">{formData.purchaseDate}</span>
                </div>
                <div className="sm:col-span-2 flex justify-between border-t border-gray-200/60 pt-2">
                  <span className="text-gray-500">Premises Address:</span>
                  <span className="font-medium text-gray-900 text-right max-w-sm">{formData.installationAddress}</span>
                </div>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="bg-blue-50/60 rounded-xl p-5 border border-blue-100 text-xs space-y-2">
              <h4 className="font-bold text-blue-950 uppercase tracking-wider">
                Statutory Verification Fee Schedule (Legal Metrology Act)
              </h4>
              <div className="flex justify-between text-gray-600">
                <span>Standard Stamping / Verification Fee:</span>
                <span className="font-semibold text-gray-900">₹1,500.00</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tamper-Evident QR Security Tagging Fee:</span>
                <span className="font-semibold text-gray-900">₹250.00</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Central & State GST (18%):</span>
                <span className="font-semibold text-gray-900">₹315.00</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-blue-900 border-t border-blue-200 pt-2">
                <span>Total Assessment:</span>
                <span>₹2,065.00 (Challan Auto-Cleared)</span>
              </div>
            </div>

            {/* Statutory Declaration */}
            <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={declarationAgreed}
                onChange={e => setDeclarationAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                I hereby solemnly affirm and declare that the instrument particulars, calibration specifications, and invoice records provided above are authentic and complete in accordance with the <strong>Legal Metrology Act, 2009</strong> and Central Enforcement Rules.
              </span>
            </label>

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-between">
              <Button
                type="button"
                variant="secondary"
                size="md"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setStep(2)}
              >
                Back to Documents
              </Button>
              <Button
                type="button"
                size="md"
                isLoading={isSubmitting}
                disabled={!declarationAgreed}
                onClick={handleSubmitApplication}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Submit Application
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: Success Screen */}
      {step === 4 && (
        <Card padding="lg" className="text-center py-10">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Application Submitted Successfully!</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
            Your verification request has been registered in the National Legal Metrology portal. A field inspector will be assigned shortly.
          </p>

          {/* Unique Application ID Box */}
          <div className="my-6 max-w-sm mx-auto p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned Application Number
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-primary-700">
                {submittedAppId}
              </span>
              <button
                type="button"
                onClick={handleCopyAppId}
                className="p-1 rounded text-gray-400 hover:text-gray-700 transition-colors"
                title="Copy Application ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Save this ID for all official correspondence</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="md"
              onClick={() => navigate(`/business/applications/${submittedAppDbId}`)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Track Application Progress
            </Button>
            <Button
              size="md"
              variant="secondary"
              onClick={() => navigate('/business/instruments')}
            >
              View Registered Instruments
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
