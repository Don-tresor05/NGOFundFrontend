import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { HighlightedText } from '../HighlightedText';

interface PieMetricChartProps {
  title: string;
  data: Array<{ label: string; value: number; color: string }>;
}

export function PieMetricChart({ title, data }: PieMetricChartProps) {
  return (
    <div className="panel-card">
      <h3 className="text-lg font-bold text-slate-900">
        <HighlightedText text={title} />
      </h3>
      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={70} outerRadius={110} paddingAngle={3}>
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {data.map((entry) => (
          <div key={entry.label} className="flex items-center gap-2 text-sm text-slate-600">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
