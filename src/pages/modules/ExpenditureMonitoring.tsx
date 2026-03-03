import React from 'react';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { ExpenditureBudgetChart } from '../../components/charts/ExpenditureBudgetChart';
import { ExpenseCategoriesChart } from '../../components/charts/ExpenseCategoriesChart';
import { DollarSign, Clock, CheckCircle, FileText, Plus, Upload, Download, Eye, Edit, Trash2, History } from 'lucide-react';

const expenses = [
  { id: 'EXP-2024-00125', date: '2024-05-15', description: 'Medical Supplies Purchase', category: 'Medical', project: 'Vaccination Program', amount: 2500, submittedBy: 'Michael Finance', status: 'Approved' },
  { id: 'EXP-2024-00124', date: '2024-05-14', description: 'Training Materials', category: 'Education', project: 'Worker Training', amount: 850, submittedBy: 'John Admin', status: 'Approved' },
  { id: 'EXP-2024-00123', date: '2024-05-13', description: 'Staff Salaries - May', category: 'Payroll', project: 'General Operations', amount: 8200, submittedBy: 'Michael Finance', status: 'Pending' },
  { id: 'EXP-2024-00122', date: '2024-05-12', description: 'Office Rent', category: 'Operations', project: 'General Operations', amount: 1200, submittedBy: 'John Admin', status: 'Paid' },
];

const auditTrail = [
  { icon: CheckCircle, title: 'Medical Supplies approved', description: 'Amount: $2,500 | Approved by: John Admin', time: '2024-05-15 14:30', color: '#4CAF50' },
  { icon: Clock, title: 'May salaries pending review', description: 'Amount: $8,200 | Submitted by: Michael Finance', time: '2024-05-13 10:15', color: '#FF9800' },
  { icon: FileText, title: 'Office rent receipt uploaded', description: 'Receipt verified and attached to expense', time: '2024-05-12 09:45', color: '#2196F3' },
];

export const ExpenditureMonitoring: React.FC = () => {
  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-[#dee2e6] mb-8">
        <h2 className="text-3xl font-bold text-[#212529] m-0">Expenditure Monitoring Module</h2>
        <p className="text-[#6c757d] text-sm mt-2">Monitor expenses ensuring transparency and accountability, manage approval workflows, and track receipts for audit compliance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Expenditure" value="$124,800" icon={DollarSign} iconBgClass="bg-[rgba(255,200,87,0.1)] text-[#FFC857]" trend="5% under budget" trendDirection="up" />
        <StatCard title="Pending Approvals" value="12" icon={Clock} iconBgClass="bg-[rgba(255,152,0,0.1)] text-[#FF9800]" trend="Needs review" trendDirection="down" />
        <StatCard title="Approved Expenses" value="$118,500" icon={CheckCircle} iconBgClass="bg-[rgba(76,175,80,0.1)] text-[#4CAF50]" trend="95% approved" trendDirection="up" />
        <StatCard title="Receipt Compliance" value="98%" icon={FileText} iconBgClass="bg-[rgba(156,39,176,0.1)] text-[#9C27B0]" trend="Excellent" trendDirection="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ExpenditureBudgetChart />
        <ExpenseCategoriesChart />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-[#dee2e6] mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-[#212529]">Filter by:</label>
          <select className="border border-[#dee2e6] rounded-lg px-3 py-2 text-sm">
            <option>All Expenses</option>
            <option>Pending Approval</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
        <select className="border border-[#dee2e6] rounded-lg px-3 py-2 text-sm">
          <option>All Categories</option>
          <option>Medical Supplies</option>
          <option>Staff Salaries</option>
          <option>Operations</option>
          <option>Equipment</option>
        </select>
        <div className="flex-1"></div>
        <Button icon={Plus}>Record Expense</Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] overflow-hidden mb-8">
        <div className="bg-[#f8f9fa] px-6 py-4 flex justify-between items-center border-b border-[#dee2e6]">
          <h3 className="text-xl font-bold text-[#212529] m-0">Expense Tracking</h3>
          <div className="flex gap-2">
            <Button variant="outline" icon={Upload}>Upload Receipts</Button>
            <Button variant="outline" icon={Download}>Export Expenses</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8f9fa]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Expense ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Project</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Submitted By</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Receipt</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-[#dee2e6] hover:bg-[#f8f9fa]">
                  <td className="px-6 py-4 text-sm text-[#495057]">{expense.id}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{expense.date}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{expense.description}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{expense.category}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{expense.project}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">${expense.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{expense.submittedBy}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      expense.status === 'Approved' || expense.status === 'Paid' ? 'bg-[rgba(76,175,80,0.15)] text-[#4CAF50]' : 'bg-[rgba(255,152,0,0.15)] text-[#FF9800]'
                    }`}>
                      {expense.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="outline" size="sm" icon={Eye}></Button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" icon={Edit}></Button>
                      <Button variant="outline" size="sm" icon={Trash2}></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-[#212529] mb-4 pb-3 border-b border-[#dee2e6]">Audit Trail Visibility</h3>
      <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] overflow-hidden">
        <div className="bg-[#f8f9fa] px-6 py-4 flex justify-between items-center border-b border-[#dee2e6]">
          <h3 className="text-xl font-bold text-[#212529] m-0">Expense Approval History</h3>
          <Button variant="outline" icon={History}>View Full History</Button>
        </div>
        <div className="p-6 space-y-4">
          {auditTrail.map((item, index) => (
            <div key={index} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#e9ecef] flex items-center justify-center">
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[#212529]">{item.title}</div>
                <div className="text-sm text-[#6c757d]">{item.description}</div>
                <div className="text-xs text-[#6c757d] mt-1">{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};