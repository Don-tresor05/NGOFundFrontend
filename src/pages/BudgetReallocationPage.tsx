import { useEffect, useMemo, useState } from 'react';
import { AppHeader } from '../components';
import { useAppDataStore } from '../store/appDataStore';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../lib/api';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function BudgetReallocationPage() {
  const currentProfile = useAuthStore((state) => state.currentProfile);
  const budgetLines = useAppDataStore((state) => state.budgetLines) || [];
  const projects = useAppDataStore((state) => state.projects) || [];
  const grants = useAppDataStore((state) => state.grants) || [];
  
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    source_budget_line: '',
    target_budget_line: '',
    amount: '',
    reason: ''
  });

  const loadRequests = async () => {
    try {
      const data = await apiRequest<any[] | { results: any[] }>('/reallocation-requests/');
      setRequests(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const budgetLineOptions = useMemo(() => {
    return budgetLines.map(bl => {
      const grant = grants.find(g => g.grant_id === bl.grant_id);
      const project = projects.find(p => p.grant_id === grant?.grant_id);
      return {
        id: bl.budget_line_id,
        label: `${project?.name || grant?.grant_title || 'Unknown'} - ${bl.line_name} (${currency.format(bl.allocated_amount - bl.spent_amount)} available)`,
        available: bl.allocated_amount - bl.spent_amount
      };
    });
  }, [budgetLines, grants, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/reallocation-requests/', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      alert('Reallocation request submitted successfully');
      setShowForm(false);
      setFormData({ source_budget_line: '', target_budget_line: '', amount: '', reason: '' });
      loadRequests();
    } catch (err) {
      alert('Failed to submit request');
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Approve this reallocation request?')) return;
    try {
      await apiRequest(`/reallocation-requests/${id}/approve/`, { method: 'POST' });
      loadRequests();
    } catch (err) {
      alert('Failed to approve request');
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Reject this reallocation request?')) return;
    try {
      await apiRequest(`/reallocation-requests/${id}/reject/`, { method: 'POST' });
      loadRequests();
    } catch (err) {
      alert('Failed to reject request');
    }
  };

  return (
    <div className="page">
      <AppHeader title="Budget Reallocation" subtitle="Request and manage budget reallocations" />
      
      <div className="container">
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Reallocation Requests</h2>
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
              {showForm ? 'Cancel' : 'New Request'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="border-t pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">From Budget Line</label>
                <select
                  required
                  value={formData.source_budget_line}
                  onChange={(e) => setFormData({ ...formData, source_budget_line: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select source...</option>
                  {budgetLineOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">To Budget Line</label>
                <select
                  required
                  value={formData.target_budget_line}
                  onChange={(e) => setFormData({ ...formData, target_budget_line: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select target...</option>
                  {budgetLineOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Explain the reason for reallocation..."
                />
              </div>
              <button type="submit" className="btn btn-primary">Submit Request</button>
            </form>
          )}
        </div>

        <div className="card">
          {loading ? (
            <p className="text-center py-8 text-slate-500">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No reallocation requests</p>
          ) : (
            <div className="space-y-3">
              {requests.map(req => (
                <div key={req.id} className="border rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{currency.format(req.amount)}</p>
                      <p className="text-sm text-slate-600">{req.reason}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${
                      req.status === 'approved' ? 'bg-green-100 text-green-700' :
                      req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mb-3">
                    Requested {new Date(req.created_at).toLocaleDateString()}
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(req.id)} className="btn btn-sm btn-primary">
                        Approve
                      </button>
                      <button onClick={() => handleReject(req.id)} className="btn btn-sm btn-outline">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
