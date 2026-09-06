import React from 'react';
import type {
  ApplicationStatus,
  CertificateStatus,
  InstrumentStatus,
  InspectionStatus,
  InspectionResult,
} from '@/types';

// ============================================================
// Generic Badge
// ============================================================

type BadgeVariant =
  | 'gray'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'red'
  | 'indigo'
  | 'teal'
  | 'orange'
  | 'purple';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  gray:   'bg-gray-100  text-gray-700  ring-gray-200',
  blue:   'bg-blue-50   text-blue-700  ring-blue-200',
  green:  'bg-green-50  text-green-700 ring-green-200',
  yellow: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
  red:    'bg-red-50    text-red-700   ring-red-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  teal:   'bg-teal-50   text-teal-700  ring-teal-200',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200',
  purple: 'bg-purple-50 text-purple-700 ring-purple-200',
};

const dotClasses: Record<BadgeVariant, string> = {
  gray:   'bg-gray-500',
  blue:   'bg-blue-500',
  green:  'bg-green-500',
  yellow: 'bg-yellow-500',
  red:    'bg-red-500',
  indigo: 'bg-indigo-500',
  teal:   'bg-teal-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
};

export function Badge({ variant = 'gray', children, dot = false, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {dot && (
        <span className={['w-1.5 h-1.5 rounded-full shrink-0', dotClasses[variant]].join(' ')} />
      )}
      {children}
    </span>
  );
}

// ============================================================
// Specialised status badges
// ============================================================

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const map: Record<ApplicationStatus, { variant: BadgeVariant; label: string }> = {
    DRAFT:                  { variant: 'gray',   label: 'Draft' },
    SUBMITTED:              { variant: 'blue',   label: 'Submitted' },
    UNDER_REVIEW:           { variant: 'indigo', label: 'Under Review' },
    INSPECTOR_ASSIGNED:     { variant: 'purple', label: 'Inspector Assigned' },
    INSPECTION_SCHEDULED:   { variant: 'orange', label: 'Inspection Scheduled' },
    INSPECTED:              { variant: 'teal',   label: 'Inspected' },
    APPROVED:               { variant: 'green',  label: 'Approved' },
    REJECTED:               { variant: 'red',    label: 'Rejected' },
    NEEDS_CORRECTION:       { variant: 'yellow', label: 'Needs Correction' },
  };
  const cfg = map[status] ?? { variant: 'gray', label: status };
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
}

export function CertificateStatusBadge({ status }: { status: CertificateStatus }) {
  const map: Record<CertificateStatus, { variant: BadgeVariant; label: string }> = {
    VERIFIED: { variant: 'green',  label: 'Verified' },
    EXPIRED:  { variant: 'yellow', label: 'Expired' },
    INVALID:  { variant: 'red',    label: 'Invalid' },
    REVOKED:  { variant: 'red',    label: 'Revoked' },
  };
  const cfg = map[status];
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
}

export function InstrumentStatusBadge({ status }: { status: InstrumentStatus }) {
  const map: Record<InstrumentStatus, { variant: BadgeVariant; label: string }> = {
    REGISTERED:          { variant: 'gray',   label: 'Registered' },
    PENDING_INSPECTION:  { variant: 'orange', label: 'Pending Inspection' },
    CERTIFIED:           { variant: 'teal',   label: 'Certified' },
    REJECTED:            { variant: 'red',    label: 'Rejected' },
    EXPIRED:             { variant: 'yellow', label: 'Expired' },
  };
  const cfg = map[status];
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
}

export function InspectionStatusBadge({ status }: { status: InspectionStatus }) {
  const map: Record<InspectionStatus, { variant: BadgeVariant; label: string }> = {
    SCHEDULED:   { variant: 'blue',   label: 'Scheduled' },
    IN_PROGRESS: { variant: 'orange', label: 'In Progress' },
    COMPLETED:   { variant: 'green',  label: 'Completed' },
    CANCELLED:   { variant: 'red',    label: 'Cancelled' },
  };
  const cfg = map[status];
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
}

export function InspectionResultBadge({ result }: { result: InspectionResult | null }) {
  if (!result) return <Badge variant="gray">Pending</Badge>;
  const map: Record<InspectionResult, { variant: BadgeVariant; label: string }> = {
    APPROVED:         { variant: 'green',  label: 'Approved' },
    REJECTED:         { variant: 'red',    label: 'Rejected' },
    NEEDS_CORRECTION: { variant: 'yellow', label: 'Needs Correction' },
  };
  const cfg = map[result];
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
}
