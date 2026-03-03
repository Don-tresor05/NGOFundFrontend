import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Cleared', value: 65, color: '#10B981' },
  { name: 'Pending', value: 20, color: '#F59E0B' },
  { name: 'Reconciled', value: 12, color: '#3B82F6' },
  { name: 'Failed', value: 3, color: '#EF4444' },
];

export const TransactionStatus: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {/* Header */}
      <h3 className="text-lg font-bold text-gray-900 mb-6">Transaction Status</h3>

      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="flex flex-col items-center space-y-2">
        <div className="flex space-x-6">
          {data.slice(0, 3).map((item) => (
            <div key={item.name} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700">{item.name}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data[3].color }}
          />
          <span className="text-sm text-gray-700">{data[3].name}</span>
        </div>
      </div>
    </div>
  );
};