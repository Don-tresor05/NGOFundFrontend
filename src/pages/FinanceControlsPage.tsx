import { useEffect, useState, type FormEvent } from 'react';
import { RefreshCcw, ShieldAlert, Layers3, CalendarClock, Save } from 'lucide-react';
import { AppHeader, Button } from '../components';
import { apiList, apiRequest } from '../lib/api';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const fieldClass = 'w-full rounded border border-slate-300 px-3 py-2';

interface SpendingAlert {
  id: number;
  budget_line_name: string;
  severity: 'watch' | 'warning' | 'critical';
  status: 'open' | 'acknowledged' | 'resolved';
  message: string;
  threshold_percent: string | number;
}

interface PaymentBatch {
  id: number;
  name: string;
  status: string;
  scheduled_for: string | null;
  scheduled_payment_count: number;
  total_amount: string | number;
}

interface PeriodClose {
  id: number;
  bank_account_name: string | null;
  period_start: string;
  period_end: string;
  status: string;
  unmatched_statement_lines: number;
  reconciliation_exceptions: number;
}

export function FinanceControlsPage() {
  const [alerts, setAlerts] = useState<SpendingAlert[]>([]);
  const [batches, setBatches] = useState<PaymentBatch[]>([]);
  const [periodCloses, setPeriodCloses] = useState<PeriodClose[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [batchName, setBatchName] = useState('');
  const [closeForm, setCloseForm] = useState({ period_start: '', period_end: '', bank_account: '' });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [alertRows, batchRows, closeRows] = await Promise.all([
        apiList<SpendingAlert>('/spending-alerts/'),
        apiList<PaymentBatch>('/payment-batches/'),
        apiList<PeriodClose>('/period-closes/'),
      ]);
      setAlerts(alertRows);
      setBatches(batchRows);
      setPeriodCloses(closeRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load finance controls.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const generateAlerts = async () => {
    await apiRequest('/spending-alerts/generate/', { method: 'POST' });
    await load();
  };

  const createBatch = async (event: FormEvent) => {
    event.preventDefault();
    await apiRequest('/payment-batches/', {
      method: 'POST',
      body: JSON.stringify({ name: batchName }),
    });
    setBatchName('');
    await load();
  };

  const createClose = async (event: FormEvent) => {
    event.preventDefault();
    await apiRequest('/period-closes/', {
      method: 'POST',
      body: JSON.stringify({
        period_start: closeForm.period_start,
        period_end: closeForm.period_end,
        bank_account: closeForm.bank_account ? Number(closeForm.bank_account) : null,
      }),
    });
    setCloseForm({ period_start: '', period_end: '', bank_account: '' });
    await load();
  };

  const runBatch = async (id: number) => {
    await apiRequest(`/payment-batches/${id}/process/`, { method: 'POST' });
    await load();
  };

  const prepareClose = async (id: number) => {
    await apiRequest(`/period-closes/${id}/prepare/`, { method: 'POST' });
    await load();
  };

  const closePeriod = async (id: number) => {
    await apiRequest(`/period-closes/${id}/close/`, { method: 'POST' });
    await load();
  };

  return (
    <div className="page">
      <AppHeader title="Finance Controls" summary="Spending alerts, payment batches, and period-end close workflow." />
      <div className="container">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">Finance operations</p>
            <h1 className="text-2xl font-bold text-slate-900">Controls and closing</h1>
          </div>
          <Button variant="outline" icon={RefreshCcw} onClick={load} disabled={loading}>
            {loading ? 'Refreshing' : 'Refresh'}
          </Button>
        </div>

        {error ? <div className="card mb-6 border-red-200 bg-red-50 text-red-700">{error}</div> : null}

        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          <div className="card">
            <div className="mb-3 flex items-center gap-2">
              <ShieldAlert size={18} />
              <h2 className="text-lg font-semibold">Spending alerts</h2>
            </div>
            <Button icon={ShieldAlert} onClick={generateAlerts}>Generate alerts</Button>
            <div className="mt-4 space-y-2">
              {alerts.length === 0 ? <p className="text-sm text-slate-500">No alerts</p> : alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="rounded border border-slate-200 p-2 text-sm">
                  <p className="font-medium">{alert.budget_line_name}</p>
                  <p className="text-xs text-slate-500">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

          <form className="card space-y-3" onSubmit={createBatch}>
            <div className="mb-1 flex items-center gap-2">
              <Layers3 size={18} />
              <h2 className="text-lg font-semibold">Payment batch</h2>
            </div>
            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Batch name</span>
              <input className={fieldClass} value={batchName} onChange={(e) => setBatchName(e.target.value)} required />
            </label>
            <Button type="submit" icon={Save}>Create batch</Button>
          </form>

          <form className="card space-y-3" onSubmit={createClose}>
            <div className="mb-1 flex items-center gap-2">
              <CalendarClock size={18} />
              <h2 className="text-lg font-semibold">Period close</h2>
            </div>
            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Period start</span>
              <input className={fieldClass} type="date" value={closeForm.period_start} onChange={(e) => setCloseForm((prev) => ({ ...prev, period_start: e.target.value }))} required />
            </label>
            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Period end</span>
              <input className={fieldClass} type="date" value={closeForm.period_end} onChange={(e) => setCloseForm((prev) => ({ ...prev, period_end: e.target.value }))} required />
            </label>
            <Button type="submit" icon={Save}>Create close</Button>
          </form>
        </div>

        <div className="mb-6 card">
          <h2 className="mb-4 text-lg font-semibold">Payment batches</h2>
          <div className="space-y-3">
            {batches.length === 0 ? <p className="py-6 text-center text-slate-500">No batches</p> : batches.map((batch) => (
              <div key={batch.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 p-3">
                <div>
                  <p className="font-medium">{batch.name}</p>
                  <p className="text-xs text-slate-500">{batch.scheduled_payment_count} payments • {currency.format(Number(batch.total_amount ?? 0))}</p>
                </div>
                <Button variant="outline" onClick={() => runBatch(batch.id)}>Process</Button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Period closes</h2>
          <div className="space-y-3">
            {periodCloses.length === 0 ? <p className="py-6 text-center text-slate-500">No period closes</p> : periodCloses.map((close) => (
              <div key={close.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 p-3">
                <div>
                  <p className="font-medium">{close.bank_account_name || 'All accounts'}</p>
                  <p className="text-xs text-slate-500">{new Date(close.period_start).toLocaleDateString()} - {new Date(close.period_end).toLocaleDateString()} • {close.status}</p>
                  <p className="text-xs text-slate-500">{close.unmatched_statement_lines} unmatched lines • {close.reconciliation_exceptions} exceptions</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => prepareClose(close.id)}>Prepare</Button>
                  <Button onClick={() => closePeriod(close.id)}>Close</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
