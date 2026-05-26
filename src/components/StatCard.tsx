import { LucideIcon, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { DashboardStat, TrendDirection } from '../types';

interface StatCardProps extends DashboardStat {
  icon: LucideIcon;
}

const trendIconMap: Record<TrendDirection, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

export function StatCard({ label, value, trend, trendDirection, icon: Icon }: StatCardProps) {
  const TrendIcon = trendIconMap[trendDirection];

  return (
    <div className="panel-card stat-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">{label}</p>
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className="icon-chip">
          <Icon size={22} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
        <TrendIcon size={16} />
        <span>{trend}</span>
      </div>
    </div>
  );
}
