import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, RefreshCcw } from 'lucide-react';
import { AppHeader, Button } from '../components';
import { AreaMetricChart, PieMetricChart } from '../components/charts';
import { apiRequest } from '../lib/api';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

interface FinanceSummary {
  totals: {
    total_budget: string | number;
    total_spent: string | number;
    remaining_budget: string | number;
    total_income: string | number;
    scheduled_payments: string | number;
    overdue_payments: string | number;
    pending_requisitions: number;
    pending_expense_approvals: number;
    unmatched_statement_lines: number;
    reconciliation_exceptions: number;
  };
  project_budgets: Array<{
    project_id: number;
    project_name: string;
    grant_title: string;
    allocated: string | number;
    spent: string | number;
    remaining: string | number;
    utilization: number;
    status: string;
  }>;
  budget_alerts: Array<{
    severity: 'critical' | 'warning' | 'watch';
    budget_line_id: number;
    budget_line: string;
    grant: string;
    allocated: string | number;
    spent: string | number;
    remaining: string | number;
    utilization: number;
  }>;
  bank_accounts: Array<{
    bank_account_id: number;
    account_name: string;
    bank_name: string;
    currency: string;
    matched_lines: number;
    unmatched_lines: number;
    reconciliations: number;
    reconciliation_rate: number;
  }>;
  vendors: Array<{
    vendor_id: number;
    name: string;
    scheduled_count: number;
    paid_amount: string | number;
    outstanding_amount: string | number;
  }>;
  recent_transactions: Array<{
    id: number;
    amount: string | number;
    transaction_date: string;
    bank_reference_number: string;
    status: string;
  }>;
  upcoming_payments: Array<{
    id: number;
    vendor_name: string;
    description: string;
    amount: string | number;
    due_date: string;
    status: string;
  }>;
  forecast: {
    monthly_burn_rate: string | number;
    next_month_balance: string | number;
    three_month_balance: string | number;
    runway_months: number | null;
  };
}

const asNumber = (value: string | number | null | undefined) => Number(value ?? 0);

