import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, KeyRound, Mail } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { Button } from '../components/Button';
import { HighlightedText } from '../components/HighlightedText';
import { useAuthStore } from '../store/authStore';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isDev = import.meta.env.DEV;

  const handleRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const request = await requestPasswordReset(email);
      setStatusMessage(request.detail);
      setErrorMessage(null);
      setIssuedToken(request.token ?? null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not request password reset.');
      setStatusMessage(null);
      setIssuedToken(null);
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
            <p className="eyebrow">Password Recovery</p>
            <h1 className="mt-3 text-5xl font-bold text-slate-950">
              <HighlightedText text="Request a reset token first." />
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              This page only handles token request. The password confirmation happens on the next page, keeping the recovery steps separate.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="metric-tile">
                <span className="eyebrow">Action</span>
                <strong>Request token</strong>
                <p className="mt-2 text-sm text-slate-600">Enter the account email and generate a reset token.</p>
              </div>
              <div className="metric-tile">
                <span className="eyebrow">Next</span>
                <strong>Confirm password</strong>
                <p className="mt-2 text-sm text-slate-600">Use the separate confirmation page to set the new password.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-panel auth-panel-role">
          <div className="role-auth-banner" style={{ background: 'linear-gradient(135deg, #d97706 0%, #111827 100%)' }}>
            <div className="mb-6">
              <BrandLogo compact inverse />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">Token Request</p>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  <HighlightedText text="Start the recovery flow" />
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
                  Request the reset token here, then continue to the confirmation page to complete the workflow.
                </p>
              </div>
              <div className="role-auth-banner-icon">
                <KeyRound size={28} />
              </div>
            </div>
          </div>

          <div className="mt-8 auth-workflow-card">
            <div className="auth-step-card">
              <div className="auth-step-header">
                <div>
                  <p className="section-label">Step 1</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">Request reset token</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    The backend creates a short-lived token for the account recovery confirmation page.
                  </p>
                </div>
                <span className="auth-step-number">
                  <Mail size={14} />
                </span>
              </div>

              <form onSubmit={handleRequest} className="mt-5 space-y-4">
                <label className="form-group">
                  <span className="form-label">Email</span>
                  <input
                    className="form-control"
                    type="email"
                    autoComplete="email"
                    value={email}
                    placeholder="name@organization.org"
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                <Button type="submit" block icon={ArrowRight} disabled={isSubmitting}>
                  {isSubmitting ? 'Requesting token...' : 'Request reset token'}
                </Button>
              </form>
            </div>

            <div className="mt-4 auth-note-card">
              Use the confirmation page to set a new password after you receive the reset token.
            </div>

            {issuedToken && isDev ? (
              <div className="mt-4 rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Development helper</p>
                <p className="mt-2 leading-6">
                  A token was issued in this local environment. You can continue to the confirmation page without
                  exposing it in the UI.
                </p>
                <Button
                  type="button"
                  className="mt-4"
                  onClick={() =>
                    navigate('/reset-password/confirm', {
                      state: {
                        email,
                        token: issuedToken,
                      },
                    })
                  }
                >
                  Continue to confirmation
                </Button>
              </div>
            ) : null}
          </div>

          {statusMessage ? <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{statusMessage}</div> : null}
          {errorMessage ? <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-600">
            <span>Remember your password?</span>
            <Link to="/login" className="font-semibold text-amber-700">
              Back to sign in
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
