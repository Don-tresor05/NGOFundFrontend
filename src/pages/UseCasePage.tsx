import { FormEvent, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Bug, Check, ClipboardCheck, Eye, Plus, RefreshCcw } from 'lucide-react';
import { AppHeader, Button, DataTable, StatCard, StatusBadge } from '../components';
import { DataEntryForm } from '../components/forms/DataEntryForm';
import { AreaMetricChart, BarMetricChart, PieMetricChart } from '../components/charts';
import { ACTORS, USE_CASES } from '../constants/appModel';
import { roleLabels, useAppDataStore } from '../store/appDataStore';
import { useAuthStore } from '../store/authStore';
import {
  Actor,
  BugReport,
  DashboardStat,
  ReportSchedule,
  Role,
  UseCaseId,
  TestCase,
} from '../types';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const exportCsv = (filename: string, rows: Array<Record<string, string | number | null | undefined>>) => {
  if (!rows.length) {
    return;
  }

  const headers = Object.keys(rows[0]);
  const escape = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) {
      return '';
    }
    const stringValue = String(value);
    return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
  };

  const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => escape(row[header])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const actorToRole: Record<Actor, Role> = {
  super_administrator: 'SUPER_ADMIN',
  finance_officer: 'FINANCE_OFFICER',
  field_staff: 'FIELD_STAFF',
  project_manager: 'PROJECT_MANAGER',
  executive_director: 'EXECUTIVE_DIRECTOR',
  external_auditor: 'EXTERNAL_AUDITOR',
  donor_user: 'DONOR_USER',
};

