import {
  Activity,
  BarChart3,
  CheckCircle2,
  Coins,
  Landmark,
  Shield,
  UserRoundCog,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppHeader, HighlightedText, StatCard } from '../components';
import { AreaMetricChart, BarMetricChart, PieMetricChart } from '../components/charts';
import { ACTORS, PLATFORM_MODULES, USE_CASES } from '../constants/appModel';
import { useAppDataStore } from '../store/appDataStore';
import { useAuthStore } from '../store/authStore';
import { DashboardStat } from '../types';

const dashboardIcons = [Shield, Coins, BarChart3, Activity, UserRoundCog, Landmark, CheckCircle2];

export function DashboardPage() {
  const currentProfile = useAuthStore((state) => state.currentProfile);
  const dataReady = useAppDataStore((state) => state.dataReady);
  const systemSettingsSummary = useAppDataStore((state) => state.systemSettingsSummary);
  const donorEngagementDashboard = useAppDataStore((state) => state.donorEngagementDashboard);

  if (!currentProfile) {
    return null;
  }

  const actor = ACTORS.find((entry) => entry.id === currentProfile.actor);
  const actorUseCases = USE_CASES.filter((entry) => entry.actors.includes(currentProfile.actor));
  const actorModules = PLATFORM_MODULES.map((module) => ({
    ...module,
    useCases: actorUseCases.filter((useCase) => useCase.moduleId === module.id),
  })).filter((module) => module.useCases.length > 0);
  const activeApprovals =
    useAppDataStore((state) => state.requisitions.filter((item) => item.status === 'pending').length) +
    useAppDataStore((state) => state.expenseApprovals.filter((item) => item.stage !== 'approved' && item.stage !== 'rejected').length) +
    useAppDataStore((state) => state.reallocationRequests.filter((item) => item.status === 'pending').length);
  const outstandingAlerts =
    useAppDataStore((state) => state.bugReports.filter((item) => item.status !== 'closed').length) +
    useAppDataStore((state) => state.complianceItems.filter((item) => !item.verified).length) +
    useAppDataStore((state) => state.notifications.filter((item) => !item.is_read).length);
  const workflowDistribution = [
    {
      label: 'Approvals',
      value:
        useAppDataStore((state) => state.requisitions.filter((item) => item.status === 'pending').length) +
        useAppDataStore((state) => state.expenseApprovals.filter((item) => item.stage !== 'approved' && item.stage !== 'rejected').length),
    },
    {
      label: 'Monitoring',
      value: useAppDataStore((state) => state.budgetLines.length + state.complianceItems.filter((item) => !item.verified).length),
    },
    {
      label: 'Reporting',
      value: useAppDataStore((state) => state.reports.length + state.reportSchedules.length + state.reportDeliveries.length),
    },
    {
      label: 'Governance',
      value: useAppDataStore((state) => state.users.length + state.notifications.length),
    },
  ];

  const stats: DashboardStat[] = [
    { label: 'Role Modules', value: String(actorModules.length), trend: 'Module access mapped by role', trendDirection: 'up' },
    { label: 'Role Workflows', value: String(actorUseCases.length), trend: 'Use cases grouped under modules', trendDirection: 'up' },
    { label: 'Active Approvals', value: String(activeApprovals), trend: dataReady ? 'Live workflow queue from backend data' : 'Waiting on backend sync', trendDirection: 'neutral' },
    { label: 'Outstanding Alerts', value: String(outstandingAlerts), trend: 'Open issues and unread notices', trendDirection: 'down' },
  ];

  return (
    <>
      <AppHeader title={actor?.dashboardTitle ?? 'Dashboard'} summary={actor?.dashboardSummary ?? ''} />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = dashboardIcons[index % dashboardIcons.length];
          return <StatCard key={stat.label} {...stat} icon={Icon} />;
        })}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <AreaMetricChart
          title="Funding Rhythm"
          data={Array.from({ length: 5 }, (_, index) => {
            const monthDate = new Date();
            monthDate.setMonth(monthDate.getMonth() - (4 - index));
            const label = monthDate.toLocaleString('en-US', { month: 'short' });
            const total = useAppDataStore
              .getState()
              .transactions.filter((transaction) => {
                const date = new Date(`${transaction.transaction_date}T00:00:00`);
                return date.getMonth() === monthDate.getMonth() && date.getFullYear() === monthDate.getFullYear();
              })
              .reduce((sum, transaction) => sum + transaction.amount, 0);
            return { label, value: Math.round(total / 1000) };
          })}
        />
        <PieMetricChart
          title="Workflow Distribution"
          data={workflowDistribution.map((item, index) => ({
            ...item,
            color: ['#f59e0b', '#1f6f78', '#4caf50', '#ef4444'][index],
          }))}
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <BarMetricChart
          title="Weekly Completion Pattern"
          data={[
            { label: 'Mon', value: 9 },
            { label: 'Tue', value: 12 },
            { label: 'Wed', value: 15 },
            { label: 'Thu', value: 11 },
            { label: 'Fri', value: 14 },
          ]}
        />

        <div className="panel-card">
          <h3 className="text-lg font-bold text-slate-900">
            <HighlightedText text="Role Modules" />
          </h3>
          <div className="mt-5 space-y-4">
            {actorModules.map((module) => (
              <div key={module.id} className="module-dashboard-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="eyebrow">{module.useCases.length} workflows</span>
                    <h4 className="mt-1 text-xl font-bold text-slate-900">{module.title}</h4>
                  </div>
                  <span className="module-dashboard-count">{module.uiElements.length}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{module.summary}</p>
                <div className="mt-4 space-y-2">
                  {module.useCases.map((useCase) => (
                    <Link key={`${module.id}-${useCase.id}`} to={`/app/use-cases/${useCase.id}`} className="quick-link-card quick-link-card-compact">
                      <span className="block font-semibold text-slate-900">{useCase.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {(systemSettingsSummary || donorEngagementDashboard) && (
        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          {systemSettingsSummary && (
            <div className="panel-card">
              <h3 className="text-lg font-bold text-slate-900">
                <HighlightedText text="Governance Summary" />
              </h3>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="metric-tile">
                  <span className="eyebrow">Settings</span>
                  <strong>{systemSettingsSummary.total}</strong>
                </div>
                <div className="metric-tile">
                  <span className="eyebrow">Session Timeout</span>
                  <strong>{systemSettingsSummary.access_timeout_minutes} mins</strong>
                </div>
                <div className="metric-tile">
                  <span className="eyebrow">Groups</span>
                  <strong>{Object.keys(systemSettingsSummary.groups).length}</strong>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {Object.entries(systemSettingsSummary.groups).map(([group, count]) => (
                  <div key={group} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{group}</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {donorEngagementDashboard && (
            <div className="panel-card">
              <h3 className="text-lg font-bold text-slate-900">
                <HighlightedText text="Donor Engagement" />
              </h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="metric-tile">
                  <span className="eyebrow">Total Donors</span>
                  <strong>{donorEngagementDashboard.total_donors}</strong>
                </div>
                <div className="metric-tile">
                  <span className="eyebrow">Communications</span>
                  <strong>{donorEngagementDashboard.total_communications}</strong>
                </div>
                <div className="metric-tile">
                  <span className="eyebrow">Active</span>
                  <strong>{donorEngagementDashboard.active_donors}</strong>
                </div>
                <div className="metric-tile">
                  <span className="eyebrow">Inactive</span>
                  <strong>{donorEngagementDashboard.inactive_donors}</strong>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {donorEngagementDashboard.top_donors.map((donor) => (
                  <div key={donor.donor_id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <div className="font-semibold text-slate-900">{donor.organization_name}</div>
                      <div className="text-sm text-slate-500">
                        {donor.communication_count} communications · Last contact {donor.last_contact_date ?? 'none'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Engagement</div>
                      <div className="text-xl font-bold text-slate-900">{donor.engagement_score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}
