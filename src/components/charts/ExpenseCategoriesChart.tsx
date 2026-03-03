import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const categoryData = [
  { name: 'Medical', value: 35 },
  { name: 'Payroll', value: 40 },
  { name: 'Operations', value: 15 },
  { name: 'Equipment', value: 7 },
  { name: 'Training', value: 3 },
];

const COLORS = ['#10b981', '#0ea5e9', '#f97316', '#8b5cf6', '#64748b'];

export const ExpenseCategoriesChart: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Expense Categories</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={categoryData} cx="50%" cy="45%" outerRadius={100} paddingAngle={1} dataKey="value">
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value}%`, '']} />
          <Legend 
            verticalAlign="bottom" 
            content={(props) => {
              const { payload } = props;
              return (
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {payload?.slice(0, 3).map((entry: any, index: number) => (
                    <div key={`legend-${index}`} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm text-gray-600">{entry.value}</span>
                    </div>
                  ))}
                  <div className="w-full flex justify-center gap-4 mt-2">
                    {payload?.slice(3).map((entry: any, index: number) => (
                      <div key={`legend-${index + 3}`} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-gray-600">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};