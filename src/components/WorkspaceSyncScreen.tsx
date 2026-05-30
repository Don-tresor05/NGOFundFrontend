import {
  CheckCircle2,
  Database,
  LayoutDashboard,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ACTORS } from '../constants/appModel';
import { Profile } from '../types';
import { BrandLogo } from './BrandLogo';
import { Button } from './Button';

interface WorkspaceSyncScreenProps {
  profile: Profile;
  isLoading: boolean;
  apiError: string | null;
  onRetry: () => void;
}

const syncSteps = [
  { label: 'Session verified', description: 'Confirms the authenticated role gateway and token state.', icon: ShieldCheck },
  { label: 'Permissions loaded', description: 'Checks the role-aware routes and module access surface.', icon: LayoutDashboard },
  { label: 'Backend data synced', description: 'Fetches donors, grants, projects, finance, and audit records.', icon: Database },
  { label: 'Workspace activated', description: 'Unlocks the dashboard and use-case workspaces.', icon: CheckCircle2 },
];

export function WorkspaceSyncScreen({ profile, isLoading, apiError, onRetry }: WorkspaceSyncScreenProps) {
  const actor = ACTORS.find((entry) => entry.id === profile.actor);
  const accentColor = actor?.accentColor ?? '#1f6f78';

  return (
    <div className="sync-shell">
      <div className="sync-orb sync-orb-top" />
      <div className="sync-orb sync-orb-bottom" />

      <div className="sync-layout">
        <section className="sync-hero-panel">
          <div className="sync-hero-top">
            <BrandLogo inverse />
            <div className="sync-live-badge">
              <Loader2 size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>{apiError ? 'Connection issue' : isLoading ? 'Synchronizing' : 'Preparing workspace'}</span>
            </div>
          </div>

          <p className="eyebrow text-white/75">Post-login synchronization</p>
          <h1 className="mt-3 max-w-2xl text-5xl font-bold text-white lg:text-6xl">
            {apiError ? 'We hit a loading issue.' : 'Bringing your role workspace online.'}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 lg:text-lg">
            {apiError
              ? 'The session is valid, but the backend data layer did not finish loading. You can retry the sync without signing in again.'
              : 'We are verifying the secure session, loading role permissions, and pulling the operational data needed for your dashboard.'}
          </p>

          <div className="sync-role-card" style={{ borderColor: `${accentColor}55` }}>
            <div className="sync-avatar" style={{ backgroundColor: `${accentColor}22` }}>
              {profile.avatarText}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold uppercase tracking-[0.28em] text-white/65">Current Portal</div>
              <div className="mt-1 text-xl font-bold text-white">{actor?.label ?? profile.actor}</div>
              <div className="mt-1 text-sm leading-6 text-white/75">
                {actor?.dashboardSummary ?? profile.department}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="sync-metric">
              <span className="sync-metric-label">User</span>
              <strong>{profile.name}</strong>
            </div>
            <div className="sync-metric">
              <span className="sync-metric-label">Role</span>
              <strong>{actor?.shortLabel ?? profile.actor}</strong>
            </div>
            <div className="sync-metric">
              <span className="sync-metric-label">Location</span>
              <strong>{profile.location}</strong>
            </div>
          </div>

          <div className="sync-progress-shell">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-bold text-white/90">
                {apiError ? 'Retry required' : isLoading ? 'Syncing backend services' : 'Finalizing workspace'}
              </span>
              <span className="text-white/65">{apiError ? 'Data stream paused' : 'Secure API channel active'}</span>
            </div>
            <div className="sync-progress-track">
              <div className="sync-progress-fill" style={{ background: `linear-gradient(90deg, ${accentColor} 0%, #f4b93f 100%)` }} />
            </div>
          </div>
        </section>

        <section className="sync-status-panel">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Synchronization checklist</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950">Preparing your workspace</h2>
            </div>
            <div className="sync-panel-badge">
              <Sparkles size={14} />
              <span>Secure loading</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {syncSteps.map((step, index) => {
              const Icon = step.icon;
              const isComplete = !apiError && (!isLoading || index < 2);
              const isActive = isLoading && index === 2 && !apiError;

              return (
                <div
                  key={step.label}
                  className={`sync-step ${isComplete ? 'sync-step-complete' : ''} ${isActive ? 'sync-step-active' : ''}`}
                >
                  <div className="sync-step-icon">
                    <Icon size={17} className={isActive ? 'animate-spin' : ''} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold text-slate-900">{step.label}</h3>
                      <span className="sync-step-pill">{isComplete ? 'Ready' : isActive ? 'Syncing' : 'Waiting'}</span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sync-footer-card mt-6">
            {apiError ? (
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-rose-600">Connection error</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{apiError}</p>
                <div className="mt-4">
                  <Button onClick={onRetry} icon={RefreshCcw}>
                    Retry sync
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Loaded modules</div>
                  <div className="mt-2 text-lg font-bold text-slate-900">Role-based workspace</div>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Status</div>
                  <div className="mt-2 text-lg font-bold text-slate-900">
                    {isLoading ? 'Fetching live data' : 'Ready to enter'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
