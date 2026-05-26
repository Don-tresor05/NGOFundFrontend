import { Link } from 'react-router-dom';
import { HighlightedText } from '../components';

export function NotFoundPage() {
  return (
    <div className="auth-shell">
      <div className="auth-panel text-center">
        <p className="eyebrow">Not Found</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">
          <HighlightedText text="This route is outside the use-case map." />
        </h1>
        <p className="mt-4 text-sm text-slate-600">Return to the product shell and continue from a mapped actor dashboard.</p>
        <div className="mt-8">
          <Link to="/login" className="font-semibold text-amber-700">
            Back to Login into the System
          </Link>
        </div>
      </div>
    </div>
  );
}
