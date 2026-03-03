import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const roleData = [
  { name: 'Administrator', value: 5 },
  { name: 'Finance Officer', value: 8 },
  { name: 'Auditor', value: 3 },
  { name: 'Staff', value: 15 },
  { name: 'Donor', value: 17 },
];

const COLORS = ['#FF9800', '#2196F3', '#9C27B0', '#6c757d', '#4CAF50'];

export const UserRoleChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={roleData} cx="50%" cy="50%" outerRadius={100} paddingAngle={2} dataKey="value">
          {roleData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};