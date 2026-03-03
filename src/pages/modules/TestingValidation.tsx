import React from 'react';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { FlaskConical, CheckCircle, Bug, UserCheck, Plus, Download, TrendingUp, GitBranch, History, Edit } from 'lucide-react';

const testCases = {
  todo: [
    { id: 'TC-045', title: 'Multi-currency conversion', description: 'Test currency conversion accuracy', priority: 'High', estimate: '2h' },
    { id: 'TC-046', title: 'Donor export functionality', description: 'Test donor data export in all formats', priority: 'Medium', estimate: '1.5h' },
  ],
  inProgress: [
    { id: 'TC-043', title: 'Receipt generation', description: 'Test automated receipt generation', priority: 'High', estimate: '3h' },
    { id: 'TC-044', title: 'Real-time fund tracking', description: 'Test real-time updates', priority: 'High', estimate: '2.5h' },
  ],
  testing: [
    { id: 'TC-042', title: 'User permission levels', description: 'Test role-based access controls', priority: 'Medium', estimate: '2h' },
  ],
  done: [
    { id: 'TC-041', title: 'Donor registration', description: 'Test new donor registration flow', status: 'Passed', time: '1.5h' },
    { id: 'TC-040', title: 'Login authentication', description: 'Test user login and security', status: 'Passed', time: '1h' },
  ],
};

const bugs = [
  { id: 'BUG-012', title: 'Currency conversion error', description: 'RWF to USD conversion showing incorrect values for large amounts', module: 'Fund Tracking', reported: 'May 14, 2024', assignedTo: 'Dev Team', severity: 'critical' },
  { id: 'BUG-011', title: 'Receipt generation delay', description: 'Automated receipts taking more than 5 minutes to generate', module: 'Donor Management', reported: 'May 13, 2024', assignedTo: 'John Dev', severity: 'high' },
  { id: 'BUG-010', title: 'Mobile responsiveness issue', description: 'Dashboard charts not resizing correctly on mobile devices', module: 'Dashboard', reported: 'May 12, 2024', assignedTo: 'UI Team', severity: 'medium' },
];

