import { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, CheckCircle2, Coins, RefreshCcw, Search, Tag, Heart, Mail, FileText, Download } from 'lucide-react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { AppHeader, Button, StatCard } from '../components';
import { PieMetricChart } from '../components/charts';
import { useAppDataStore } from '../store/appDataStore';
import { useAuthStore } from '../store/authStore';
import { tokenStorage, apiRequest } from '../lib/api';
import { Donor, DonorEngagementSummary } from '../types';

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
  const [searchParams] = useSearchParams();
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
  const [realDonations, setRealDonations] = useState<any[]>([]);
  const [impactReports, setImpactReports] = useState<any[]>([]);
  
  // Check for payment success
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const paymentStatus = searchParams.get('payment');
    
    console.log('Payment params:', { sessionId, paymentStatus });
    
    if (sessionId && paymentStatus === 'success') {
      console.log('Checking payment status...');
      apiRequest(`/payments/check-payment-status/?session_id=${sessionId}`)
        .then((data) => {
          console.log('Payment check response:', data);
          alert('Thank you for your donation! You should receive an email confirmation shortly.');
          window.history.replaceState({}, '', '/app/donor-portal');
        })
        .catch(err => {
          console.error('Payment check failed:', err);
          alert('Payment completed but verification failed. Please contact support.');
        });
    }
  }, [searchParams]);
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
  const [showMessageThread, setShowMessageThread] = useState(false);
  const [showRecurringDonations, setShowRecurringDonations] = useState(false);
  const [recurringAmount, setRecurringAmount] = useState('');
  const [recurringProject, setRecurringProject] = useState('');
  const [recurringStartDate, setRecurringStartDate] = useState('');
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [donationType, setDonationType] = useState<'one-time' | 'recurring'>('one-time');
  const [recurringFrequency, setRecurringFrequency] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');
  const [commTab, setCommTab] = useState<'all' | 'acknowledgments'>('all');
  const [linkedDonor, setLinkedDonor] = useState<Donor | null>(null);
  const donorId = linkedDonor?.donor_id ?? null;

  const actor = currentProfile?.actor;
  const fallbackMatchedDonor = useMemo(() => {
    if (!currentProfile) {
      return null;
    }

    const normalizedEmail = currentProfile.email.trim().toLowerCase();
    const normalizedName = currentProfile.name.trim().toLowerCase();
    return (
      donors.find((donor) => donor.contact_email.trim().toLowerCase() === normalizedEmail) ??
      donors.find((donor) => donor.contact_person.trim().toLowerCase() === normalizedName) ??
      null
    );
  }, [currentProfile, donors]);
  const resolvedDonor = linkedDonor ?? fallbackMatchedDonor;

  const donorGrantIds = useMemo(
    () => (resolvedDonor ? grants.filter((grant) => grant.donor_id === resolvedDonor.donor_id).map((grant) => grant.grant_id) : []),
    [grants, resolvedDonor]
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
  const donorChannels = useMemo(() => {
    const channels = (donorSummary as { channels?: string[] | string } | null)?.channels ?? [];
    if (Array.isArray(channels)) {
      return channels.map((channel) => String(channel)).filter((channel, index, all) => all.indexOf(channel) === index);
    }
    if (typeof channels === 'string') {
      return channels
        .split(',')
        .map((channel) => channel.trim())
        .filter(Boolean)
        .filter((channel, index, all) => all.indexOf(channel) === index);
    }
    return [];
  }, [donorSummary?.channels]);
  const donationProjects = useMemo(() => {
    const names = realDonations
      .map((donation) => donation.project || 'General Fund')
      .filter((name, index, all) => all.indexOf(name) === index);
    return names;
  }, [realDonations]);
  const fundedProjects = useMemo(
    () => projects.filter((project) => donationProjects.includes(project.name)),
    [donationProjects, projects]
  );
  
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
    if (actor !== 'donor_user') {
      setDonorSummary(null);
      setLinkedDonor(null);
      return;
    }

    let mounted = true;
    setIsRefreshing(true);

    const loadDonorContext = async () => {
      const donor = await apiRequest<Donor>('/donors/me/');
      if (!mounted) {
        return;
      }

      const resolvedDonor = donor?.donor_id ? donor : fallbackMatchedDonor;
      if (!resolvedDonor?.donor_id) {
        setLinkedDonor(null);
        setDonorSummary(null);
        return;
      }

      setLinkedDonor(resolvedDonor);
      const summary = await fetchDonorEngagementSummary(resolvedDonor.donor_id);
      if (mounted) {
        setDonorSummary(summary);
      }

      if (mounted) {
        setIsRefreshing(false);
      }
    };
    
    loadDonorContext().finally(() => {
      if (mounted) {
        setIsRefreshing(false);
      }
    });

    const interval = setInterval(() => {
      loadDonorContext().catch((err) => console.error('Failed to refresh donor context:', err));
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [actor, fetchDonorEngagementSummary, fallbackMatchedDonor]);

  useEffect(() => {
    if (!donorId) {
      return;
    }

    let mounted = true;
    apiRequest<{ donations?: any[] }>(`/payments/donor-donations/?donor_id=${donorId}`)
      .then((data) => {
        if (mounted && data?.donations) {
          setRealDonations(data.donations);
          setImpactReports(
            data.donations.map((entry: any) => ({
              id: `impact-${entry.id}`,
              title: entry.project !== 'General Fund' ? `Impact Report: ${entry.project}` : 'General Fund Contribution Report',
              project: entry.project,
              amount: entry.amount,
              date: entry.date,
              report_type: 'Impact Report',
              generated_at: new Date(entry.date).toLocaleDateString(),
            }))
          );
        }
      })
      .catch((err) => console.error('Failed to fetch donations:', err));

    return () => {
      mounted = false;
    };
  }, [donorId]);

  useEffect(() => {
    if (resolvedDonor) {
      setProfileDraft({
        organization_name: resolvedDonor.organization_name,
        contact_person: resolvedDonor.contact_person,
        contact_email: resolvedDonor.contact_email,
        country: resolvedDonor.country,
        category: resolvedDonor.category,
      });
    }
    }, [resolvedDonor]);

  // Debug logging for stats
  useEffect(() => {
    console.log('🔢 Stats Update:', {
      realDonations: realDonations.length,
      projectDonations: realDonations.filter(d => d.project && d.project !== 'General Fund').length,
      impactReports: impactReports.length,
      donorProjects: fundedProjects.length
    });
  }, [realDonations, impactReports, fundedProjects]);

  // Download tax receipt
  const downloadReceipt = (donation: any) => {
    const html = `<!DOCTYPE html><html><head><title>Tax Receipt</title><style>body{font-family:Arial;max-width:800px;margin:40px auto;padding:20px}.header{text-align:center;border-bottom:2px solid #333;padding-bottom:20px;margin-bottom:30px}.amount{font-size:24px;color:#16a34a;font-weight:bold;margin:20px 0}.field{margin:15px 0}.label{font-weight:bold}</style></head><body><div class="header"><h1>Official Tax Receipt</h1><p>Rwanda Paediatric Association NGO</p></div><div class="field"><span class="label">Receipt Date:</span> ${new Date().toLocaleDateString()}</div><div class="field"><span class="label">Donation Date:</span> ${new Date(donation.date).toLocaleDateString()}</div><div class="field"><span class="label">Reference:</span> ${donation.reference}</div><div class="field"><span class="label">Project:</span> ${donation.project}</div><div class="amount">Amount: $${donation.amount}</div><p style="margin-top:30px;padding-top:20px;border-top:1px solid #ccc">This receipt is issued for tax purposes. Please retain for your records.</p></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${donation.reference}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download impact report
  const downloadImpactReport = (report: any) => {
    const html = `<!DOCTYPE html><html><head><title>Impact Report</title><style>body{font-family:Arial;max-width:800px;margin:40px auto;padding:20px}.header{text-align:center;border-bottom:2px solid #1f6f78;padding-bottom:20px;margin-bottom:30px}h1{color:#1f6f78}.section{margin:30px 0;padding:20px;background:#f8fafc;border-radius:8px}.metric{display:inline-block;margin:15px 20px 15px 0}.label{font-size:12px;color:#64748b}.value{font-size:24px;font-weight:bold;color:#1f6f78}</style></head><body><div class="header"><h1>Impact Report</h1><p>Rwanda Paediatric Association NGO</p></div><h2>${report.title}</h2><div class="section"><h3>Your Contribution</h3><div class="metric"><div class="label">Amount Donated</div><div class="value">$${report.amount}</div></div><div class="metric"><div class="label">Date</div><div class="value">${new Date(report.date).toLocaleDateString()}</div></div><div class="metric"><div class="label">Project</div><div class="value">${report.project}</div></div></div><div class="section"><h3>Impact Summary</h3><p>Your generous contribution of $${report.amount} to ${report.project} is making a meaningful difference in our community.</p><p><strong>Thank you for your continued support!</strong></p></div><p style="margin-top:40px;padding-top:20px;border-top:1px solid #ccc;font-size:12px;color:#64748b">Generated: ${new Date().toLocaleString()}</p></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impact-report-${report.project.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!currentProfile) {
    return null;
  }

  if (actor !== 'donor_user') {
    return <Navigate to="/app/dashboard" replace />;
  }

  const lifetimeGiving = realDonations.reduce((sum, d) => sum + d.amount, 0) || donorTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const activeGrantCount = donationProjects.filter((name) => name !== 'General Fund').length;
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
        title={resolvedDonor?.organization_name ? `${resolvedDonor.organization_name} Donor Portal` : 'Donor Portal'}
        summary="A read-only donor-facing portal showing giving history, project impact, receipts, and engagement updates."
      />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Lifetime Giving"
          value={currency.format(lifetimeGiving)}
          trend={resolvedDonor ? 'Linked donor record' : 'Waiting for donor matching'}
          trendDirection="up"
          icon={Coins}
        />
        <StatCard
          label="Supported Projects"
          value={String(fundedProjects.length)}
          trend="Projects funded through this donor profile"
          trendDirection="up"
          icon={Activity}
        />
        <StatCard
          label="Receipts Ready"
          value={String(realDonations.length)}
          trend="Receipts and transaction summaries only"
          trendDirection="neutral"
          icon={CheckCircle2}
        />
        <StatCard
          label="Impact Updates"
          value={String(impactReports.length)}
          trend="Delivered updates associated with this donor"
          trendDirection="up"
          icon={BarChart3}
        />
      </section>

      {/* Quick Actions Bar */}
      <section className="mt-6 panel-card">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => setShowDonationForm(true)}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
          >
            <Heart className="h-8 w-8 text-slate-600" />
            <div>
              <div className="font-semibold text-slate-900">Make a Donation</div>
              <div className="text-xs text-slate-600">Support a project</div>
            </div>
          </button>
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

      {/* Donation Form Modal */}
      {showDonationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Make a Donation</h3>
            <p className="text-sm text-slate-600 mb-6">Support our projects with a secure donation via Stripe</p>
            
            {/* Donation Type */}
            <div className="mb-4">
              <label className="form-label">Donation Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDonationType('one-time')}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    donationType === 'one-time'
                      ? 'border-slate-900 bg-slate-50 text-slate-900'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  One-Time
                </button>
                <button
                  onClick={() => setDonationType('recurring')}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    donationType === 'recurring'
                      ? 'border-slate-900 bg-slate-50 text-slate-900'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  Recurring
                </button>
              </div>
            </div>

            {/* Recurring Frequency */}
            {donationType === 'recurring' && (
              <div className="mb-4">
                <label className="form-label">Frequency</label>
                <select
                  className="form-control"
                  value={recurringFrequency}
                  onChange={(e) => setRecurringFrequency(e.target.value as any)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            )}

            {/* Project Selection */}
            <div className="mb-4">
              <label className="form-label">Select Project</label>
              <select
                className="form-control"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">General Fund</option>
                {donorProjects.map((project) => (
                  <option key={project.project_id} value={project.project_id}>
                    {project.name}
                  </option>
                ))}
                {projects
                  .filter((p) => !donorGrantIds.includes(p.grant_id))
                  .map((project) => (
                    <option key={project.project_id} value={project.project_id}>
                      {project.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="form-label">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">$</span>
                <input
                  type="number"
                  className="form-control pl-8"
                  placeholder="100.00"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  min="1"
                  step="0.01"
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="mb-6">
              <div className="grid grid-cols-4 gap-2">
                {['25', '50', '100', '250'].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDonationAmount(amount)}
                    className="p-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            {donationAmount && (
              <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">
                    {donationType === 'recurring' ? `${recurringFrequency} donation` : 'One-time donation'}
                  </span>
                  <span className="font-bold text-lg text-slate-900">${donationAmount}</span>
                </div>
                {selectedProject && (
                  <div className="text-xs text-slate-500">
                    to {projects.find(p => p.project_id.toString() === selectedProject)?.name || 'Selected Project'}
                  </div>
                )}
              </div>
            )}

            {/* Test Card Info */}
            <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-2 mb-2">
                <div className="text-blue-600 text-sm">💳</div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Test Card for Payment</p>
                  <p className="text-xs text-blue-700 mt-1">Use these details on the Stripe checkout page:</p>
                </div>
              </div>
              <div className="mt-2 space-y-1 text-xs font-mono bg-white p-3 rounded border border-blue-200">
                <div className="flex justify-between">
                  <span className="text-slate-600">Card:</span>
                  <span className="font-bold text-slate-900">4242 4242 4242 4242</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Expiry:</span>
                  <span className="font-bold text-slate-900">12/34</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">CVC:</span>
                  <span className="font-bold text-slate-900">123</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={async () => {
                  if (!donationAmount || parseFloat(donationAmount) <= 0) {
                    alert('Please enter a valid amount');
                    return;
                  }
                  
                  if (!resolvedDonor) {
                    alert('Donor information not found. Please update your profile.');
                    return;
                  }
                  
                  try {
                    const data = await apiRequest<{ checkout_url: string }>('/payments/create-checkout-session/', {
                      method: 'POST',
                      body: JSON.stringify({
                        amount: parseFloat(donationAmount),
                        donor_id: resolvedDonor.donor_id,
                        project_id: selectedProject ? parseInt(selectedProject) : null,
                        donation_type: donationType,
                        frequency: donationType === 'recurring' ? recurringFrequency : undefined
                      }),
                    });

                    // Redirect to Stripe Checkout
                    window.location.href = data.checkout_url;
                  } catch (error: any) {
                    alert(`Error: ${error.message || 'Failed to process donation'}`);
                  }
                }}
                disabled={!donationAmount}
              >
                Proceed to Payment
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDonationForm(false);
                  setDonationAmount('');
                  setSelectedProject('');
                  setDonationType('one-time');
                }}
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-slate-500 mt-4 text-center">
              🔒 Secure payment processed by Stripe
            </p>
          </div>
        </div>
      )}

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
                onClick={async () => {
                  if (contactMessage.trim() && resolvedDonor) {
                    try {
                      await apiRequest('/donor-communications/', {
                        method: 'POST',
                        body: JSON.stringify({
                          donor_id: resolvedDonor.donor_id,
                          channel: 'donor_portal',
                          subject: 'Message from Donor Portal',
                          message: contactMessage,
                          communication_date: new Date().toISOString(),
                        }),
                      });
                      alert(`Message sent to NGO team! We'll contact you at ${currentProfile.email}`);
                      setContactMessage('');
                      setShowContactForm(false);
                    } catch (err) {
                      console.error('Failed to send message:', err);
                      alert('Failed to send message. Please try again or contact us directly.');
                    }
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
          {(realDonations.length > 0 || filteredTransactions.length > 0) ? (
            (realDonations.length > 0 ? realDonations : filteredTransactions).map((item: any, idx: number) => (
              <div key={item.id || item.transaction_id || idx} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">
                    {item.reference || item.bank_reference_number}
                  </div>
                  <div className="text-sm text-slate-500">
                    {item.date ? new Date(item.date).toLocaleDateString() : item.transaction_date}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">{item.project || 'General Fund'}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-teal-700">${item.amount}</div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                    completed
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

      {/* Donation History Timeline */}
      <section className="mt-6 panel-card">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Donation History Timeline</h3>
        <p className="text-sm text-slate-600 mb-6">Visual timeline of your contributions over time</p>
        
        {(realDonations.length > 0 || donorTransactions.length > 0) ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200"></div>
            
            {/* Timeline items */}
            <div className="space-y-6">
              {(realDonations.length > 0 ? realDonations : donorTransactions)
                .map((item: any, index: number) => {
                  const amount = item.amount;
                  const date = item.date || item.transaction_date;
                  const projectName = item.project || 'General Fund';
                  const reference = (item.reference || item.bank_reference_number || '').substring(0, 30);
                  
                  return (
                    <div key={item.id || item.transaction_id || index} className="relative flex items-start gap-4 pl-16">
                      {/* Timeline dot */}
                      <div className="absolute left-6 top-2 w-4 h-4 rounded-full bg-teal-600 border-4 border-white ring-2 ring-slate-200"></div>
                      
                      {/* Content */}
                      <div className="flex-1 rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-lg text-slate-900">
                                ${amount}
                              </span>
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                                completed
                              </span>
                            </div>
                            <div className="text-sm text-slate-600 mb-2">
                              to {projectName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {new Date(date).toLocaleDateString()} · Ref: {reference}
                            </div>
                          </div>
                          {index === 0 && (
                            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded">
                              Most Recent
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {/* Timeline end marker */}
            <div className="relative flex items-center gap-4 pl-16 mt-6">
              <div className="absolute left-6 w-4 h-4 rounded-full bg-slate-300 border-4 border-white"></div>
              <div className="text-sm text-slate-500 italic">Start of giving history</div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
            <p>No donation history yet.</p>
            <p className="text-xs mt-2">Your donations will appear here as a visual timeline.</p>
          </div>
        )}
      </section>

      {/* Tax Receipts Section */}
      <section id="tax-receipts" className="mt-6 panel-card">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Tax Receipts</h3>
        <p className="text-sm text-slate-600 mb-4">Download official tax receipts for your contributions.</p>
        <div className="space-y-2">
          {(realDonations.length > 0 || donorTransactions.length > 0) ? (
            (realDonations.length > 0 ? realDonations : donorTransactions).map((item: any, idx: number) => (
              <div key={item.id || item.transaction_id || idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
                <div>
                  <div className="font-medium text-slate-900">${item.amount}</div>
                  <div className="text-sm text-slate-500">
                    {item.date ? new Date(item.date).toLocaleDateString() : item.transaction_date} · {item.reference || item.bank_reference_number}
                  </div>
                </div>
                <Button
                  variant="outline"
                  icon={Download}
                  onClick={() => downloadReceipt(item)}
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
          {(impactReports.length > 0 || donorReports.length > 0) ? (
            (impactReports.length > 0 ? impactReports : donorReports).map((report: any) => (
              <div key={report.id || report.report_id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
                <div>
                  <div className="font-medium text-slate-900">{report.title || `Report ${report.report_id}`}</div>
                  <div className="text-sm text-slate-500">
                    {report.report_type} · Generated: {report.generated_at || 'N/A'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  icon={Download}
                  onClick={() => downloadImpactReport(report)}
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
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h4 className="font-semibold text-slate-900 mb-4">Set Up Recurring Donation</h4>
              
              {/* Amount */}
              <div className="mb-4">
                <label className="form-label">Monthly Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">$</span>
                  <input
                    type="number"
                    className="form-control pl-8"
                    placeholder="25.00"
                    min="5"
                    step="5"
                    value={recurringAmount}
                    onChange={(e) => setRecurringAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="mb-4">
                <div className="grid grid-cols-4 gap-2">
                  {['10', '25', '50', '100'].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setRecurringAmount(amount)}
                      className="p-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    >
                      ${amount}/mo
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Selection */}
              <div className="mb-4">
                <label className="form-label">Support Project</label>
                <select 
                  className="form-control"
                  value={recurringProject}
                  onChange={(e) => setRecurringProject(e.target.value)}
                >
                  <option value="">General Fund</option>
                  {projects.map((project) => (
                    <option key={project.project_id} value={project.project_id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div className="mb-4">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  min={new Date().toISOString().split('T')[0]}
                  value={recurringStartDate}
                  onChange={(e) => setRecurringStartDate(e.target.value)}
                />
              </div>

              {/* Payment Method Info */}
              <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-900 font-medium mb-1">Automatic Payments</p>
                <p className="text-xs text-blue-700">
                  Your card will be charged automatically each month. You can pause or cancel anytime.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={async () => {
                    if (!recurringAmount || parseFloat(recurringAmount) < 5) {
                      alert('Please enter a valid monthly amount (minimum $5)');
                      return;
                    }
                    
                    if (!resolvedDonor) {
                      alert('Donor information not found. Please update your profile.');
                      return;
                    }
                    
                    try {
                      const response = await fetch('http://localhost:8000/api/payments/create-checkout-session/', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${tokenStorage.access}`
                        },
                        body: JSON.stringify({
                          amount: parseFloat(recurringAmount),
                          donor_id: resolvedDonor.donor_id,
                          project_id: recurringProject ? parseInt(recurringProject) : null,
                          donation_type: 'recurring',
                          frequency: 'monthly'
                        })
                      });
                      
                      if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Failed to create subscription');
                      }
                      
                      const data = await response.json();
                      
                      // Redirect to Stripe Checkout
                      window.location.href = data.url;
                    } catch (error: any) {
                      alert(`Error: ${error.message || 'Failed to set up recurring donation'}`);
                    }
                  }}
                  disabled={!recurringAmount}
                >
                  Set Up Monthly Giving
                </Button>
                <Button variant="ghost" onClick={() => setShowRecurringDonations(false)}>
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-slate-500 mt-4 text-center">
                🔒 Secure subscription managed by Stripe
              </p>
            </div>

            {/* Existing Recurring Donations (Empty State) */}
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-600">You don't have any active recurring donations yet.</p>
              <p className="text-xs text-slate-500 mt-1">Set up your first monthly donation above.</p>
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
                      `${resolvedDonor?.organization_name?.toLowerCase().replace(/\s+/g, '-') ?? 'donor'}-portal.csv`,
                      donorExportRows
                    )
                  }
                >
                  Export Portal Data
                </Button>
                <Button
                  variant="outline"
                  icon={RefreshCcw}
                  onClick={() => {
                    if (!donorId) {
                      return;
                    }
                    fetchDonorEngagementSummary(donorId).then(setDonorSummary);
                  }}
                  disabled={!donorId || isRefreshing}
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
                <strong>{resolvedDonor ? 'Verified' : 'Pending match'}</strong>
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
              {resolvedDonor ? (
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
                <strong>{resolvedDonor?.organization_name ?? 'Not linked yet'}</strong>
              </div>
              <div className="metric-tile">
                <span className="eyebrow">Primary Contact</span>
                <strong>{resolvedDonor?.contact_person ?? currentProfile.name}</strong>
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
                disabled={!resolvedDonor || profileSaving}
                onClick={async () => {
                  if (!resolvedDonor) {
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
              <h3 className="text-xl font-bold text-slate-900">Communications & Acknowledgments</h3>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {donorSummary?.next_action ?? 'No follow-up needed'}
              </span>
            </div>

            {/* Tab Navigation */}
            <div className="mt-4 flex gap-2 border-b border-slate-200">
              <button 
                onClick={() => setCommTab('all')}
                className={`px-4 py-2 text-sm font-medium ${commTab === 'all' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All Communications
              </button>
              <button 
                onClick={() => setCommTab('acknowledgments')}
                className={`px-4 py-2 text-sm font-medium ${commTab === 'acknowledgments' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Acknowledgments
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {commTab === 'acknowledgments' ? (
                // Show only acknowledgments
                realDonations.length > 0 ? (
                  realDonations.map((donation: any) => (
                    <div key={`ack-${donation.id}`} className="rounded-2xl border border-green-200 bg-green-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-900">Thank You for Your Donation</div>
                          <div className="text-sm text-slate-500">Email · {new Date(donation.date).toLocaleDateString()}</div>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-green-200 px-3 py-1 text-xs font-semibold text-green-800">
                          Sent
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        Thank you for your generous donation of ${donation.amount} to {donation.project}. Your support helps us continue our mission.
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                    No acknowledgments yet. Make a donation to receive a thank you!
                  </div>
                )
              ) : (
                // Show all communications
                <>
              {/* Acknowledgments (when donations are made) */}
              {donorTransactions.slice(0, 3).map((transaction) => (
                <div key={`ack-${transaction.transaction_id}`} className="rounded-2xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">Thank You for Your Donation</div>
                      <div className="text-sm text-slate-500">Email · {transaction.transaction_date}</div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-green-200 px-3 py-1 text-xs font-semibold text-green-800">
                      Sent
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Thank you for your generous donation of {currency.format(transaction.amount)}. 
                    Your contribution is making a real difference in our mission. 
                    A receipt has been sent to your email for tax purposes.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <span className="text-xs text-slate-500">Ref: {transaction.bank_reference_number}</span>
                  </div>
                </div>
              ))}

              {/* Regular Communications */}
              {donorCommunications.length > 0 ? (
                (() => {
                  const unreadReplies = (donorCommunications as Array<{ id: number; channel: string; is_read?: boolean }>).filter(
                    (c) => c.channel === 'staff_reply' && !c.is_read
                  );
                  const hasUnread = unreadReplies.length > 0;
                  
                  return (
                    <div 
                      onClick={() => {
                        setShowMessageThread(!showMessageThread);
                        if (!showMessageThread && hasUnread) {
                          // Mark as read when opening
                          unreadReplies.forEach((reply) => {
                            apiRequest(`/donor-communications/${reply.id}/`, {
                              method: 'PATCH',
                              body: JSON.stringify({ is_read: true }),
                            });
                          });
                        }
                      }}
                      className="rounded-2xl border border-slate-200 bg-white p-4 cursor-pointer hover:border-blue-400 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold text-slate-900">Your Messages</div>
                          {hasUnread && (
                            <span className="inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                              {unreadReplies.length} new {unreadReplies.length === 1 ? 'reply' : 'replies'}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400">{showMessageThread ? '▼' : '►'}</span>
                      </div>
                      {showMessageThread && (
                        <div className="space-y-3 max-h-96 overflow-y-auto mt-4" onClick={(e) => e.stopPropagation()}>
                          {donorCommunications.slice().sort((a, b) => 
                            new Date(a.communication_date).getTime() - new Date(b.communication_date).getTime()
                          ).map((communication) => (
                            <div key={communication.id} className={`flex ${communication.channel === 'staff_reply' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] rounded-lg p-3 ${
                                communication.channel === 'staff_reply' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-slate-100 text-slate-900'
                              }`}>
                                <div className="text-xs opacity-75 mb-1">
                                  {communication.channel === 'staff_reply' ? 'Staff' : 'You'} · {new Date(communication.communication_date).toLocaleString('en-US', { 
                                    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' 
                                  })}
                                </div>
                                <div className="font-medium text-sm">{communication.subject}</div>
                                <div className="text-sm mt-1">{communication.message}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                  {isRefreshing ? 'Loading donor communications...' : 'No donor communications are linked yet.'}
                </div>
              )}
              </>
              )}

              {/* Info Message */}
              {donorTransactions.length > 0 && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <p className="text-xs text-blue-900">
                    <strong>Automated Acknowledgments:</strong> You'll receive a thank-you email automatically 
                    after each donation is processed. These messages include your receipt and impact details.
                  </p>
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
                <strong>{fundedProjects.length}</strong>
              </div>
              <div className="metric-tile">
                <span className="eyebrow">Reports Delivered</span>
                <strong>{impactReports.length}</strong>
              </div>
              <div className="metric-tile">
                <span className="eyebrow">Receipts Generated</span>
                <strong>{realDonations.length}</strong>
              </div>
              <div className="metric-tile">
                <span className="eyebrow">Last Contact</span>
                <strong>{donorSummary?.last_contact_date ?? 'No contact yet'}</strong>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {fundedProjects.map((project) => (
                <div key={project.project_id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="font-semibold text-slate-900">{project.name}</div>
                  <div className="text-sm text-slate-500">
                    {project.status} · {project.start_date} to {project.end_date}
                  </div>
                </div>
              ))}
              {fundedProjects.length === 0 ? (
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
                  <div className="mt-1 text-xl font-bold text-slate-900">{donorChannels.length}</div>
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