export function FinanceDashboardPage() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<FinanceSummary>('/finance-dashboard/');
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load finance dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const pendingApprovals = (summary?.totals.pending_requisitions ?? 0) + (summary?.totals.pending_expense_approvals ?? 0);
  const fundingRhythm = useMemo(
    () =>
      Array.from({ length: 5 }, (_, index) => {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - (4 - index));
        const label = monthDate.toLocaleString('en-US', { month: 'short' });
        const value = (summary?.recent_transactions ?? [])
          .filter((transaction) => {
            const date = new Date(`${transaction.transaction_date}T00:00:00`);
            return date.getMonth() === monthDate.getMonth() && date.getFullYear() === monthDate.getFullYear();
          })
          .reduce((sum, transaction) => sum + asNumber(transaction.amount), 0);
        return { label, value: Math.round(value / 1000) };
      }),
    [summary]
  );

  const workflowDistribution = useMemo(
    () => [
      { label: 'Approvals', value: pendingApprovals },
      { label: 'Monitoring', value: (summary?.totals.unmatched_statement_lines ?? 0) + (summary?.budget_alerts.length ?? 0) },
      { label: 'Reporting', value: (summary?.recent_transactions.length ?? 0) + (summary?.upcoming_payments.length ?? 0) },
      { label: 'Controls', value: (summary?.bank_accounts.length ?? 0) + (summary?.vendors.length ?? 0) },
    ],
    [pendingApprovals, summary]
  );

  const topProjects = useMemo(() => [...(summary?.project_budgets ?? [])].sort((a, b) => b.utilization - a.utilization).slice(0, 10), [summary]);

  return (
    <div className="page">
      <AppHeader title="Finance Dashboard" summary="Budget control, reconciliation status, vendor exposure, and payment scheduling." />

      <div className="container">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">Finance operations</p>
            <h1 className="text-2xl font-bold text-slate-900">Budget and controls overview</h1>
          </div>
          <Button variant="outline" icon={RefreshCcw} onClick={loadSummary} disabled={loading}>
            {loading ? 'Refreshing' : 'Refresh'}
          </Button>
        </div>

        {error ? (
          <div className="card mb-6 border-red-200 bg-red-50 text-red-700">{error}</div>
        ) : null}

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="card">
            <p className="text-sm text-slate-500">Total Budget</p>
            <p className="text-2xl font-bold">{currency.format(asNumber(summary?.totals.total_budget))}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Spent</p>
            <p className="text-2xl font-bold text-orange-600">{currency.format(asNumber(summary?.totals.total_spent))}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Remaining</p>
            <p className="text-2xl font-bold text-green-600">{currency.format(asNumber(summary?.totals.remaining_budget))}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Scheduled Payments</p>
            <p className="text-2xl font-bold text-blue-600">{currency.format(asNumber(summary?.totals.scheduled_payments))}</p>
          </div>
        </div>

        <div className="mb-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Budget alerts</h2>
              <Link to="/app/finance/reallocations" className="btn btn-outline btn-sm">
                Reallocate
              </Link>
            </div>
            {summary?.budget_alerts.length ? (
              <div className="space-y-3">
                {summary.budget_alerts.slice(0, 6).map((alert) => (
                  <div key={alert.budget_line_id} className="rounded border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{alert.budget_line}</p>
                        <p className="text-xs text-slate-500">{alert.grant}</p>
                      </div>
                      <span className={`rounded px-2 py-1 text-xs font-bold ${alert.severity === 'critical' ? 'bg-red-100 text-red-700' : alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                        {alert.utilization.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className={alert.severity === 'critical' ? 'h-full bg-red-500' : 'h-full bg-amber-500'} style={{ width: `${Math.min(alert.utilization, 100)}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-slate-600">
                      <span>{currency.format(asNumber(alert.spent))} spent</span>
                      <span>{currency.format(asNumber(alert.remaining))} remaining</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-slate-500">{loading ? 'Loading alerts...' : 'No active budget alerts'}</p>
            )}
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold">Controls queue</h2>
            <div className="space-y-3">
              <Link to="/app/finance/approvals" className="flex items-center justify-between rounded border border-slate-200 p-3 hover:bg-slate-50">
                <span>Pending approvals</span>
                <strong>{pendingApprovals}</strong>
              </Link>
              <Link to="/app/finance/reconciliation" className="flex items-center justify-between rounded border border-slate-200 p-3 hover:bg-slate-50">
                <span>Unmatched statement lines</span>
                <strong>{summary?.totals.unmatched_statement_lines ?? 0}</strong>
              </Link>
              <Link to="/app/finance/payments" className="flex items-center justify-between rounded border border-slate-200 p-3 hover:bg-slate-50">
                <span>Overdue payments</span>
                <strong>{currency.format(asNumber(summary?.totals.overdue_payments))}</strong>
              </Link>
              <Link to="/app/finance/controls" className="flex items-center justify-between rounded border border-slate-200 p-3 hover:bg-slate-50">
                <span>Controls and close</span>
                <strong>{(summary?.totals.reconciliation_exceptions ?? 0) > 0 ? 'Attention' : 'Ready'}</strong>
              </Link>
              {(summary?.totals.reconciliation_exceptions ?? 0) > 0 ? (
                <div className="flex items-start gap-3 rounded border border-red-200 bg-red-50 p-3 text-red-700">
                  <AlertTriangle size={18} />
                  <span>{summary?.totals.reconciliation_exceptions} reconciliation exceptions need review.</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold">Cash flow projection</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Monthly burn rate</span>
                <strong>{currency.format(asNumber(summary?.forecast.monthly_burn_rate))}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Next month balance</span>
                <strong>{currency.format(asNumber(summary?.forecast.next_month_balance))}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">3-month balance</span>
                <strong>{currency.format(asNumber(summary?.forecast.three_month_balance))}</strong>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-sm font-medium">Estimated runway</span>
                <strong>{summary?.forecast.runway_months == null ? 'No burn' : `${summary.forecast.runway_months} months`}</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold">Bank reconciliation</h2>
            <div className="space-y-3">
              {(summary?.bank_accounts ?? []).slice(0, 4).map((account) => (
                <div key={account.bank_account_id} className="rounded border border-slate-200 p-3">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-semibold">{account.account_name}</p>
                      <p className="text-xs text-slate-500">{account.bank_name} · {account.currency}</p>
                    </div>
                    <strong>{account.reconciliation_rate.toFixed(0)}%</strong>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">{account.unmatched_lines} unmatched, {account.matched_lines} matched</p>
                </div>
              ))}
              <Link to="/app/finance/reconciliation" className="btn btn-outline w-full">
                Open reconciliation
              </Link>
              <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                {summary?.totals.unmatched_statement_lines ?? 0} unmatched lines and {(summary?.totals.reconciliation_exceptions ?? 0)} exceptions are pending review.
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Project budget overview</h2>
            <Link to="/app/finance/vendors" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
              Vendor exposure <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left">Project</th>
                  <th className="p-3 text-right">Allocated</th>
                  <th className="p-3 text-right">Spent</th>
                  <th className="p-3 text-right">Remaining</th>
                  <th className="p-3 text-right">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {topProjects.map((project) => (
                  <tr key={project.project_id} className="border-b hover:bg-slate-50">
                    <td className="p-3">
                      <p className="font-medium">{project.project_name}</p>
                      <p className="text-xs text-slate-500">{project.grant_title}</p>
                    </td>
                    <td className="p-3 text-right">{currency.format(asNumber(project.allocated))}</td>
                    <td className="p-3 text-right">{currency.format(asNumber(project.spent))}</td>
                    <td className="p-3 text-right">{currency.format(asNumber(project.remaining))}</td>
                    <td className="p-3 text-right font-semibold">{project.utilization.toFixed(1)}%</td>
                  </tr>
                ))}
                {!topProjects.length ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">{loading ? 'Loading project budgets...' : 'No project budgets found'}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <AreaMetricChart title="Funding Rhythm" data={fundingRhythm} />
          <PieMetricChart
            title="Workflow Distribution"
            data={workflowDistribution.map((item, index) => ({
              ...item,
              color: ['#1f6f78', '#f59e0b', '#4caf50', '#ef4444'][index],
            }))}
          />
        </div>
      </div>
    </div>
  );
}
