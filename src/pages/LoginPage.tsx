import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeDollarSign,
  Briefcase,
  Building2,
  FolderKanban,
  ShieldCheck,
  Telescope,
  WalletCards,
} from 'lucide-react';
import { ACTORS, ACTOR_LOGIN_IDS, DEMO_ACCOUNTS } from '../constants/appModel';
import { BrandLogo } from '../components/BrandLogo';
import { Button } from '../components/Button';
import { HighlightedText } from '../components/HighlightedText';
import { useAuthStore } from '../store/authStore';
import { Actor } from '../types';

const actorIcons = {
  super_administrator: ShieldCheck,
  finance_officer: BadgeDollarSign,
  field_staff: Briefcase,
  project_manager: FolderKanban,
  executive_director: Building2,
  external_auditor: Telescope,
  donor_user: WalletCards,
} as const;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loginError = useAuthStore((state) => state.loginError);
  const [actor, setActor] = useState<Actor>('super_administrator');
  const [email, setEmail] = useState('superadmin@ngofund.org');
  const [password, setPassword] = useState('demo12345');

  const actorDefinition = useMemo(
    () => ACTORS.find((entry) => entry.id === actor) ?? ACTORS[0],
    [actor]
  );
  const demoAccount = useMemo(
    () => DEMO_ACCOUNTS.find((entry) => entry.actor === actor),
    [actor]
  );
  const LoginIcon = actorIcons[actor];

  const handleActorSelect = (nextActor: Actor) => {
    setActor(nextActor);
    const account = DEMO_ACCOUNTS.find((entry) => entry.actor === nextActor);
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const authenticated = await login({ actor, email, password });
    if (authenticated) {
      navigate('/app/dashboard');
    }
  };

  return (
    <div className="auth-shell auth-shell-wide auth-shell-login">
      <div className="auth-layout">
        <section className="auth-hero">
          <div className="auth-hero-card">
            <BrandLogo />
            <p className="eyebrow">Login into the System</p>
            <h1 className="mt-3 text-5xl font-bold text-slate-950">
              <HighlightedText text="Choose the portal that matches the actor." />
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Each actor enters through a different operational lens. The authentication experience now starts by
              selecting the correct role gateway, not by dumping every user into one generic form.
            </p>

            <div className="mt-8 grid gap-3 md:grid-cols-2">
              {ACTORS.map((entry) => {
                const Icon = actorIcons[entry.id];
                const isActive = entry.id === actor;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => handleActorSelect(entry.id)}
                    className={`actor-selector ${isActive ? 'actor-selector-active' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="actor-selector-icon"
                        style={{ backgroundColor: `${entry.accentColor}18`, color: entry.accentColor }}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-bold text-slate-900">{entry.label}</span>
                          <span className="actor-chip">{entry.accessLabel}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{entry.loginSummary}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="auth-panel auth-panel-role">
          <div
            className="role-auth-banner"
            style={{ background: `linear-gradient(135deg, ${actorDefinition.accentColor} 0%, #111827 100%)` }}
          >
            <div className="mb-6">
              <BrandLogo compact inverse />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">{actorDefinition.accessLabel}</p>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  <HighlightedText text={actorDefinition.loginTitle} />
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">{actorDefinition.loginSummary}</p>
              </div>
              <div className="role-auth-banner-icon">
                <LoginIcon size={28} />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {actorDefinition.highlights.map((item) => (
                <span key={item} className="role-highlight-pill">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="form-group">
                <span className="form-label">Selected Portal</span>
                <div className="role-preview">
                  <span className="font-semibold text-slate-900">{actorDefinition.label}</span>
                  <span className="text-sm text-slate-500">{actorDefinition.shortLabel}</span>
                </div>
              </label>

              <label className="form-group">
                <span className="form-label">{ACTOR_LOGIN_IDS[actor].label}</span>
                <input
                  className="form-control"
                  value={email}
                  placeholder={ACTOR_LOGIN_IDS[actor].placeholder}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
            </div>

            <label className="form-group">
              <span className="form-label">Password</span>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <div className="demo-credential-card">
              <div>
                <div className="text-sm font-bold text-slate-900">Demo credentials for this role</div>
                <div className="mt-1 text-sm text-slate-600">
                  {demoAccount?.email} <span className="mx-2 text-slate-300">|</span> password: <strong>demo12345</strong>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if (demoAccount) {
                    setEmail(demoAccount.email);
                    setPassword(demoAccount.password);
                  }
                }}
              >
                Use Demo Credentials
              </Button>
            </div>

            {loginError ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{loginError}</div> : null}

            <Button type="submit" block icon={ArrowRight}>
              Login into the System
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-600">
            <span>Need a fresh role-specific account intake?</span>
            <Link to="/create-account" className="font-semibold text-amber-700">
              Create Account
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
