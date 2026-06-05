import { FormEvent, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { Button } from '../components/Button';
import { HighlightedText } from '../components/HighlightedText';
import { useAuthStore } from '../store/authStore';

type VerifyLocationState = {
  email?: string;
  detail?: string;
};

export function VerifyAccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const verifySignupOtp = useAuthStore((state) => state.verifySignupOtp);
  const resendSignupOtp = useAuthStore((state) => state.resendSignupOtp);
  const { email: initialEmail, detail } = (location.state ?? {}) as VerifyLocationState;
  const [email, setEmail] = useState(initialEmail ?? '');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(detail ?? null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pageSubtitle = useMemo(() => {
    if (email) {
      return `Enter the verification code issued for ${email} to activate the account.`;
    }
    return 'Enter the verification code issued during signup to activate the account.';
  }, [email]);

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await verifySignupOtp(email.trim(), otp.trim());
      setStatusMessage(response.detail);
      setErrorMessage(null);
      navigate('/app/dashboard', { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not verify the account.');
      setStatusMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setErrorMessage('Enter the email address before requesting another OTP.');
      return;
    }
    setIsResending(true);
    try {
      const response = await resendSignupOtp(email.trim());
      setStatusMessage(response.detail);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not resend the OTP.');
      setStatusMessage(null);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-shell auth-shell-wide">
      <div className="auth-layout">
        <section className="auth-hero">
          <div className="auth-hero-card">
            <BrandLogo />
            <p className="eyebrow">Account Verification</p>
            <h1 className="mt-3 text-5xl font-bold text-slate-950">
              <HighlightedText text="Verify the email code to activate the account." />
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Signup creates the account in an inactive state. The verification step confirms ownership of the email address
              before the account is activated.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="metric-tile">
                <span className="eyebrow">Step 1</span>
                <strong>Receive code</strong>
                <p className="mt-2 text-sm text-slate-600">The verification code is delivered by email after signup.</p>
              </div>
              <div className="metric-tile">
                <span className="eyebrow">Step 2</span>
                <strong>Activate account</strong>
                <p className="mt-2 text-sm text-slate-600">Verify the code to unlock the dashboard session.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-panel auth-panel-role">
          <div className="role-auth-banner" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #111827 100%)' }}>
            <div className="mb-6">
              <BrandLogo compact inverse />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">Email Verification</p>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  <HighlightedText text="Activate the new account" />
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">{pageSubtitle}</p>
              </div>
              <div className="role-auth-banner-icon">
                <ShieldCheck size={28} />
              </div>
            </div>
          </div>

          <div className="mt-8 auth-workflow-card">
            <div className="auth-step-card">
              <div className="auth-step-header">
                <div>
                  <p className="section-label">Verify account</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">Enter the verification code</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    The account remains inactive until the code is confirmed.
                  </p>
                </div>
                <span className="auth-step-number">
                  <Mail size={14} />
                </span>
              </div>

              <form onSubmit={handleVerify} className="mt-5 space-y-4">
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

                <label className="form-group">
                  <span className="form-label">Verification Code</span>
                  <input
                    className="form-control"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    placeholder="Enter the 6-digit code"
                    onChange={(event) => setOtp(event.target.value)}
                  />
                </label>

                <Button type="submit" block icon={ArrowRight} disabled={isSubmitting}>
                  {isSubmitting ? 'Verifying account...' : 'Verify and continue'}
                </Button>
              </form>
            </div>

            <div className="mt-4 auth-note-card">
              If you did not receive the code, request a new verification code using the resend action below.
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              <span>Need another code? Request a resend.</span>
              <Button type="button" variant="ghost" onClick={handleResend} disabled={isResending}>
                {isResending ? 'Resending...' : 'Resend code'}
              </Button>
            </div>
          </div>

          {statusMessage ? <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{statusMessage}</div> : null}
          {errorMessage ? <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-600">
            <Link to="/create-account" className="font-semibold text-amber-700">
              Back to signup
            </Link>
            <Link to="/login" className="font-semibold text-amber-700">
              Back to sign in
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