export const TestingValidation: React.FC = () => {
  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-[#dee2e6] mb-8">
        <h2 className="text-3xl font-bold text-[#212529] m-0">System Testing & Validation Module</h2>
        <p className="text-[#6c757d] text-sm mt-2">Ensure platform meets operational and user requirements through structured testing, manage test cases, and track validation results.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Test Cases" value="142" icon={FlaskConical} iconBgClass="bg-[rgba(156,39,176,0.1)] text-[#9C27B0]" trend="12 new this week" trendDirection="up" />
        <StatCard title="Pass Rate" value="94%" icon={CheckCircle} iconBgClass="bg-[rgba(156,39,176,0.1)] text-[#9C27B0]" trend="2% improvement" trendDirection="up" />
        <StatCard title="Active Bugs" value="8" icon={Bug} iconBgClass="bg-[rgba(156,39,176,0.1)] text-[#9C27B0]" trend="Needs attention" trendDirection="down" />
        <StatCard title="UAT Completion" value="75%" icon={UserCheck} iconBgClass="bg-[rgba(156,39,176,0.1)] text-[#9C27B0]" trend="Good progress" trendDirection="up" />
      </div>

      <h3 className="text-2xl font-bold text-[#212529] mb-4 pb-3 border-b border-[#dee2e6]">Test Case Management</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#e9ecef] rounded-lg p-4 min-h-[400px]">
          <h4 className="font-semibold text-[#212529] mb-4">To Do</h4>
          {testCases.todo.map((test) => (
            <div key={test.id} className="bg-white rounded-lg p-4 mb-3 border-l-4 border-[#9E9E9E] shadow-sm">
              <div className="font-semibold text-[#212529] mb-1">{test.id}: {test.title}</div>
              <div className="text-sm text-[#6c757d] mb-2">{test.description}</div>
              <div className="flex justify-between text-xs text-[#6c757d]">
                <span>Priority: {test.priority}</span>
                <span>Est: {test.estimate}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#e9ecef] rounded-lg p-4 min-h-[400px]">
          <h4 className="font-semibold text-[#212529] mb-4">In Progress</h4>
          {testCases.inProgress.map((test) => (
            <div key={test.id} className="bg-white rounded-lg p-4 mb-3 border-l-4 border-[#FF9800] shadow-sm">
              <div className="font-semibold text-[#212529] mb-1">{test.id}: {test.title}</div>
              <div className="text-sm text-[#6c757d] mb-2">{test.description}</div>
              <div className="flex justify-between text-xs text-[#6c757d]">
                <span>Priority: {test.priority}</span>
                <span>Est: {test.estimate}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#e9ecef] rounded-lg p-4 min-h-[400px]">
          <h4 className="font-semibold text-[#212529] mb-4">Testing</h4>
          {testCases.testing.map((test) => (
            <div key={test.id} className="bg-white rounded-lg p-4 mb-3 border-l-4 border-[#2196F3] shadow-sm">
              <div className="font-semibold text-[#212529] mb-1">{test.id}: {test.title}</div>
              <div className="text-sm text-[#6c757d] mb-2">{test.description}</div>
              <div className="flex justify-between text-xs text-[#6c757d]">
                <span>Priority: {test.priority}</span>
                <span>Est: {test.estimate}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#e9ecef] rounded-lg p-4 min-h-[400px]">
          <h4 className="font-semibold text-[#212529] mb-4">Done</h4>
          {testCases.done.map((test) => (
            <div key={test.id} className="bg-white rounded-lg p-4 mb-3 border-l-4 border-[#4CAF50] shadow-sm">
              <div className="font-semibold text-[#212529] mb-1">{test.id}: {test.title}</div>
              <div className="text-sm text-[#6c757d] mb-2">{test.description}</div>
              <div className="flex justify-between text-xs">
                <span className="text-[#4CAF50]">Status: {test.status}</span>
                <span className="text-[#6c757d]">Time: {test.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-[#212529] mb-4 pb-3 border-b border-[#dee2e6]">Bug/Issue Tracking Board</h3>
      <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] overflow-hidden mb-8">
        <div className="bg-[#f8f9fa] px-6 py-4 flex justify-between items-center border-b border-[#dee2e6]">
          <h3 className="text-xl font-bold text-[#212529] m-0">Active Issues</h3>
          <Button icon={Plus}>Report Bug</Button>
        </div>
        <div className="p-6 space-y-4">
          {bugs.map((bug) => (
            <div key={bug.id} className={`bg-white border-l-4 rounded-lg p-4 shadow-sm ${
              bug.severity === 'critical' ? 'border-[#F44336]' : 
              bug.severity === 'high' ? 'border-[#FF9800]' : 
              'border-[#2196F3]'
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold text-[#212529] mb-1">{bug.id}: {bug.title}</div>
                  <div className="text-sm text-[#6c757d] mb-2">{bug.description}</div>
                  <div className="flex gap-4 text-xs text-[#6c757d]">
                    <span>Module: {bug.module}</span>
                    <span>Reported: {bug.reported}</span>
                    <span>Assigned to: {bug.assignedTo}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" icon={Edit}></Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-[#212529] mb-4 pb-3 border-b border-[#dee2e6]">User Acceptance Testing (UAT)</h3>
      <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] overflow-hidden mb-8">
        <div className="bg-[#f8f9fa] px-6 py-4 flex justify-between items-center border-b border-[#dee2e6]">
          <h3 className="text-xl font-bold text-[#212529] m-0">UAT Feedback & Validation</h3>
          <Button icon={Plus}>New UAT Session</Button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-[#212529] mb-2">Test Environment</label>
              <select className="w-full border border-[#dee2e6] rounded-lg px-3 py-2 text-sm">
                <option>Select Environment</option>
                <option>Development</option>
                <option>Staging</option>
                <option>Production</option>
                <option>UAT Sandbox</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#212529] mb-2">Test Date</label>
              <input type="date" className="w-full border border-[#dee2e6] rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#212529] mb-2">UAT Feedback Form</label>
            <textarea className="w-full border border-[#dee2e6] rounded-lg px-3 py-2 text-sm" rows={4} placeholder="Enter UAT feedback..."></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#212529] mb-2">Tester Name</label>
            <input type="text" className="w-full border border-[#dee2e6] rounded-lg px-3 py-2 text-sm max-w-md" placeholder="Enter tester name" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#212529] mb-2">Overall Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button key={rating} className={`px-3 py-2 rounded border ${rating === 5 ? 'bg-[#FFC857] border-[#FFC857] text-[#1a1a2e]' : 'border-[#dee2e6] text-[#495057] hover:bg-[#f8f9fa]'}`}>
                  {rating}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Cancel</Button>
            <Button>Submit UAT Feedback</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 text-center border border-[#dee2e6] hover:border-[#FFC857] hover:shadow-md transition-all cursor-pointer">
          <div className="w-15 h-15 bg-[rgba(255,200,87,0.1)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <Download className="w-7 h-7 text-[#FFC857]" />
          </div>
          <div className="font-semibold text-[#212529] mb-2">Export Test Results</div>
          <p className="text-sm text-[#6c757d]">Download testing reports</p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center border border-[#dee2e6] hover:border-[#FFC857] hover:shadow-md transition-all cursor-pointer">
          <div className="w-15 h-15 bg-[rgba(255,200,87,0.1)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-7 h-7 text-[#FFC857]" />
          </div>
          <div className="font-semibold text-[#212529] mb-2">Test Metrics</div>
          <p className="text-sm text-[#6c757d]">View testing performance</p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center border border-[#dee2e6] hover:border-[#FFC857] hover:shadow-md transition-all cursor-pointer">
          <div className="w-15 h-15 bg-[rgba(255,200,87,0.1)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <GitBranch className="w-7 h-7 text-[#FFC857]" />
          </div>
          <div className="font-semibold text-[#212529] mb-2">Release Management</div>
          <p className="text-sm text-[#6c757d]">Manage version releases</p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center border border-[#dee2e6] hover:border-[#FFC857] hover:shadow-md transition-all cursor-pointer">
          <div className="w-15 h-15 bg-[rgba(255,200,87,0.1)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <History className="w-7 h-7 text-[#FFC857]" />
          </div>
          <div className="font-semibold text-[#212529] mb-2">Version History</div>
          <p className="text-sm text-[#6c757d]">View release notes</p>
        </div>
      </div>
    </div>
  );
};