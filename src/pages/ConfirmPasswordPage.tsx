import { FormEvent, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { Button } from '../components/Button';
import { HighlightedText } from '../components/HighlightedText';
import { useAuthStore } from '../store/authStore';

type ResetLocationState = {
  email?: string;
  token?: string;
};

export function ConfirmPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const confirmPasswordReset = useAuthStore((state) => state.confirmPasswordReset);
  const { email, token: initialToken } = (location.state ?? {}) as ResetLocationState;
  const [token, setToken] = useState(initialToken ?? '');
  const [newPassword, setNewPassword] = useState('demo12345');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pageSubtitle = useMemo(() => {
    if (email) {
      return `Confirm the new password for ${email}.`;
    }
    return 'Confirm the token and set a new password.';
  }, [email]);

  const handleConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const message = await confirmPasswordReset(token, newPassword);
      setStatusMessage(message);
      setErrorMessage(null);
      navigate('/login');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not confirm password reset.');
      setStatusMessage(null);
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
              <HighlightedText text="Confirm the reset token." />
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              This page only handles the second step. Use the token from the previous page or from your email and set a new password here.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="metric-tile">
                <span className="eyebrow">Input</span>
                <strong>Reset token</strong>
                <p className="mt-2 text-sm text-slate-600">Paste the token issued during the request step.</p>
              </div>
              <div className="metric-tile">
                <span className="eyebrow">Output</span>
                <strong>New password</strong>
                <p className="mt-2 text-sm text-slate-600">Set the new password and return to login.</p>
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
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">Token Confirmation</p>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  <HighlightedText text="Complete the recovery" />
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
                  {pageSubtitle}
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
                  <p className="section-label">Step 2</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">Confirm password reset</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Enter the token and choose the new password to finish the account recovery.
                  </p>
                </div>
                <span className="auth-step-number">
                  <ShieldCheck size={14} />
                </span>
              </div>

              <form onSubmit={handleConfirm} className="mt-5 space-y-4">
                <label className="form-group">
                  <span className="form-label">Reset Token</span>
                  <input className="form-control" value={token} onChange={(event) => setToken(event.target.value)} />
                </label>
                <label className="form-group">
                  <span className="form-label">New Password</span>
                  <input
                    className="form-control"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                </label>
                <Button type="submit" block>
                  Confirm New Password
                </Button>
              </form>
            </div>

            <div className="mt-4 auth-note-card">
              If you have not requested a token yet, go back to the request page first.
            </div>
          </div>

          {statusMessage ? <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{statusMessage}</div> : null}
          {errorMessage ? <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-600">
            <Link to="/reset-password" className="font-semibold text-amber-700">
              Request a new token
            </Link>
            <Link to="/login" className="font-semibold text-amber-700">
              Back to Login into the System
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
