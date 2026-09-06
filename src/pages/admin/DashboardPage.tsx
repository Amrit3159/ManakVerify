import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Scale,
  Award,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { StatCard, Card, CardHeader, CardDivider } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ApplicationStatusBadge } from '@/components/ui/Badge';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    businesses,
    instruments,
    applications,
    inspections,
    certificates,
    getBusinessById,
    getInstrumentById,
  } = useData();

  // 1. Total registered instruments
  const totalInstruments = instruments.length;
  // 2. Verified instruments
  const verifiedInstruments = instruments.filter(i => i.status === 'CERTIFIED').length;
  // 3. Pending inspections
  const pendingInspections = inspections.filter(i => i.status === 'SCHEDULED' || i.status === 'IN_PROGRESS').length;
  // 4. Expired certificates
  const expiredCertificates = certificates.filter(c => c.status === 'EXPIRED').length;
  // 5. Non-compliant instruments
  const nonCompliantInstruments = instruments.filter(i => i.status === 'REJECTED' || i.status === 'EXPIRED').length;

  // Chart 1: Applications Pipeline Status
  const statusData = [
    { name: 'Submitted', count: applications.filter(a => a.status === 'SUBMITTED').length },
    { name: 'Under Review', count: applications.filter(a => a.status === 'UNDER_REVIEW').length },
    { name: 'Assigned', count: applications.filter(a => a.status === 'INSPECTOR_ASSIGNED').length },
    { name: 'Scheduled', count: applications.filter(a => a.status === 'INSPECTION_SCHEDULED').length },
    { name: 'Approved', count: applications.filter(a => a.status === 'APPROVED').length },
    { name: 'Rejected', count: applications.filter(a => a.status === 'REJECTED').length },
  ];

  // Chart 2: Instrument Categories Distribution
  const categoryCounts: Record<string, number> = {};
  instruments.forEach(inst => {
    const label = inst.type.replace(/_/g, ' ');
    categoryCounts[label] = (categoryCounts[label] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Chart 3: Approval vs Rejection trends
  const outcomeData = [
    { name: 'Approved', count: inspections.filter(i => i.overallResult === 'APPROVED').length, fill: '#10b981' },
    { name: 'Needs Correction', count: inspections.filter(i => i.overallResult === 'NEEDS_CORRECTION').length, fill: '#f59e0b' },
    { name: 'Rejected', count: inspections.filter(i => i.overallResult === 'REJECTED').length, fill: '#ef4444' },
  ];

  const recentApps = applications
    .slice()
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, 5);

  const firstName = user?.name.split(' ')[0] ?? 'Admin';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">National Metrology Administration</h1>
          <p className="page-subtitle">
            Welcome, {firstName}. Central Legal Metrology Enforcement & Verification Oversight.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Central Registry
          </span>
        </div>
      </div>

      {/* 5 Core Government Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="cursor-pointer" onClick={() => navigate('/admin/instruments')}>
          <StatCard
            label="Total Registered"
            value={totalInstruments}
            icon={<Scale className="w-5 h-5" />}
            color="indigo"
          />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/admin/certificates')}>
          <StatCard
            label="Verified Instruments"
            value={verifiedInstruments}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="teal"
          />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/admin/inspections')}>
          <StatCard
            label="Pending Inspections"
            value={pendingInspections}
            icon={<Clock className="w-5 h-5" />}
            color="orange"
          />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/admin/certificates')}>
          <StatCard
            label="Expired Certificates"
            value={expiredCertificates}
            icon={<Calendar className="w-5 h-5" />}
            color="red"
          />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/admin/instruments')}>
          <StatCard
            label="Non-Compliant Devices"
            value={nonCompliantInstruments}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="red"
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Applications pipeline bar chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Verification Pipeline Status"
              description="Real-time distribution of requests across all procedural stages"
              action={
                <Button size="xs" variant="ghost" rightIcon={<ArrowRight className="w-3.5 h-3.5" />} onClick={() => navigate('/admin/applications')}>
                  All Applications
                </Button>
              }
            />
            <CardDivider />
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#4338ca" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Category distribution Pie Chart */}
        <Card>
          <CardHeader
            title="Instrument Categories"
            description="Proportion of registered device types"
          />
          <CardDivider />
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Second Row: Quick Jurisdictions and Recent Applications */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Links & Shortcuts */}
        <Card>
          <CardHeader
            title="Administrative Controls"
            description="Manage registry entities"
          />
          <CardDivider />
          <div className="space-y-2.5">
            <button
              onClick={() => navigate('/admin/applications')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-primary-700" />
                <span className="text-xs font-semibold text-gray-800">Review & Assign Applications</span>
              </div>
              <span className="text-xs font-bold text-primary-700 bg-white px-2 py-0.5 rounded shadow-sm">
                {applications.length}
              </span>
            </button>

            <button
              onClick={() => navigate('/admin/businesses')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-primary-700" />
                <span className="text-xs font-semibold text-gray-800">Commercial Establishments</span>
              </div>
              <span className="text-xs font-bold text-gray-700 bg-white px-2 py-0.5 rounded shadow-sm">
                {businesses.length}
              </span>
            </button>

            <button
              onClick={() => navigate('/admin/instruments')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Scale className="w-4 h-4 text-primary-700" />
                <span className="text-xs font-semibold text-gray-800">National Device Registry</span>
              </div>
              <span className="text-xs font-bold text-gray-700 bg-white px-2 py-0.5 rounded shadow-sm">
                {totalInstruments}
              </span>
            </button>

            <button
              onClick={() => navigate('/admin/certificates')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-primary-700" />
                <span className="text-xs font-semibold text-gray-800">Certificate Authority & Revocation</span>
              </div>
              <span className="text-xs font-bold text-gray-700 bg-white px-2 py-0.5 rounded shadow-sm">
                {certificates.length}
              </span>
            </button>

            <button
              onClick={() => navigate('/admin/analytics')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-primary-700" />
                <span className="text-xs font-semibold text-gray-800">Compliance Analytics Heatmap</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </Card>

        {/* Recent Applications Table */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="p-5 pb-0">
              <CardHeader
                title="Recent Verification Applications"
                description="Latest submissions awaiting verification or inspector assignment"
                action={
                  <Button
                    size="xs"
                    variant="ghost"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => navigate('/admin/applications')}
                  >
                    View All
                  </Button>
                }
              />
            </div>
            <CardDivider className="mx-5" />
            <div className="divide-y divide-gray-100">
              {recentApps.map(app => {
                const biz = getBusinessById(app.businessId);
                const inst = getInstrumentById(app.instrumentId);
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 px-5 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/applications/${app.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-primary-700 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {app.applicationNumber} — {inst?.name ?? 'Instrument'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {biz?.name ?? 'Business'} • Submitted {app.submittedDate}
                        </p>
                      </div>
                    </div>
                    <ApplicationStatusBadge status={app.status} />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
