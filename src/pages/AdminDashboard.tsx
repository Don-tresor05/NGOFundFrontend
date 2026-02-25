import React from 'react';
import { Button } from '../components/Button';
import { StatCard } from '../components/StatCard';
import { TrendingUp, Users, FileText, Shield, Download, RotateCcw, Eye, Settings, Eye as EyeIcon } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-[#dee2e6] mb-8">
        <h2 className="text-3xl font-bold text-[#212529] m-0">Dashboard & Transparency Portal</h2>
        <p className="text-[#6c757d] text-sm mt-2">Centralized visibility into all funding operations, financial transparency dashboards, and real-time metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Funds Managed"
          value="$182,540"
          icon={TrendingUp}
          iconBgClass="bg-[rgba(255,200,87,0.1)] text-[#FFC857]"
          trend="12% this month"
          trendDirection="up"
        />
        <StatCard
          title="Active Donors"
          icon={Users}
          value="142"
          iconBgClass="bg-[rgba(76,175,80,0.1)] text-[#4CAF50]"
          trend="15 new this month"
          trendDirection="up"
        />
        <StatCard
          title="Active Projects"
          icon={FileText}
          value="12"
          iconBgClass="bg-[rgba(53,49,76,0.1)] text-[#2d2b55]"
          trend="3 new this month"
          trendDirection="up"
        />
        <StatCard
          title="Transparency Score"
          icon={Shield}
          value="A+"
          iconBgClass="bg-[rgba(255,152,0,0.1)] text-[#FF9800]"
          trend="Excellent"
          trendDirection="up"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-[#212529] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="action-card">
            <div className="text-4xl mb-3">👁️</div>
            <h4 className="text-[#212529] font-semibold mb-1">Public Portal</h4>
            <p className="text-[#6c757d] text-sm">View public transparency dashboard</p>
          </div>
          <div className="action-card">
            <div className="text-4xl mb-3">🔔</div>
            <h4 className="text-[#212529] font-semibold mb-1">Alerts Center</h4>
            <p className="text-[#6c757d] text-sm">Manage system alerts</p>
          </div>
          <div className="action-card">
            <div className="text-4xl mb-3">⚙️</div>
            <h4 className="text-[#212529] font-semibold mb-1">Customize Layout</h4>
            <p className="text-[#6c757d] text-sm">Arrange dashboard widgets</p>
          </div>
          <div className="action-card">
            <div className="text-4xl mb-3">📥</div>
            <h4 className="text-[#212529] font-semibold mb-1">Export Dashboard</h4>
            <p className="text-[#6c757d] text-sm">Download current view</p>
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] overflow-hidden">
        <div className="bg-[#f8f9fa] px-6 py-4 flex justify-between items-center border-b border-[#dee2e6]">
          <h3 className="text-xl font-bold text-[#212529] m-0">Recent Activity Feed</h3>
          <Button variant="outline" icon={RotateCcw}>
            Refresh
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#e9ecef] flex items-center justify-center text-lg">💝</div>
            <div className="flex-1">
              <div className="font-semibold text-[#212529]">New donation received</div>
              <div className="text-sm text-[#6c757d]">Sarah Donor donated $150 to Child Vaccination Program</div>
              <div className="text-xs text-[#6c757d] mt-1">2024-05-15 14:30</div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#e9ecef] flex items-center justify-center text-lg">📑</div>
            <div className="flex-1">
              <div className="font-semibold text-[#212529]">Project fund allocated</div>
              <div className="text-sm text-[#6c757d]">$5,000 allocated to Hospital Equipment Upgrade project</div>
              <div className="text-xs text-[#6c757d] mt-1">2024-05-15 13:45</div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#e9ecef] flex items-center justify-center text-lg">👤</div>
            <div className="flex-1">
              <div className="font-semibold text-[#212529]">New donor registered</div>
              <div className="text-sm text-[#6c757d]">Robert Johnson registered as new donor</div>
              <div className="text-xs text-[#6c757d] mt-1">2024-05-15 12:20</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