const generateTemporaryPassword = () => {
  const token = globalThis.crypto?.randomUUID?.().replace(/-/g, '').slice(0, 12) ?? `temp${Date.now().toString(36)}`;
  return `${token}A!`;
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
  const allowedUseCases = USE_CASES.filter((entry) => entry.actors.includes(currentProfile.actor));
  const firstBudgetLine = store.budgetLines[0];
  const firstGrant = store.grants[0];
  const staffRequirementTotal = store.staffRequirements.length;
  const staffRequirementInReview = store.staffRequirements.filter((requirement) => requirement.validation_status === 'in_review').length;
  const staffRequirementPending = store.staffRequirements.filter((requirement) => requirement.validation_status === 'pending').length;
  const mappedProcessAreas = new Set(store.staffRequirements.map((requirement) => requirement.process_area.trim().toLowerCase()).filter(Boolean));
  const openTestCaseCount = store.testCases.filter((testCase) => testCase.status !== 'approved' && testCase.status !== 'rejected').length;
  const uatOpenCount = store.uatFeedback.filter((feedback) => feedback.status !== 'closed').length;

  const commonStats: DashboardStat[] = [
    { label: 'Responsible Actor', value: actor?.shortLabel ?? 'Actor', trend: 'Directly mapped from diagram', trendDirection: 'up' },
    { label: 'Workflow State', value: store.dataReady ? 'Backend synced' : 'Syncing', trend: 'Connected to backend APIs', trendDirection: 'neutral' },
    { label: 'Access Policy', value: actor?.label ?? 'Role-aware', trend: 'Use-case permissions enforced', trendDirection: 'up' },
  ];

  const reconciliationRows = store.transactions.map((transaction) => ({
    transaction_id: transaction.transaction_id,
    budget_line: budgetLineName(transaction.budget_line_id),
    amount: currency.format(transaction.amount),
    date: transaction.transaction_date,
    reference: transaction.bank_reference_number,
    status: transaction.status ?? 'pending',
  }));
  const reconciliationPendingCount = store.transactions.filter((transaction) => !transaction.status || transaction.status === 'pending').length;
  const reconciliationClearedCount = store.transactions.filter((transaction) => transaction.status === 'cleared').length;
  const reconciliationMatchedCount = store.transactions.filter((transaction) => transaction.status === 'reconciled').length;

  const reportScheduleRows = store.reportSchedules.map((schedule) => ({
    report_type: schedule.report_type,
    frequency: schedule.frequency,
    delivery_method: schedule.delivery_method,
    recipients: schedule.recipient_emails,
    status: schedule.is_active ? 'active' : 'inactive',
    next_run_at: schedule.next_run_at ?? '-',
    last_run_at: schedule.last_run_at ?? '-',
  }));

  const reportDeliveryRows = store.reportDeliveries.map((delivery) => ({
    report_id: delivery.report,
    destination: delivery.destination,
    method: delivery.delivery_method,
    status: delivery.status,
    sent_at: delivery.sent_at ?? '-',
  }));
  const activeSchedules = store.reportSchedules.filter((schedule) => schedule.is_active).length;
  const auditRows = store.auditLogs.map((log) => ({
    action_type: log.action_type,
    user: userName(log.user_id),
    target_entity_type: log.target_entity_type,
    timestamp: log.timestamp,
    ip_address: log.ip_address || '-',
  }));
  const auditActionCount = new Set(store.auditLogs.map((log) => log.action_type)).size;
  const auditTargetCount = new Set(store.auditLogs.map((log) => log.target_entity_type)).size;
  const verifiedComplianceCount = store.complianceItems.filter((item) => item.verified).length;
  const pendingComplianceCount = store.complianceItems.length - verifiedComplianceCount;
  const complianceRows = store.complianceItems.map((item) => ({
    title: item.title,
    owner: item.owner,
    verified: item.verified ? 'verified' : 'pending',
  }));
  const testCaseRows = store.testCases.map((testCase) => ({
    title: testCase.title,
    environment: testCase.environment,
    status: testCase.status,
    priority: testCase.priority,
    created_at: testCase.created_at,
  }));
  const openBugCount = store.bugReports.filter((bug) => bug.status !== 'closed').length;
  const openUatCount = store.uatFeedback.filter((feedback) => feedback.status !== 'closed').length;
  const publishedReleaseCount = store.releaseNotes.filter((note) => note.status === 'published').length;
  const releaseRows = store.releaseNotes.map((note) => ({
    version: note.version,
    title: note.title,
    environment: note.environment,
    status: note.status,
    created_at: note.created_at,
  }));

  const [userForm, setUserForm] = useState({ name: '', email: '', actor: 'field_staff' });
  const [settingDrafts, setSettingDrafts] = useState<Record<string, string>>({});
  const [donorForm, setDonorForm] = useState({ name: '', email: '', type: 'individual' });
  const [receiptForm, setReceiptForm] = useState({ donorName: '', project: '', amount: '0', receivedOn: '2026-05-25' });
  const [allocationForm, setAllocationForm] = useState({ project: '', amount: '0' });
  const [reportForm, setReportForm] = useState({ name: '', period: '' });
  const [auditForm, setAuditForm] = useState({ action: '', source: '' });
  const [claimForm, setClaimForm] = useState({ category: '', amount: '0' });
  const [requirementForm, setRequirementForm] = useState({ interviewee: '', process: '', feedback: '' });
  const [testCaseForm, setTestCaseForm] = useState({ title: '', scenario: '', environment: 'Staging', priority: 'medium' as TestCase['priority'] });
  const [uatForm, setUatForm] = useState({ testCase: '', feedback: '' });
  const [reallocationForm, setReallocationForm] = useState({ source: '', target: '', amount: '0', reason: '' });
  const [expenseForm, setExpenseForm] = useState({ requisition: '', notes: '', decisionReason: '' });
  const [scheduleForm, setScheduleForm] = useState({ reportType: '', frequency: 'monthly', deliveryMethod: 'email', recipients: '', nextRunAt: '' });
  const [documentForm, setDocumentForm] = useState({ title: '', version: 'v1', summary: '', content: '' });
  const [bugForm, setBugForm] = useState({ title: '', description: '', reproductionSteps: '', environment: 'UAT', severity: 'medium' as BugReport['severity'] });
  const [releaseForm, setReleaseForm] = useState({ version: '', title: '', summary: '', changelog: '', environment: 'Production' });

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
            <section className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <div className="panel-card">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-slate-900">Security summary</h3>
                  <Button variant="outline" onClick={() => store.fetchSecuritySummary()}>
                    Refresh Summary
                  </Button>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="metric-tile">
                    <span className="eyebrow">Session Timeout</span>
                    <strong>{store.securitySummary?.session_timeout_minutes ?? 60} mins</strong>
                  </div>
                  <div className="metric-tile">
                    <span className="eyebrow">Reset Requests</span>
                    <strong>{store.securitySummary?.password_reset_requests ?? 0}</strong>
                  </div>
                  <div className="metric-tile">
                    <span className="eyebrow">Inactive Users</span>
                    <strong>{store.securitySummary?.inactive_users ?? 0}</strong>
                  </div>
                </div>
              </div>
              <div className="panel-card">
                <h3 className="text-xl font-bold text-slate-900">Role governance snapshot</h3>
                <div className="mt-6 space-y-3 text-sm text-slate-600">
                  <p>Security settings and account controls now load from the backend instead of local mock state.</p>
                  <p>Password reset, access governance, and user lifecycle checks are available through the accounts API.</p>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Current Role</div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">{roleLabels[actorToRole[currentProfile.actor]]}</div>
                    <p className="mt-2 text-sm text-slate-600">
                      Access is governed by the backend role matrix. Sensitive controls stay hidden when the role is not permitted.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Allowed Use Cases</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {allowedUseCases.map((entry) => (
                        <span key={entry.id} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                          {entry.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
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
                    password: generateTemporaryPassword(),
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
            <section className="grid gap-6 xl:grid-cols-2">
              <div className="panel-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-slate-900">Governance overview</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => store.fetchSystemSettingsSummary()}>
                      Refresh Summary
                    </Button>
                    <Button
                      onClick={() =>
                        store.bulkUpdateSettings(
                          store.systemSettings.map((setting) => ({
                            setting_key: setting.key,
                            label: setting.label,
                            setting_value: settingDrafts[setting.key] ?? setting.value,
                            setting_group: setting.group,
                          }))
                        )
                      }
                    >
                      Save All Settings
                    </Button>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="metric-tile">
                    <span className="eyebrow">Total Settings</span>
                    <strong>{store.systemSettingsSummary?.total ?? store.systemSettings.length}</strong>
                  </div>
                  <div className="metric-tile">
                    <span className="eyebrow">Session Timeout</span>
                    <strong>{store.systemSettingsSummary?.access_timeout_minutes ?? 60} mins</strong>
                  </div>
                  <div className="metric-tile">
                    <span className="eyebrow">Groups</span>
                    <strong>{Object.keys(store.systemSettingsSummary?.groups ?? {}).length}</strong>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {Object.entries(store.systemSettingsSummary?.groups ?? {}).map(([group, count]) => (
                    <div key={group} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{group}</div>
                      <div className="mt-2 text-2xl font-bold text-slate-900">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
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
            <section className="panel-card mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-slate-900">Donor engagement overview</h3>
                <Button variant="outline" onClick={() => store.fetchDonorEngagementDashboard()}>
                  Refresh Engagement Overview
                </Button>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div className="metric-tile">
                  <span className="eyebrow">Total Donors</span>
                  <strong>{store.donorEngagementDashboard?.total_donors ?? store.donors.length}</strong>
                </div>
                <div className="metric-tile">
                  <span className="eyebrow">Active Donors</span>
                  <strong>{store.donorEngagementDashboard?.active_donors ?? store.donors.filter((donor) => donor.status === 'active').length}</strong>
                </div>
                <div className="metric-tile">
                  <span className="eyebrow">Communications</span>
                  <strong>{store.donorEngagementDashboard?.total_communications ?? 0}</strong>
                </div>
                <div className="metric-tile">
                  <span className="eyebrow">Channels</span>
                  <strong>{Object.keys(store.donorEngagementDashboard?.channel_totals ?? {}).length}</strong>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {(store.donorEngagementDashboard?.top_donors ?? []).map((donor) => (
                  <div key={donor.donor_id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <div className="font-semibold text-slate-900">{donor.organization_name}</div>
                      <div className="text-sm text-slate-500">
                        {donor.communication_count} communications · last contact {donor.last_contact_date ?? 'none'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Engagement</div>
                      <div className="text-xl font-bold text-slate-900">{donor.engagement_score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
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
          <section className="space-y-6">
            <section className="grid gap-4 md:grid-cols-4">
              <StatCard label="Pending Matches" value={String(reconciliationPendingCount)} trend="Require reconciliation" trendDirection="neutral" icon={ClipboardCheck} />
              <StatCard label="Cleared" value={String(reconciliationClearedCount)} trend="Bank confirmed" trendDirection="up" icon={Check} />
              <StatCard label="Reconciled" value={String(reconciliationMatchedCount)} trend="Matched to ledger" trendDirection="up" icon={Eye} />
              <StatCard label="Total Lines" value={String(store.transactions.length)} trend="Current bank review set" trendDirection="neutral" icon={RefreshCcw} />
            </section>

            <div className="panel-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Bank reconciliation workbench</h3>
                  <p className="mt-1 text-sm text-slate-500">Review bank lines, reconcile pending transactions, and export the current match set.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => exportCsv('bank-reconciliation.csv', reconciliationRows)}>
                    Export CSV
                  </Button>
                  <Button variant="outline" icon={RefreshCcw}>Reload Statement</Button>
                </div>
              </div>
              <div className="mt-6">
                <DataTable
                  rows={store.transactions}
                  columns={[
                    { key: 'reference', header: 'Bank Reference', render: (row) => row.bank_reference_number },
                    { key: 'budget', header: 'Budget Line', render: (row) => budgetLineName(row.budget_line_id) },
                    { key: 'amount', header: 'Amount', render: (row) => currency.format(row.amount) },
                    { key: 'date', header: 'Transaction Date', render: (row) => row.transaction_date },
                    { key: 'status', header: 'Status', render: (row) => <StatusBadge label={row.status ?? 'pending'} /> },
                    {
                      key: 'action',
                      header: 'Action',
                      render: (row) =>
                        row.status === 'reconciled' ? (
                          <Button variant="ghost" icon={Check} />
                        ) : (
                          <Button variant="outline" onClick={() => store.reconcileTransaction(row.transaction_id)}>
                            Reconcile
                          </Button>
                        ),
                    },
                  ]}
                  emptyTitle="No bank lines available"
                  emptyDescription="Once transactions are recorded, they can be reconciled here."
                />
              </div>
            </div>

            <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
              <div className="panel-card">
                <h3 className="text-xl font-bold text-slate-900">Reconciliation summary</h3>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="metric-tile">
                    <span className="eyebrow">Pending</span>
                    <strong>{reconciliationPendingCount}</strong>
                  </div>
                  <div className="metric-tile">
                    <span className="eyebrow">Cleared</span>
                    <strong>{reconciliationClearedCount}</strong>
                  </div>
                  <div className="metric-tile">
                    <span className="eyebrow">Reconciled</span>
                    <strong>{reconciliationMatchedCount}</strong>
                  </div>
                </div>
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  The workbench is permission-aware: only finance and leadership roles can reconcile transactions, while auditors can review status changes.
                </div>
              </div>
              <BarMetricChart
                title="Match Distribution"
                data={[
                  { label: 'Pending', value: reconciliationPendingCount },
                  { label: 'Cleared', value: reconciliationClearedCount },
                  { label: 'Reconciled', value: reconciliationMatchedCount },
                ]}
              />
            </section>
          </section>
        );

      case 'generate-financial-reports':
        return (
          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6">
              <DataEntryForm
                title="Generate a finance report"
                description="Produce reporting output for a selected period."
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

              <DataEntryForm
                title="Schedule report delivery"
                description="Set cadence, destination, and delivery path for repeating reports."
                onSubmit={(event) => {
                  event.preventDefault();
                  store.createReportSchedule({
                    report_type: scheduleForm.reportType,
                    grant: firstGrant?.grant_id ?? null,
                    frequency: scheduleForm.frequency as ReportSchedule['frequency'],
                    delivery_method: scheduleForm.deliveryMethod as ReportSchedule['delivery_method'],
                    recipient_emails: scheduleForm.recipients,
                    next_run_at: scheduleForm.nextRunAt || null,
                  });
                  setScheduleForm({ reportType: '', frequency: 'monthly', deliveryMethod: 'email', recipients: '', nextRunAt: '' });
                }}
                actions={<Button type="submit">Create Schedule</Button>}
              >
                <label className="form-group">
                  <span className="form-label">Report Type</span>
                  <input className="form-control" value={scheduleForm.reportType} onChange={(event) => setScheduleForm((state) => ({ ...state, reportType: event.target.value }))} />
                </label>
                <label className="form-group">
                  <span className="form-label">Frequency</span>
                  <select className="form-control" value={scheduleForm.frequency} onChange={(event) => setScheduleForm((state) => ({ ...state, frequency: event.target.value }))}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="custom">Custom</option>
                  </select>
                </label>
                <label className="form-group">
                  <span className="form-label">Delivery Method</span>
                  <select className="form-control" value={scheduleForm.deliveryMethod} onChange={(event) => setScheduleForm((state) => ({ ...state, deliveryMethod: event.target.value }))}>
                    <option value="email">Email</option>
                    <option value="download">Download</option>
                    <option value="archive">Archive</option>
                  </select>
                </label>
                <label className="form-group">
                  <span className="form-label">Recipient Emails</span>
                  <input className="form-control" value={scheduleForm.recipients} onChange={(event) => setScheduleForm((state) => ({ ...state, recipients: event.target.value }))} />
                </label>
                <label className="form-group">
                  <span className="form-label">Next Run At</span>
                  <input className="form-control" type="datetime-local" value={scheduleForm.nextRunAt} onChange={(event) => setScheduleForm((state) => ({ ...state, nextRunAt: event.target.value }))} />
                </label>
              </DataEntryForm>
            </div>
            <section className="grid gap-4 md:grid-cols-4 xl:col-span-2">
              <StatCard label="Reports" value={String(store.reports.length)} trend="Generated report records" trendDirection="up" icon={Eye} />
              <StatCard label="Schedules" value={String(store.reportSchedules.length)} trend={`${activeSchedules} active schedules`} trendDirection="neutral" icon={RefreshCcw} />
              <StatCard label="Deliveries" value={String(store.reportDeliveries.length)} trend="Dispatched report copies" trendDirection="up" icon={ClipboardCheck} />
              <StatCard label="Exports" value="CSV" trend="Current output format" trendDirection="neutral" icon={Plus} />
            </section>
            <div className="panel-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Generated reports</h3>
                  <p className="mt-1 text-sm text-slate-500">Track generated reports, schedule them, and export the current operational snapshot.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      exportCsv(
                        'generated-reports.csv',
                        store.reports.map((report) => ({
                          report_type: report.report_type,
                          grant: grantTitle(report.grant_id),
                          format: report.format,
                          created_at: report.created_at,
                        }))
                      )
                    }
                  >
                    Export Reports
                  </Button>
                  <Button variant="outline" onClick={() => store.fetchAll()}>
                    Refresh
                  </Button>
                </div>
              </div>
              <div className="mt-6">
                <DataTable
                  rows={store.reports}
                  columns={[
                    { key: 'type', header: 'Report Type', render: (row) => row.report_type },
                    { key: 'grant', header: 'Grant', render: (row) => grantTitle(row.grant_id) },
                    { key: 'generatedBy', header: 'Generated By', render: (row) => userName(row.generated_by_user_id) },
                    { key: 'format', header: 'Format', render: (row) => row.format },
                    { key: 'created', header: 'Created At', render: (row) => row.created_at },
                    {
                      key: 'deliver',
                      header: 'Delivery',
                      render: (row) => (
                        <Button variant="outline" onClick={() => store.deliverReport(row.report_id, { destination: currentProfile.email, delivery_method: 'email' })}>
                          Deliver
                        </Button>
                      ),
                    },
                  ]}
                />
              </div>
              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-lg font-semibold text-slate-900">Scheduled report runs</h4>
                  <Button variant="outline" onClick={() => exportCsv('report-schedules.csv', reportScheduleRows)}>
                    Export Schedules
                  </Button>
                </div>
                <div className="mt-4">
                  <DataTable
                    rows={store.reportSchedules}
                    columns={[
                      { key: 'type', header: 'Report Type', render: (row) => row.report_type },
                      { key: 'frequency', header: 'Frequency', render: (row) => row.frequency },
                      { key: 'delivery', header: 'Delivery', render: (row) => row.delivery_method },
                      { key: 'status', header: 'Status', render: (row) => <StatusBadge label={row.is_active ? 'active' : 'pending'} /> },
                      {
                        key: 'actions',
                        header: 'Actions',
                        render: (row) => (
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => store.activateReportSchedule(row.id)}>Activate</Button>
                            <Button variant="ghost" onClick={() => store.deactivateReportSchedule(row.id)}>Deactivate</Button>
                            <Button variant="outline" onClick={() => store.runReportSchedule(row.id)}>Run Now</Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-lg font-semibold text-slate-900">Delivered copies</h4>
                  <Button variant="outline" onClick={() => exportCsv('report-deliveries.csv', reportDeliveryRows)}>
                    Export Deliveries
                  </Button>
                </div>
                <div className="mt-4">
                  <DataTable
                    rows={store.reportDeliveries}
                    columns={[
                      { key: 'report', header: 'Report', render: (row) => row.report },
                      { key: 'destination', header: 'Destination', render: (row) => row.destination },
                      { key: 'method', header: 'Method', render: (row) => row.delivery_method },
                      { key: 'status', header: 'Status', render: (row) => <StatusBadge label={row.status} /> },
                      {
                        key: 'dispatch',
                        header: 'Dispatch',
                        render: (row) => (
                          <Button
                            variant="outline"
                            disabled={row.status === 'sent'}
                            onClick={() => store.dispatchReportDelivery(row.id)}
                          >
                            Dispatch
                          </Button>
                        ),
                      },
                    ]}
                  />
                </div>
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
                store.createStaffRequirement({
                  interviewee_name: requirementForm.interviewee || currentProfile.name,
                  process_area: requirementForm.process || 'Operations',
                  feedback: requirementForm.feedback,
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
                    { label: 'Interviews', value: String(staffRequirementTotal), status: 'active' },
                    { label: 'Processes', value: String(mappedProcessAreas.size), status: 'in_review' },
                    { label: 'Sign-offs', value: String(staffRequirementPending + staffRequirementInReview), status: 'pending' },
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
              <div className="panel-card">
                <h3 className="text-xl font-bold text-slate-900">Captured requirements</h3>
                <div className="mt-6">
                  <DataTable
                    rows={store.staffRequirements}
                    columns={[
                      { key: 'interviewee', header: 'Interviewee', render: (row) => row.interviewee_name },
                      { key: 'process', header: 'Process Area', render: (row) => row.process_area },
                      { key: 'status', header: 'Status', render: (row) => <StatusBadge label={row.validation_status} /> },
                      { key: 'signedOff', header: 'Signed Off By', render: (row) => (row.signed_off_by ? userName(row.signed_off_by) : '-') },
                      {
                        key: 'actions',
                        header: 'Actions',
                        render: (row) => (
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => store.reviewStaffRequirement(row.id)}>Review</Button>
                            <Button variant="outline" onClick={() => store.signOffStaffRequirement(row.id)}>Sign Off</Button>
                            <Button variant="ghost" onClick={() => store.rejectStaffRequirement(row.id)}>Reject</Button>
                          </div>
                        ),
                      },
                    ]}
                    emptyTitle="No staff requirements yet"
                    emptyDescription="Captured interviews and process notes will appear here after submission."
                  />
                </div>
              </div>
              <div className="panel-card">
                <h3 className="text-xl font-bold text-slate-900">Process documents</h3>
                <div className="mt-6">
                  <DataEntryForm
                    title="Create or update a process document"
                    description="Capture the process narrative, version, and editable content."
                    onSubmit={(event) => {
                      event.preventDefault();
                      store.createProcessDocument(documentForm);
                      setDocumentForm({ title: '', version: 'v1', summary: '', content: '' });
                    }}
                    actions={<Button type="submit">Save Document</Button>}
                  >
                    <label className="form-group">
                      <span className="form-label">Title</span>
                      <input className="form-control" value={documentForm.title} onChange={(event) => setDocumentForm((state) => ({ ...state, title: event.target.value }))} />
                    </label>
                    <label className="form-group">
                      <span className="form-label">Version</span>
                      <input className="form-control" value={documentForm.version} onChange={(event) => setDocumentForm((state) => ({ ...state, version: event.target.value }))} />
                    </label>
                    <label className="form-group">
                      <span className="form-label">Summary</span>
                      <input className="form-control" value={documentForm.summary} onChange={(event) => setDocumentForm((state) => ({ ...state, summary: event.target.value }))} />
                    </label>
                    <label className="form-group">
                      <span className="form-label">Content</span>
                      <textarea className="form-control min-h-36" value={documentForm.content} onChange={(event) => setDocumentForm((state) => ({ ...state, content: event.target.value }))} />
                    </label>
                  </DataEntryForm>
                </div>
                <div className="mt-6">
                  <DataTable
                    rows={store.processDocuments}
                    columns={[
                      { key: 'title', header: 'Title', render: (row) => row.title },
                      { key: 'version', header: 'Version', render: (row) => row.version },
                      { key: 'status', header: 'Status', render: (row) => <StatusBadge label={row.status} /> },
                      {
                        key: 'actions',
                        header: 'Actions',
                        render: (row) => (
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => store.submitProcessDocumentForReview(row.id)}>Submit</Button>
                            <Button variant="outline" onClick={() => store.approveProcessDocument(row.id)}>Approve</Button>
                            <Button variant="outline" onClick={() => store.publishProcessDocument(row.id)}>Publish</Button>
                            <Button variant="ghost" onClick={() => store.rejectProcessDocument(row.id)}>Reject</Button>
                          </div>
                        ),
                      },
                    ]}
                    emptyTitle="No process documents yet"
                    emptyDescription="Publishable process documents will appear here after the first save."
                  />
                </div>
              </div>
            </div>
          </section>
        );

      case 'manage-testing-validation':
        return (
          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <section className="grid gap-4 md:grid-cols-4">
                <StatCard label="Test Cases" value={String(store.testCases.length)} trend="Validation scenarios" trendDirection="up" icon={ClipboardCheck} />
                <StatCard label="Open Bugs" value={String(openBugCount)} trend="Unclosed defects" trendDirection="neutral" icon={Bug} />
                <StatCard label="UAT Issues" value={String(openUatCount)} trend="Feedback items" trendDirection="neutral" icon={Eye} />
                <StatCard label="Released" value={String(publishedReleaseCount)} trend="Published versions" trendDirection="up" icon={Check} />
              </section>
              <DataEntryForm
                title="Create a test case"
                description="Capture test coverage before UAT and release validation."
                onSubmit={(event) => {
                  event.preventDefault();
                  store.createTestCase({
                    title: testCaseForm.title,
                    scenario: testCaseForm.scenario,
                    environment: testCaseForm.environment,
                    priority: testCaseForm.priority,
                  });
                  setTestCaseForm({ title: '', scenario: '', environment: 'Staging', priority: 'medium' });
                }}
                actions={<Button type="submit">Save Test Case</Button>}
              >
                <label className="form-group">
                  <span className="form-label">Title</span>
                  <input className="form-control" value={testCaseForm.title} onChange={(event) => setTestCaseForm((state) => ({ ...state, title: event.target.value }))} />
                </label>
                <label className="form-group">
                  <span className="form-label">Scenario</span>
                  <textarea className="form-control min-h-28" value={testCaseForm.scenario} onChange={(event) => setTestCaseForm((state) => ({ ...state, scenario: event.target.value }))} />
                </label>
                <label className="form-group">
                  <span className="form-label">Environment</span>
                  <select className="form-control" value={testCaseForm.environment} onChange={(event) => setTestCaseForm((state) => ({ ...state, environment: event.target.value }))}>
                    <option>Staging</option>
                    <option>UAT</option>
                    <option>Pre-release</option>
                    <option>Production Smoke</option>
                  </select>
                </label>
                <label className="form-group">
                  <span className="form-label">Priority</span>
                  <select className="form-control" value={testCaseForm.priority} onChange={(event) => setTestCaseForm((state) => ({ ...state, priority: event.target.value as TestCase['priority'] }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </label>
              </DataEntryForm>

              <div className="panel-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-slate-900">Test case management</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => exportCsv('test-cases.csv', testCaseRows)}>
                      Export Test Cases
                    </Button>
                    <Button variant="outline" icon={Bug}>Open Bug Board</Button>
                  </div>
                </div>
                <div className="mt-6">
                  <DataTable
                    rows={store.testCases}
                    columns={[
                      { key: 'title', header: 'Test Case', render: (row) => row.title },
                      { key: 'scenario', header: 'Scenario', render: (row) => row.scenario },
                      { key: 'environment', header: 'Environment', render: (row) => row.environment },
                      { key: 'priority', header: 'Priority', render: (row) => <StatusBadge label={row.priority} /> },
                      { key: 'status', header: 'Status', render: (row) => <StatusBadge label={row.status} /> },
                      {
                        key: 'actions',
                        header: 'Actions',
                        render: (row) => (
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => store.startTestCase(row.id)}>Start</Button>
                            <Button variant="outline" onClick={() => store.reviewTestCase(row.id)}>Review</Button>
                            <Button variant="outline" onClick={() => store.approveTestCase(row.id)}>Approve</Button>
                            <Button variant="ghost" onClick={() => store.rejectTestCase(row.id)}>Reject</Button>
                          </div>
                        ),
                      },
                    ]}
                    emptyTitle="No test cases yet"
                    emptyDescription="Create the first validation scenario to track release readiness."
                  />
                </div>
              </div>

              <AreaMetricChart
                title="Validation Status"
                data={[
                  { label: 'Open Cases', value: openTestCaseCount },
                  { label: 'Bugs', value: store.bugReports.filter((bug) => bug.status !== 'closed').length },
                  { label: 'UAT', value: uatOpenCount },
                  { label: 'Release', value: store.releaseNotes.filter((note) => note.status === 'published').length },
                ]}
              />

              <div className="panel-card">
                <h3 className="text-xl font-bold text-slate-900">Release notes</h3>
                <div className="mt-6">
                  <DataEntryForm
                    title="Create release note"
                    description="Capture the release summary and deployment changelog."
                    onSubmit={(event) => {
                      event.preventDefault();
                      store.createReleaseNote(releaseForm);
                      setReleaseForm({ version: '', title: '', summary: '', changelog: '', environment: 'Production' });
                    }}
                    actions={<Button type="submit">Save Release Note</Button>}
                  >
                    <label className="form-group">
                      <span className="form-label">Version</span>
                      <input className="form-control" value={releaseForm.version} onChange={(event) => setReleaseForm((state) => ({ ...state, version: event.target.value }))} />
                    </label>
                    <label className="form-group">
                      <span className="form-label">Title</span>
                      <input className="form-control" value={releaseForm.title} onChange={(event) => setReleaseForm((state) => ({ ...state, title: event.target.value }))} />
                    </label>
                    <label className="form-group">
                      <span className="form-label">Summary</span>
                      <input className="form-control" value={releaseForm.summary} onChange={(event) => setReleaseForm((state) => ({ ...state, summary: event.target.value }))} />
                    </label>
                    <label className="form-group">
                      <span className="form-label">Changelog</span>
                      <textarea className="form-control min-h-28" value={releaseForm.changelog} onChange={(event) => setReleaseForm((state) => ({ ...state, changelog: event.target.value }))} />
                    </label>
                  </DataEntryForm>
                </div>
                <div className="mt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="text-lg font-semibold text-slate-900">Published releases</h4>
                    <Button variant="outline" onClick={() => exportCsv('release-notes.csv', releaseRows)}>
                      Export Releases
                    </Button>
                  </div>
                  <DataTable
                    rows={store.releaseNotes}
                    columns={[
                      { key: 'version', header: 'Version', render: (row) => row.version },
                      { key: 'title', header: 'Title', render: (row) => row.title },
                      { key: 'status', header: 'Status', render: (row) => <StatusBadge label={row.status} /> },
                      {
                        key: 'actions',
                        header: 'Actions',
                        render: (row) => (
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => store.publishReleaseNote(row.id)}>Publish</Button>
                            <Button variant="ghost" onClick={() => store.archiveReleaseNote(row.id)}>Archive</Button>
                          </div>
                        ),
                      },
                    ]}
                    emptyTitle="No release notes yet"
                    emptyDescription="Release notes will appear after the first version is saved."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="panel-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-slate-900">Validation overview</h3>
                  <Button variant="outline" onClick={() => store.fetchAll()}>
                    Refresh
                  </Button>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="metric-tile">
                    <span className="eyebrow">Open Test Cases</span>
                    <strong>{openTestCaseCount}</strong>
                  </div>
                  <div className="metric-tile">
                    <span className="eyebrow">Open Bugs</span>
                    <strong>{openBugCount}</strong>
                  </div>
                  <div className="metric-tile">
                    <span className="eyebrow">Published</span>
                    <strong>{publishedReleaseCount}</strong>
                  </div>
                </div>
              </div>
              <DataEntryForm
                title="Capture UAT feedback"
                description="Record testing feedback against a test case and keep release readiness traceable."
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!uatForm.testCase) {
                    return;
                  }
                  store.createUATFeedback({
                    test_case: Number(uatForm.testCase),
                    feedback: uatForm.feedback,
                  });
                  setUatForm({ testCase: '', feedback: '' });
                }}
                actions={<Button type="submit" icon={ClipboardCheck}>Submit Feedback</Button>}
              >
                <label className="form-group">
                  <span className="form-label">Test Case</span>
                  <select className="form-control" value={uatForm.testCase} onChange={(event) => setUatForm((state) => ({ ...state, testCase: event.target.value }))}>
                    <option value="">Select a test case</option>
                    {store.testCases.map((testCase) => (
                      <option key={testCase.id} value={testCase.id}>
                        {testCase.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-group">
                  <span className="form-label">Feedback</span>
                  <textarea className="form-control min-h-32" value={uatForm.feedback} onChange={(event) => setUatForm((state) => ({ ...state, feedback: event.target.value }))} />
                </label>
              </DataEntryForm>

              <div className="panel-card">
                <h3 className="text-xl font-bold text-slate-900">UAT feedback queue</h3>
                <div className="mt-6">
                  <DataTable
                    rows={store.uatFeedback}
                    columns={[
                      { key: 'testCase', header: 'Test Case', render: (row) => store.testCases.find((testCase) => testCase.id === row.test_case)?.title ?? String(row.test_case) },
                      { key: 'feedback', header: 'Feedback', render: (row) => row.feedback },
                      { key: 'status', header: 'Status', render: (row) => <StatusBadge label={row.status} /> },
                      {
                        key: 'actions',
                        header: 'Actions',
                        render: (row) => (
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => store.resolveUATFeedback(row.id)}>Resolve</Button>
                            <Button variant="ghost" onClick={() => store.closeUATFeedback(row.id)}>Close</Button>
                          </div>
                        ),
                      },
                    ]}
                    emptyTitle="No UAT feedback yet"
                    emptyDescription="UAT notes will appear once testers submit feedback."
                  />
                </div>
              </div>

              <DataEntryForm
                title="Log a bug report"
                description="Capture a defect, its environment, and the evidence needed for triage."
                onSubmit={(event) => {
                  event.preventDefault();
                  store.createBugReport({
                    title: bugForm.title,
                    description: bugForm.description,
                    reproduction_steps: bugForm.reproductionSteps,
                    environment: bugForm.environment,
                    severity: bugForm.severity,
                  });
                  setBugForm({ title: '', description: '', reproductionSteps: '', environment: 'UAT', severity: 'medium' });
                }}
                actions={<Button type="submit">Create Bug Report</Button>}
              >
                <label className="form-group">
                  <span className="form-label">Title</span>
                  <input className="form-control" value={bugForm.title} onChange={(event) => setBugForm((state) => ({ ...state, title: event.target.value }))} />
                </label>
                <label className="form-group">
                  <span className="form-label">Environment</span>
                  <input className="form-control" value={bugForm.environment} onChange={(event) => setBugForm((state) => ({ ...state, environment: event.target.value }))} />
                </label>
                <label className="form-group">
                  <span className="form-label">Severity</span>
                  <select className="form-control" value={bugForm.severity} onChange={(event) => setBugForm((state) => ({ ...state, severity: event.target.value as BugReport['severity'] }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </label>
                <label className="form-group">
                  <span className="form-label">Description</span>
                  <textarea className="form-control min-h-28" value={bugForm.description} onChange={(event) => setBugForm((state) => ({ ...state, description: event.target.value }))} />
                </label>
                <label className="form-group">
                  <span className="form-label">Reproduction Steps</span>
                  <textarea className="form-control min-h-28" value={bugForm.reproductionSteps} onChange={(event) => setBugForm((state) => ({ ...state, reproductionSteps: event.target.value }))} />
                </label>
              </DataEntryForm>

              <div className="panel-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-slate-900">Bug board</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => exportCsv('bug-reports.csv', store.bugReports.map((bug) => ({
                      title: bug.title,
                      environment: bug.environment,
                      severity: bug.severity,
                      status: bug.status,
                    })))}>
                      Export Bugs
                    </Button>
                    <Button variant="outline" icon={Bug}>Open Bug Board</Button>
                  </div>
                </div>
                <div className="mt-6">
                  <DataTable
                    rows={store.bugReports}
                    columns={[
                      { key: 'title', header: 'Bug', render: (row) => row.title },
                      { key: 'environment', header: 'Environment', render: (row) => row.environment },
                      { key: 'severity', header: 'Severity', render: (row) => <StatusBadge label={row.severity} /> },
                      { key: 'status', header: 'Status', render: (row) => <StatusBadge label={row.status} /> },
                      {
                        key: 'actions',
                        header: 'Actions',
                        render: (row) => (
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => store.triageBugReport(row.id)}>Triage</Button>
                            <Button variant="outline" onClick={() => store.startBugReport(row.id)}>Start</Button>
                            <Button variant="outline" onClick={() => store.resolveBugReport(row.id)}>Resolve</Button>
                            <Button variant="ghost" onClick={() => store.closeBugReport(row.id)}>Close</Button>
                          </div>
                        ),
                      },
                    ]}
                    emptyTitle="No bug reports yet"
                    emptyDescription="Logged defects will show up here for triage and resolution."
                  />
                </div>
              </div>
            </div>
          </section>
        );

      case 'update-user-profile':
        return <Navigate to="/app/profile" replace />;

      case 'review-budget-requests':
        return (
          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <DataEntryForm
              title="Request budget reallocation"
              description="Move value between budget lines while keeping approvals traceable."
              onSubmit={(event) => {
                event.preventDefault();
                store.createReallocationRequest({
                  source_budget_line: Number(reallocationForm.source || (firstBudgetLine?.budget_line_id ?? 0)),
                  target_budget_line: Number(reallocationForm.target || (firstBudgetLine?.budget_line_id ?? 0)),
                  amount: Number(reallocationForm.amount),
                  reason: reallocationForm.reason,
                });
                setReallocationForm({ source: '', target: '', amount: '0', reason: '' });
              }}
              actions={<Button type="submit">Submit Reallocation</Button>}
            >
              <label className="form-group">
                <span className="form-label">Source Budget Line ID</span>
                <input className="form-control" value={reallocationForm.source} onChange={(event) => setReallocationForm((state) => ({ ...state, source: event.target.value }))} />
              </label>
              <label className="form-group">
                <span className="form-label">Target Budget Line ID</span>
                <input className="form-control" value={reallocationForm.target} onChange={(event) => setReallocationForm((state) => ({ ...state, target: event.target.value }))} />
              </label>
              <label className="form-group">
                <span className="form-label">Amount</span>
                <input className="form-control" type="number" value={reallocationForm.amount} onChange={(event) => setReallocationForm((state) => ({ ...state, amount: event.target.value }))} />
              </label>
              <label className="form-group">
                <span className="form-label">Reason</span>
                <textarea className="form-control min-h-28" value={reallocationForm.reason} onChange={(event) => setReallocationForm((state) => ({ ...state, reason: event.target.value }))} />
              </label>
            </DataEntryForm>

            <div className="panel-card">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-slate-900">Budget request queue</h3>
                <Button variant="outline" onClick={() => store.fetchAll()}>Refresh</Button>
              </div>
              <div className="mt-6">
                <DataTable
                  rows={store.reallocationRequests}
                  columns={[
                    { key: 'source', header: 'Source', render: (row) => budgetLineName(row.source_budget_line) },
                    { key: 'target', header: 'Target', render: (row) => budgetLineName(row.target_budget_line) },
                    { key: 'amount', header: 'Amount', render: (row) => currency.format(row.amount) },
                    { key: 'status', header: 'Status', render: (row) => <StatusBadge label={row.status} /> },
                    {
                      key: 'actions',
                      header: 'Actions',
                      render: (row) => (
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => store.approveReallocationRequest(row.id)}>Approve</Button>
                          <Button variant="ghost" onClick={() => store.rejectReallocationRequest(row.id)}>Reject</Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
              <div className="mt-6 border-t border-slate-200 pt-6">
                <h4 className="text-lg font-semibold text-slate-900">Expense requisitions</h4>
                <div className="mt-4">
                  <DataTable
                    rows={store.requisitions}
                    columns={[
                      { key: 'project', header: 'Budget Line', render: (row) => budgetLineName(row.budget_line_id) },
                      { key: 'requester', header: 'Requester', render: (row) => userName(row.submitted_by_user_id) },
                      { key: 'amount', header: 'Amount', render: (row) => currency.format(row.amount) },
                      { key: 'status', header: 'Status', render: (row) => <StatusBadge label={row.status} /> },
                    ]}
                  />
                </div>
              </div>
            </div>
          </section>
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
          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <DataEntryForm
              title="Submit expense approval"
              description="Create a workflow record that routes a requisition through approval stages."
              onSubmit={(event) => {
                event.preventDefault();
                store.createExpenseApproval({
                  requisition: Number(expenseForm.requisition || (store.requisitions[0]?.requisition_id ?? 0)),
                  notes: expenseForm.notes,
                });
                setExpenseForm({ requisition: '', notes: '', decisionReason: '' });
              }}
              actions={<Button type="submit">Create Expense Approval</Button>}
            >
              <label className="form-group">
                <span className="form-label">Requisition ID</span>
                <input className="form-control" value={expenseForm.requisition} onChange={(event) => setExpenseForm((state) => ({ ...state, requisition: event.target.value }))} />
              </label>
              <label className="form-group">
                <span className="form-label">Notes</span>
                <textarea className="form-control min-h-28" value={expenseForm.notes} onChange={(event) => setExpenseForm((state) => ({ ...state, notes: event.target.value }))} />
              </label>
            </DataEntryForm>

            <div className="panel-card space-y-8">
              <div>
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

              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-slate-900">Expense approval chain</h3>
                  <Button variant="outline" onClick={() => store.fetchAll()}>Refresh</Button>
                </div>
                <div className="mt-6">
                  <DataTable
                    rows={store.expenseApprovals}
                    columns={[
                      { key: 'req', header: 'Requisition', render: (row) => row.requisition },
                      { key: 'stage', header: 'Stage', render: (row) => <StatusBadge label={row.stage} /> },
                      { key: 'notes', header: 'Notes', render: (row) => row.notes || '-' },
                      {
                        key: 'actions',
                        header: 'Actions',
                        render: (row) => (
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => store.advanceExpenseApproval(row.id, 'department-review')}>Dept Review</Button>
                            <Button variant="outline" onClick={() => store.advanceExpenseApproval(row.id, 'finance-review')}>Finance Review</Button>
                            <Button variant="outline" onClick={() => store.advanceExpenseApproval(row.id, 'executive-review')}>Executive Review</Button>
                            <Button onClick={() => store.approveExpenseApproval(row.id, expenseForm.notes || 'Approved')}>Approve</Button>
                            <Button variant="ghost" onClick={() => store.rejectExpenseApproval(row.id, expenseForm.decisionReason || 'Rejected during approval chain')}>Reject</Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
                <div className="mt-4">
                  <label className="form-group">
                    <span className="form-label">Decision Reason</span>
                    <input className="form-control" value={expenseForm.decisionReason} onChange={(event) => setExpenseForm((state) => ({ ...state, decisionReason: event.target.value }))} />
                  </label>
                </div>
              </div>
            </div>
          </section>
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
          <section className="space-y-6">
            <section className="grid gap-4 md:grid-cols-4">
              <StatCard label="Audit Events" value={String(store.auditLogs.length)} trend="Immutable trace records" trendDirection="up" icon={Eye} />
              <StatCard label="Action Types" value={String(auditActionCount)} trend="Distinct operations observed" trendDirection="neutral" icon={ClipboardCheck} />
              <StatCard label="Target Types" value={String(auditTargetCount)} trend="Tracked entities" trendDirection="neutral" icon={Check} />
              <StatCard label="Exports" value="CSV" trend="Downloadable audit feed" trendDirection="neutral" icon={Plus} />
            </section>
            <div className="panel-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Traceable audit evidence</h3>
                  <p className="mt-1 text-sm text-slate-500">Review the immutable action trail, filter patterns, and export evidence for compliance reviews.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => exportCsv('audit-logs.csv', auditRows)}>
                    Export Audit Log
                  </Button>
                  <Button variant="outline" onClick={() => store.fetchAll()}>
                    Refresh
                  </Button>
                </div>
              </div>
              <div className="mt-6">
                <DataTable
                  rows={store.auditLogs}
                  columns={[
                    { key: 'action', header: 'Action', render: (row) => row.action_type },
                    { key: 'owner', header: 'User', render: (row) => userName(row.user_id) },
                    { key: 'source', header: 'Target Entity', render: (row) => row.target_entity_type },
                    { key: 'timestamp', header: 'Timestamp', render: (row) => row.timestamp },
                    { key: 'ip', header: 'IP Address', render: (row) => row.ip_address || '-' },
                  ]}
                  emptyTitle="No audit entries yet"
                  emptyDescription="Audit records will appear here as users perform platform actions."
                />
              </div>
            </div>
          </section>
        );

      case 'verify-compliance-checklist':
        return (
          <section className="space-y-6">
            <section className="grid gap-4 md:grid-cols-4">
              <StatCard label="Checklist Items" value={String(store.complianceItems.length)} trend="Current compliance scope" trendDirection="neutral" icon={ClipboardCheck} />
              <StatCard label="Verified" value={String(verifiedComplianceCount)} trend="Approved controls" trendDirection="up" icon={Check} />
              <StatCard label="Pending" value={String(pendingComplianceCount)} trend="Needs review" trendDirection="neutral" icon={Eye} />
              <StatCard label="Exports" value="CSV" trend="Compliance evidence package" trendDirection="neutral" icon={Plus} />
            </section>
            <div className="panel-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Checklist verification</h3>
                  <p className="mt-1 text-sm text-slate-500">Track the verification state of each control and export the current checklist view.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => exportCsv('compliance-checklist.csv', complianceRows)}>
                    Export Checklist
                  </Button>
                  <Button variant="outline" onClick={() => store.fetchAll()}>
                    Refresh
                  </Button>
                </div>
              </div>
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
                          {item.verified ? 'Unverify' : 'Verify Compliance Checklist'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'access-donor-portal':
        return (
          <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <div className="panel-card">
              <h3 className="text-xl font-bold text-slate-900">Dedicated donor portal</h3>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                This use case is now served by the dedicated donor portal route. The portal is read-only for donors and is
                personalized from the donor record linked to the account.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="metric-tile">
                  <span className="eyebrow">Portal Route</span>
                  <strong>/app/donor-portal</strong>
                </div>
                <div className="metric-tile">
                  <span className="eyebrow">Access Mode</span>
                  <strong>Read-only</strong>
                </div>
                <div className="metric-tile">
                  <span className="eyebrow">Personalization</span>
                  <strong>Linked donor record</strong>
                </div>
                <div className="metric-tile">
                  <span className="eyebrow">Primary Views</span>
                  <strong>Giving, receipts, impact, communications</strong>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/app/donor-portal" className="btn btn-primary">
                  Open donor portal
                </Link>
                <Link to="/app/profile" className="btn btn-outline">
                  Update portal profile
                </Link>
              </div>
            </div>
            <PieMetricChart
              title="Donor Portal Focus"
              data={[
                { label: 'Giving', value: 35, color: '#1f6f78' },
                { label: 'Receipts', value: 25, color: '#f59e0b' },
                { label: 'Impact', value: 25, color: '#4caf50' },
                { label: 'Messages', value: 15, color: '#ef4444' },
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
    commonStats,
    currentProfile.actor,
    currentProfile.name,
    currentProfile.email,
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
    testCaseForm.environment,
    testCaseForm.priority,
    testCaseForm.scenario,
    testCaseForm.title,
    uatForm.feedback,
    uatForm.testCase,
    reportForm.name,
    reportForm.period,
    auditForm.action,
    auditForm.source,
    reallocationForm.amount,
    reallocationForm.reason,
    reallocationForm.source,
    reallocationForm.target,
    expenseForm.decisionReason,
    expenseForm.notes,
    expenseForm.requisition,
    scheduleForm.deliveryMethod,
    scheduleForm.frequency,
    scheduleForm.nextRunAt,
    scheduleForm.recipients,
    scheduleForm.reportType,
    documentForm.content,
    documentForm.summary,
    documentForm.title,
    documentForm.version,
    bugForm.description,
    bugForm.environment,
    bugForm.reproductionSteps,
    bugForm.severity,
    bugForm.title,
    releaseForm.changelog,
    releaseForm.environment,
    releaseForm.summary,
    releaseForm.title,
    releaseForm.version,
  ]);

  return <><AppHeader title={useCase.title} summary={useCase.summary} />{content}</>;
}
