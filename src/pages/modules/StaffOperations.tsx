import React from 'react';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { ClipboardList, MessageSquare, Network, CheckCheck, Plus, Download, RefreshCw, Eye, Save, Bold, Italic, Underline, List, Link, Image, Table } from 'lucide-react';

const requirements = [
  { id: 'REQ-001', title: 'Automated Donor Receipts', department: 'Finance', submittedBy: 'Michael Finance', date: '2024-05-15', priority: 'High', status: 'Implemented', validation: 'Validated' },
  { id: 'REQ-002', title: 'Real-time Fund Tracking', department: 'Operations', submittedBy: 'John Admin', date: '2024-05-14', priority: 'High', status: 'Implemented', validation: 'Validated' },
  { id: 'REQ-003', title: 'Multi-currency Support', department: 'Finance', submittedBy: 'Lisa Auditor', date: '2024-05-13', priority: 'Medium', status: 'In Progress', validation: 'Pending' },
  { id: 'REQ-004', title: 'Project Impact Reporting', department: 'Fundraising', submittedBy: 'Sarah Donor', date: '2024-05-12', priority: 'Medium', status: 'Planned', validation: 'Pending' },
  { id: 'REQ-005', title: 'Mobile App Access', department: 'IT', submittedBy: 'System Team', date: '2024-05-11', priority: 'Low', status: 'Backlog', validation: 'Not Started' },
];

