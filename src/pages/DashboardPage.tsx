import {
  Activity,
  BarChart3,
  CheckCircle2,
  Coins,
  Landmark,
  Shield,
  UserRoundCog,
} from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
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
  const transactions = useAppDataStore((state) => state.transactions);
  const requisitions = useAppDataStore((state) => state.requisitions);
  const reports = useAppDataStore((state) => state.reports);
  const bugReports = useAppDataStore((state) => state.bugReports);
  const actorId = currentProfile?.actor;
  const actor = actorId ? ACTORS.find((entry) => entry.id === actorId) : undefined;
  const actorUseCases = actorId ? USE_CASES.filter((entry) => entry.actors.includes(actorId)) : [];
  const actorModules = actorId
    ? PLATFORM_MODULES.map((module) => ({
        ...module,
        useCases: actorUseCases.filter((useCase) => useCase.moduleId === module.id),
      })).filter((module) => module.useCases.length > 0)
    : [];
  const pendingRequisitionCount = useAppDataStore((state) => state.requisitions.filter((item) => item.status === 'pending').length);
  const activeExpenseApprovalCount = useAppDataStore(
    (state) => state.expenseApprovals.filter((item) => item.stage !== 'approved' && item.stage !== 'rejected').length
  );
  const pendingReallocationCount = useAppDataStore((state) => state.reallocationRequests.filter((item) => item.status === 'pending').length);
  const openBugCount = useAppDataStore((state) => state.bugReports.filter((item) => item.status !== 'closed').length);
  const unverifiedComplianceCount = useAppDataStore((state) => state.complianceItems.filter((item) => !item.verified).length);
  const unreadNotificationCount = useAppDataStore((state) => state.notifications.filter((item) => !item.is_read).length);
  const budgetLineCount = useAppDataStore((state) => state.budgetLines.length);
  const reportCount = useAppDataStore((state) => state.reports.length);
  const reportScheduleCount = useAppDataStore((state) => state.reportSchedules.length);
  const reportDeliveryCount = useAppDataStore((state) => state.reportDeliveries.length);
  const userCount = useAppDataStore((state) => state.users.length);
  const approvedRequisitionCount = useAppDataStore((state) => state.requisitions.filter((item) => item.status === 'approved').length);
  const approvedExpenseApprovalCount = useAppDataStore((state) => state.expenseApprovals.filter((item) => item.stage === 'approved').length);
  const matchedStatementLines = useAppDataStore((state) => state.bankStatementLines.filter((line) => line.matched).length);
  const approvedTestCaseCount = useAppDataStore((state) => state.testCases.filter((testCase) => testCase.status === 'approved').length);
  const approvedUatFeedbackCount = useAppDataStore((state) => state.uatFeedback.filter((feedback) => feedback.status === 'closed').length);
  const deliverySuccessCount = useAppDataStore((state) => state.reportDeliveries.filter((delivery) => delivery.status === 'sent').length);
  const deliveryFailureCount = useAppDataStore((state) => state.reportDeliveries.filter((delivery) => delivery.status === 'failed').length);
  const reconciliationSuccessRate = useAppDataStore((state) => {
    const total = state.bankStatementLines.length;
    return total ? Math.round((state.bankStatementLines.filter((line) => line.matched).length / total) * 100) : 0;
  });
  const deliverySuccessRate = useAppDataStore((state) => {
    const total = state.reportDeliveries.length;
    return total ? Math.round((state.reportDeliveries.filter((delivery) => delivery.status === 'sent').length / total) * 100) : 0;
  });
  const qaReadinessRate = useAppDataStore((state) => {
    const total = state.testCases.length;
    return total ? Math.round((state.testCases.filter((testCase) => testCase.status === 'approved').length / total) * 100) : 0;
  });
  const weeklyActivity = Array.from({ length: 5 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (4 - index));
    const label = day.toLocaleDateString('en-US', { weekday: 'short' });
    const dayKey = day.toISOString().slice(0, 10);
    const value =
      transactions.filter((transaction) => transaction.created_at.startsWith(dayKey)).length +
      requisitions.filter((requisition) => requisition.created_at.startsWith(dayKey)).length +
      reports.filter((report) => report.created_at.startsWith(dayKey)).length +
      bugReports.filter((bug) => bug.created_at.startsWith(dayKey)).length;
    return { label, value };
  });

  const activeApprovals = actorId ? pendingRequisitionCount + activeExpenseApprovalCount + pendingReallocationCount : 0;
  const outstandingAlerts = actorId ? openBugCount + unverifiedComplianceCount + unreadNotificationCount : 0;
  const workflowDistribution = actorId
    ? [
        {
          label: 'Approvals',
          value: pendingRequisitionCount + activeExpenseApprovalCount,
        },
        {
          label: 'Monitoring',
          value: budgetLineCount + unverifiedComplianceCount,
        },
        {
          label: 'Reporting',
          value: reportCount + reportScheduleCount + reportDeliveryCount,
        },
        {
          label: 'Governance',
          value: userCount + unreadNotificationCount,
        },
      ]
    : [];

  const stats: DashboardStat[] = actorId
    ? [
        { label: 'Role Modules', value: String(actorModules.length), trend: 'Module access mapped by role', trendDirection: 'up' },
        { label: 'Role Workflows', value: String(actorUseCases.length), trend: 'Use cases grouped under modules', trendDirection: 'up' },
        { label: 'Active Approvals', value: String(activeApprovals), trend: dataReady ? 'Live workflow queue from backend data' : 'Waiting on backend sync', trendDirection: 'neutral' },
        { label: 'Outstanding Alerts', value: String(outstandingAlerts), trend: 'Open issues and unread notices', trendDirection: 'down' },
      ]
    : [];

  if (!currentProfile) {
    return null;
  }

  if (currentProfile.actor === 'donor_user') {
    return <Navigate to="/app/donor-portal" replace />;
  }

  return (
    <>
      <AppHeader title={actor?.dashboardTitle ?? 'Dashboard'} summary={actor?.dashboardSummary ?? ''} />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = dashboardIcons[index % dashboardIcons.length];
          return <StatCard key={stat.label} {...stat} icon={Icon} />;
        })}
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Approval Clearance"
          value={String(approvedRequisitionCount + approvedExpenseApprovalCount)}
          trend="Approved requisitions and expense approvals"
          trendDirection="up"
          icon={CheckCircle2}
        />
        <StatCard
          label="Reconciliation Success"
          value={`${reconciliationSuccessRate}%`}
          trend={`${matchedStatementLines} matched statement lines`}
          trendDirection="up"
          icon={Landmark}
        />
        <StatCard
          label="Delivery Success"
          value={`${deliverySuccessRate}%`}
          trend={`${deliverySuccessCount} sent · ${deliveryFailureCount} failed`}
          trendDirection="up"
          icon={Activity}
        />
        <StatCard
          label="QA Readiness"
          value={`${qaReadinessRate}%`}
          trend={`${approvedTestCaseCount} approved test cases · ${approvedUatFeedbackCount} closed UAT items`}
          trendDirection="up"
          icon={Shield}
        />
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
          data={weeklyActivity}
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

      {systemSettingsSummary && (
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
        </section>
      )}
    </>
  );
}
