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
import { ACTORS, ACTOR_LOGIN_IDS } from '../constants/appModel';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDev = import.meta.env.DEV;

  const actorDefinition = useMemo(
    () => ACTORS.find((entry) => entry.id === actor) ?? ACTORS[0],
    [actor]
  );
  const LoginIcon = actorIcons[actor];

  const handleActorSelect = (nextActor: Actor) => {
    setActor(nextActor);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const authenticated = await login({ actor, email, password });
      if (authenticated) {
        navigate('/app/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell auth-shell-wide auth-shell-login">
      <div className="auth-layout">
        <section className="auth-hero">
          <div className="auth-hero-card">
            <BrandLogo />
            <p className="eyebrow">Secure sign in</p>
            <h1 className="mt-3 text-5xl font-bold text-slate-950">
              <HighlightedText text="Sign in through the correct role portal." />
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Select the workspace that matches your role, then sign in with your own account. The page stays focused on one action and one authenticated entry path.
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
                  autoComplete="email"
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
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              <span>Use your own account credentials for this portal.</span>
              <Button type="button" variant="ghost" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? 'Hide password' : 'Show password'}
              </Button>
            </div>

            {isDev ? (
              <details className="rounded-[1.5rem] border border-amber-100 bg-amber-50/70 px-5 py-4 text-sm text-slate-700">
                <summary className="cursor-pointer font-semibold text-slate-900">Development helper</summary>
                <p className="mt-3 leading-6">
                  Development builds can still use seeded test accounts for local verification, but the production UI keeps that path hidden.
                </p>
              </details>
            ) : null}

            {loginError ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{loginError}</div> : null}

            <Button type="submit" block icon={ArrowRight} disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-600">
            <div className="flex flex-wrap gap-4">
              <span>Need a new secure account?</span>
              <Link to="/create-account" className="font-semibold text-amber-700">
                Create account
              </Link>
            </div>
            <Link to="/reset-password" className="font-semibold text-amber-700">
              Forgot password?
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
