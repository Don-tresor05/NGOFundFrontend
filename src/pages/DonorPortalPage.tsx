import { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, CheckCircle2, Coins, RefreshCcw, Search, Tag, Heart, Mail, FileText, Download } from 'lucide-react';
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
  const [showAllProjects, setShowAllProjects] = useState(false);
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
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [showRecurringDonations, setShowRecurringDonations] = useState(false);

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

      {/* Quick Actions Bar */}
      <section className="mt-6 panel-card">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/projects"
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
          >
            <Heart className="h-8 w-8 text-slate-600" />
            <div>
              <div className="font-semibold text-slate-900">Make a Donation</div>
              <div className="text-xs text-slate-600">Support a project</div>
            </div>
          </Link>
          <button
            onClick={() => setShowContactForm(true)}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
          >
            <Mail className="h-8 w-8 text-slate-600" />
            <div>
              <div className="font-semibold text-slate-900">Contact Team</div>
              <div className="text-xs text-slate-600">Send us a message</div>
            </div>
          </button>
          <button
            onClick={() => {
              const anchor = document.createElement('a');
              anchor.href = '#tax-receipts';
              anchor.click();
            }}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
          >
            <FileText className="h-8 w-8 text-slate-600" />
            <div>
              <div className="font-semibold text-slate-900">Tax Receipts</div>
              <div className="text-xs text-slate-600">Download receipts</div>
            </div>
          </button>
          <button
            onClick={() => {
              const anchor = document.createElement('a');
              anchor.href = '#impact-reports';
              anchor.click();
            }}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
          >
            <Download className="h-8 w-8 text-slate-600" />
            <div>
              <div className="font-semibold text-slate-900">Impact Reports</div>
              <div className="text-xs text-slate-600">View your impact</div>
            </div>
          </button>
        </div>
      </section>

      {/* Contact NGO Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Send Message to NGO Team</h3>
            <p className="text-sm text-slate-600 mb-4">We'll get back to you within 24-48 hours.</p>
            <textarea
              className="form-control"
              rows={6}
              placeholder="Your message here..."
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
            />
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() => {
                  if (contactMessage.trim()) {
                    alert(`Message sent to NGO team! We'll contact you at ${currentProfile.email}`);
                    setContactMessage('');
                    setShowContactForm(false);
                  }
                }}
                disabled={!contactMessage.trim()}
              >
                Send Message
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowContactForm(false);
                  setContactMessage('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Panel */}
      <section className="mt-6 panel-card">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Transaction History</h3>
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
        </div>

        {/* Transaction List */}
        <div className="mt-4 space-y-2">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div key={transaction.transaction_id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">
                    {transaction.bank_reference_number}
                  </div>
                  <div className="text-sm text-slate-500">{transaction.transaction_date}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-teal-700">{currency.format(transaction.amount)}</div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    transaction.status === 'reconciled' ? 'bg-green-100 text-green-700' :
                    transaction.status === 'cleared' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {transaction.status || 'pending'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              No transactions found matching your criteria.
            </div>
          )}
        </div>
      </section>

      {/* Tax Receipts Section */}
      <section id="tax-receipts" className="mt-6 panel-card">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Tax Receipts</h3>
        <p className="text-sm text-slate-600 mb-4">Download official tax receipts for your contributions.</p>
        <div className="space-y-2">
          {donorTransactions.length > 0 ? (
            donorTransactions.map((transaction) => (
              <div key={transaction.transaction_id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
                <div>
                  <div className="font-medium text-slate-900">{currency.format(transaction.amount)}</div>
                  <div className="text-sm text-slate-500">{transaction.transaction_date} · {transaction.bank_reference_number}</div>
                </div>
                <Button
                  variant="outline"
                  icon={Download}
                  onClick={() => alert(`Downloading receipt for ${transaction.bank_reference_number}...`)}
                >
                  Download Receipt
                </Button>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              No receipts available yet.
            </div>
          )}
        </div>
      </section>

      {/* My Impact Reports Section */}
      <section id="impact-reports" className="mt-6 panel-card">
        <h3 className="text-xl font-bold text-slate-900 mb-4">My Impact Reports</h3>
        <p className="text-sm text-slate-600 mb-4">View and download reports showing the impact of your contributions.</p>
        <div className="space-y-2">
          {donorReports.length > 0 ? (
            donorReports.map((report) => (
              <div key={report.report_id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
                <div>
                  <div className="font-medium text-slate-900">{(report as any).title || `Report ${report.report_id}`}</div>
                  <div className="text-sm text-slate-500">
                    {report.report_type} · Generated: {(report as any).generated_at || 'N/A'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  icon={Download}
                  onClick={() => {
                    const reportFile = (report as any).file_path;
                    if (reportFile) {
                      window.open(reportFile, '_blank');
                    } else {
                      alert('Report file not available for download yet.');
                    }
                  }}
                >
                  Download Report
                </Button>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              <Download className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>No impact reports available yet.</p>
              <p className="text-xs mt-2">Reports will appear here once your funded projects generate impact data.</p>
            </div>
          )}
        </div>
      </section>

      {/* Recurring Donations Section */}
      <section className="mt-6 panel-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Recurring Donations</h3>
            <p className="text-sm text-slate-600 mt-1">Set up automatic monthly giving to support ongoing work.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowRecurringDonations(!showRecurringDonations)}
          >
            {showRecurringDonations ? 'Hide' : 'Manage'}
          </Button>
        </div>
        
        {showRecurringDonations && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-dashed border-teal-300 bg-teal-50 px-4 py-8 text-center">
              <Heart className="h-12 w-12 mx-auto mb-3 text-teal-400" />
              <p className="text-slate-900 font-semibold mb-2">Set Up Monthly Giving</p>
              <p className="text-sm text-slate-600 mb-4">Support your favorite projects with automatic monthly donations.</p>
              <Button onClick={() => alert('Recurring donation setup coming soon!')}>
                Set Up Monthly Donation
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Suggested Projects Section */}
      <section className="mt-6 panel-card">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Projects You Might Like</h3>
        <p className="text-sm text-slate-600 mb-4">
          {donorProjects.length > 0 
            ? `Based on your support for ${donorProjects[0].name}`
            : 'Explore projects that align with your interests'}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {projects
            .filter((p) => !donorGrantIds.includes(p.grant_id))
            .slice(0, 4)
            .map((project) => {
              const projectBudgetLines = budgetLines.filter((bl) => bl.grant_id === project.grant_id);
              const totalBudget = projectBudgetLines.reduce((sum, bl) => sum + bl.allocated_amount, 0);
              
              return (
                <div key={project.project_id} className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-slate-900 mb-2">{project.name}</h4>
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                    {project.description || 'Making a difference in communities.'}
                  </p>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-slate-600">Budget:</span>
                    <span className="font-semibold text-slate-900">{currency.format(totalBudget)}</span>
                  </div>
                  <Link
                    to="/projects"
                    className="block text-center text-xs font-semibold text-teal-700 hover:text-teal-800 py-2 px-3 rounded-lg border border-teal-200 hover:bg-teal-50 transition-colors"
                  >
                    Learn More & Support
                  </Link>
                </div>
              );
            })}
        </div>
        {projects.filter((p) => !donorGrantIds.includes(p.grant_id)).length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
            You're supporting all available projects! Thank you for your generosity.
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
              <Link to="/projects" className="quick-link-card quick-link-card-compact">
                <span className="block font-semibold text-slate-900">Browse All Projects</span>
                <span className="block text-sm text-slate-500">Explore all running and historical projects.</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* All Projects Section */}
      <section className="mt-8">
        <div className="panel-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Browse All Projects</h2>
              <p className="text-sm text-slate-600 mt-1">
                Explore all running and historical projects. See what we're working on and consider supporting new initiatives.
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowAllProjects(!showAllProjects)}>
              {showAllProjects ? 'Hide' : 'Show All'} ({projects.length})
            </Button>
          </div>

          {showAllProjects && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const projectBudgetLines = budgetLines.filter((bl) => bl.grant_id === project.grant_id);
                const totalBudget = projectBudgetLines.reduce((sum, bl) => sum + bl.allocated_amount, 0);
                const budgetLineIds = projectBudgetLines.map((bl) => bl.budget_line_id);
                const spent = transactions
                  .filter((t) => budgetLineIds.includes(t.budget_line_id))
                  .reduce((sum, t) => sum + t.amount, 0);
                const fundingProgress = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;
                const isFundedByMe = donorGrantIds.includes(project.grant_id);

                return (
                  <div
                    key={project.project_id}
                    className={`rounded-xl border p-4 ${
                      isFundedByMe
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-slate-900 text-sm">{project.name}</h3>
                      {isFundedByMe && (
                        <span className="text-xs font-semibold bg-amber-200 text-amber-900 px-2 py-1 rounded-full">
                          You Fund This
                        </span>
                      )}
                      {!isFundedByMe && (
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          project.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : project.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {project.status}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                      {project.description || 'Transforming lives through sustainable development.'}
                    </p>

                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{project.start_date} - {project.end_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Budget:</span>
                        <span className="font-medium">{currency.format(totalBudget)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Progress:</span>
                        <span className="font-medium">{Math.round(fundingProgress)}%</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#1f6f78] to-[#0f766e]"
                          style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                        />
                      </div>
                    </div>

                    {!isFundedByMe && (
                      <div className="mt-3">
                        <Link
                          to="/projects"
                          className="block text-center text-xs font-semibold text-[#0f766e] hover:text-[#1f6f78] py-2 px-3 rounded-lg border border-[#0f766e] hover:bg-teal-50 transition-colors"
                        >
                          Learn More & Support
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!showAllProjects && (
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">
                Click "Show All" to browse {projects.length} available projects
              </p>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 text-[#0f766e] hover:text-[#1f6f78] font-semibold"
              >
                Or visit the Public Projects Page
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
