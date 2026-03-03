import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { ChevronDown } from 'lucide-react';

const data = [
  { month: 'Jan', received: 25000, allocated: 18000 },
  { month: 'Feb', received: 32000, allocated: 22000 },
  { month: 'Mar', received: 28000, allocated: 25000 },
  { month: 'Apr', received: 38000, allocated: 30000 },
  { month: 'May', received: 42000, allocated: 35000 },
];

export const RealTimeFundFlow: React.FC = () => {
  const [timeframe, setTimeframe] = useState('Daily');

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Real-Time Fund Flow</h3>
        <div className="relative">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <YAxis 
              domain={[0, 45000]}
              ticks={[0, 5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="rect"
              wrapperStyle={{ paddingBottom: '20px' }}
            />
            <Area
              type="monotone"
              dataKey="received"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#receivedGradient)"
              name="Funds Received"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            />
            <Area
              type="monotone"
              dataKey="allocated"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#allocatedGradient)"
              name="Funds Allocated"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
            <defs>
              <linearGradient id="receivedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="allocatedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};