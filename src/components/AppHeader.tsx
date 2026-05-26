import { Bell } from 'lucide-react';
import { ACTORS } from '../constants/appModel';
import { useAuthStore } from '../store/authStore';
import { BrandLogo } from './BrandLogo';
import { HighlightedText } from './HighlightedText';

interface AppHeaderProps {
  title: string;
  summary: string;
}

export function AppHeader({ title, summary }: AppHeaderProps) {
  const currentProfile = useAuthStore((state) => state.currentProfile);
  const actor = ACTORS.find((entry) => entry.id === currentProfile?.actor);

  return (
    <header className="panel-card sticky top-0 z-20 mb-6 border-amber-100 bg-white/95 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <BrandLogo compact />
          <div>
            <p className="eyebrow">{actor?.label}</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              <HighlightedText text={title} />
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">{summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative rounded-full border border-amber-200 bg-amber-50 p-3 text-slate-700">
            <Bell size={18} />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              3
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="font-semibold text-slate-900">{currentProfile?.name}</div>
            <div className="text-xs text-slate-500">{currentProfile?.email}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
