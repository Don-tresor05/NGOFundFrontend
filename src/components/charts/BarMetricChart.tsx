import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { HighlightedText } from '../HighlightedText';

interface BarMetricChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
}

export function BarMetricChart({ title, data }: BarMetricChartProps) {
  return (
    <div className="panel-card">
      <h3 className="text-lg font-bold text-slate-900">
        <HighlightedText text={title} />
      </h3>
      <div className="mt-6 overflow-x-auto">
        <BarChart width={640} height={288} data={data}>
          <CartesianGrid stroke="#ece8da" vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#1f6f78" radius={[8, 8, 0, 0]} />
        </BarChart>
      </div>
    </div>
  );
}
