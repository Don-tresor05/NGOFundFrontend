import { FormEvent, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Bug, Check, ClipboardCheck, Eye, Plus, RefreshCcw } from 'lucide-react';
import { AppHeader, Button, DataTable, StatCard, StatusBadge } from '../components';
import { DataEntryForm } from '../components/forms/DataEntryForm';
import { AreaMetricChart, BarMetricChart, PieMetricChart } from '../components/charts';
import { ACTORS, USE_CASES } from '../constants/appModel';
import { roleLabels, useAppDataStore } from '../store/appDataStore';
import { useAuthStore } from '../store/authStore';
import { Actor, DashboardStat, Role, UseCaseId } from '../types';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const actorToRole: Record<Actor, Role> = {
  super_administrator: 'SUPER_ADMIN',
  finance_officer: 'FINANCE_OFFICER',
  field_staff: 'FIELD_STAFF',
  project_manager: 'PROJECT_MANAGER',
  executive_director: 'EXECUTIVE_DIRECTOR',
  external_auditor: 'EXTERNAL_AUDITOR',
  donor_user: 'DONOR_USER',
};

export function UseCasePage() {
  const { useCaseId } = useParams<{ useCaseId: UseCaseId }>();
  const currentProfile = useAuthStore((state) => state.currentProfile);
  const store = useAppDataStore();

  const useCase = USE_CASES.find((entry) => entry.id === useCaseId);

  if (!currentProfile || !useCase) {
    return <Navigate to="/app/dashboard" replace />;
  }

  if (!useCase.actors.includes(currentProfile.actor)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const actor = ACTORS.find((entry) => entry.id === currentProfile.actor);
  const currentUserId = store.users.find((user) => user.email === currentProfile.email)?.user_id ?? 1;
  const userName = (id: number) => store.users.find((user) => user.user_id === id)?.full_name ?? 'Unknown User';
  const budgetLineName = (id: number) => store.budgetLines.find((line) => line.budget_line_id === id)?.line_name ?? 'Unmapped Budget';
  const grantTitle = (id: number) => store.grants.find((grant) => grant.grant_id === id)?.grant_title ?? 'Unmapped Grant';
  const firstBudgetLine = store.budgetLines[0];
  const firstGrant = store.grants[0];

  const commonStats: DashboardStat[] = [
    { label: 'Responsible Actor', value: actor?.shortLabel ?? 'Actor', trend: 'Directly mapped from diagram', trendDirection: 'up' },
    { label: 'Mock Workflow State', value: 'Live', trend: 'Interactive local-state prototype', trendDirection: 'neutral' },
    { label: 'Access Policy', value: 'Exact', trend: 'Use-case permissions enforced', trendDirection: 'up' },
  ];

  const [userForm, setUserForm] = useState({ name: '', email: '', actor: 'field_staff' });
  const [settingDrafts, setSettingDrafts] = useState<Record<string, string>>({});
  const [donorForm, setDonorForm] = useState({ name: '', email: '', type: 'individual' });
  const [receiptForm, setReceiptForm] = useState({ donorName: '', project: '', amount: '0', receivedOn: '2026-05-25' });
  const [allocationForm, setAllocationForm] = useState({ project: '', amount: '0' });
  const [reportForm, setReportForm] = useState({ name: '', period: '' });
  const [auditForm, setAuditForm] = useState({ action: '', source: '' });
  const [claimForm, setClaimForm] = useState({ category: '', amount: '0' });
  const [requirementForm, setRequirementForm] = useState({ interviewee: '', process: '', feedback: '' });
  const [testingForm, setTestingForm] = useState({ testCase: '', environment: 'Staging', feedback: '' });

  const content = useMemo(() => {
    switch (useCase.id) {
      case 'manage-user-accounts':
        return (
          <>
            <section className="grid gap-6 md:grid-cols-3">
              {commonStats.map((stat, index) => (
                <StatCard key={stat.label} {...stat} icon={[Plus, Eye, Check][index]} />
              ))}
            </section>
            <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <DataEntryForm
                title="Invite or create a system user"
                description="Add a new actor account into the platform governance register."
                onSubmit={(event: FormEvent<HTMLFormElement>) => {
                  event.preventDefault();
                  store.createUser({
                    full_name: userForm.name,
                    email: userForm.email,
                    password: 'demo123',
                    role: actorToRole[userForm.actor as Actor],
                  });
                  setUserForm({ name: '', email: '', actor: 'field_staff' });
                }}
                actions={<Button type="submit">Create Account</Button>}
              >
                <label className="form-group">
                  <span className="form-label">Full Name</span>
                  <input className="form-control" value={userForm.name} onChange={(event) => setUserForm((state) => ({ ...state, name: event.target.value }))} />
                </label>
                <label className="form-group">
                  <span className="form-label">Email</span>
                  <input className="form-control" value={userForm.email} onChange={(event) => setUserForm((state) => ({ ...state, email: event.target.value }))} />
                </label>
                <label className="form-group">
                  <span className="form-label">Actor</span>
                  <select className="form-control" value={userForm.actor} onChange={(event) => setUserForm((state) => ({ ...state, actor: event.target.value }))}>
                    {ACTORS.map((entry) => (
                      <option key={entry.id} value={entry.id}>{entry.label}</option>
                    ))}
                  </select>
                </label>
              </DataEntryForm>
              <div className="panel-card">
                <h3 className="text-xl font-bold text-slate-900">Current user roster</h3>
                <div className="mt-6">
                  <DataTable
                    rows={store.users}
                    columns={[
                      { key: 'name', header: 'Name', render: (row) => row.full_name },
                      { key: 'email', header: 'Email', render: (row) => row.email },
                      { key: 'role', header: 'Role', render: (row) => roleLabels[row.role] },
                      { key: 'status', header: 'Status', render: (row) => <StatusBadge label={row.is_active ? 'active' : 'inactive'} /> },
                      { key: 'created', header: 'Created At', render: (row) => row.created_at },
                    ]}
                  />
                </div>
              </div>
            </section>
          </>
        );

      case 'manage-system-settings':
        return (
          <>
            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="panel-card">
                <h3 className="text-xl font-bold text-slate-900">Operational settings</h3>
                <div className="mt-6 space-y-4">
                  {store.systemSettings.map((setting) => (
                    <div key={setting.key} className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-900">{setting.label}</div>
                          <div className="text-sm text-slate-500">{setting.group}</div>
                        </div>
                        <input
                          className="form-control max-w-xs"
                          value={settingDrafts[setting.key] ?? setting.value}
                          onChange={(event) =>
                            setSettingDrafts((state) => ({ ...state, [setting.key]: event.target.value }))
                          }
                        />
                      </div>
                      <div className="mt-4">
                        <Button onClick={() => store.updateSetting(setting.key, settingDrafts[setting.key] ?? setting.value)}>
                          Save Setting
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <PieMetricChart
                title="Settings Balance"
                data={[
                  { label: 'Access', value: 35, color: '#f59e0b' },
                  { label: 'Finance', value: 40, color: '#1f6f78' },
                  { label: 'Notifications', value: 25, color: '#4caf50' },
                ]}
              />
            </section>
          </>
        );

      case 'view-event-logs':
        return (
          <>
            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="panel-card">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-slate-900">System event stream</h3>
                  <Button variant="outline" icon={RefreshCcw}>Refresh Feed</Button>
                </div>
                <div className="mt-6">
                  <DataTable
                    rows={store.auditLogs}
                    columns={[
                      { key: 'time', header: 'Timestamp', render: (row) => row.timestamp },
                      { key: 'event', header: 'Action Type', render: (row) => row.action_type },
                      { key: 'actor', header: 'User', render: (row) => userName(row.user_id) },
                      { key: 'target', header: 'Target Entity', render: (row) => row.target_entity_type },
                    ]}
                  />
                </div>
              </div>
              <BarMetricChart
                title="Severity Mix"
                data={[
                  { label: 'Info', value: 12 },
                  { label: 'Warning', value: 7 },
                  { label: 'Critical', value: 3 },
                ]}
              />
            </section>
          </>
        );

      case 'view-analytical-dashboard':
        return (
          <>
            <section className="grid gap-6 xl:grid-cols-2">
              <AreaMetricChart
                title="Cross-Program Contribution Trend"
                data={[
                  { label: 'Jan', value: 21 },
                  { label: 'Feb', value: 26 },
                  { label: 'Mar', value: 33 },
                  { label: 'Apr', value: 29 },
                  { label: 'May', value: 37 },
                ]}
              />
              <PieMetricChart
                title="Portfolio Performance"
                data={[
                  { label: 'On Track', value: 58, color: '#4caf50' },
                  { label: 'Watch List', value: 27, color: '#f59e0b' },
                  { label: 'Escalated', value: 15, color: '#ef4444' },
                ]}
              />
            </section>
          </>
        );

      case 'register-new-donor':
        return (
          <>
            <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <DataEntryForm
                title="Register donor record"
                description="Capture the minimum donor data required by finance operations."
                onSubmit={(event) => {
                  event.preventDefault();
                  store.createDonor({
                    organization_name: donorForm.name,
                    contact_person: donorForm.name,
                    contact_email: donorForm.email,
                    country: 'Rwanda',
                    category: donorForm.type,
                  });
                  setDonorForm({ name: '', email: '', type: 'individual' });
                }}
                actions={<Button type="submit">Register New Donor</Button>}
              >
                <label className="form-group">
                  <span className="form-label">Donor Name</span>
                  <input className="form-control" value={donorForm.name} onChange={(event) => setDonorForm((state) => ({ ...state, name: event.target.value }))} />
                </label>
                <label className="form-group">
                  <span className="form-label">Email</span>
                  <input className="form-control" value={donorForm.email} onChange={(event) => setDonorForm((state) => ({ ...state, email: event.target.value }))} />
                </label>
                <label className="form-group">
                  <span className="form-label">Type</span>
                  <select className="form-control" value={donorForm.type} onChange={(event) => setDonorForm((state) => ({ ...state, type: event.target.value }))}>
                    <option value="individual">Individual</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </label>
              </DataEntryForm>
              <div className="panel-card">
                <h3 className="text-xl font-bold text-slate-900">Donor register</h3>
                <div className="mt-6">
                  <DataTable
                    rows={store.donors}
                    columns={[
                      { key: 'name', header: 'Organization', render: (row) => row.organization_name },
                      { key: 'contact', header: 'Contact Person', render: (row) => row.contact_person },
                      { key: 'email', header: 'Email', render: (row) => row.contact_email },
                      { key: 'category', header: 'Category', render: (row) => row.category },
                      { key: 'status', header: 'Status', render: (row) => <StatusBadge label={row.status} /> },
                    ]}
                  />
                </div>
              </div>
            </section>
          </>
        );

      case 'record-fund-receipt':
        return (
          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <DataEntryForm
              title="Post incoming funds"
              description="Record a receipt against a donor and target project."
              onSubmit={(event) => {
                event.preventDefault();
                const budgetLine = store.budgetLines.find((line) => line.line_name === receiptForm.project) ?? firstBudgetLine;
                store.recordTransaction({
                  requisition_id: store.requisitions[0]?.requisition_id ?? 1,
                  budget_line_id: budgetLine.budget_line_id,
                  processed_by_user_id: currentUserId,
                  amount: Number(receiptForm.amount),
                  transaction_date: receiptForm.receivedOn,
                  bank_reference_number: `BNK-${Date.now().toString().slice(-5)}`,
                });
                setReceiptForm({ donorName: '', project: '', amount: '0', receivedOn: '2026-05-25' });
              }}
              actions={<Button type="submit">Record Fund Receipt</Button>}
            >
              <label className="form-group">
                <span className="form-label">Donor Name</span>
                <input className="form-control" value={receiptForm.donorName} onChange={(event) => setReceiptForm((state) => ({ ...state, donorName: event.target.value }))} />
              </label>
              <label className="form-group">
                <span className="form-label">Project</span>
                <input className="form-control" value={receiptForm.project} onChange={(event) => setReceiptForm((state) => ({ ...state, project: event.target.value }))} />
              </label>
              <label className="form-group">
                <span className="form-label">Amount</span>
                <input className="form-control" type="number" value={receiptForm.amount} onChange={(event) => setReceiptForm((state) => ({ ...state, amount: event.target.value }))} />
              </label>
              <label className="form-group">
                <span className="form-label">Received On</span>
                <input className="form-control" type="date" value={receiptForm.receivedOn} onChange={(event) => setReceiptForm((state) => ({ ...state, receivedOn: event.target.value }))} />
              </label>
            </DataEntryForm>
            <div className="panel-card">
              <h3 className="text-xl font-bold text-slate-900">Receipt ledger</h3>
              <div className="mt-6">
                <DataTable
                  rows={store.transactions}
                  columns={[
                    { key: 'id', header: 'Transaction ID', render: (row) => row.transaction_id },
                    { key: 'project', header: 'Budget Line', render: (row) => budgetLineName(row.budget_line_id) },
                    { key: 'amount', header: 'Amount', render: (row) => currency.format(row.amount) },
                    { key: 'date', header: 'Transaction Date', render: (row) => row.transaction_date },
                    { key: 'bank', header: 'Bank Reference', render: (row) => row.bank_reference_number },
                  ]}
                />
              </div>
            </div>
          </section>
        );

      case 'allocate-funds-to-projects':
        return (
          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <DataEntryForm
              title="Allocate project funds"
              description="Move committed finance into an approved project allocation."
              onSubmit={(event) => {
                event.preventDefault();
                store.createBudgetLine({
                  grant_id: firstGrant.grant_id,
                  line_name: allocationForm.project,
                  allocated_amount: Number(allocationForm.amount),
                });
                setAllocationForm({ project: '', amount: '0' });
              }}
              actions={<Button type="submit">Allocate Funds to Projects</Button>}
            >
              <label className="form-group">
                <span className="form-label">Project</span>
                <input className="form-control" value={allocationForm.project} onChange={(event) => setAllocationForm((state) => ({ ...state, project: event.target.value }))} />
              </label>
              <label className="form-group">
                <span className="form-label">Amount</span>
                <input className="form-control" type="number" value={allocationForm.amount} onChange={(event) => setAllocationForm((state) => ({ ...state, amount: event.target.value }))} />
              </label>
            </DataEntryForm>
            <AreaMetricChart
              title="Allocation Momentum"
              data={store.budgetLines.map((budgetLine) => ({
                label: budgetLine.line_name.split(' ')[0],
                value: budgetLine.allocated_amount / 1000,
              }))}
            />
          </section>
        );

      case 'bank-reconciliation':
        return (
          <div className="panel-card">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-slate-900">Open bank matches</h3>
              <Button variant="outline" icon={RefreshCcw}>Reload Statement</Button>
            </div>
            <div className="mt-6">
              <DataTable
                rows={store.transactions}
                columns={[
                  { key: 'reference', header: 'Bank Reference', render: (row) => row.bank_reference_number },
                  { key: 'budget', header: 'Budget Line', render: (row) => budgetLineName(row.budget_line_id) },
                  { key: 'amount', header: 'Amount', render: (row) => currency.format(row.amount) },
                  { key: 'date', header: 'Transaction Date', render: (row) => row.transaction_date },
                  {
                    key: 'action',
                    header: 'Action',
                    render: (row) =>
                      row.bank_reference_number === 'PENDING' ? (
                        <Button variant="outline" onClick={() => store.reconcileTransaction(row.transaction_id)}>
                          Reconcile
                        </Button>
                      ) : (
                        <Button variant="ghost" icon={Check} />
                      ),
                  },
                ]}
              />
            </div>
          </div>
        );

      case 'generate-financial-reports':
        return (
          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <DataEntryForm
              title="Generate a finance report"
              description="Produce mock reporting output for a selected period."
              onSubmit={(event) => {
                event.preventDefault();
                store.generateReport(reportForm.name || reportForm.period, firstGrant.grant_id, currentUserId, 'PDF');
                setReportForm({ name: '', period: '' });
              }}
              actions={<Button type="submit">Generate Financial Reports</Button>}
            >
              <label className="form-group">
                <span className="form-label">Report Name</span>
                <input className="form-control" value={reportForm.name} onChange={(event) => setReportForm((state) => ({ ...state, name: event.target.value }))} />
              </label>
              <label className="form-group">
                <span className="form-label">Period</span>
                <input className="form-control" value={reportForm.period} onChange={(event) => setReportForm((state) => ({ ...state, period: event.target.value }))} />
              </label>
            </DataEntryForm>
            <div className="panel-card">
              <h3 className="text-xl font-bold text-slate-900">Generated reports</h3>
              <div className="mt-6">
                <DataTable
                  rows={store.reports}
                  columns={[
                    { key: 'type', header: 'Report Type', render: (row) => row.report_type },
                    { key: 'grant', header: 'Grant', render: (row) => grantTitle(row.grant_id) },
                    { key: 'generatedBy', header: 'Generated By', render: (row) => userName(row.generated_by_user_id) },
                    { key: 'format', header: 'Format', render: (row) => row.format },
                    { key: 'created', header: 'Created At', render: (row) => row.created_at },
                  ]}
                />
              </div>
            </div>
          </section>
        );

      case 'maintain-audit-trail':
        return (
          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <DataEntryForm
              title="Append an audit event"
              description="Create a new trace event to preserve transaction visibility."
              onSubmit={(event) => {
                event.preventDefault();
                store.createAuditLog({
                  user_id: currentUserId,
                  action_type: auditForm.action,
                  target_entity_id: store.transactions[0]?.transaction_id ?? 1,
                  target_entity_type: auditForm.source || 'transactions',
                  ip_address: '192.168.1.50',
                  details: `Manual audit entry created by ${currentProfile.name}`,
                });
                setAuditForm({ action: '', source: '' });
              }}
              actions={<Button type="submit">Maintain Audit Trail</Button>}
            >
              <label className="form-group">
                <span className="form-label">Action</span>
                <input className="form-control" value={auditForm.action} onChange={(event) => setAuditForm((state) => ({ ...state, action: event.target.value }))} />
              </label>
              <label className="form-group">
                <span className="form-label">Source</span>
                <input className="form-control" value={auditForm.source} onChange={(event) => setAuditForm((state) => ({ ...state, source: event.target.value }))} />
              </label>
            </DataEntryForm>
            <div className="panel-card">
              <h3 className="text-xl font-bold text-slate-900">Audit entries</h3>
              <div className="mt-6">
                <DataTable
                  rows={store.auditLogs}
                  columns={[
                    { key: 'action', header: 'Action', render: (row) => row.action_type },
                    { key: 'owner', header: 'User', render: (row) => userName(row.user_id) },
                    { key: 'source', header: 'Target Entity', render: (row) => row.target_entity_type },
                    { key: 'time', header: 'Timestamp', render: (row) => row.timestamp },
                  ]}
                />
              </div>
            </div>
          </section>
        );

      case 'submit-expense-claims':
        return (
          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <DataEntryForm
              title="Submit a new claim"
              description="Create a reimbursable field expense request."
              onSubmit={(event) => {
                event.preventDefault();
                store.createRequisition({
                  submitted_by_user_id: currentUserId,
                  budget_line_id: firstBudgetLine.budget_line_id,
                  amount: Number(claimForm.amount),
                  description: claimForm.category,
                  receipt_document_url: '/receipts/new-field-claim.pdf',
                });
                setClaimForm({ category: '', amount: '0' });
              }}
              actions={<Button type="submit">Submit Expense Claims</Button>}
            >
              <label className="form-group">
                <span className="form-label">Category</span>
                <input className="form-control" value={claimForm.category} onChange={(event) => setClaimForm((state) => ({ ...state, category: event.target.value }))} />
              </label>
              <label className="form-group">
                <span className="form-label">Amount</span>
                <input className="form-control" type="number" value={claimForm.amount} onChange={(event) => setClaimForm((state) => ({ ...state, amount: event.target.value }))} />
              </label>
            </DataEntryForm>
            <div className="panel-card">
              <h3 className="text-xl font-bold text-slate-900">Claim queue</h3>
              <div className="mt-6">
                <DataTable
                  rows={store.requisitions.filter((requisition) => requisition.submitted_by_user_id === currentUserId)}
                  columns={[
                    { key: 'claimant', header: 'Claimant', render: (row) => userName(row.submitted_by_user_id) },
                    { key: 'category', header: 'Description', render: (row) => row.description },
                    { key: 'amount', header: 'Amount', render: (row) => currency.format(row.amount) },
                    { key: 'status', header: 'Status', render: (row) => <StatusBadge label={row.status} /> },
                    { key: 'submittedOn', header: 'Submitted', render: (row) => row.created_at },
                  ]}
                />
              </div>
            </div>
          </section>
        );

      case 'capture-staff-requirements':
        return (
          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <DataEntryForm
              title="Capture staff input"
              description="Record interview notes, process evidence, feedback, and validation status for operational requirements."
              onSubmit={(event) => {
                event.preventDefault();
                store.createAuditLog({
                  user_id: currentUserId,
                  action_type: 'STAFF_REQUIREMENT_CAPTURED',
                  target_entity_id: currentUserId,
                  target_entity_type: 'requirements',
                  ip_address: '192.168.1.66',
                  details: `${requirementForm.interviewee || currentProfile.name} submitted ${requirementForm.process || 'an operational process'} feedback.`,
                });
                setRequirementForm({ interviewee: '', process: '', feedback: '' });
              }}
              actions={<Button type="submit">Capture Requirement</Button>}
            >
              <label className="form-group">
                <span className="form-label">Interviewee</span>
                <input className="form-control" value={requirementForm.interviewee} onChange={(event) => setRequirementForm((state) => ({ ...state, interviewee: event.target.value }))} />
              </label>
              <label className="form-group">
                <span className="form-label">Process Area</span>
                <input className="form-control" value={requirementForm.process} onChange={(event) => setRequirementForm((state) => ({ ...state, process: event.target.value }))} />
              </label>
              <label className="form-group">
                <span className="form-label">Staff Feedback</span>
                <textarea className="form-control min-h-32" value={requirementForm.feedback} onChange={(event) => setRequirementForm((state) => ({ ...state, feedback: event.target.value }))} />
              </label>
            </DataEntryForm>

            <div className="space-y-6">
              <div className="panel-card">
                <h3 className="text-xl font-bold text-slate-900">Requirement validation tracker</h3>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {[
                    { label: 'Interviews', value: '18/24', status: 'active' },
                    { label: 'Processes', value: '11 mapped', status: 'in_review' },
                    { label: 'Sign-offs', value: '7 pending', status: 'pending' },
                  ].map((item) => (
                    <div key={item.label} className="metric-tile">
                      <span className="eyebrow">{item.label}</span>
                      <strong>{item.value}</strong>
                      <div className="mt-3">
                        <StatusBadge label={item.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <BarMetricChart
                title="Process Documentation Progress"
                data={[
                  { label: 'Donor', value: 86 },
                  { label: 'Finance', value: 74 },
                  { label: 'Projects', value: 68 },
                  { label: 'Audit', value: 91 },
                ]}
              />
            </div>
          </section>
        );

      case 'manage-testing-validation':
        return (
          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <div className="panel-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-slate-900">Test case management</h3>
                  <Button variant="outline" icon={Bug}>Open Bug Board</Button>
                </div>
                <div className="mt-6">
                  <DataTable
                    rows={[
                      { id: 'TC-001', scenario: 'Finance officer records fund receipt', environment: 'Staging', status: 'approved' },
                      { id: 'TC-002', scenario: 'Project manager approves budget request', environment: 'UAT', status: 'in_review' },
                      { id: 'TC-003', scenario: 'Auditor exports compliance checklist', environment: 'Pre-release', status: 'pending' },
                    ]}
                    columns={[
                      { key: 'id', header: 'Test ID', render: (row) => row.id },
                      { key: 'scenario', header: 'Scenario', render: (row) => row.scenario },
                      { key: 'environment', header: 'Environment', render: (row) => row.environment },
                      { key: 'status', header: 'Status', render: (row) => <StatusBadge label={row.status} /> },
                    ]}
                  />
                </div>
              </div>
              <AreaMetricChart
                title="Validation Status"
                data={[
                  { label: 'Unit', value: 92 },
                  { label: 'Flow', value: 84 },
                  { label: 'UAT', value: 71 },
                  { label: 'Release', value: 63 },
                ]}
              />
            </div>

            <DataEntryForm
              title="Capture UAT feedback"
              description="Record testing feedback against an environment and keep release readiness traceable."
              onSubmit={(event) => {
                event.preventDefault();
                store.createAuditLog({
                  user_id: currentUserId,
                  action_type: 'UAT_FEEDBACK_CAPTURED',
                  target_entity_id: currentUserId,
                  target_entity_type: 'testing_validation',
                  ip_address: '192.168.1.71',
                  details: `${testingForm.testCase || 'A test case'} feedback captured for ${testingForm.environment}.`,
                });
                setTestingForm({ testCase: '', environment: 'Staging', feedback: '' });
              }}
              actions={<Button type="submit" icon={ClipboardCheck}>Submit Feedback</Button>}
            >
              <label className="form-group">
                <span className="form-label">Test Case</span>
                <input className="form-control" value={testingForm.testCase} onChange={(event) => setTestingForm((state) => ({ ...state, testCase: event.target.value }))} />
              </label>
              <label className="form-group">
                <span className="form-label">Environment</span>
                <select className="form-control" value={testingForm.environment} onChange={(event) => setTestingForm((state) => ({ ...state, environment: event.target.value }))}>
                  <option>Staging</option>
                  <option>UAT</option>
                  <option>Pre-release</option>
                  <option>Production Smoke</option>
                </select>
              </label>
              <label className="form-group">
                <span className="form-label">Feedback</span>
                <textarea className="form-control min-h-32" value={testingForm.feedback} onChange={(event) => setTestingForm((state) => ({ ...state, feedback: event.target.value }))} />
              </label>
            </DataEntryForm>
          </section>
        );

      case 'update-user-profile':
        return <Navigate to="/app/profile" replace />;

      case 'review-budget-requests':
        return (
          <div className="panel-card">
            <h3 className="text-xl font-bold text-slate-900">Budget request queue</h3>
            <div className="mt-6">
              <DataTable
                rows={store.requisitions}
                columns={[
                  { key: 'project', header: 'Budget Line', render: (row) => budgetLineName(row.budget_line_id) },
                  { key: 'requester', header: 'Requester', render: (row) => userName(row.submitted_by_user_id) },
                  { key: 'amount', header: 'Amount', render: (row) => currency.format(row.amount) },
                  { key: 'status', header: 'Status', render: (row) => <StatusBadge label={row.status} /> },
                  {
                    key: 'actions',
                    header: 'Actions',
                    render: (row) => (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => store.approveRequisition(row.requisition_id)}>Approve</Button>
                        <Button variant="ghost" onClick={() => store.rejectRequisition(row.requisition_id, 'Rejected during budget review')}>Reject</Button>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        );

      case 'monitor-project-budget':
        return (
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="panel-card">
              <h3 className="text-xl font-bold text-slate-900">Project budget health</h3>
              <div className="mt-6">
                <DataTable
                  rows={store.budgetLines}
                  columns={[
                    { key: 'project', header: 'Budget Line', render: (row) => row.line_name },
                    { key: 'grant', header: 'Grant', render: (row) => grantTitle(row.grant_id) },
                    { key: 'allocated', header: 'Allocated', render: (row) => currency.format(row.allocated_amount) },
                    { key: 'spent', header: 'Spent', render: (row) => currency.format(row.spent_amount) },
                    { key: 'remaining', header: 'Remaining', render: (row) => currency.format(row.allocated_amount - row.spent_amount) },
                  ]}
                />
              </div>
            </div>
            <AreaMetricChart
              title="Budget Burn Rate"
              data={store.budgetLines.map((budget) => ({
                label: budget.line_name.split(' ')[0],
                value: Math.round((budget.spent_amount / budget.allocated_amount) * 100),
              }))}
            />
          </section>
        );

      case 'final-approve-requisitions':
        return (
          <div className="panel-card">
            <h3 className="text-xl font-bold text-slate-900">Requisition board</h3>
            <div className="mt-6">
              <DataTable
                  rows={store.requisitions}
                  columns={[
                  { key: 'title', header: 'Description', render: (row) => row.description },
                  { key: 'owner', header: 'Submitted By', render: (row) => userName(row.submitted_by_user_id) },
                  { key: 'amount', header: 'Amount', render: (row) => currency.format(row.amount) },
                  { key: 'status', header: 'Status', render: (row) => <StatusBadge label={row.status} /> },
                  {
                    key: 'approve',
                    header: 'Decision',
                    render: (row) =>
                      row.status === 'pending' ? (
                        <Button onClick={() => store.approveRequisition(row.requisition_id)}>Final Approve Requisitions</Button>
                      ) : (
                        <Button variant="ghost" icon={Check} />
                      ),
                  },
                ]}
              />
            </div>
          </div>
        );

      case 'view-strategic-dashboard':
        return (
          <section className="grid gap-6 xl:grid-cols-2">
            <BarMetricChart
              title="Strategic Outcome Mix"
              data={[
                { label: 'Coverage', value: 78 },
                { label: 'Uptime', value: 96 },
                { label: 'Approval Pace', value: 82 },
                { label: 'Audit Readiness', value: 91 },
              ]}
            />
            <PieMetricChart
              title="Leadership Priorities"
              data={[
                { label: 'Programs', value: 42, color: '#1f6f78' },
                { label: 'Finance', value: 24, color: '#f59e0b' },
                { label: 'Governance', value: 20, color: '#4caf50' },
                { label: 'Donor Trust', value: 14, color: '#ef4444' },
              ]}
            />
          </section>
        );

      case 'view-audit-trail':
        return (
          <div className="panel-card">
            <h3 className="text-xl font-bold text-slate-900">Traceable audit evidence</h3>
            <div className="mt-6">
              <DataTable
                rows={store.auditLogs}
                columns={[
                  { key: 'action', header: 'Action', render: (row) => row.action_type },
                  { key: 'owner', header: 'User', render: (row) => userName(row.user_id) },
                  { key: 'source', header: 'Target Entity', render: (row) => row.target_entity_type },
                  { key: 'timestamp', header: 'Timestamp', render: (row) => row.timestamp },
                ]}
              />
            </div>
          </div>
        );

      case 'verify-compliance-checklist':
        return (
          <div className="panel-card">
            <h3 className="text-xl font-bold text-slate-900">Checklist verification</h3>
            <div className="mt-6 space-y-4">
              {store.complianceItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{item.title}</div>
                      <div className="text-sm text-slate-500">{item.owner}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge label={item.verified ? 'approved' : 'pending'} />
                      <Button variant="outline" onClick={() => store.toggleComplianceItem(item.id)}>
                        Verify Compliance Checklist
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'access-donor-portal':
        return (
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="panel-card">
              <h3 className="text-xl font-bold text-slate-900">Donor experience summary</h3>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="metric-tile">
                  <span className="eyebrow">Lifetime Giving</span>
                  <strong>{currency.format(store.transactions.reduce((sum, transaction) => sum + transaction.amount, 0))}</strong>
                </div>
                <div className="metric-tile">
                  <span className="eyebrow">Active Projects</span>
                  <strong>{store.projects.length} supported programs</strong>
                </div>
                <div className="metric-tile">
                  <span className="eyebrow">Receipts Ready</span>
                  <strong>{store.transactions.length} tax receipts</strong>
                </div>
                <div className="metric-tile">
                  <span className="eyebrow">Impact Updates</span>
                  <strong>2 new stories</strong>
                </div>
              </div>
            </div>
            <PieMetricChart
              title="Donation Interest Mix"
              data={[
                { label: 'Maternal Care', value: 45, color: '#f59e0b' },
                { label: 'Water Access', value: 30, color: '#1f6f78' },
                { label: 'Nutrition', value: 25, color: '#4caf50' },
              ]}
            />
          </section>
        );

      case 'view-transaction-summaries':
        return (
          <div className="panel-card">
            <h3 className="text-xl font-bold text-slate-900">Transaction summaries</h3>
            <div className="mt-6">
              <DataTable
                rows={store.transactions}
                columns={[
                  { key: 'project', header: 'Budget Line', render: (row) => budgetLineName(row.budget_line_id) },
                  { key: 'amount', header: 'Amount', render: (row) => currency.format(row.amount) },
                  { key: 'date', header: 'Date', render: (row) => row.transaction_date },
                  { key: 'reference', header: 'Bank Reference', render: (row) => row.bank_reference_number },
                ]}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  }, [
    claimForm.amount,
    claimForm.category,
    requirementForm.feedback,
    requirementForm.interviewee,
    requirementForm.process,
    testingForm.environment,
    testingForm.feedback,
    testingForm.testCase,
    commonStats,
    currentProfile.actor,
    currentProfile.name,
    settingDrafts,
    store,
    useCase.id,
    userForm.actor,
    userForm.email,
    userForm.name,
    donorForm.email,
    donorForm.name,
    donorForm.type,
    receiptForm.amount,
    receiptForm.donorName,
    receiptForm.project,
    receiptForm.receivedOn,
    allocationForm.amount,
    allocationForm.project,
    reportForm.name,
    reportForm.period,
    auditForm.action,
    auditForm.source,
  ]);

  return <><AppHeader title={useCase.title} summary={useCase.summary} />{content}</>;
}
