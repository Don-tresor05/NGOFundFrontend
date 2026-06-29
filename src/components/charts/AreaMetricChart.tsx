import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { HighlightedText } from '../HighlightedText';

interface AreaMetricChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
}

export function AreaMetricChart({ title, data }: AreaMetricChartProps) {
  return (
    <div className="panel-card">
      <h3 className="text-lg font-bold text-slate-900">
        <HighlightedText text={title} />
      </h3>
      <div className="mt-6 overflow-x-auto">
        <AreaChart width={640} height={288} data={data}>
          <defs>
            <linearGradient id="areaMetricFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#ece8da" vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="#d97706" fill="url(#areaMetricFill)" strokeWidth={3} />
        </AreaChart>
      </div>
    </div>
  );
}
