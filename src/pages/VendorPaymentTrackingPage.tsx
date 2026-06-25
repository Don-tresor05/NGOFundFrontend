import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCcw, Plus, Save, Search } from 'lucide-react';
import { AppHeader, Button } from '../components';
import { apiList, apiRequest } from '../lib/api';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

type VendorStatus = 'active' | 'inactive';

interface Vendor {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  category: string;
  status: VendorStatus;
  scheduled_count: number;
  paid_amount: string | number;
  outstanding_amount: string | number;
}

interface ScheduledPayment {
  id: number;
  vendor: number;
  vendor_name: string;
  description: string;
  amount: string | number;
  currency: string;
  due_date: string;
  status: string;
  notes: string;
}

const emptyVendor = {
  name: '',
  contact_person: '',
  email: '',
  phone: '',
  category: '',
  status: 'active' as VendorStatus,
};

const fieldClass = 'w-full rounded border border-slate-300 px-3 py-2';

export function VendorPaymentTrackingPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [payments, setPayments] = useState<ScheduledPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | VendorStatus>('all');
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyVendor);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vendorRows, paymentRows] = await Promise.all([
        apiList<Vendor>('/vendors/'),
        apiList<ScheduledPayment>('/scheduled-payments/'),
      ]);
      setVendors(vendorRows);
      setPayments(paymentRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vendor data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const statusMatch = filter === 'all' || vendor.status === filter;
      const queryText = `${vendor.name} ${vendor.contact_person} ${vendor.email} ${vendor.category}`.toLowerCase();
      return statusMatch && queryText.includes(query.toLowerCase());
    });
  }, [vendors, filter, query]);

  const totalPaid = filteredVendors.reduce((sum, vendor) => sum + Number(vendor.paid_amount ?? 0), 0);
  const totalOutstanding = filteredVendors.reduce((sum, vendor) => sum + Number(vendor.outstanding_amount ?? 0), 0);
  const activeCount = filteredVendors.filter((vendor) => vendor.status === 'active').length;

  const recentPayments = useMemo(
    () =>
      [...payments]
        .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())
        .slice(0, 10),
    [payments],
  );

  const handleCreateVendor = async (event: FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await apiRequest('/vendors/', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm(emptyVendor);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vendor.');
    } finally {
      setCreating(false);
    }
  };

  const updateVendorStatus = async (id: number, status: VendorStatus) => {
    try {
      await apiRequest(`/vendors/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor.');
    }
  };

  return (
    <div className="page">
      <AppHeader title="Vendor Payments" summary="Vendor registry, payment exposure, and payment activity." />

      <div className="container">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">Finance operations</p>
            <h1 className="text-2xl font-bold text-slate-900">Vendor tracking</h1>
          </div>
          <Button variant="outline" icon={RefreshCcw} onClick={load} disabled={loading}>
            {loading ? 'Refreshing' : 'Refresh'}
          </Button>
        </div>

        {error ? <div className="card mb-6 border-red-200 bg-red-50 text-red-700">{error}</div> : null}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="card">
            <p className="text-sm text-slate-500">Active Vendors</p>
            <p className="text-2xl font-bold">{activeCount}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Paid Exposure</p>
            <p className="text-2xl font-bold text-green-600">{currency.format(totalPaid)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Outstanding Exposure</p>
            <p className="text-2xl font-bold text-orange-600">{currency.format(totalOutstanding)}</p>
          </div>
        </div>

        <div className="mb-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <form className="card space-y-4" onSubmit={handleCreateVendor}>
            <div className="flex items-center gap-2">
              <Plus size={18} />
              <h2 className="text-lg font-semibold">Register vendor</h2>
            </div>
            <div className="grid gap-3">
              <label className="space-y-1 text-sm font-medium text-slate-700">
                <span>Vendor name</span>
                <input className={fieldClass} value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
              </label>
              <label className="space-y-1 text-sm font-medium text-slate-700">
                <span>Contact person</span>
                <input className={fieldClass} value={form.contact_person} onChange={(e) => setForm((prev) => ({ ...prev, contact_person: e.target.value }))} />
              </label>
              <label className="space-y-1 text-sm font-medium text-slate-700">
                <span>Email</span>
                <input className={fieldClass} type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
              </label>
              <label className="space-y-1 text-sm font-medium text-slate-700">
                <span>Phone</span>
                <input className={fieldClass} value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
              </label>
              <label className="space-y-1 text-sm font-medium text-slate-700">
                <span>Category</span>
                <input className={fieldClass} value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
              </label>
              <label className="space-y-1 text-sm font-medium text-slate-700">
                <span>Status</span>
                <select
                  className={fieldClass}
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as VendorStatus }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>
            <Button type="submit" icon={Save} disabled={creating}>
              {creating ? 'Saving' : 'Save vendor'}
            </Button>
          </form>

          <div className="card">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Vendor registry</h2>
                <p className="text-sm text-slate-500">Search by name, category, or contact.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input className={`${fieldClass} pl-9`} placeholder="Search vendors" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <select className="rounded border border-slate-300 px-3 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-slate-500">
                    <th className="py-2">Vendor</th>
                    <th className="py-2">Category</th>
                    <th className="py-2 text-right">Scheduled</th>
                    <th className="py-2 text-right">Paid</th>
                    <th className="py-2 text-right">Outstanding</th>
                    <th className="py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.length === 0 ? (
                    <tr>
                      <td className="py-8 text-center text-slate-500" colSpan={6}>
                        No vendors found
                      </td>
                    </tr>
                  ) : (
                    filteredVendors.map((vendor) => (
                      <tr key={vendor.id} className="border-b align-top">
                        <td className="py-3">
                          <p className="font-medium text-slate-900">{vendor.name}</p>
                          <p className="text-xs text-slate-500">{vendor.contact_person || vendor.email || 'No contact details'}</p>
                        </td>
                        <td className="py-3 text-sm text-slate-600">{vendor.category || '-'}</td>
                        <td className="py-3 text-right">{vendor.scheduled_count}</td>
                        <td className="py-3 text-right text-green-700">{currency.format(Number(vendor.paid_amount ?? 0))}</td>
                        <td className="py-3 text-right text-orange-700">{currency.format(Number(vendor.outstanding_amount ?? 0))}</td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <span className={`rounded px-2 py-1 text-xs font-semibold ${vendor.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                              {vendor.status}
                            </span>
                            <button
                              type="button"
                              className="text-xs font-semibold text-blue-700"
                              onClick={() => updateVendorStatus(vendor.id, vendor.status === 'active' ? 'inactive' : 'active')}
                            >
                              Toggle
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Recent payment activity</h2>
              <p className="text-sm text-slate-500">Latest scheduled payment records and current status.</p>
            </div>
            <Link to="/app/finance/payments" className="text-sm font-semibold text-blue-700">
              Open payment scheduling
            </Link>
          </div>

          <div className="space-y-3">
            {recentPayments.length === 0 ? (
              <p className="py-8 text-center text-slate-500">No scheduled payments recorded</p>
            ) : (
              recentPayments.map((payment) => (
                <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 p-3">
                  <div>
                    <p className="font-medium text-slate-900">{payment.vendor_name}</p>
                    <p className="text-xs text-slate-500">
                      {payment.description} • Due {new Date(payment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{currency.format(Number(payment.amount ?? 0))}</p>
                    <span className="text-xs text-slate-500">{payment.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
