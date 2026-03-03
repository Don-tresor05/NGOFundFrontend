import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const loginData = [
  { day: 'Mon', logins: 25 },
  { day: 'Tue', logins: 32 },
  { day: 'Wed', logins: 28 },
  { day: 'Thu', logins: 35 },
  { day: 'Fri', logins: 42 },
  { day: 'Sat', logins: 18 },
  { day: 'Sun', logins: 15 },
];

export const LoginActivityChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={loginData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="logins" fill="#FF9800" />
      </BarChart>
    </ResponsiveContainer>
  );
};