import { useEffect, useMemo, useState, type FormEvent } from 'react';
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

interface BankAccountRow {
  id: number;
  account_name: string;
  bank_name: string;
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

const emptyImportForm = {
  bank_account: '',
  statement_number: '',
  period_start: '',
  period_end: '',
  opening_balance: '',
  closing_balance: '',
  csv_lines: '',
};

const parseStatementLines = (rawLines: string) => {
  return rawLines
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split(',').map((part) => part.trim());
      if (parts.length < 3) {
        throw new Error(`Line ${index + 1} must use date, description, optional reference, amount.`);
      }

      const hasReference = parts.length >= 4;
      const amount = parts[parts.length - 1];
      const parsedAmount = Number(amount);
      if (!Number.isFinite(parsedAmount)) {
        throw new Error(`Line ${index + 1} has an invalid amount.`);
      }

      return {
        transaction_date: parts[0],
        description: parts.slice(1, hasReference ? -2 : -1).join(', ') || 'Bank statement line',
        reference_number: hasReference ? parts[parts.length - 2] : '',
        amount: parsedAmount,
      };
    });
};

export function BankReconciliationPage() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountRow[]>([]);
  const [statements, setStatements] = useState<BankStatementRow[]>([]);
  const [statementLines, setStatementLines] = useState<BankStatementLineRow[]>([]);
  const [reconciliations, setReconciliations] = useState<ReconciliationRow[]>([]);
  const [selectedStatement, setSelectedStatement] = useState('');
  const [importForm, setImportForm] = useState(emptyImportForm);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async (clearMessage = true) => {
    setLoading(true);
    if (clearMessage) {
      setMessage(null);
    }
    try {
      const [accountsPayload, txns, statementsPayload, lines, recons] = await Promise.all([
        apiRequest<BankAccountRow[] | { results: BankAccountRow[] }>('/bank-accounts/'),
        apiRequest<TransactionRow[] | { results: TransactionRow[] }>('/transactions/?status=cleared'),
        apiRequest<BankStatementRow[] | { results: BankStatementRow[] }>('/bank-statements/'),
        apiRequest<BankStatementLineRow[] | { results: BankStatementLineRow[] }>('/bank-statement-lines/'),
        apiRequest<ReconciliationRow[] | { results: ReconciliationRow[] }>('/reconciliations/'),
      ]);
      const statementRows = asArray(statementsPayload);
      setBankAccounts(asArray(accountsPayload));
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

  const handleImportStatement = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const lines = parseStatementLines(importForm.csv_lines);
      if (!lines.length) {
        throw new Error('Add at least one statement line.');
      }

      const statement = await apiRequest<BankStatementRow>('/bank-statements/', {
        method: 'POST',
        body: JSON.stringify({
          bank_account: Number(importForm.bank_account),
          statement_number: importForm.statement_number,
          period_start: importForm.period_start,
          period_end: importForm.period_end,
          opening_balance: importForm.opening_balance || 0,
          closing_balance: importForm.closing_balance || 0,
        }),
      });

      await apiRequest(`/bank-statements/${statement.id}/import-lines/`, {
        method: 'POST',
        body: JSON.stringify({
          statement_number: importForm.statement_number,
          period_start: importForm.period_start,
          period_end: importForm.period_end,
          opening_balance: importForm.opening_balance || 0,
          closing_balance: importForm.closing_balance || 0,
          lines,
        }),
      });

      setImportForm(emptyImportForm);
      setMessage('Bank statement imported. Run Auto-match to create reconciliation records.');
      await loadData(false);
      setSelectedStatement(String(statement.id));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to import bank statement.');
    } finally {
      setBusy(false);
    }
  };

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
      await loadData(false);
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
      await loadData(false);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Auto-match failed.');
    } finally {
      setBusy(false);
    }
  };

  const filteredStatementLines = useMemo(
    () => statementLines.filter((line) => !selectedStatement || String(line.bank_statement) === selectedStatement),
    [selectedStatement, statementLines]
  );
  const filteredLineIds = useMemo(() => new Set(filteredStatementLines.map((line) => line.id)), [filteredStatementLines]);
  const filteredLines = useMemo(
    () => filteredStatementLines.filter((line) => !line.matched),
    [filteredStatementLines]
  );
  const filteredReconciliations = useMemo(
    () => reconciliations.filter((row) => !selectedStatement || filteredLineIds.has(row.bank_statement_line)),
    [filteredLineIds, reconciliations, selectedStatement]
  );
  const importedCount = filteredStatementLines.length;
  const unmatchedCount = filteredLines.length;
  const matchedCount = filteredReconciliations.filter((row) => row.status === 'matched').length;
  const exceptionCount = filteredReconciliations.filter((row) => row.status === 'exception').length;
  const reconciliationRate = importedCount > 0 ? Math.round((matchedCount / importedCount) * 100) : 0;

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
          <Button variant="outline" icon={RefreshCcw} onClick={() => loadData()} disabled={loading}>
            Refresh
          </Button>
        </div>

        {message ? <div className="card mb-6 border-blue-200 bg-blue-50 text-blue-800">{message}</div> : null}

        <div className="mb-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <div className="card">
            <p className="text-sm text-slate-500">Cleared Txns</p>
            <p className="text-2xl font-bold text-slate-900">{transactions.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Imported Lines</p>
            <p className="text-2xl font-bold text-slate-900">{importedCount}</p>
          </div>
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
            <p className="text-2xl font-bold">{reconciliationRate}%</p>
          </div>
        </div>

        <form onSubmit={handleImportStatement} className="card mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Import bank statement</h2>
            <p className="text-sm text-slate-500">Paste CSV-style lines: date, description, reference, amount. References must match ledger bank references for Auto-match.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Bank Account</span>
              <select className="form-control" value={importForm.bank_account} onChange={(event) => setImportForm((prev) => ({ ...prev, bank_account: event.target.value }))} required>
                <option value="">Select account</option>
                {bankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_name} ({account.bank_name})
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Statement Number</span>
              <input className="form-control" value={importForm.statement_number} onChange={(event) => setImportForm((prev) => ({ ...prev, statement_number: event.target.value }))} required />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Period Start</span>
              <input type="date" className="form-control" value={importForm.period_start} onChange={(event) => setImportForm((prev) => ({ ...prev, period_start: event.target.value }))} required />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Period End</span>
              <input type="date" className="form-control" value={importForm.period_end} onChange={(event) => setImportForm((prev) => ({ ...prev, period_end: event.target.value }))} required />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Opening Balance</span>
              <input type="number" className="form-control" value={importForm.opening_balance} onChange={(event) => setImportForm((prev) => ({ ...prev, opening_balance: event.target.value }))} required />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Closing Balance</span>
              <input type="number" className="form-control" value={importForm.closing_balance} onChange={(event) => setImportForm((prev) => ({ ...prev, closing_balance: event.target.value }))} required />
            </label>
          </div>
          <label className="mt-4 block space-y-1">
            <span className="text-sm font-medium text-slate-700">Statement Lines</span>
            <textarea
              className="form-control min-h-[120px]"
              value={importForm.csv_lines}
              onChange={(event) => setImportForm((prev) => ({ ...prev, csv_lines: event.target.value }))}
              placeholder="2026-06-21, Stripe donation, pi_3TkpypJjDFiTxf7G07IyDT5A, 25"
              required
            />
          </label>
          <div className="mt-4 flex justify-end">
            <Button type="submit" disabled={busy || bankAccounts.length === 0}>
              Import Statement
            </Button>
          </div>
        </form>

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
          {filteredReconciliations.length === 0 ? (
            <p className="py-8 text-center text-slate-500">No reconciliation records yet. Import statement lines, then run Auto-match or match a line manually.</p>
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
                  {filteredReconciliations.slice(0, 20).map((recon) => (
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
