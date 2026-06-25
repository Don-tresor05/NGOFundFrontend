import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { RefreshCcw, Plus, Play, CheckCircle2, Save, XCircle } from 'lucide-react';
import { AppHeader, Button } from '../components';
import { apiList, apiRequest } from '../lib/api';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

interface Vendor {
  id: number;
  name: string;
  status: string;
}

interface BudgetLine {
  id: number;
  line_name: string;
  remaining_amount: string | number;
  grant: number;
}

interface BankAccount {
  id: number;
  account_name: string;
  bank_name: string;
}

interface ScheduledPayment {
  id: number;
  vendor: number;
  vendor_name: string;
  budget_line: number;
  budget_line_name: string;
  bank_account: number | null;
  bank_account_name: string | null;
  description: string;
  amount: string | number;
  currency: string;
  due_date: string;
  status: string;
  notes: string;
}

const emptyForm = {
  vendor: '',
  budget_line: '',
  bank_account: '',
  description: '',
  amount: '',
  currency: 'USD',
  due_date: '',
  notes: '',
};

const fieldClass = 'w-full rounded border border-slate-300 px-3 py-2';

export function PaymentSchedulingPage() {
  const [payments, setPayments] = useState<ScheduledPayment[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'week'>('list');
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [paymentRows, vendorRows, budgetRows, bankRows] = await Promise.all([
        apiList<ScheduledPayment>('/scheduled-payments/'),
        apiList<Vendor>('/vendors/'),
        apiList<BudgetLine>('/budget-lines/'),
        apiList<BankAccount>('/bank-accounts/'),
      ]);
      setPayments(paymentRows);
      setVendors(vendorRows);
      setBudgetLines(budgetRows);
      setBankAccounts(bankRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const upcomingPayments = payments.filter((payment) => ['scheduled', 'approved', 'overdue'].includes(payment.status));
  const overduePayments = upcomingPayments.filter((payment) => payment.status === 'overdue' || new Date(payment.due_date) < new Date());
  const upcomingTotal = upcomingPayments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const overdueTotal = overduePayments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);

  const weekBuckets = useMemo(() => {
    const buckets: Record<string, ScheduledPayment[]> = {};
    upcomingPayments.forEach((payment) => {
      const date = new Date(payment.due_date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const key = weekStart.toISOString().slice(0, 10);
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(payment);
    });
    return buckets;
  }, [upcomingPayments]);

  const createPayment = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiRequest('/scheduled-payments/', {
        method: 'POST',
        body: JSON.stringify({
          vendor: Number(form.vendor),
          budget_line: Number(form.budget_line),
          bank_account: form.bank_account ? Number(form.bank_account) : null,
          description: form.description,
          amount: form.amount,
          currency: form.currency,
          due_date: form.due_date,
          notes: form.notes,
        }),
      });
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create scheduled payment.');
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (id: number, action: 'approve' | 'pay' | 'cancel') => {
    try {
      await apiRequest(`/scheduled-payments/${id}/${action}/`, { method: 'POST' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} payment.`);
    }
  };

  const affordableBudgetLines = useMemo(
    () => budgetLines.filter((line) => Number(line.remaining_amount ?? 0) > 0),
    [budgetLines],
  );

  return (
    <div className="page">
      <AppHeader title="Payment Scheduling" summary="Create, approve, and process scheduled vendor payments." />

      <div className="container">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">Finance operations</p>
            <h1 className="text-2xl font-bold text-slate-900">Scheduled payments</h1>
          </div>
          <Button variant="outline" icon={RefreshCcw} onClick={load} disabled={loading}>
            {loading ? 'Refreshing' : 'Refresh'}
          </Button>
        </div>

        {error ? <div className="card mb-6 border-red-200 bg-red-50 text-red-700">{error}</div> : null}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="card">
            <p className="text-sm text-slate-500">Upcoming</p>
            <p className="text-2xl font-bold">{currency.format(upcomingTotal)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{currency.format(overdueTotal)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Scheduled Items</p>
            <p className="text-2xl font-bold text-blue-600">{upcomingPayments.length}</p>
          </div>
        </div>

        <div className="mb-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <form className="card space-y-4" onSubmit={createPayment}>
            <div className="flex items-center gap-2">
              <Plus size={18} />
              <h2 className="text-lg font-semibold">Schedule payment</h2>
            </div>

            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Vendor</span>
              <select className="w-full rounded border border-slate-300 px-3 py-2" value={form.vendor} onChange={(e) => setForm((prev) => ({ ...prev, vendor: e.target.value }))} required>
                <option value="">Select vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} {vendor.status !== 'active' ? '(inactive)' : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Budget line</span>
              <select className="w-full rounded border border-slate-300 px-3 py-2" value={form.budget_line} onChange={(e) => setForm((prev) => ({ ...prev, budget_line: e.target.value }))} required>
                <option value="">Select budget line</option>
                {affordableBudgetLines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.line_name} - {currency.format(Number(line.remaining_amount ?? 0))}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Bank account</span>
              <select className="w-full rounded border border-slate-300 px-3 py-2" value={form.bank_account} onChange={(e) => setForm((prev) => ({ ...prev, bank_account: e.target.value }))}>
                <option value="">Optional</option>
                {bankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.bank_name} - {account.account_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Description</span>
              <input className={fieldClass} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} required />
            </label>
            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Amount</span>
              <input className={fieldClass} type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} required />
            </label>
            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Due date</span>
              <input className={fieldClass} type="date" value={form.due_date} onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))} required />
            </label>
            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Notes</span>
              <input className={fieldClass} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
            </label>

            <Button type="submit" icon={Save} disabled={saving}>
              {saving ? 'Saving' : 'Save payment'}
            </Button>
          </form>

          <div className="card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Payment schedule</h2>
                <p className="text-sm text-slate-500">Approve, pay, or cancel scheduled payments.</p>
              </div>
              <div className="flex gap-2">
                <button className={`rounded px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`} onClick={() => setViewMode('list')} type="button">
                  List
                </button>
                <button className={`rounded px-3 py-2 text-sm ${viewMode === 'week' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`} onClick={() => setViewMode('week')} type="button">
                  Week
                </button>
              </div>
            </div>

            {viewMode === 'list' ? (
              <div className="space-y-3">
                {upcomingPayments.length === 0 ? (
                  <p className="py-8 text-center text-slate-500">No scheduled payments</p>
                ) : (
                  upcomingPayments.map((payment) => (
                    <div key={payment.id} className="rounded border border-slate-200 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{payment.vendor_name}</p>
                          <p className="text-xs text-slate-500">
                            {payment.description} • {payment.budget_line_name}
                          </p>
                          <p className="text-xs text-slate-500">Due {new Date(payment.due_date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{currency.format(Number(payment.amount ?? 0))}</p>
                          <p className="text-xs text-slate-500">{payment.status}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button variant="outline" icon={CheckCircle2} onClick={() => runAction(payment.id, 'approve')}>
                          Approve
                        </Button>
                        <Button icon={Play} onClick={() => runAction(payment.id, 'pay')}>
                          Pay
                        </Button>
                        <Button variant="outline" icon={XCircle} onClick={() => runAction(payment.id, 'cancel')}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.keys(weekBuckets).length === 0 ? (
                  <p className="py-8 text-center text-slate-500">No weekly payment buckets</p>
                ) : (
                  Object.entries(weekBuckets).map(([weekStart, entries]) => (
                    <div key={weekStart} className="rounded border border-slate-200 p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold">Week of {new Date(weekStart).toLocaleDateString()}</h3>
                        <p className="font-bold">{currency.format(entries.reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0))}</p>
                      </div>
                      <div className="space-y-2">
                        {entries.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between rounded bg-slate-50 p-2">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{payment.vendor_name}</p>
                              <p className="text-xs text-slate-500">{new Date(payment.due_date).toLocaleDateString()}</p>
                            </div>
                            <p className="font-semibold">{currency.format(Number(payment.amount ?? 0))}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
