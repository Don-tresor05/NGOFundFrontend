import React from 'react';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { FileText, Calendar, Download, Bot, DollarSign, Users, Network, BarChart3, Plus, Settings, Edit, Pause, Play, FileDown, Mail, FileSpreadsheet } from 'lucide-react';
import { ReportDownloadsChart } from '../../components/charts/ReportDownloadsChart';

const scheduledReports = [
  { name: 'Monthly Financial Summary', type: 'Financial', frequency: 'Monthly', recipients: 'Board, Finance Team', nextRun: '2024-06-01', format: 'PDF, Excel', status: 'Active' },
  { name: 'Quarterly Donor Report', type: 'Donor', frequency: 'Quarterly', recipients: 'Fundraising Team', nextRun: '2024-07-01', format: 'PDF', status: 'Active' },
  { name: 'Weekly Activity Report', type: 'Operations', frequency: 'Weekly', recipients: 'Management Team', nextRun: '2024-05-20', format: 'Email Summary', status: 'Active' },
  { name: 'Annual Audit Report', type: 'Audit', frequency: 'Annual', recipients: 'Auditors, Board', nextRun: '2024-12-31', format: 'PDF, Word', status: 'Pending' },
];

export const ReportsAnalytics: React.FC = () => {
  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-[#dee2e6] mb-8">
        <h2 className="text-3xl font-bold text-[#212529] m-0">Reporting & Analytics Module</h2>
        <p className="text-[#6c757d] text-sm mt-2">Generate financial summaries, donor reports, interactive dashboards, audit logs, and automate scheduled reporting.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Available Reports" value="24" icon={FileText} iconBgClass="bg-[rgba(255,152,0,0.1)] text-[#FF9800]" trend="5 new templates" trendDirection="up" />
        <StatCard title="Scheduled Reports" value="8" icon={Calendar} iconBgClass="bg-[rgba(255,152,0,0.1)] text-[#FF9800]" trend="Active" trendDirection="up" />
        <StatCard title="Last Month Downloads" value="142" icon={Download} iconBgClass="bg-[rgba(255,152,0,0.1)] text-[#FF9800]" trend="25% increase" trendDirection="up" />
        <StatCard title="Report Automation" value="85%" icon={Bot} iconBgClass="bg-[rgba(255,152,0,0.1)] text-[#FF9800]" trend="Highly automated" trendDirection="up" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 text-center border border-[#dee2e6] hover:border-[#FFC857] hover:shadow-md transition-all cursor-pointer">
          <div className="w-15 h-15 bg-[rgba(255,200,87,0.1)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-7 h-7 text-[#FFC857]" />
          </div>
          <div className="font-semibold text-[#212529] mb-2">Financial Reports</div>
          <p className="text-sm text-[#6c757d]">Income, expenses, balance sheets</p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center border border-[#dee2e6] hover:border-[#FFC857] hover:shadow-md transition-all cursor-pointer">
          <div className="w-15 h-15 bg-[rgba(255,200,87,0.1)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-[#FFC857]" />
          </div>
          <div className="font-semibold text-[#212529] mb-2">Donor Reports</div>
          <p className="text-sm text-[#6c757d]">Donor activity and engagement</p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center border border-[#dee2e6] hover:border-[#FFC857] hover:shadow-md transition-all cursor-pointer">
          <div className="w-15 h-15 bg-[rgba(255,200,87,0.1)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <Network className="w-7 h-7 text-[#FFC857]" />
          </div>
          <div className="font-semibold text-[#212529] mb-2">Project Reports</div>
          <p className="text-sm text-[#6c757d]">Progress and outcomes</p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center border border-[#dee2e6] hover:border-[#FFC857] hover:shadow-md transition-all cursor-pointer">
          <div className="w-15 h-15 bg-[rgba(255,200,87,0.1)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-[#FFC857]" />
          </div>
          <div className="font-semibold text-[#212529] mb-2">Analytics Reports</div>
          <p className="text-sm text-[#6c757d]">Performance metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#212529] m-0">Custom Report Builder</h3>
            <Button icon={Plus}>New Report</Button>
          </div>
          <div className="h-64 flex flex-col justify-center items-center text-center">
            <Settings className="w-12 h-12 text-[#6c757d] mb-4" />
            <h4 className="text-[#212529] mb-2">Drag & Drop Report Builder</h4>
            <p className="text-[#6c757d] max-w-sm mb-6">Create custom reports by dragging fields from the left panel to the report canvas</p>
            <Button icon={Play}>Start Building</Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#dee2e6] p-6">
          <h3 className="text-xl font-bold text-[#212529] mb-6 m-0">Most Downloaded Reports</h3>
          <ReportDownloadsChart />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] overflow-hidden mb-8">
        <div className="bg-[#f8f9fa] px-6 py-4 flex justify-between items-center border-b border-[#dee2e6]">
          <h3 className="text-xl font-bold text-[#212529] m-0">Scheduled Reports Configuration</h3>
          <Button icon={Plus}>Schedule Report</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8f9fa]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Report Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Frequency</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Recipients</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Next Run</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Format</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scheduledReports.map((report, index) => (
                <tr key={index} className="border-b border-[#dee2e6] hover:bg-[#f8f9fa]">
                  <td className="px-6 py-4 text-sm text-[#495057]">{report.name}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{report.type}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{report.frequency}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{report.recipients}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{report.nextRun}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{report.format}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      report.status === 'Active' ? 'bg-[rgba(76,175,80,0.15)] text-[#4CAF50]' : 'bg-[rgba(255,152,0,0.15)] text-[#FF9800]'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" icon={Edit}></Button>
                      {report.status === 'Active' ? (
                        <Button variant="outline" size="sm" icon={Pause}></Button>
                      ) : (
                        <Button variant="outline" size="sm" icon={Play}></Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-[#212529] mb-4 pb-3 border-b border-[#dee2e6]">Export Options</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 text-center border border-[#dee2e6] hover:border-[#FFC857] hover:shadow-md transition-all cursor-pointer">
          <div className="w-15 h-15 bg-[rgba(255,200,87,0.1)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileDown className="w-7 h-7 text-[#FFC857]" />
          </div>
          <div className="font-semibold text-[#212529] mb-2">Export as PDF</div>
          <p className="text-sm text-[#6c757d]">High-quality document format</p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center border border-[#dee2e6] hover:border-[#FFC857] hover:shadow-md transition-all cursor-pointer">
          <div className="w-15 h-15 bg-[rgba(255,200,87,0.1)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-7 h-7 text-[#FFC857]" />
          </div>
          <div className="font-semibold text-[#212529] mb-2">Export as Excel</div>
          <p className="text-sm text-[#6c757d]">Spreadsheet for analysis</p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center border border-[#dee2e6] hover:border-[#FFC857] hover:shadow-md transition-all cursor-pointer">
          <div className="w-15 h-15 bg-[rgba(255,200,87,0.1)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-[#FFC857]" />
          </div>
          <div className="font-semibold text-[#212529] mb-2">Export as CSV</div>
          <p className="text-sm text-[#6c757d]">Raw data for processing</p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center border border-[#dee2e6] hover:border-[#FFC857] hover:shadow-md transition-all cursor-pointer">
          <div className="w-15 h-15 bg-[rgba(255,200,87,0.1)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-[#FFC857]" />
          </div>
          <div className="font-semibold text-[#212529] mb-2">Email Report</div>
          <p className="text-sm text-[#6c757d]">Send directly to recipients</p>
        </div>
      </div>
    </div>
  );
};