import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Scale,
  Award,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  PieChart as PieIcon,
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
  AreaChart,
  Area,
} from 'recharts';
import { useData } from '@/context/DataContext';
import { Card, CardHeader, CardDivider, StatCard } from '@/components/ui/Card';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminAnalyticsPage() {
  const { instruments, applications, inspections, certificates, businesses } = useData();

  const totalInstruments = instruments.length;
  const certifiedInstruments = instruments.filter(i => i.status === 'CERTIFIED').length;
  const complianceRate = totalInstruments > 0
    ? Math.round((certifiedInstruments / totalInstruments) * 100)
    : 100;

  // Monthly applications & inspections trends
  const monthlyData = [
    { month: 'Apr', applications: 12, inspections: 10, approved: 9 },
    { month: 'May', applications: 18, inspections: 15, approved: 14 },
    { month: 'Jun', applications: 24, inspections: 22, approved: 20 },
    { month: 'Jul', applications: 35, inspections: 30, approved: 28 },
    { month: 'Aug', applications: 42, inspections: 38, approved: 36 },
    { month: 'Sep', applications: applications.length, inspections: inspections.length, approved: certificates.length },
  ];

  // Instrument category counts
  const categoryCounts: Record<string, number> = {};
  instruments.forEach(i => {
    const label = i.type.replace(/_/g, ' ');
    categoryCounts[label] = (categoryCounts[label] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Approval vs rejection
  const approvalData = [
    { name: 'Approved', count: inspections.filter(i => i.overallResult === 'APPROVED').length, fill: '#10b981' },
    { name: 'Needs Correction', count: inspections.filter(i => i.overallResult === 'NEEDS_CORRECTION').length, fill: '#f59e0b' },
    { name: 'Rejected', count: inspections.filter(i => i.overallResult === 'REJECTED').length, fill: '#ef4444' },
  ];

  // Jurisdiction breakdown
  const states = ['Delhi NCR', 'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">National Metrology Analytics & Heatmaps</h1>
        <p className="page-subtitle">
          Macro indicators, throughput velocity, calibration tolerances, and statutory enforcement performance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Overall National Compliance"
          value={`${complianceRate}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
          trend={{ value: '+3.8% MoM', up: true }}
        />
        <StatCard
          label="Active Certificates"
          value={certificates.filter(c => c.status === 'VERIFIED').length}
          icon={<Award className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          label="Supervised Establishments"
          value={businesses.length}
          icon={<Building2 className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          label="Average Turnaround"
          value="3.2 Days"
          icon={<Calendar className="w-5 h-5" />}
          color="orange"
        />
      </div>

      {/* Row 1: Volume Over Time */}
      <Card>
        <CardHeader
          title="Verification & Inspection Volume Over Time"
          description="Monthly comparison between submissions received vs. physical inspections completed"
        />
        <CardDivider />
        <div className="h-72 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4338ca" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4338ca" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorInsps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="applications" name="Applications Received" stroke="#4338ca" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
              <Area type="monotone" dataKey="inspections" name="Inspections Completed" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorInsps)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Row 2: Two charts (Device Categories & Outcome Distribution) */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Instrument Categories */}
        <Card>
          <CardHeader
            title="Instrument Categories Distribution"
            description="Market share of registered measuring apparatus by type"
          />
          <CardDivider />
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Inspection Outcomes */}
        <Card>
          <CardHeader
            title="Statutory Inspection Decisions"
            description="Clearance vs. non-compliance ratio recorded by field officers"
          />
          <CardDivider />
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={approvalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {approvalData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 3: Regional Compliance Table */}
      <Card padding="none">
        <div className="p-5 pb-0">
          <CardHeader
            title="State-wise Metrological Enforcement Compliance"
            description="Compliance scorecard benchmarked under Legal Metrology Central Rules"
          />
        </div>
        <CardDivider className="mx-5" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-5">State / Jurisdiction</th>
                <th className="py-3 px-5">Commercial Traders</th>
                <th className="py-3 px-5">Registered Devices</th>
                <th className="py-3 px-5">Verification Rate</th>
                <th className="py-3 px-5">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {states.map((st, i) => {
                const rate = 94 - i * 2.5;
                return (
                  <tr key={st} className="hover:bg-gray-50/80">
                    <td className="py-3.5 px-5 font-bold text-gray-900">{st}</td>
                    <td className="py-3.5 px-5 font-mono text-gray-700">{320 + i * 45} entities</td>
                    <td className="py-3.5 px-5 font-mono font-semibold text-gray-900">{1240 + i * 180}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600 rounded-full"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-gray-900">{rate.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Optimal
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
