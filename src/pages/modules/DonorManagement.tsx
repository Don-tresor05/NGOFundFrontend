import React from 'react';
import { Button } from '../../components/Button';
import { StatCard } from '../../components/StatCard';
import { Users, UserCheck, TrendingUp, DollarSign, Download, Plus, RefreshCw, Eye, Edit, Mail, Tag, Upload } from 'lucide-react';

export const DonorManagement: React.FC = () => {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-[#dee2e6] mb-8">
        <h2 className="text-3xl font-bold text-[#212529] m-0">Donor Management Module</h2>
        <p className="text-[#6c757d] text-sm mt-2">Store donor details, track contribution history, manage donor relationships, and automate communications.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Donors"
          value="142"
          icon={Users}
          iconBgClass="bg-[rgba(76,175,80,0.1)] text-[#4CAF50]"
          trend="15 new this month"
          trendDirection="up"
        />
        <StatCard
          title="Active Donors"
          value="128"
          icon={UserCheck}
          iconBgClass="bg-[rgba(76,175,80,0.1)] text-[#4CAF50]"
          trend="90% active rate"
          trendDirection="up"
        />
        <StatCard
          title="Donor Retention"
          value="78%"
          icon={TrendingUp}
          iconBgClass="bg-[rgba(76,175,80,0.1)] text-[#4CAF50]"
          trend="5% improvement"
          trendDirection="up"
        />
        <StatCard
          title="Avg. Donation"
          value="$245"
          icon={DollarSign}
          iconBgClass="bg-[rgba(255,200,87,0.1)] text-[#FFC857]"
          trend="$15 increase"
          trendDirection="up"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-5 border border-[#dee2e6] mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="font-semibold">Filter by:</label>
          <select className="form-control w-40">
            <option>All Donors</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Corporate</option>
            <option>Individual</option>
          </select>
        </div>
        <input type="text" className="form-control w-48" placeholder="Search donors..." />
        <div className="flex-1" />
        <Button icon={Plus}>Add Donor</Button>
        <Button variant="outline" icon={Download}>Export</Button>
      </div>

      {/* Table Section */}
      <div className="table-container mb-8">
        <div className="bg-[#f8f9fa] px-6 py-4 flex justify-between items-center border-b border-[#dee2e6]">
          <h3 className="text-xl font-bold text-[#212529] m-0">Donor Management Table</h3>
          <div className="flex gap-2">
            <Button variant="outline" icon={Upload}>Import</Button>
            <Button variant="outline" icon={RefreshCw}>Refresh</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8f9fa] border-b border-[#dee2e6]">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-[#212529] text-sm">Donor ID</th>
                <th className="px-6 py-4 text-left font-semibold text-[#212529] text-sm">Full Name</th>
                <th className="px-6 py-4 text-left font-semibold text-[#212529] text-sm">Contact</th>
                <th className="px-6 py-4 text-left font-semibold text-[#212529] text-sm">Type</th>
                <th className="px-6 py-4 text-left font-semibold text-[#212529] text-sm">Total Donated</th>
                <th className="px-6 py-4 text-left font-semibold text-[#212529] text-sm">Last Donation</th>
                <th className="px-6 py-4 text-left font-semibold text-[#212529] text-sm">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-[#212529] text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#dee2e6] hover:bg-[rgba(255,200,87,0.02)]">
                <td className="px-6 py-4 text-[#495057]">DON001</td>
                <td className="px-6 py-4 text-[#495057]">Sarah Donor</td>
                <td className="px-6 py-4 text-[#495057]">sarah@email.com</td>
                <td className="px-6 py-4 text-[#495057]">Individual</td>
                <td className="px-6 py-4 text-[#495057]">$2,850</td>
                <td className="px-6 py-4 text-[#495057]">2024-05-15</td>
                <td className="px-6 py-4"><span className="status-badge status-active">Active</span></td>
                <td className="px-6 py-4 flex gap-2">
                  <Button variant="outline" icon={Eye}></Button>
                  <Button variant="outline" icon={Edit}></Button>
                </td>
              </tr>
              <tr className="border-b border-[#dee2e6] hover:bg-[rgba(255,200,87,0.02)]">
                <td className="px-6 py-4 text-[#495057]">DON002</td>
                <td className="px-6 py-4 text-[#495057]">Global Health Fund</td>
                <td className="px-6 py-4 text-[#495057]">contact@ghf.org</td>
                <td className="px-6 py-4 text-[#495057]">Corporate</td>
                <td className="px-6 py-4 text-[#495057]">$15,000</td>
                <td className="px-6 py-4 text-[#495057]">2024-05-14</td>
                <td className="px-6 py-4"><span className="status-badge status-active">Active</span></td>
                <td className="px-6 py-4 flex gap-2">
                  <Button variant="outline" icon={Eye}></Button>
                  <Button variant="outline" icon={Edit}></Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-[#212529] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="action-card">
            <div className="text-4xl mb-3">✉️</div>
            <h4 className="text-[#212529] font-semibold mb-1">Send Bulk Email</h4>
            <p className="text-[#6c757d] text-sm">Communicate with donors</p>
          </div>
          <div className="action-card">
            <div className="text-4xl mb-3">🏷️</div>
            <h4 className="text-[#212529] font-semibold mb-1">Categorize Donors</h4>
            <p className="text-[#6c757d] text-sm">Add tags and categories</p>
          </div>
          <div className="action-card">
            <div className="text-4xl mb-3">📜</div>
            <h4 className="text-[#212529] font-semibold mb-1">View Communication Log</h4>
            <p className="text-[#6c757d] text-sm">Track all interactions</p>
          </div>
          <div className="action-card">
            <div className="text-4xl mb-3">📄</div>
            <h4 className="text-[#212529] font-semibold mb-1">Generate Donor Reports</h4>
            <p className="text-[#6c757d] text-sm">Create detailed reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};
