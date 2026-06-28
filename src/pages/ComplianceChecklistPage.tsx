import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Calendar, CheckCircle, Clock, FileCheck, Plus, XCircle } from 'lucide-react';
import { AppHeader, Button } from '../components';
import { StatCard } from '../components/StatCard';
import { apiRequest } from '../lib/api';

interface ComplianceItem {
  id: number;
  title: string;
  owner: string;
  verified: boolean;
  verified_by?: string | null;
  verified_at?: string | null;
}

export default function ComplianceChecklistPage() {
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');
  const [ownerFilter, setOwnerFilter] = useState('ALL');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await apiRequest<any>('/compliance-items/');
        setItems(Array.isArray(data) ? data : data.results || []);
      } catch (error) {
        console.error('Error fetching compliance items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const owners = useMemo(() => [...new Set(items.map((item) => item.owner))], [items]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const statusMatch =
          statusFilter === 'ALL' || (statusFilter === 'VERIFIED' ? item.verified : !item.verified);
        const ownerMatch = ownerFilter === 'ALL' || item.owner === ownerFilter;
        return statusMatch && ownerMatch;
      }),
    [items, ownerFilter, statusFilter]
  );

  const stats = useMemo(
    () => ({
      total: items.length,
      verified: items.filter((item) => item.verified).length,
      pending: items.filter((item) => !item.verified).length,
    }),
    [items]
  );

  const toggleVerification = async (item: ComplianceItem, verified: boolean) => {
    try {
      await apiRequest(`/compliance-items/${item.id}/${verified ? 'verify' : 'unverify'}/`, {
        method: 'POST',
      });
      setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, verified } : entry)));
    } catch (error) {
      console.error('Error updating compliance item:', error);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center">Loading...</div>;
  }

  return (
    <div className="page">
      <AppHeader title="Compliance Checklist" summary="Track governance items and verification status." />

      <div className="container">
        <div className="mb-6 flex items-center justify-end">
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Add Item
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <StatCard label="Total Items" value={String(stats.total)} trend="Compliance scope" trendDirection="neutral" icon={FileCheck} />
          <StatCard label="Verified" value={String(stats.verified)} trend="Verified items" trendDirection="up" icon={CheckCircle} />
          <StatCard label="Pending" value={String(stats.pending)} trend="Awaiting review" trendDirection="down" icon={Clock} />
        </div>

        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'VERIFIED' | 'UNVERIFIED')} className="rounded-lg border px-4 py-2">
              <option value="ALL">All Status</option>
              <option value="VERIFIED">Verified</option>
              <option value="UNVERIFIED">Unverified</option>
            </select>
            <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)} className="rounded-lg border px-4 py-2">
              <option value="ALL">All Owners</option>
              {owners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
            <div className="flex items-center text-sm text-slate-600">{filteredItems.length} items shown</div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{item.verified ? <CheckCircle className="text-green-500" size={20} /> : <XCircle className="text-gray-400" size={20} />}</div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {item.verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Owner: {item.owner}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{item.verified_at ? `Verified: ${new Date(item.verified_at).toLocaleDateString()}` : 'Verification pending'}</span>
                      </div>
                      <div>Verified by: {item.verified_by || 'Unassigned'}</div>
                    </div>
                  </div>
                </div>
                <select
                  value={item.verified ? 'VERIFIED' : 'UNVERIFIED'}
                  onChange={(e) => toggleVerification(item, e.target.value === 'VERIFIED')}
                  className="rounded-lg border px-3 py-1 text-sm"
                >
                  <option value="UNVERIFIED">Unverified</option>
                  <option value="VERIFIED">Verified</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {!filteredItems.length ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
            <AlertTriangle className="mx-auto mb-2 text-slate-400" size={36} />
            No compliance items match the current filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}
