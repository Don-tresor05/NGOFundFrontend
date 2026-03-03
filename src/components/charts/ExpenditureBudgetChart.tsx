import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const budgetData = [
  { month: 'Jan', budget: 25000, actual: 22000 },
  { month: 'Feb', budget: 28000, actual: 26500 },
  { month: 'Mar', budget: 30000, actual: 28800 },
  { month: 'Apr', budget: 32000, actual: 31200 },
  { month: 'May', budget: 35000, actual: 33500 },
];

export const ExpenditureBudgetChart: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Expenditure vs Budget</h3>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option>Monthly</option>
          <option>Quarterly</option>
          <option>Yearly</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={budgetData} barCategoryGap={20}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} domain={[0, 40000]} ticks={[0, 5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000]} tickFormatter={(value) => `$${value / 1000}k`} />
          <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="rect"
            wrapperStyle={{ paddingBottom: '10px' }}
          />
          <Bar dataKey="budget" name="Budget" fill="#0ea5e9" />
          <Bar dataKey="actual" name="Actual Expenditure" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};