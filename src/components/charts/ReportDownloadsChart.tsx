import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const downloadData = [
  { name: 'Financial', downloads: 45 },
  { name: 'Donor', downloads: 38 },
  { name: 'Project', downloads: 32 },
  { name: 'Audit', downloads: 28 },
  { name: 'Compliance', downloads: 15 },
];

export const ReportDownloadsChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={downloadData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#6b7280', fontSize: 12, angle: -45, textAnchor: 'end' }}
          height={60}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          domain={[0, 45]}
          ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45]}
        />
        <Tooltip />
        <Bar dataKey="downloads" fill="#FFA726" />
      </BarChart>
    </ResponsiveContainer>
  );
};