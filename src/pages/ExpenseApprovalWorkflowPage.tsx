import { useEffect, useState } from 'react';
import { AppHeader } from '../components';
import { apiRequest } from '../lib/api';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function ExpenseApprovalWorkflowPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadApprovals = async () => {
    try {
      const data = await apiRequest<any[] | { results: any[] }>('/expense-approvals/');
      setApprovals(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleAdvance = async (id: number, stage: string, notes = '') => {
    try {
      const actionPath =
        stage === 'submitted'
          ? 'department-review'
          : stage === 'department_review'
            ? 'finance-review'
            : stage === 'finance_review'
              ? 'executive-review'
              : 'approve';
      await apiRequest(`/expense-approvals/${id}/${actionPath}/`, {
        method: 'POST',
        body: JSON.stringify({ notes })
      });
      loadApprovals();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update approval');
    }
  };

  const handleReject = async (id: number, decisionReason: string) => {
    try {
      await apiRequest(`/expense-approvals/${id}/reject/`, {
        method: 'POST',
        body: JSON.stringify({ decision_reason: decisionReason })
      });
      loadApprovals();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject approval');
    }
  };

  const filteredApprovals = approvals.filter(a => 
    filter === 'all' || a.stage === filter
  );

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'executive_review': return 'bg-purple-100 text-purple-700';
      case 'finance_review': return 'bg-blue-100 text-blue-700';
      case 'department_review': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const nextStageLabel = (stage: string) => {
    switch (stage) {
      case 'submitted': return 'Send to Department Review';
      case 'department_review': return 'Send to Finance Review';
      case 'finance_review': return 'Send to Executive Review';
      case 'executive_review': return 'Final Approve';
      default: return 'Approve';
    }
  };

  return (
    <div className="page">
      <AppHeader title="Expense Approvals" subtitle="Multi-level approval workflow" />
      
      <div className="container">
        <div className="card mb-6">
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('submitted')}
              className={`px-4 py-2 rounded ${filter === 'submitted' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
            >
              Submitted
            </button>
            <button 
              onClick={() => setFilter('department_review')}
              className={`px-4 py-2 rounded ${filter === 'department_review' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
            >
              Department
            </button>
            <button 
              onClick={() => setFilter('finance_review')}
              className={`px-4 py-2 rounded ${filter === 'finance_review' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
            >
              Finance
            </button>
            <button 
              onClick={() => setFilter('executive_review')}
              className={`px-4 py-2 rounded ${filter === 'executive_review' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
            >
              Executive
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="card">
              <p className="text-center py-8 text-slate-500">Loading...</p>
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="card">
              <p className="text-center py-8 text-slate-500">No approvals pending</p>
            </div>
          ) : (
            filteredApprovals.map(approval => (
              <div key={approval.id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">Requisition #{approval.requisition}</h3>
                    <p className="text-sm text-slate-600 mt-1">{approval.notes}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${getStageColor(approval.stage)}`}>
                    {approval.stage.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="text-xs text-slate-500 mb-3">
                  Requested {new Date(approval.created_at).toLocaleDateString()}
                  {approval.reviewed_at && ` • Reviewed ${new Date(approval.reviewed_at).toLocaleDateString()}`}
                </div>

                {approval.decision_reason && (
                  <div className="bg-slate-50 p-3 rounded mb-3 text-sm">
                    <p className="font-medium text-slate-700">Review Notes:</p>
                    <p className="text-slate-600">{approval.decision_reason}</p>
                  </div>
                )}

                {!['approved', 'rejected'].includes(approval.stage) && (
                  <div className="flex gap-2 pt-3 border-t">
                    <button 
                      onClick={() => {
                        const notes = prompt('Enter approval notes (optional):');
                        if (notes !== null) handleAdvance(approval.id, approval.stage, notes);
                      }}
                      className="btn btn-primary"
                    >
                      {nextStageLabel(approval.stage)}
                    </button>
                    <button 
                      onClick={() => {
                        const notes = prompt('Enter rejection reason:');
                        if (notes) handleReject(approval.id, notes);
                      }}
                      className="btn btn-outline"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