export const StaffOperations: React.FC = () => {
  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-[#dee2e6] mb-8">
        <h2 className="text-3xl font-bold text-[#212529] m-0">Staff & Operations Module</h2>
        <p className="text-[#6c757d] text-sm mt-2">Capture interviews, processes, and staff input for system requirements, track requirement completion and validation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Requirements Captured" value="48" icon={ClipboardList} iconBgClass="bg-[rgba(33,150,243,0.1)] text-[#2196F3]" trend="12 new this week" trendDirection="up" />
        <StatCard title="Interviews Completed" value="15" icon={MessageSquare} iconBgClass="bg-[rgba(33,150,243,0.1)] text-[#2196F3]" trend="All scheduled" trendDirection="up" />
        <StatCard title="Processes Documented" value="22" icon={Network} iconBgClass="bg-[rgba(33,150,243,0.1)] text-[#2196F3]" trend="5 updated" trendDirection="up" />
        <StatCard title="Validation Status" value="85%" icon={CheckCheck} iconBgClass="bg-[rgba(33,150,243,0.1)] text-[#2196F3]" trend="Good progress" trendDirection="up" />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-[#dee2e6] mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-[#212529]">Filter by:</label>
          <select className="border border-[#dee2e6] rounded-lg px-3 py-2 text-sm">
            <option>All Requirements</option>
            <option>Pending</option>
            <option>Validated</option>
            <option>Rejected</option>
          </select>
        </div>
        <select className="border border-[#dee2e6] rounded-lg px-3 py-2 text-sm">
          <option>All Departments</option>
          <option>Finance</option>
          <option>Operations</option>
          <option>Fundraising</option>
          <option>IT</option>
        </select>
        <div className="flex-1"></div>
        <Button icon={Plus}>Capture Requirement</Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] overflow-hidden mb-8">
        <div className="bg-[#f8f9fa] px-6 py-4 flex justify-between items-center border-b border-[#dee2e6]">
          <h3 className="text-xl font-bold text-[#212529] m-0">Interview & Requirement Capture</h3>
          <div className="flex gap-2">
            <Button variant="outline" icon={Download}>Export Requirements</Button>
            <Button variant="outline" icon={RefreshCw}>Refresh</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8f9fa]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Req ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Department</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Submitted By</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Date Captured</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Priority</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Validation</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((req) => (
                <tr key={req.id} className="border-b border-[#dee2e6] hover:bg-[#f8f9fa]">
                  <td className="px-6 py-4 text-sm text-[#495057]">{req.id}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{req.title}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{req.department}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{req.submittedBy}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{req.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      req.priority === 'High' ? 'bg-[rgba(76,175,80,0.15)] text-[#4CAF50]' : 
                      req.priority === 'Medium' ? 'bg-[rgba(255,152,0,0.15)] text-[#FF9800]' : 
                      'bg-[rgba(158,158,158,0.15)] text-[#9E9E9E]'
                    }`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      req.status === 'Implemented' ? 'bg-[rgba(33,150,243,0.15)] text-[#2196F3]' : 
                      req.status === 'In Progress' ? 'bg-[rgba(255,152,0,0.15)] text-[#FF9800]' : 
                      'bg-[rgba(158,158,158,0.15)] text-[#9E9E9E]'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      req.validation === 'Validated' ? 'bg-[rgba(33,150,243,0.15)] text-[#2196F3]' : 
                      req.validation === 'Pending' ? 'bg-[rgba(255,152,0,0.15)] text-[#FF9800]' : 
                      'bg-[rgba(158,158,158,0.15)] text-[#9E9E9E]'
                    }`}>
                      {req.validation}
                    </span>
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

      <h3 className="text-2xl font-bold text-[#212529] mb-4 pb-3 border-b border-[#dee2e6]">Process Documentation Editor</h3>
      <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] overflow-hidden mb-8">
        <div className="bg-[#f8f9fa] px-6 py-4 flex justify-between items-center border-b border-[#dee2e6]">
          <h3 className="text-xl font-bold text-[#212529] m-0">Process Flow Documentation</h3>
          <Button icon={Save}>Save Process</Button>
        </div>
        <div className="p-6">
          <div className="bg-white border border-[#dee2e6] rounded-lg min-h-[300px] p-5">
            <div className="flex gap-2 mb-4 pb-4 border-b border-[#dee2e6]">
              <button className="p-2 bg-[#e9ecef] rounded hover:bg-[#dee2e6]"><Bold className="w-4 h-4" /></button>
              <button className="p-2 bg-[#e9ecef] rounded hover:bg-[#dee2e6]"><Italic className="w-4 h-4" /></button>
              <button className="p-2 bg-[#e9ecef] rounded hover:bg-[#dee2e6]"><Underline className="w-4 h-4" /></button>
              <button className="p-2 bg-[#e9ecef] rounded hover:bg-[#dee2e6]"><List className="w-4 h-4" /></button>
              <button className="p-2 bg-[#e9ecef] rounded hover:bg-[#dee2e6]"><Link className="w-4 h-4" /></button>
              <button className="p-2 bg-[#e9ecef] rounded hover:bg-[#dee2e6]"><Image className="w-4 h-4" /></button>
              <button className="p-2 bg-[#e9ecef] rounded hover:bg-[#dee2e6]"><Table className="w-4 h-4" /></button>
            </div>
            <div className="min-h-[200px]">
              <h3 className="text-[#212529] font-semibold mb-2">Donor Registration Process</h3>
              <p className="text-[#495057] mb-2"><strong>Process Owner:</strong> Fundraising Department</p>
              <p className="text-[#495057] mb-4"><strong>Last Updated:</strong> May 15, 2024</p>
              <hr className="mb-4" />
              <h4 className="text-[#212529] font-semibold mb-2">Process Steps:</h4>
              <ol className="list-decimal list-inside mb-4 text-[#495057]">
                <li>Donor accesses registration form via website or mobile app</li>
                <li>System validates donor information (email, contact details)</li>
                <li>Automated welcome email sent upon successful registration</li>
                <li>Donor profile created in donor management module</li>
                <li>Initial communication preferences recorded</li>
              </ol>
              <h4 className="text-[#212529] font-semibold mb-2">Success Metrics:</h4>
              <ul className="list-disc list-inside text-[#495057]">
                <li>Registration completion rate: 85%</li>
                <li>Average registration time: 3 minutes</li>
                <li>Welcome email open rate: 65%</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#212529] mb-2">Process Category</label>
              <select className="w-full border border-[#dee2e6] rounded-lg px-3 py-2 text-sm">
                <option>Donor Management</option>
                <option>Fund Processing</option>
                <option>Project Allocation</option>
                <option>Reporting</option>
                <option>System Operations</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#212529] mb-2">Process Owner</label>
              <input type="text" className="w-full border border-[#dee2e6] rounded-lg px-3 py-2 text-sm" defaultValue="Fundraising Department" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#212529] mb-2">Review Date</label>
              <input type="date" className="w-full border border-[#dee2e6] rounded-lg px-3 py-2 text-sm" defaultValue="2024-08-15" />
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-[#212529] mb-4 pb-3 border-b border-[#dee2e6]">Staff Feedback & Input</h3>
      <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] overflow-hidden">
        <div className="bg-[#f8f9fa] px-6 py-4 flex justify-between items-center border-b border-[#dee2e6]">
          <h3 className="text-xl font-bold text-[#212529] m-0">Staff Input Submission Area</h3>
          <Button icon={Plus}>New Feedback</Button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#212529] mb-2">Feedback Title</label>
              <input type="text" className="w-full border border-[#dee2e6] rounded-lg px-3 py-2 text-sm" placeholder="Enter feedback title" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#212529] mb-2">Department</label>
              <select className="w-full border border-[#dee2e6] rounded-lg px-3 py-2 text-sm">
                <option>Select Department</option>
                <option>Finance</option>
                <option>Operations</option>
                <option>Fundraising</option>
                <option>IT</option>
                <option>Management</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-[#212529] mb-2">Description</label>
            <textarea className="w-full border border-[#dee2e6] rounded-lg px-3 py-2 text-sm" rows={4} placeholder="Describe your feedback or suggestion..."></textarea>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-[#212529] mb-2">Priority</label>
            <select className="w-full border border-[#dee2e6] rounded-lg px-3 py-2 text-sm max-w-xs">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline">Cancel</Button>
            <Button>Submit Feedback</Button>
          </div>
        </div>
      </div>
    </div>
  );
};