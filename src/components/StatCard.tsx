import React from 'react';
import { LucideIcon, ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgClass: string;
  trend: string;
  trendDirection: 'up' | 'down';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBgClass,
  trend,
  trendDirection,
}) => {
  const trendColor = trendDirection === 'up' ? 'text-[#4CAF50]' : 'text-[#F44336]';
  const TrendIcon = trendDirection === 'up' ? ArrowUp : ArrowDown;

  return (
    <div className="stat-card">
      <div className="flex justify-between items-start mb-4">
        <div className="text-[#6c757d] font-semibold text-sm">{title}</div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${iconBgClass}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="text-3xl font-bold text-[#212529] mb-2 leading-tight">{value}</div>
      <div className={`text-xs flex items-center gap-1 ${trendColor}`}>
        <TrendIcon size={14} />
        {trend}
      </div>
    </div>
  );
};
