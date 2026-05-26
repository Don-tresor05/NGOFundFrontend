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
import { useAuthStore } from '../store/authStore';
import { DashboardStat } from '../types';

const dashboardIcons = [Shield, Coins, BarChart3, Activity, UserRoundCog, Landmark, CheckCircle2];

export function DashboardPage() {
  const currentProfile = useAuthStore((state) => state.currentProfile);

  if (!currentProfile) {
    return null;
  }

  const actor = ACTORS.find((entry) => entry.id === currentProfile.actor);
  const actorUseCases = USE_CASES.filter((entry) => entry.actors.includes(currentProfile.actor));
  const actorModules = PLATFORM_MODULES.map((module) => ({
    ...module,
    useCases: actorUseCases.filter((useCase) => useCase.moduleId === module.id),
  })).filter((module) => module.useCases.length > 0);

  const stats: DashboardStat[] = [
    { label: 'Role Modules', value: String(actorModules.length), trend: 'Module access mapped by role', trendDirection: 'up' },
    { label: 'Role Workflows', value: String(actorUseCases.length), trend: 'Use cases grouped under modules', trendDirection: 'up' },
    { label: 'Active Approvals', value: '12', trend: '3 escalated this morning', trendDirection: 'neutral' },
    { label: 'Outstanding Alerts', value: '3', trend: 'Critical items visible', trendDirection: 'down' },
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
          data={[
            { label: 'Jan', value: 18 },
            { label: 'Feb', value: 24 },
            { label: 'Mar', value: 29 },
            { label: 'Apr', value: 34 },
            { label: 'May', value: 31 },
          ]}
        />
        <PieMetricChart
          title="Workflow Distribution"
          data={[
            { label: 'Approvals', value: 34, color: '#f59e0b' },
            { label: 'Monitoring', value: 28, color: '#1f6f78' },
            { label: 'Reporting', value: 20, color: '#4caf50' },
            { label: 'Profile', value: 18, color: '#ef4444' },
          ]}
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
    </>
  );
}
