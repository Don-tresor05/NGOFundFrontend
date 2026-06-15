import { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, CheckCircle2, Coins, RefreshCcw, Search, Upload, Tag, Send } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { AppHeader, Button, StatCard } from '../components';
import { PieMetricChart } from '../components/charts';
import { useAppDataStore } from '../store/appDataStore';
import { useAuthStore } from '../store/authStore';
import { DonorEngagementSummary } from '../types';

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

export function DonorPortalPage() {
  const currentProfile = useAuthStore((state) => state.currentProfile);
  const donors = useAppDataStore((state) => state.donors);
  const grants = useAppDataStore((state) => state.grants);
  const budgetLines = useAppDataStore((state) => state.budgetLines);
  const projects = useAppDataStore((state) => state.projects);
  const transactions = useAppDataStore((state) => state.transactions);
  const reports = useAppDataStore((state) => state.reports);
  const reportDeliveries = useAppDataStore((state) => state.reportDeliveries);
  const updateDonorProfile = useAppDataStore((state) => state.updateDonorProfile);
  const fetchDonorEngagementSummary = useAppDataStore((state) => state.fetchDonorEngagementSummary);
  const [donorSummary, setDonorSummary] = useState<DonorEngagementSummary | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    organization_name: '',
    contact_person: '',
    contact_email: '',
    country: '',
    category: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);
  const [acknowledgmentMessage, setAcknowledgmentMessage] = useState('');

  const actor = currentProfile?.actor;
  const matchedDonor = useMemo(() => {
    if (!currentProfile || actor !== 'donor_user') {
      return null;
    }

    const normalizedEmail = currentProfile.email.trim().toLowerCase();
    const normalizedName = currentProfile.name.trim().toLowerCase();
    return (
      donors.find((donor) => donor.contact_email.trim().toLowerCase() === normalizedEmail) ??
      donors.find((donor) => donor.contact_person.trim().toLowerCase() === normalizedName) ??
      null
    );
  }, [actor, currentProfile, donors]);

  const donorGrantIds = useMemo(
    () => (matchedDonor ? grants.filter((grant) => grant.donor_id === matchedDonor.donor_id).map((grant) => grant.grant_id) : []),
    [grants, matchedDonor]
  );
  const donorBudgetLineIds = useMemo(
    () => budgetLines.filter((line) => donorGrantIds.includes(line.grant_id)).map((line) => line.budget_line_id),
    [budgetLines, donorGrantIds]
  );
  const donorProjects = useMemo(() => projects.filter((project) => donorGrantIds.includes(project.grant_id)), [donorGrantIds, projects]);
  const donorTransactions = useMemo(
    () => transactions.filter((transaction) => donorBudgetLineIds.includes(transaction.budget_line_id)),
    [donorBudgetLineIds, transactions]
  );
  const donorReports = useMemo(() => reports.filter((report) => donorGrantIds.includes(report.grant_id)), [donorGrantIds, reports]);
  const donorDeliveries = useMemo(
    () => reportDeliveries.filter((delivery) => donorReports.some((report) => report.report_id === delivery.report)),
    [donorReports, reportDeliveries]
  );
  const donorCommunications = donorSummary?.recent_communications ?? [];
  
  // Filter and search logic
  const filteredTransactions = useMemo(() => {
    return donorTransactions.filter((transaction) => {
      const matchesSearch = searchQuery === '' || 
        transaction.bank_reference_number.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [donorTransactions, searchQuery, filterStatus]);
  
  const donorExportRows = useMemo(
    () => [
      ...filteredTransactions.map((transaction) => ({
        type: 'transaction',
        reference: transaction.bank_reference_number,
        amount: transaction.amount,
        date: transaction.transaction_date,
        status: transaction.status ?? 'pending',
      })),
      ...donorDeliveries.map((delivery) => ({
        type: 'report_delivery',
        reference: delivery.report,
        amount: '',
        date: delivery.sent_at ?? '',
        status: delivery.status,
      })),
      ...donorCommunications.map((communication) => ({
        type: 'communication',
        reference: communication.subject,
        amount: '',
        date: communication.communication_date,
        status: communication.channel,
      })),
    ],
    [donorCommunications, donorDeliveries, filteredTransactions]
  );

  useEffect(() => {
    let mounted = true;

    if (actor !== 'donor_user' || !matchedDonor) {
      setDonorSummary(null);
      return () => {
        mounted = false;
      };
    }

    setIsRefreshing(true);
    fetchDonorEngagementSummary(matchedDonor.donor_id)
      .then((summary) => {
        if (mounted) {
          setDonorSummary(summary);
        }
      })
      .finally(() => {
        if (mounted) {
          setIsRefreshing(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [actor, fetchDonorEngagementSummary, matchedDonor]);

  useEffect(() => {
    if (matchedDonor) {
      setProfileDraft({
        organization_name: matchedDonor.organization_name,
        contact_person: matchedDonor.contact_person,
        contact_email: matchedDonor.contact_email,
        country: matchedDonor.country,
        category: matchedDonor.category,
      });
    }
  }, [matchedDonor]);

  if (!currentProfile) {
    return null;
  }

  if (actor !== 'donor_user') {
    return <Navigate to="/app/dashboard" replace />;
  }

  const lifetimeGiving = donorTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const activeGrantCount = donorGrantIds.length;
  const communicationChannels = Object.entries(
    (donorSummary?.channels ?? []).reduce<Record<string, number>>((counts, channel) => {
      counts[channel] = (counts[channel] ?? 0) + 1;
      return counts;
    }, {})
  ).map(([label, value]) => ({
    label,
    value,
    color: ['#1f6f78', '#f59e0b', '#4caf50', '#ef4444', '#64748b'][Math.abs(label.length) % 5],
  }));

  return (
    <>
      <AppHeader
        title={matchedDonor?.organization_name ? `${matchedDonor.organization_name} Donor Portal` : 'Donor Portal'}
        summary="A read-only donor-facing portal showing giving history, project impact, receipts, and engagement updates."
      />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Lifetime Giving"
          value={currency.format(lifetimeGiving)}
          trend={matchedDonor ? 'Linked donor record' : 'Waiting for donor matching'}
          trendDirection="up"
          icon={Coins}
        />
        <StatCard
          label="Supported Projects"
          value={String(donorProjects.length)}
          trend="Projects funded through this donor profile"
          trendDirection="up"
          icon={Activity}
        />
        <StatCard
          label="Receipts Ready"
          value={String(donorTransactions.length)}
          trend="Receipts and transaction summaries only"
          trendDirection="neutral"
          icon={CheckCircle2}
        />
        <StatCard
          label="Impact Updates"
          value={String(donorDeliveries.filter((delivery) => delivery.status === 'sent').length)}
          trend="Delivered updates associated with this donor"
          trendDirection="up"
          icon={BarChart3}
        />
      </section>

      {/* Search and Filter Panel */}
      <section className="mt-6 panel-card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions by reference..."
                className="form-control pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <select className="form-control w-48" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="cleared">Cleared</option>
            <option value="reconciled">Reconciled</option>
          </select>
          <Button variant="outline" icon={Upload} onClick={() => setShowBulkImport(!showBulkImport)}>
            Bulk Import
          </Button>
          <Button variant="outline" icon={Send} onClick={() => setShowAcknowledgment(!showAcknowledgment)}>
            Send Acknowledgment
          </Button>
        </div>

        {/* Bulk Import Section */}
        {showBulkImport && (
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <h4 className="font-semibold text-slate-900">Bulk Import Donors</h4>
            <p className="mt-1 text-sm text-slate-600">Upload a CSV file with donor information</p>
            <div className="mt-4 flex items-center gap-3">
              <input
                type="file"
                accept=".csv"
                className="form-control flex-1"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              <Button
                onClick={() => {
                  if (importFile) {
                    alert(`Importing ${importFile.name}... Backend endpoint: POST /api/donors/bulk-import/`);
                    setImportFile(null);
                    setShowBulkImport(false);
                  }
                }}
                disabled={!importFile}
              >
                Import
              </Button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Format: organization_name, contact_person, contact_email, country, category
            </p>
          </div>
        )}

        {/* Auto-Acknowledgment Section */}
        {showAcknowledgment && (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4">
            <h4 className="font-semibold text-slate-900">Send Automated Acknowledgment</h4>
            <p className="mt-1 text-sm text-slate-600">Send thank-you message to {matchedDonor?.organization_name || 'donor'}</p>
            <textarea
              className="form-control mt-3"
              rows={3}
              placeholder="Thank you for your generous contribution..."
              value={acknowledgmentMessage}
              onChange={(e) => setAcknowledgmentMessage(e.target.value)}
            />
            <div className="mt-3 flex gap-2">
              <Button
                onClick={() => {
                  if (matchedDonor && acknowledgmentMessage) {
                    alert(`Sending acknowledgment to ${matchedDonor.contact_email}...`);
                    setAcknowledgmentMessage('');
                    setShowAcknowledgment(false);
                  }
                }}
                disabled={!acknowledgmentMessage}
              >
                Send Email
              </Button>
              <Button variant="ghost" onClick={() => setShowAcknowledgment(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="panel-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Donor portal overview</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  This workspace is read-only. It is linked to the donor record and shows only portfolio, receipt, and impact information.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    exportCsv(
                      `${matchedDonor?.organization_name?.toLowerCase().replace(/\s+/g, '-') ?? 'donor'}-portal.csv`,
                      donorExportRows
                    )
                  }
                >
                  Export Portal Data
                </Button>
                <Button
                  variant="outline"
                  icon={RefreshCcw}
                  onClick={() => matchedDonor && fetchDonorEngagementSummary(matchedDonor.donor_id).then(setDonorSummary)}
                  disabled={!matchedDonor || isRefreshing}
                >
                  {isRefreshing ? 'Refreshing...' : 'Refresh summary'}
                </Button>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="metric-tile">
                <span className="eyebrow">Active Grants</span>
                <strong>{activeGrantCount}</strong>
              </div>
              <div className="metric-tile">
                <span className="eyebrow">Recent Communications</span>
                <strong>{donorCommunications.length}</strong>
              </div>
              <div className="metric-tile">
                <span className="eyebrow">Linked Status</span>
                <strong>{matchedDonor ? 'Verified' : 'Pending match'}</strong>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/app/profile" className="btn btn-outline">
                Update profile
              </Link>
              <Link to="/app/dashboard" className="btn btn-ghost">
                Back to workspace
              </Link>
            </div>
          </div>

          <div className="panel-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Donor profile snapshot</h3>
                <p className="mt-1 text-sm text-slate-600">This portal is read-only and personalized from the linked donor record.</p>
              </div>
              {matchedDonor ? (
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Linked donor record
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  No donor record matched
                </span>
              )}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="metric-tile">
                <span className="eyebrow">Organization</span>
                <strong>{matchedDonor?.organization_name ?? 'Not linked yet'}</strong>
              </div>
              <div className="metric-tile">
                <span className="eyebrow">Primary Contact</span>
                <strong>{matchedDonor?.contact_person ?? currentProfile.name}</strong>
              </div>
              <div className="metric-tile">
                <span className="eyebrow">Portal Email</span>
                <strong>{currentProfile.email}</strong>
              </div>
              <div className="metric-tile">
                <span className="eyebrow">Engagement Score</span>
                <strong>{donorSummary?.engagement_score ?? 'Loading...'}</strong>
              </div>
            </div>
          </div>

          <div className="panel-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Update donor profile</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Keep the donor-side contact details current. Internal status and financial records remain controlled by the platform team.
                </p>
              </div>
              <Button
                variant="outline"
                disabled={!matchedDonor || profileSaving}
                onClick={async () => {
                  if (!matchedDonor) {
                    return;
                  }
                  setProfileSaving(true);
                  try {
                    await updateDonorProfile(profileDraft);
                    setProfileStatus('Donor profile updated successfully.');
                  } finally {
                    setProfileSaving(false);
                  }
                }}
              >
                {profileSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="form-group">
                <span className="form-label">Organization Name</span>
                <input
                  className="form-control"
                  value={profileDraft.organization_name}
                  onChange={(event) => setProfileDraft((state) => ({ ...state, organization_name: event.target.value }))}
                />
              </label>
              <label className="form-group">
                <span className="form-label">Contact Person</span>
                <input
                  className="form-control"
                  value={profileDraft.contact_person}
                  onChange={(event) => setProfileDraft((state) => ({ ...state, contact_person: event.target.value }))}
                />
              </label>
              <label className="form-group">
                <span className="form-label">Contact Email</span>
                <input
                  className="form-control"
                  type="email"
                  value={profileDraft.contact_email}
                  onChange={(event) => setProfileDraft((state) => ({ ...state, contact_email: event.target.value }))}
                />
              </label>
              <label className="form-group">
                <span className="form-label">Country</span>
                <input
                  className="form-control"
                  value={profileDraft.country}
                  onChange={(event) => setProfileDraft((state) => ({ ...state, country: event.target.value }))}
                />
              </label>
              <label className="form-group md:col-span-2">
                <span className="form-label">Category</span>
                <input
                  className="form-control"
                  value={profileDraft.category}
                  onChange={(event) => setProfileDraft((state) => ({ ...state, category: event.target.value }))}
                />
              </label>
            </div>
            {profileStatus ? <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{profileStatus}</div> : null}
            
            {/* Tag Management Section */}
            <div className="mt-6 border-t border-slate-200 pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-5 w-5 text-slate-600" />
                <h4 className="font-semibold text-slate-900">Donor Tags</h4>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    {tag}
                    <button
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {tags.length === 0 && (
                  <span className="text-sm text-slate-500">No tags yet. Add tags to categorize this donor.</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add tag (e.g., major-donor, recurring)"
                  className="form-control flex-1"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newTag.trim()) {
                      setTags([...tags, newTag.trim()]);
                      setNewTag('');
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    if (newTag.trim()) {
                      setTags([...tags, newTag.trim()]);
                      setNewTag('');
                    }
                  }}
                  disabled={!newTag.trim()}
                >
                  Add Tag
                </Button>
              </div>
            </div>
          </div>

          <div className="panel-card">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-slate-900">Recent communications</h3>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {donorSummary?.next_action ?? 'No follow-up needed'}
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {donorCommunications.length > 0 ? (
                donorCommunications.map((communication) => (
                  <div key={communication.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">{communication.subject}</div>
                        <div className="text-sm text-slate-500">{communication.channel} · {communication.communication_date}</div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                        Recorded
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{communication.message}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                  {isRefreshing ? 'Loading donor communications...' : 'No donor communications are linked yet.'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel-card">
            <h3 className="text-xl font-bold text-slate-900">Impact snapshot</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="metric-tile">
                <span className="eyebrow">Projects Supported</span>
                <strong>{donorProjects.length}</strong>
              </div>
              <div className="metric-tile">
                <span className="eyebrow">Reports Delivered</span>
                <strong>{donorDeliveries.filter((delivery) => delivery.status === 'sent').length}</strong>
              </div>
              <div className="metric-tile">
                <span className="eyebrow">Receipts Generated</span>
                <strong>{donorTransactions.length}</strong>
              </div>
              <div className="metric-tile">
                <span className="eyebrow">Last Contact</span>
                <strong>{donorSummary?.last_contact_date ?? 'No contact yet'}</strong>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {donorProjects.slice(0, 4).map((project) => (
                <div key={project.project_id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="font-semibold text-slate-900">{project.name}</div>
                  <div className="text-sm text-slate-500">
                    {project.status} · {project.start_date} to {project.end_date}
                  </div>
                </div>
              ))}
              {donorProjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                  No funded projects are linked to this donor profile yet.
                </div>
              ) : null}
            </div>
          </div>

          {/* Enhanced Engagement Tracking */}
          <div className="panel-card">
            <h3 className="text-xl font-bold text-slate-900">Engagement Tracking</h3>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Engagement Score</span>
                  <span className="text-2xl font-bold text-blue-600">{donorSummary?.engagement_score ?? 0}</span>
                </div>
                <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${Math.min((donorSummary?.engagement_score ?? 0) * 10, 100)}%` }}
                  />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Total Communications</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">{donorCommunications.length}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Channels Used</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">{(donorSummary?.channels ?? []).length}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Avg Response Time</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">N/A</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Next Action</div>
                  <div className="mt-1 text-sm font-medium text-slate-900">{donorSummary?.next_action ?? 'None'}</div>
                </div>
              </div>
            </div>
          </div>

          <PieMetricChart title="Communication Channels" data={communicationChannels} />

          <div className="panel-card">
            <h3 className="text-xl font-bold text-slate-900">Portal actions</h3>
            <div className="mt-5 space-y-3">
              <Link to="/app/profile" className="quick-link-card quick-link-card-compact">
                <span className="block font-semibold text-slate-900">Update portal profile</span>
                <span className="block text-sm text-slate-500">Keep contact details current.</span>
              </Link>
              <Link to="/app/use-cases/view-transaction-summaries" className="quick-link-card quick-link-card-compact">
                <span className="block font-semibold text-slate-900">View transaction summaries</span>
                <span className="block text-sm text-slate-500">Read the donation receipt trail.</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
