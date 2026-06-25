import { useEffect, useMemo, useState } from 'react';
import { RefreshCcw, Wand2 } from 'lucide-react';
import { AppHeader, Button } from '../components';
import { apiRequest } from '../lib/api';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const asArray = <T,>(payload: T[] | { results?: T[] }) => (Array.isArray(payload) ? payload : payload.results ?? []);

interface TransactionRow {
  id: number;
  amount: string | number;
  transaction_date: string;
  bank_reference_number: string;
  status: string;
}

interface BankStatementRow {
  id: number;
  statement_number: string;
  bank_account: number;
  period_start: string;
  period_end: string;
}

interface BankStatementLineRow {
  id: number;
  bank_statement: number;
  transaction_date: string;
  description: string;
  reference_number: string;
  amount: string | number;
  matched: boolean;
}

interface ReconciliationRow {
  id: number;
  transaction: number;
  bank_statement_line: number;
  status: string;
  difference_amount: string | number;
  created_at: string;
}

export function BankReconciliationPage() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [statements, setStatements] = useState<BankStatementRow[]>([]);
  const [statementLines, setStatementLines] = useState<BankStatementLineRow[]>([]);
  const [reconciliations, setReconciliations] = useState<ReconciliationRow[]>([]);
  const [selectedStatement, setSelectedStatement] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [txns, statementsPayload, lines, recons] = await Promise.all([
        apiRequest<TransactionRow[] | { results: TransactionRow[] }>('/transactions/?status=cleared'),
        apiRequest<BankStatementRow[] | { results: BankStatementRow[] }>('/bank-statements/'),
        apiRequest<BankStatementLineRow[] | { results: BankStatementLineRow[] }>('/bank-statement-lines/?matched=false'),
        apiRequest<ReconciliationRow[] | { results: ReconciliationRow[] }>('/reconciliations/'),
      ]);
      const statementRows = asArray(statementsPayload);
      setTransactions(asArray(txns));
      setStatements(statementRows);
      setStatementLines(asArray(lines));
      setReconciliations(asArray(recons));
      setSelectedStatement((current) => current || String(statementRows[0]?.id ?? ''));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to load reconciliation data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualMatch = async (transactionId: number, lineId: number) => {
    setBusy(true);
    setMessage(null);
    try {
      const reconciliation = await apiRequest<ReconciliationRow>('/reconciliations/', {
        method: 'POST',
        body: JSON.stringify({
          transaction: transactionId,
          bank_statement_line: lineId,
          status: 'unmatched',
        }),
      });
      await apiRequest(`/reconciliations/${reconciliation.id}/match/`, { method: 'POST' });
      setMessage('Transaction matched successfully.');
      loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to match transaction.');
    } finally {
      setBusy(false);
    }
  };

  const handleAutoMatch = async () => {
    if (!selectedStatement) {
      setMessage('Select a bank statement first.');
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const result = await apiRequest<{ matched: number; created: number }>('/reconciliations/auto-match/', {
        method: 'POST',
        body: JSON.stringify({ bank_statement: Number(selectedStatement) }),
      });
      setMessage(`Auto-match completed: ${result.matched} lines matched, ${result.created} reconciliations created.`);
      loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Auto-match failed.');
    } finally {
      setBusy(false);
    }
  };

  const unmatchedCount = statementLines.length;
  const matchedCount = reconciliations.filter((row) => row.status === 'matched').length;
  const exceptionCount = reconciliations.filter((row) => row.status === 'exception').length;
  const filteredLines = useMemo(
    () => statementLines.filter((line) => !selectedStatement || String(line.bank_statement) === selectedStatement),
    [selectedStatement, statementLines]
  );

  return (
    <div className="page">
      <AppHeader title="Bank Reconciliation" summary="Auto-match bank statements, clear exceptions, and reconcile unmatched transactions." />

      <div className="container">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <select value={selectedStatement} onChange={(event) => setSelectedStatement(event.target.value)} className="form-control min-w-[260px]">
              <option value="">All statements</option>
              {statements.map((statement) => (
                <option key={statement.id} value={statement.id}>
                  {statement.statement_number} ({statement.period_start} to {statement.period_end})
                </option>
              ))}
            </select>
            <Button icon={Wand2} onClick={handleAutoMatch} disabled={busy || !selectedStatement}>
              Auto-match
            </Button>
          </div>
          <Button variant="outline" icon={RefreshCcw} onClick={loadData} disabled={loading}>
            Refresh
          </Button>
        </div>

        {message ? <div className="card mb-6 border-blue-200 bg-blue-50 text-blue-800">{message}</div> : null}

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="card">
            <p className="text-sm text-slate-500">Unmatched Lines</p>
            <p className="text-2xl font-bold text-orange-600">{unmatchedCount}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Matched</p>
            <p className="text-2xl font-bold text-green-600">{matchedCount}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Exceptions</p>
            <p className="text-2xl font-bold text-red-600">{exceptionCount}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Reconciliation Rate</p>
            <p className="text-2xl font-bold">{matchedCount + unmatchedCount > 0 ? Math.round((matchedCount / (matchedCount + unmatchedCount)) * 100) : 0}%</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold">Unmatched statement lines</h2>
            {loading ? (
              <p className="py-8 text-center text-slate-500">Loading...</p>
            ) : filteredLines.length === 0 ? (
              <p className="py-8 text-center text-slate-500">No unmatched lines for this view</p>
            ) : (
              <div className="space-y-3">
                {filteredLines.slice(0, 12).map((line) => (
                  <div key={line.id} className="rounded border border-slate-200 p-3">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{line.description}</p>
                        <p className="text-xs text-slate-500">{line.reference_number || 'No reference'}</p>
                      </div>
                      <p className="font-semibold">{currency.format(Number(line.amount))}</p>
                    </div>
                    <p className="text-xs text-slate-600">{new Date(line.transaction_date).toLocaleDateString()}</p>
                    <button
                      onClick={() => {
                        const txnId = window.prompt('Enter transaction ID to match:');
                        if (txnId) handleManualMatch(Number(txnId), line.id);
                      }}
                      className="btn btn-primary btn-sm mt-2"
                      disabled={busy}
                    >
                      Match manually
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold">Cleared transactions</h2>
            {loading ? (
              <p className="py-8 text-center text-slate-500">Loading...</p>
            ) : transactions.length === 0 ? (
              <p className="py-8 text-center text-slate-500">No cleared transactions waiting for reconciliation</p>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 12).map((txn) => (
                  <div key={txn.id} className="rounded border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">Transaction #{txn.id}</p>
                        <p className="text-xs text-slate-500">{txn.bank_reference_number}</p>
                      </div>
                      <p className="font-semibold">{currency.format(Number(txn.amount))}</p>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">{new Date(txn.transaction_date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card mt-6">
          <h2 className="mb-4 text-lg font-semibold">Recent reconciliations</h2>
          {reconciliations.length === 0 ? (
            <p className="py-8 text-center text-slate-500">No reconciliations yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">Transaction</th>
                    <th className="p-3 text-left">Statement Line</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-right">Difference</th>
                    <th className="p-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reconciliations.slice(0, 20).map((recon) => (
                    <tr key={recon.id} className="border-b hover:bg-slate-50">
                      <td className="p-3">#{recon.transaction}</td>
                      <td className="p-3">#{recon.bank_statement_line}</td>
                      <td className="p-3">
                        <span className={`rounded px-2 py-1 text-xs ${recon.status === 'matched' ? 'bg-green-100 text-green-700' : recon.status === 'exception' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {recon.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">{currency.format(Number(recon.difference_amount))}</td>
                      <td className="p-3">{new Date(recon.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
