import React from 'react';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { DollarSign, Clock, CheckCircle, RefreshCw, Plus, Upload, Download, MoreHorizontal } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const fundFlowData = [
  { month: 'Jan', received: 25000, allocated: 20000 },
  { month: 'Feb', received: 32000, allocated: 27000 },
  { month: 'Mar', received: 38000, allocated: 33000 },
  { month: 'Apr', received: 45000, allocated: 40000 },
  { month: 'May', received: 42000, allocated: 37000 },
];

const statusData = [
  { name: 'Cleared', value: 178290 },
  { name: 'Pending', value: 4250 },
  { name: 'Reconciled', value: 3500 },
  { name: 'Failed', value: 500 },
];

const COLORS = ['#10b981', '#f97316', '#0ea5e9', '#ef4444'];

const transactions = [
  { id: 'TXN-2024-00125', date: '2024-05-15', donor: 'Sarah Donor - Vaccination', amount: 150, currency: 'USD', method: 'Credit Card', status: 'Cleared' },
  { id: 'TXN-2024-00124', date: '2024-05-14', donor: 'Global Health Fund Grant', amount: 15000, currency: 'USD', method: 'Bank Transfer', status: 'Reconciled' },
  { id: 'TXN-2024-00123', date: '2024-05-13', donor: 'ABC Corporation', amount: 5000, currency: 'USD', method: 'Check', status: 'Pending' },
  { id: 'TXN-2024-00122', date: '2024-05-01', donor: 'Robert Johnson - Monthly', amount: 75, currency: 'USD', method: 'Recurring Card', status: 'Cleared' },
];

export const FundTracking: React.FC = () => {
  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-[#dee2e6] mb-8">
        <h2 className="text-3xl font-bold text-[#212529] m-0">Fund Collection & Tracking Module</h2>
        <p className="text-[#6c757d] text-sm mt-2">Record funds received, monitor incoming financial transactions, and track real-time fund flow with multi-currency support.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Funds Received" value="$182,540" icon={DollarSign} iconBgClass="bg-[rgba(255,200,87,0.1)] text-[#FFC857]" trend="12% this month" trendDirection="up" />
        <StatCard title="Pending Transactions" value="$4,250" icon={Clock} iconBgClass="bg-[rgba(255,152,0,0.1)] text-[#FF9800]" trend="Needs review" trendDirection="down" />
        <StatCard title="Cleared Funds" value="$178,290" icon={CheckCircle} iconBgClass="bg-[rgba(76,175,80,0.1)] text-[#4CAF50]" trend="98% cleared" trendDirection="up" />
        <StatCard title="Currency Conversion" value="4" icon={RefreshCw} iconBgClass="bg-[rgba(33,150,243,0.1)] text-[#2196F3]" trend="Multi-currency" trendDirection="up" />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-[#dee2e6] mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-[#212529]">Time Period:</label>
          <select className="border border-[#dee2e6] rounded-lg px-3 py-2 text-sm">
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>Last 6 Months</option>
            <option>Last Year</option>
          </select>
        </div>
        <select className="border border-[#dee2e6] rounded-lg px-3 py-2 text-sm">
          <option>All Status</option>
          <option>Pending</option>
          <option>Cleared</option>
          <option>Reconciled</option>
        </select>
        <select className="border border-[#dee2e6] rounded-lg px-3 py-2 text-sm">
          <option value="RWF">RWF (FRw)</option>
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>
        <div className="flex-1"></div>
        <Button icon={Plus}>Record Fund</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Real-Time Fund Flow</h3>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={fundFlowData}>
              <defs>
                <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke="#f3f4f6" horizontal={true} vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} domain={[0, 50000]} ticks={[0, 5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000]} tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="rect"
                wrapperStyle={{ paddingBottom: '10px' }}
              />
              <Area type="monotone" dataKey="received" name="Funds Received" stroke="#10b981" strokeWidth={2} fill="url(#colorReceived)" dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
              <Area type="monotone" dataKey="allocated" name="Funds Allocated" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorAllocated)" dot={{ fill: '#0ea5e9', r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Transaction Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="45%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value">
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend 
                verticalAlign="bottom" 
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      {payload?.map((entry: any, index: number) => (
                        <div key={`legend-${index}`} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-sm text-gray-600">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] overflow-hidden mb-8">
        <div className="bg-[#f8f9fa] px-6 py-4 flex justify-between items-center border-b border-[#dee2e6]">
          <h3 className="text-xl font-bold text-[#212529] m-0">Recent Financial Transactions</h3>
          <div className="flex gap-2">
            <Button variant="outline" icon={Upload}>Upload Statement</Button>
            <Button variant="outline" icon={Download}>Export</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8f9fa]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Transaction ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Donor/Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Currency</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Payment Method</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-[#dee2e6] hover:bg-[#f8f9fa]">
                  <td className="px-6 py-4 text-sm text-[#495057]">{txn.id}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{txn.date}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{txn.donor}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">${txn.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{txn.currency}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{txn.method}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      txn.status === 'Cleared' || txn.status === 'Reconciled' ? 'bg-[rgba(76,175,80,0.15)] text-[#4CAF50]' : 'bg-[rgba(255,152,0,0.15)] text-[#FF9800]'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="outline" size="sm">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-[#212529] mb-4 pb-3 border-b border-[#dee2e6]">Bank Reconciliation Interface</h3>
      <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] overflow-hidden">
        <div className="bg-[#f8f9fa] px-6 py-4 flex justify-between items-center border-b border-[#dee2e6]">
          <h3 className="text-xl font-bold text-[#212529] m-0">Reconciliation Status</h3>
          <Button icon={RefreshCw}>Reconcile Now</Button>
        </div>
        <div className="p-6">
          <div className="border-2 border-dashed border-[#dee2e6] rounded-lg p-12 text-center hover:border-[#FFC857] hover:bg-[rgba(255,200,87,0.05)] transition-all cursor-pointer">
            <Upload className="w-12 h-12 text-[#6c757d] mx-auto mb-4" />
            <h4 className="text-[#212529] font-semibold mb-2">Upload Bank Statement</h4>
            <p className="text-[#6c757d] mb-4">Drag and drop your bank statement file here or click to browse</p>
            <p className="text-[#6c757d] text-sm">Supported formats: CSV, Excel, PDF</p>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-[#495057]">Matched Transactions</span>
              <span className="font-semibold text-[#212529]">142</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#495057]">Unmatched Transactions</span>
              <span className="font-semibold text-[#F44336]">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#495057]">Total to Reconcile</span>
              <span className="font-semibold text-[#212529]">$182,540</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
