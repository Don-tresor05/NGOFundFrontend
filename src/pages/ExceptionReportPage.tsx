import { useEffect, useState } from 'react';
import { AlertTriangle, DollarSign, Flag, TrendingUp, Eye, ShieldAlert } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { apiRequest } from '../lib/api';

interface Exception {
  id: string;
  type: 'POLICY_VIOLATION' | 'UNUSUAL_TRANSACTION' | 'FLAGGED_ACTIVITY';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  entity_type: string;
  entity_id: number;
  amount?: number;
  timestamp: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  assigned_to?: string;
}

export default function ExceptionReportPage() {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [filteredExceptions, setFilteredExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedException, setSelectedException] = useState<Exception | null>(null);

  useEffect(() => {
    fetchExceptions();
  }, []);

  useEffect(() => {
    filterExceptions();
  }, [exceptions, typeFilter, severityFilter, statusFilter]);

  const fetchExceptions = async () => {
    try {
      // Fetch transactions and analyze for exceptions
      const [transactions, budgetLines] = await Promise.all([
        apiRequest('/transactions/'),
        apiRequest('/budget-lines/')
      ]);

      const transData = Array.isArray(transactions) ? transactions : transactions.results || [];
      const budgetData = Array.isArray(budgetLines) ? budgetLines : budgetLines.results || [];

      const exceptionList: Exception[] = [];

      // Detect unusual transactions (amount > 10000)
      transData.forEach((t: any) => {
        const amount = parseFloat(t.amount || 0);
        if (amount > 10000) {
          exceptionList.push({
            id: `trans-${t.id}`,
            type: 'UNUSUAL_TRANSACTION',
            severity: amount > 50000 ? 'HIGH' : 'MEDIUM',
            title: `Large transaction: $${amount.toLocaleString()}`,
            description: `Needs review`,
            entity_type: 'TRANSACTION',
            entity_id: t.id,
            amount: amount,
            timestamp: t.transaction_date || t.created_at,
            status: 'OPEN',
            assigned_to: 'Finance Team'
          });
        }
      });

      // Detect policy violations (budget exceeded)
      budgetData.forEach((b: any) => {
        const allocated = parseFloat(b.allocated_amount || 0);
        const spent = parseFloat(b.spent_amount || 0);
        if (spent > allocated) {
          exceptionList.push({
            id: `budget-${b.id}`,
            type: 'POLICY_VIOLATION',
            severity: 'HIGH',
            title: `Over budget: ${b.category}`,
            description: `$${spent.toLocaleString()} spent, $${allocated.toLocaleString()} allowed`,
            entity_type: 'BUDGET',
            entity_id: b.id,
            amount: spent - allocated,
            timestamp: new Date().toISOString(),
            status: 'OPEN',
            assigned_to: 'Project Manager'
          });
        }
      });

      // Add mock flagged activities
      if (exceptionList.length === 0) {
        exceptionList.push({
          id: 'mock-1',
          type: 'FLAGGED_ACTIVITY',
          severity: 'LOW',
          title: 'Multiple login attempts',
          description: 'User attempted login 5 times in 10 minutes',
          entity_type: 'USER',
          entity_id: 1,
          timestamp: new Date().toISOString(),
          status: 'INVESTIGATING',
          assigned_to: 'Security Team'
        });
      }

      setExceptions(exceptionList);
    } catch (error) {
      console.error('Error fetching exceptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExceptions = () => {
    let result = [...exceptions];
    if (typeFilter !== 'ALL') result = result.filter(e => e.type === typeFilter);
    if (severityFilter !== 'ALL') result = result.filter(e => e.severity === severityFilter);
    if (statusFilter !== 'ALL') result = result.filter(e => e.status === statusFilter);
    setFilteredExceptions(result);
  };

  const updateStatus = (id: string, status: string) => {
    setExceptions(exceptions.map(e => e.id === id ? { ...e, status: status as any } : e));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'POLICY_VIOLATION': return <AlertTriangle className="text-red-500" size={24} />;
      case 'UNUSUAL_TRANSACTION': return <DollarSign className="text-yellow-500" size={24} />;
      case 'FLAGGED_ACTIVITY': return <Flag className="text-orange-500" size={24} />;
      default: return <AlertTriangle className="text-gray-500" size={24} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800';
      case 'INVESTIGATING': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: exceptions.length,
    high: exceptions.filter(e => e.severity === 'HIGH').length,
    open: exceptions.filter(e => e.status === 'OPEN').length,
    resolved: exceptions.filter(e => e.status === 'RESOLVED').length
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Exception Reports</h1>
        <p className="text-gray-600 mt-1">Track violations and unusual activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard label="Total Exceptions" value={String(stats.total)} trend="All exceptions tracked" trendDirection="neutral" icon={ShieldAlert} />
        <StatCard label="High Severity" value={String(stats.high)} trend="Critical issues" trendDirection="down" icon={AlertTriangle} />
        <StatCard label="Open" value={String(stats.open)} trend="Needs attention" trendDirection="down" icon={Flag} />
        <StatCard label="Resolved" value={String(stats.resolved)} trend="Closed issues" trendDirection="up" icon={Eye} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option key="ALL" value="ALL">All Types</option>
            <option key="POLICY_VIOLATION" value="POLICY_VIOLATION">Policy Violations</option>
            <option key="UNUSUAL_TRANSACTION" value="UNUSUAL_TRANSACTION">Unusual Transactions</option>
            <option key="FLAGGED_ACTIVITY" value="FLAGGED_ACTIVITY">Flagged Activities</option>
          </select>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option key="ALL" value="ALL">All Severity</option>
            <option key="HIGH" value="HIGH">High</option>
            <option key="MEDIUM" value="MEDIUM">Medium</option>
            <option key="LOW" value="LOW">Low</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option key="ALL" value="ALL">All Status</option>
            <option key="OPEN" value="OPEN">Open</option>
            <option key="INVESTIGATING" value="INVESTIGATING">Investigating</option>
            <option key="RESOLVED" value="RESOLVED">Resolved</option>
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            {filteredExceptions.length} exceptions shown
          </div>
        </div>
      </div>

      {/* Exception List */}
      <div className="space-y-4">
        {filteredExceptions.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <TrendingUp className="mx-auto text-green-500 mb-2" size={48} />
            <p className="text-green-800 font-medium">No exceptions found - All systems normal!</p>
          </div>
        ) : (
          filteredExceptions.map((exception) => (
            <div key={exception.id} className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${getSeverityColor(exception.severity)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">{getTypeIcon(exception.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{exception.title}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(exception.severity)}`}>
                        {exception.severity}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(exception.status)}`}>
                        {exception.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{exception.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div>{exception.type.replace(/_/g, ' ')}</div>
                      <div>{exception.entity_type} #{exception.entity_id}</div>
                      {exception.amount && <div>${exception.amount.toLocaleString()}</div>}
                      <div>{exception.assigned_to || 'Unassigned'}</div>
                      <div>{new Date(exception.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedException(exception)}
                    className="text-blue-600 hover:text-blue-800 p-2"
                  >
                    <Eye size={18} />
                  </button>
                  <select
                    value={exception.status}
                    onChange={(e) => updateStatus(exception.id, e.target.value)}
                    className="px-3 py-1 border rounded-lg text-sm"
                  >
                    <option key="OPEN" value="OPEN">Open</option>
                    <option key="INVESTIGATING" value="INVESTIGATING">Investigating</option>
                    <option key="RESOLVED" value="RESOLVED">Resolved</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedException && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Exception Details</h2>
              <button onClick={() => setSelectedException(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Title</label>
                <p className="text-gray-900">{selectedException.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{selectedException.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="text-gray-900">{selectedException.type.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Severity</label>
                  <p className="text-gray-900">{selectedException.severity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-gray-900">{selectedException.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned To</label>
                  <p className="text-gray-900">{selectedException.assigned_to || 'Unassigned'}</p>
                </div>
              </div>
              {selectedException.amount && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-gray-900 text-2xl font-bold">${selectedException.amount.toLocaleString()}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Timestamp</label>
                <p className="text-gray-900">{new Date(selectedException.timestamp).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setSelectedException(null)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
