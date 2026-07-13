import { useState, useMemo } from 'react';
import {
  FileText, Plus, Send, Calendar, Filter, Download,
  CheckCircle, XCircle, Clock, RefreshCw, ChevronDown, ChevronUp, X,
  Sparkles,
} from 'lucide-react';
import { useAppDataStore } from '../store/appDataStore';
import { useAuthStore } from '../store/authStore';
import { Report, ReportSchedule } from '../types';

const REPORT_TYPES = [
  'Financial Summary',
  'Donor Funding',
  'Project Utilization',
  'Reconciliation Report',
  'Audit Compliance Report',
];

const fmt = (v: string | number | undefined) =>
  v !== undefined && v !== null && v !== '' ? String(v) : '—';

function SnapshotPanel({ report }: { report: Report }) {
  const snap = report.custom_fields?.snapshot;
  if (!snap) return <p className="text-sm text-gray-400 italic">No snapshot data.</p>;

  const sections: { title: string; data: Record<string, string | number | undefined> }[] = [
    snap.financial_summary && { title: 'Financial Summary', data: snap.financial_summary as any },
    snap.donor_funding && { title: 'Donor Funding', data: snap.donor_funding as any },
    snap.project_utilization && { title: 'Project Utilization', data: snap.project_utilization as any },
    snap.reconciliation_report && { title: 'Reconciliation', data: snap.reconciliation_report as any },
    snap.audit_compliance_report && { title: 'Audit & Compliance', data: snap.audit_compliance_report as any },
  ].filter(Boolean) as any[];

  return (
    <div className="space-y-4 mt-4">
      {sections.map((s) => (
        <div key={s.title} className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">{s.title}</h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            {Object.entries(s.data).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm border-b border-gray-100 py-0.5">
                <span className="text-gray-500 capitalize">{k.replace(/_/g, ' ')}</span>
                <span className="font-medium text-gray-800">{fmt(v as any)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      {snap.budget_lines && snap.budget_lines.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">Budget Lines</h4>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500"><th className="text-left py-1">Line</th><th className="text-right">Allocated</th><th className="text-right">Spent</th><th className="text-right">Remaining</th></tr></thead>
            <tbody>
              {snap.budget_lines.map((bl, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="py-1">{bl.line_name}</td>
                  <td className="text-right">{fmt(bl.allocated_amount)}</td>
                  <td className="text-right">{fmt(bl.spent_amount)}</td>
                  <td className="text-right">{fmt(bl.remaining_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const currentProfile = useAuthStore((s) => s.currentProfile);
  const grants = useAppDataStore((s) => s.grants);
  const reports = useAppDataStore((s) => s.reports);
  const reportSchedules = useAppDataStore((s) => s.reportSchedules);
  const reportDeliveries = useAppDataStore((s) => s.reportDeliveries);
  const users = useAppDataStore((s) => s.users);
  const generateReport = useAppDataStore((s) => s.generateReport);
  const deliverReport = useAppDataStore((s) => s.deliverReport);
  const createReportSchedule = useAppDataStore((s) => s.createReportSchedule);
  const activateReportSchedule = useAppDataStore((s) => s.activateReportSchedule);
  const deactivateReportSchedule = useAppDataStore((s) => s.deactivateReportSchedule);
  const runReportSchedule = useAppDataStore((s) => s.runReportSchedule);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterGrant, setFilterGrant] = useState('');
  const [filterFormat, setFilterFormat] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Generate modal
  const [showGenerate, setShowGenerate] = useState(false);
  const [genType, setGenType] = useState(REPORT_TYPES[0]);
  const [genGrant, setGenGrant] = useState('');
  const [genFormat, setGenFormat] = useState<'PDF' | 'Excel' | 'CSV'>('PDF');
  const [genLoading, setGenLoading] = useState(false);

  // Schedule modal
  const [showSchedule, setShowSchedule] = useState(false);
  const [schedType, setSchedType] = useState(REPORT_TYPES[0]);
  const [schedGrant, setSchedGrant] = useState('');
  const [schedFreq, setSchedFreq] = useState<ReportSchedule['frequency']>('monthly');
  const [schedMethod, setSchedMethod] = useState<ReportSchedule['delivery_method']>('email');
  const [schedEmails, setSchedEmails] = useState('');
  const [schedLoading, setSchedLoading] = useState(false);

  // Detail panel
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [deliverLoading, setDeliverLoading] = useState(false);
  const [deliverDest, setDeliverDest] = useState('');

  // Active tab
  const [tab, setTab] = useState<'reports' | 'schedules' | 'deliveries'>('reports');

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (filterType && r.report_type !== filterType) return false;
      if (filterGrant && String(r.grant_id) !== filterGrant) return false;
      if (filterFormat && r.format !== filterFormat) return false;
      if (filterUser && String(r.generated_by_user_id) !== filterUser) return false;
      if (filterDateFrom && r.created_at < filterDateFrom) return false;
      if (filterDateTo && r.created_at > filterDateTo + 'T23:59:59') return false;
      return true;
    });
  }, [reports, filterType, filterGrant, filterFormat, filterUser, filterDateFrom, filterDateTo]);

  const handleGenerate = async () => {
    if (!genGrant) return;
    setGenLoading(true);
    try {
      await generateReport(genType, Number(genGrant), currentProfile?.id ? Number(currentProfile.id) : 0, genFormat);
      setShowGenerate(false);
    } finally {
      setGenLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!schedEmails.trim()) return;
    setSchedLoading(true);
    try {
      await createReportSchedule({
        report_type: schedType,
        grant: schedGrant ? Number(schedGrant) : null,
        frequency: schedFreq,
        delivery_method: schedMethod,
        recipient_emails: schedEmails,
      });
      setShowSchedule(false);
    } finally {
      setSchedLoading(false);
    }
  };

  const handleDeliver = async () => {
    if (!selectedReport) return;
    setDeliverLoading(true);
    try {
      await deliverReport(selectedReport.report_id, { destination: deliverDest || currentProfile?.email });
      showToast('Report delivered successfully');
    } finally {
      setDeliverLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterType(''); setFilterGrant(''); setFilterFormat('');
    setFilterUser(''); setFilterDateFrom(''); setFilterDateTo('');
  };

  const activeFilters = [filterType, filterGrant, filterFormat, filterUser, filterDateFrom, filterDateTo].filter(Boolean).length;

  const statusIcon = (status: string) => {
    if (status === 'sent') return <CheckCircle size={14} className="text-green-500" />;
    if (status === 'failed') return <XCircle size={14} className="text-red-500" />;
    return <Clock size={14} className="text-yellow-500" />;
  };

  return (
    <div className="page">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg,#0f2942,#1f6f78)' }}>
          <Sparkles size={15} className="text-amber-300" />
          {toast}
        </div>
      )}
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-500 mt-0.5">{filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} · {reportSchedules.length} schedule{reportSchedules.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              <Filter size={15} />
              Filters {activeFilters > 0 && <span className="bg-blue-600 text-white text-xs rounded-full px-1.5">{activeFilters}</span>}
            </button>
            <button onClick={() => setShowSchedule(true)} className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              <Calendar size={15} /> Schedule
            </button>
            <button onClick={() => setShowGenerate(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              <Plus size={15} /> Generate Report
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">All Types</option>
                {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={filterGrant} onChange={(e) => setFilterGrant(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">All Grants</option>
                {grants.map((g) => <option key={g.grant_id} value={g.grant_id}>{g.grant_title}</option>)}
              </select>
              <select value={filterFormat} onChange={(e) => setFilterFormat(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">All Formats</option>
                <option value="PDF">PDF</option>
                <option value="Excel">Excel</option>
                <option value="CSV">CSV</option>
              </select>
              <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">All Users</option>
                {users.map((u) => <option key={u.user_id} value={u.user_id}>{u.full_name}</option>)}
              </select>
              <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="From" />
              <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="To" />
            </div>
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                <X size={12} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-4">
          {(['reports', 'schedules', 'deliveries'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Reports Tab */}
        {tab === 'reports' && (
          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-lg p-12 text-center">
                <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No reports found. Generate your first report.</p>
              </div>
            ) : (
              filteredReports.map((r) => {
                const grant = grants.find((g) => g.grant_id === r.grant_id);
                const user = users.find((u) => u.user_id === r.generated_by_user_id);
                const isOpen = selectedReport?.report_id === r.report_id;
                return (
                  <div key={r.report_id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedReport(isOpen ? null : r)}
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-blue-500 shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{r.report_type}</p>
                          <p className="text-xs text-gray-500">{grant?.grant_title ?? `Grant #${r.grant_id}`} · {user?.full_name ?? `User #${r.generated_by_user_id}`}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">{r.format}</span>
                        <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                      </div>
                    </div>
                    {isOpen && (
                      <div className="border-t border-gray-100 p-4">
                        <div className="flex gap-2 mb-4">
                          <input
                            type="email"
                            placeholder={currentProfile?.email ?? 'Delivery email'}
                            value={deliverDest}
                            onChange={(e) => setDeliverDest(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                          />
                          <button
                            onClick={handleDeliver}
                            disabled={deliverLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                          >
                            <Send size={14} /> {deliverLoading ? 'Sending…' : 'Deliver'}
                          </button>
                          {r.file_url && (
                            <a href={r.file_url} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                              <Download size={14} /> Download
                            </a>
                          )}
                        </div>
                        <SnapshotPanel report={r} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Schedules Tab */}
        {tab === 'schedules' && (
          <div className="space-y-3">
            {reportSchedules.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No schedules yet. Create one to automate report delivery.</p>
              </div>
            ) : (
              reportSchedules.map((s) => {
                const grant = grants.find((g) => g.grant_id === s.grant);
                return (
                  <div key={s.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{s.report_type}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {grant?.grant_title ?? 'All grants'} · {s.frequency} · {s.delivery_method} → {s.recipient_emails}
                      </p>
                      {s.next_run_at && <p className="text-xs text-gray-400 mt-0.5">Next run: {new Date(s.next_run_at).toLocaleString()}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.is_active ? 'Active' : 'Paused'}
                      </span>
                      <button onClick={() => runReportSchedule(s.id)} title="Run now"
                        className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                        <RefreshCw size={14} />
                      </button>
                      {s.is_active
                        ? <button onClick={() => deactivateReportSchedule(s.id)} className="text-xs px-2 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">Pause</button>
                        : <button onClick={() => activateReportSchedule(s.id)} className="text-xs px-2 py-1 border border-green-300 rounded-lg hover:bg-green-50 text-green-700">Activate</button>
                      }
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Deliveries Tab */}
        {tab === 'deliveries' && (
          <div className="space-y-3">
            {reportDeliveries.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Send size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No deliveries yet.</p>
              </div>
            ) : (
              reportDeliveries.map((d) => {
                const report = reports.find((r) => r.report_id === d.report);
                return (
                  <div key={d.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {statusIcon(d.status)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{report?.report_type ?? `Report #${d.report}`}</p>
                        <p className="text-xs text-gray-500">{d.delivery_method} → {d.destination}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.status === 'sent' ? 'bg-green-50 text-green-700' : d.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        {d.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">{d.sent_at ? new Date(d.sent_at).toLocaleString() : new Date(d.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Generate Modal */}
      {showGenerate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold text-gray-900">Generate Report</h2>
              <button onClick={() => setShowGenerate(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select value={genType} onChange={(e) => setGenType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grant <span className="text-red-500">*</span></label>
                <select value={genGrant} onChange={(e) => setGenGrant(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Select a grant…</option>
                  {grants.map((g) => <option key={g.grant_id} value={g.grant_id}>{g.grant_title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <div className="flex gap-2">
                  {(['PDF', 'Excel', 'CSV'] as const).map((f) => (
                    <button key={f} onClick={() => setGenFormat(f)}
                      className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${genFormat === f ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t">
              <button onClick={() => setShowGenerate(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleGenerate} disabled={!genGrant || genLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {genLoading ? 'Generating…' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold text-gray-900">Schedule Report</h2>
              <button onClick={() => setShowSchedule(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select value={schedType} onChange={(e) => setSchedType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grant (optional)</label>
                <select value={schedGrant} onChange={(e) => setSchedGrant(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">All grants</option>
                  {grants.map((g) => <option key={g.grant_id} value={g.grant_id}>{g.grant_title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select value={schedFreq} onChange={(e) => setSchedFreq(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery</label>
                  <select value={schedMethod} onChange={(e) => setSchedMethod(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="email">Email</option>
                    <option value="download">Download</option>
                    <option value="archive">Archive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipients <span className="text-red-500">*</span></label>
                <input type="text" value={schedEmails} onChange={(e) => setSchedEmails(e.target.value)}
                  placeholder="email1@org.com, email2@org.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <p className="text-xs text-gray-400 mt-1">Comma-separated email addresses</p>
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t">
              <button onClick={() => setShowSchedule(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSchedule} disabled={!schedEmails.trim() || schedLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {schedLoading ? 'Saving…' : 'Create Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
