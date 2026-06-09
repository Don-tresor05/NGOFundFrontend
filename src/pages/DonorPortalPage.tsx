import { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, CheckCircle2, Coins, RefreshCcw } from 'lucide-react';
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
  const fetchDonorEngagementSummary = useAppDataStore((state) => state.fetchDonorEngagementSummary);
  const [donorSummary, setDonorSummary] = useState<DonorEngagementSummary | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  const donorExportRows = useMemo(
    () => [
      ...donorTransactions.map((transaction) => ({
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
    [donorCommunications, donorDeliveries, donorTransactions]
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
