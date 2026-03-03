import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const riskData = [
  { name: 'Low Risk', value: 65, color: '#4CAF50' },
  { name: 'Medium Risk', value: 25, color: '#FF9800' },
  { name: 'High Risk', value: 10, color: '#F44336' },
];

export const RiskAssessmentChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={riskData} cx="50%" cy="50%" outerRadius={100} paddingAngle={2} dataKey="value">
          {riskData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};