import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ACTORS,
  ACTOR_FORM_FIELDS,
  ACTOR_LOGIN_IDS,
} from '../constants/appModel';
import { BrandLogo } from '../components/BrandLogo';
import { Button } from '../components/Button';
import { HighlightedText } from '../components/HighlightedText';
import { useAuthStore } from '../store/authStore';
import { Actor } from '../types';

const defaultRoleValues = (actor: Actor) =>
  Object.fromEntries(ACTOR_FORM_FIELDS[actor].map((field) => [field.key, '']));

export function CreateAccountPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [actor, setActor] = useState<Actor>('donor_user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [roleValues, setRoleValues] = useState<Record<string, string>>(() => defaultRoleValues('donor_user'));
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const actorDefinition = useMemo(
    () => ACTORS.find((entry) => entry.id === actor) ?? ACTORS[0],
    [actor]
  );
  const actorFields = ACTOR_FORM_FIELDS[actor];

  const handleActorChange = (nextActor: Actor) => {
    setActor(nextActor);
    setRoleValues(defaultRoleValues(nextActor));
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedName || !trimmedEmail) {
      setFormError('Full name and email are required.');
      return;
    }

    if (trimmedPassword.length < 10) {
      setFormError('Password must be at least 10 characters long.');
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (actorFields.some((field) => !String(roleValues[field.key] ?? '').trim())) {
      setFormError('Complete the role-specific fields before creating the account.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await register({
        actor,
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
        metadata: {
          phone: phone.trim(),
          location: location.trim(),
          ...Object.fromEntries(
            Object.entries(roleValues).map(([key, value]) => [key, String(value).trim()])
          ),
        },
      });
      navigate('/verify-account', {
        replace: true,
        state: {
          email: response.email,
          detail: response.detail,
        },
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Account registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell auth-shell-wide">
      <div className="auth-layout">
        <section className="auth-hero">
          <div className="auth-hero-card">
            <BrandLogo />
            <p className="eyebrow">Create Account</p>
            <h1 className="mt-3 text-5xl font-bold text-slate-950">
              <HighlightedText text="Each actor now has its own intake form." />
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Registration is no longer generic. The fields below change with the selected role so the account
              captures the identity details that matter for that actor’s workflow.
            </p>

            <div className="mt-8 space-y-3">
              {ACTORS.map((entry) => {
                const isActive = entry.id === actor;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => handleActorChange(entry.id)}
                    className={`actor-selector actor-selector-compact ${isActive ? 'actor-selector-active' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-left">
                        <div className="font-bold text-slate-900">{entry.label}</div>
                        <div className="mt-1 text-sm text-slate-600">{entry.registrationSummary}</div>
                      </div>
                      <span className="actor-chip">{entry.accessLabel}</span>
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
            style={{ background: `linear-gradient(135deg, ${actorDefinition.accentColor} 0%, #0f172a 100%)` }}
          >
            <div className="mb-6">
              <BrandLogo compact inverse />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">{actorDefinition.label}</p>
            <h2 className="mt-3 text-3xl font-bold text-white">
              <HighlightedText text="Role-specific account intake" />
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">{actorDefinition.registrationSummary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {actorDefinition.highlights.map((item) => (
                <span key={item} className="role-highlight-pill">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <p className="section-label">Identity</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <label className="form-group">
                  <span className="form-label">Full Name</span>
                  <input className="form-control" value={name} onChange={(event) => setName(event.target.value)} />
                </label>
                <label className="form-group">
                  <span className="form-label">{ACTOR_LOGIN_IDS[actor].label}</span>
                  <input
                    className="form-control"
                    type="email"
                    autoComplete="email"
                    placeholder={ACTOR_LOGIN_IDS[actor].placeholder}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                <label className="form-group">
                  <span className="form-label">Phone</span>
                  <input
                    className="form-control"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+250 788 000 000"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </label>
                <label className="form-group">
                  <span className="form-label">Location</span>
                  <input
                    className="form-control"
                    autoComplete="address-level2"
                    placeholder="Kigali, Rwanda"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                  />
                </label>
                <label className="form-group">
                  <span className="form-label">Password</span>
                  <input
                    className="form-control"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>
                <label className="form-group">
                  <span className="form-label">Confirm Password</span>
                  <input
                    className="form-control"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repeat the password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </label>
              </div>
            </div>

            <div>
              <p className="section-label">{actorDefinition.shortLabel} Form</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {actorFields.map((field) => (
                  <label key={field.key} className="form-group">
                    <span className="form-label">{field.label}</span>
                    {field.type === 'select' ? (
                      <select
                        className="form-control"
                        value={roleValues[field.key] ?? ''}
                        onChange={(event) =>
                          setRoleValues((state) => ({ ...state, [field.key]: event.target.value }))
                        }
                      >
                        <option value="">Select {field.label.toLowerCase()}</option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="form-control"
                        type={field.type}
                        value={roleValues[field.key] ?? ''}
                        placeholder={field.placeholder}
                        onChange={(event) =>
                          setRoleValues((state) => ({ ...state, [field.key]: event.target.value }))
                        }
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="role-preview-grid">
              <div className="role-preview-card">
                <span className="eyebrow">Portal Access</span>
                <strong>{actorDefinition.accessLabel}</strong>
              </div>
              <div className="role-preview-card">
                <span className="eyebrow">Landing Area</span>
                <strong>{actorDefinition.dashboardTitle}</strong>
              </div>
              <div className="role-preview-card">
                <span className="eyebrow">Primary Login ID</span>
                <strong>{ACTOR_LOGIN_IDS[actor].label}</strong>
              </div>
              <div className="role-preview-card">
                <span className="eyebrow">Security Rule</span>
                <strong>Passwords are never prefilled</strong>
              </div>
            </div>

            <div className="auth-note-card">
              After you submit this form, the account stays inactive until you verify from the emailed link or enter the code on the next screen.
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              <span>Use a unique password and confirm it before submitting.</span>
              <Button type="button" variant="ghost" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? 'Hide password' : 'Show password'}
              </Button>
            </div>

            {formError ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

            <Button type="submit" block disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-600">
            <span>Already have access?</span>
            <Link to="/login" className="font-semibold text-amber-700">
              Back to sign in
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
