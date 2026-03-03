import React from 'react';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { TrendingUp, PieChart, FolderKanban, CalendarCheck, Plus, History, Download, Eye, Calendar } from 'lucide-react';

const projects = [
  { id: 'PROJ-2024-001', name: 'Child Vaccination Program', category: 'Healthcare', budget: 50000, allocated: 42500, utilized: 35250, utilizedPercent: 83, startDate: '2024-01-15', endDate: '2024-12-31', color: '#4CAF50' },
  { id: 'PROJ-2024-002', name: 'Healthcare Worker Training', category: 'Education', budget: 25000, allocated: 18750, utilized: 14500, utilizedPercent: 77, startDate: '2024-02-01', endDate: '2024-11-30', color: '#2196F3' },
  { id: 'PROJ-2024-003', name: 'Child Nutrition Program', category: 'Healthcare', budget: 30000, allocated: 22500, utilized: 18750, utilizedPercent: 83, startDate: '2024-03-15', endDate: '2024-12-15', color: '#4CAF50' },
  { id: 'PROJ-2024-004', name: 'Hospital Equipment Upgrade', category: 'Infrastructure', budget: 75000, allocated: 45000, utilized: 28500, utilizedPercent: 63, startDate: '2024-04-01', endDate: '2025-03-31', color: '#FF9800' },
];

const disbursements = [
  { title: 'Vaccination Program - Q3 Disbursement', amount: 12500, date: 'July 15, 2024' },
  { title: 'Training Program - Monthly Salary', amount: 8200, date: 'June 1, 2024' },
];

export const ProjectAllocation: React.FC = () => {
  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-[#dee2e6] mb-8">
        <h2 className="text-3xl font-bold text-[#212529] m-0">Project Fund Allocation Module</h2>
        <p className="text-[#6c757d] text-sm mt-2">Assign funds to specific projects, track disbursement progress, monitor budget adherence, and manage fund reallocation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Allocated" value="$145,750" icon={TrendingUp} iconBgClass="bg-[rgba(255,200,87,0.1)] text-[#FFC857]" trend="8% this quarter" trendDirection="up" />
        <StatCard title="Budget Utilization" value="78%" icon={PieChart} iconBgClass="bg-[rgba(53,49,76,0.1)] text-[#2d2b55]" trend="On track" trendDirection="up" />
        <StatCard title="Active Projects" value="12" icon={FolderKanban} iconBgClass="bg-[rgba(53,49,76,0.1)] text-[#2d2b55]" trend="3 new" trendDirection="up" />
        <StatCard title="Avg. Disbursement" value="94%" icon={CalendarCheck} iconBgClass="bg-[rgba(255,200,87,0.1)] text-[#FFC857]" trend="Timely" trendDirection="up" />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-[#dee2e6] mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-[#212529]">Filter by:</label>
          <select className="border border-[#dee2e6] rounded-lg px-3 py-2 text-sm">
            <option>All Projects</option>
            <option>Healthcare</option>
            <option>Education</option>
            <option>Infrastructure</option>
            <option>Emergency</option>
          </select>
        </div>
        <select className="border border-[#dee2e6] rounded-lg px-3 py-2 text-sm">
          <option>All Status</option>
          <option>Planning</option>
          <option>Active</option>
          <option>Completed</option>
        </select>
        <div className="flex-1"></div>
        <Button icon={Plus}>Allocate Funds</Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] overflow-hidden mb-8">
        <div className="bg-[#f8f9fa] px-6 py-4 flex justify-between items-center border-b border-[#dee2e6]">
          <h3 className="text-xl font-bold text-[#212529] m-0">Project Fund Allocation</h3>
          <div className="flex gap-2">
            <Button variant="outline" icon={History}>View History</Button>
            <Button variant="outline" icon={Download}>Export Allocation</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8f9fa]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Project ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Project Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Total Budget</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Allocated</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Utilized</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Start Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">End Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Disbursement Progress</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-[#dee2e6] hover:bg-[#f8f9fa]">
                  <td className="px-6 py-4 text-sm text-[#495057]">{project.id}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{project.name}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{project.category}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">${project.budget.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">${project.allocated.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">${project.utilized.toLocaleString()} ({project.utilizedPercent}%)</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{project.startDate}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{project.endDate}</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-[#e9ecef] rounded-full h-2">
                      <div className="h-full rounded-full" style={{ width: `${project.utilizedPercent}%`, backgroundColor: project.color }}></div>
                    </div>
                    <div className="text-center text-xs text-[#6c757d] mt-1">{project.utilizedPercent}%</div>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="outline" size="sm" icon={Eye}></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-[#212529] mb-4 pb-3 border-b border-[#dee2e6]">Disbursement Timeline</h3>
      <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] overflow-hidden">
        <div className="bg-[#f8f9fa] px-6 py-4 flex justify-between items-center border-b border-[#dee2e6]">
          <h3 className="text-xl font-bold text-[#212529] m-0">Upcoming Disbursements</h3>
          <Button variant="outline" icon={Calendar}>View Calendar</Button>
        </div>
        <div className="p-6 space-y-4">
          {disbursements.map((item, index) => (
            <div key={index} className="bg-white border-l-4 border-[#FFC857] rounded-lg p-6 shadow-sm">
              <h4 className="text-[#212529] font-semibold mb-2">{item.title}</h4>
              <p className="text-[#6c757d] mb-2">Amount: ${item.amount.toLocaleString()}</p>
              <p className="text-[#6c757d] text-sm mb-3">Scheduled: {item.date}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Approve</Button>
                <Button variant="outline" size="sm">Reschedule</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
