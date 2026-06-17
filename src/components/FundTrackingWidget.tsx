import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, PieChart, RefreshCw } from 'lucide-react';
import { apiRequest } from '../lib/api';

interface FundData {
  totalBudget: number;
  totalExpenditure: number;
  available: number;
  utilization: number;
  projectAllocations: Array<{
    project: string;
    allocated: number;
    spent: number;
  }>;
  donorContributions: Array<{
    donor: string;
    amount: number;
  }>;
}

export default function FundTrackingWidget() {
  const [data, setData] = useState<FundData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [projects, transactions] = await Promise.all([
        apiRequest('/projects/'),
        apiRequest('/transactions/')
      ]);

      const projectsData = Array.isArray(projects) ? projects : projects.results || [];
      const transData = Array.isArray(transactions) ? transactions : transactions.results || [];

      const totalBudget = projectsData.reduce((sum: number, p: any) => sum + parseFloat(p.total_budget || 0), 0);
      const totalExpenditure = transData
        .filter((t: any) => t.transaction_type === 'EXPENDITURE')
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);

      const projectAllocations = projectsData.slice(0, 5).map((p: any) => ({
        project: p.name,
        allocated: parseFloat(p.total_budget || 0),
        spent: transData
          .filter((t: any) => t.project === p.id && t.transaction_type === 'EXPENDITURE')
          .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0)
      }));

      const donorMap = new Map();
      transData
        .filter((t: any) => t.transaction_type === 'COLLECTION')
        .forEach((t: any) => {
          const donor = t.donor_name || 'Unknown';
          donorMap.set(donor, (donorMap.get(donor) || 0) + parseFloat(t.amount || 0));
        });

      const donorContributions = Array.from(donorMap.entries())
        .map(([donor, amount]) => ({ donor, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      setData({
        totalBudget,
        totalExpenditure,
        available: totalBudget - totalExpenditure,
        utilization: totalBudget > 0 ? (totalExpenditure / totalBudget) * 100 : 0,
        projectAllocations,
        donorContributions
      });
    } catch (error) {
      console.error('Error fetching fund data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>;
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Real-time Fund Tracking</h2>
        <button onClick={fetchData} className="text-blue-600 hover:text-blue-800">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Budget</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(data.totalBudget)}</p>
            </div>
            <DollarSign className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Expenditure</p>
              <p className="text-2xl font-bold text-red-900">{formatCurrency(data.totalExpenditure)}</p>
            </div>
            <TrendingUp className="text-red-500" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Available</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(data.available)}</p>
            </div>
            <PieChart className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Utilization</p>
              <p className="text-2xl font-bold text-purple-900">{data.utilization.toFixed(1)}%</p>
            </div>
            <div className="text-purple-500 text-2xl font-bold">{Math.round(data.utilization)}%</div>
          </div>
        </div>
      </div>

      {/* Budget vs Expenditure Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Budget Utilization</span>
          <span className="text-gray-600">{formatCurrency(data.totalExpenditure)} / {formatCurrency(data.totalBudget)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(data.utilization, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Project Allocations */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Top Projects by Allocation</h3>
        <div className="space-y-2">
          {data.projectAllocations.map((proj, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-gray-700 flex-1">{proj.project}</span>
              <span className="text-gray-900 font-medium mx-4">{formatCurrency(proj.allocated)}</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${Math.min((proj.spent / proj.allocated) * 100, 100)}%` }}
                ></div>
              </div>
              <span className="text-gray-500 ml-2 w-16 text-right">{((proj.spent / proj.allocated) * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Donor Contributions */}
      <div>
        <h3 className="font-semibold mb-3">Top Donor Contributions</h3>
        <div className="space-y-2">
          {data.donorContributions.map((donor, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{donor.donor}</span>
              <span className="text-gray-900 font-medium">{formatCurrency(donor.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-right">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
