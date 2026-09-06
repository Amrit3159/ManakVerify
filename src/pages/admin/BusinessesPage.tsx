import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Mail,
  Scale,
  CheckCircle2,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, StatCard } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminBusinessesPage() {
  const { businesses, instruments } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const categories = useMemo(() => {
    const set = new Set(businesses.map(b => b.category));
    return Array.from(set);
  }, [businesses]);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(biz => {
      const matchSearch =
        searchTerm === '' ||
        biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        biz.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        biz.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        biz.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        biz.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = categoryFilter === 'ALL' || biz.category === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [businesses, searchTerm, categoryFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">Registered Commercial Establishments</h1>
        <p className="page-subtitle">
          Directory of business entities, industrial plants, and commercial traders subject to Legal Metrology compliance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          label="Registered Entities"
          value={businesses.length}
          icon={<Building2 className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          label="Total Instruments Monitored"
          value={instruments.length}
          icon={<Scale className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          label="Active Status"
          value={businesses.filter(b => b.status === 'ACTIVE').length}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
        />
      </div>

      {/* Filter and Search */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by trade name, GSTIN, city, or contact..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Businesses Table */}
      {filteredBusinesses.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            title="No commercial entities found"
            description="Try changing your search query or filter."
            icon={<Building2 className="w-8 h-8 text-gray-400" />}
          />
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Establishment Name</th>
                <th className="py-3 px-4">GSTIN Identification</th>
                <th className="py-3 px-4">Trade Category</th>
                <th className="py-3 px-4">Location / Jurisdiction</th>
                <th className="py-3 px-4">Authorized Contact</th>
                <th className="py-3 px-4">Active Devices</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBusinesses.map(biz => {
                const bizInstCount = instruments.filter(i => i.businessId === biz.id).length;

                return (
                  <tr key={biz.id} className="hover:bg-gray-50/80">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {biz.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-primary-700">
                      {biz.gstin}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px]">
                        {biz.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {biz.city}, {biz.state}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-gray-800">{biz.contactPerson}</p>
                      <p className="text-[11px] text-gray-400">{biz.phone}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-gray-900">
                      {bizInstCount} devices
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
