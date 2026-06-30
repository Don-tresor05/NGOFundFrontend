import { useEffect, useState } from 'react';
import { AppHeader } from '../components';
import { apiRequest } from '../lib/api';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const asArray = <T,>(payload: T[] | { results?: T[] }) => (Array.isArray(payload) ? payload : payload.results ?? []);

interface RequisitionRow {
  id: number;
  amount: string | number;
  description: string;
  status: string;
  created_at: string;
  budget_line: number;
  submitted_by: number;
}

export function ExpenseApprovalWorkflowPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [requisitions, setRequisitions] = useState<RequisitionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const [approvalData, requisitionData] = await Promise.all([
        apiRequest<any[] | { results: any[] }>('/expense-approvals/'),
        apiRequest<RequisitionRow[] | { results: RequisitionRow[] }>('/requisitions/?status=pending'),
      ]);
      setApprovals(asArray(approvalData));
      setRequisitions(asArray(requisitionData));
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

  const handleRequisitionDecision = async (id: number, decision: 'approve' | 'reject') => {
    try {
      const body =
        decision === 'reject'
          ? JSON.stringify({ rejection_reason: prompt('Enter rejection reason:') || 'Rejected by finance review.' })
          : undefined;
      await apiRequest(`/requisitions/${id}/${decision}/`, {
        method: 'POST',
        body,
      });
      loadApprovals();
    } catch (err) {
      alert(err instanceof Error ? err.message : `Failed to ${decision} requisition`);
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
      <AppHeader title="Expense Approvals" summary="Review pending requisitions and move expense approvals through controlled stages." />
      
      <div className="container">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="card">
            <p className="text-sm text-slate-500">Pending Requisitions</p>
            <p className="text-2xl font-bold text-orange-600">{requisitions.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Open Expense Approvals</p>
            <p className="text-2xl font-bold text-blue-600">{approvals.filter((approval) => !['approved', 'rejected'].includes(approval.stage)).length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Total Controls Queue</p>
            <p className="text-2xl font-bold">{requisitions.length + approvals.filter((approval) => !['approved', 'rejected'].includes(approval.stage)).length}</p>
          </div>
        </div>

        <div className="card mb-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Pending requisitions</h2>
              <p className="text-sm text-slate-500">These are included in the dashboard pending approvals count.</p>
            </div>
          </div>
          {loading ? (
            <p className="py-8 text-center text-slate-500">Loading requisitions...</p>
          ) : requisitions.length === 0 ? (
            <p className="py-8 text-center text-slate-500">No pending requisitions</p>
          ) : (
            <div className="space-y-3">
              {requisitions.map((requisition) => (
                <div key={requisition.id} className="rounded border border-slate-200 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">Requisition #{requisition.id}</p>
                      <p className="mt-1 text-sm text-slate-600">{requisition.description}</p>
                      <p className="mt-2 text-xs text-slate-500">Submitted {new Date(requisition.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className="font-bold">{currency.format(Number(requisition.amount ?? 0))}</p>
                  </div>
                  <div className="mt-3 flex gap-2 border-t pt-3">
                    <button className="btn btn-primary" onClick={() => handleRequisitionDecision(requisition.id, 'approve')}>
                      Approve Requisition
                    </button>
                    <button className="btn btn-outline" onClick={() => handleRequisitionDecision(requisition.id, 'reject')}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card mb-6">
          <h2 className="mb-4 text-lg font-semibold">Expense approval stages</h2>
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
