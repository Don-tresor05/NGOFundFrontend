import React from 'react';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { Users, Clock, AlertTriangle, ShieldCheck, UserPlus, Download, RefreshCw, Edit, Trash2, Check, X, Save, Key, Lock, History, Shield } from 'lucide-react';
import { UserRoleChart } from '../../components/charts/UserRoleChart';
import { LoginActivityChart } from '../../components/charts/LoginActivityChart';

const users = [
  { id: 'ADM001', name: 'John Admin', email: 'admin@rpa.org', role: 'Administrator', department: 'IT & Operations', lastLogin: '2024-05-15 14:30', status: 'Active' },
  { id: 'FIN001', name: 'Michael Finance', email: 'finance@rpa.org', role: 'Finance Officer', department: 'Finance', lastLogin: '2024-05-15 13:45', status: 'Active' },
  { id: 'AUD001', name: 'Lisa Auditor', email: 'audit@rpa.org', role: 'Auditor', department: 'Compliance', lastLogin: '2024-05-15 12:20', status: 'Active' },
  { id: 'DON001', name: 'Sarah Donor', email: 'sarah.donor@email.com', role: 'Donor', department: 'External', lastLogin: '2024-05-15 11:10', status: 'Active' },
  { id: 'STAFF001', name: 'Robert Johnson', email: 'robert@rpa.org', role: 'Staff', department: 'Fundraising', lastLogin: '2024-05-14 10:05', status: 'Pending' },
];

const permissions = [
  { module: 'Donor Management', admin: true, finance: true, auditor: false, staff: false, donor: false },
  { module: 'Fund Tracking', admin: true, finance: true, auditor: true, staff: false, donor: false },
  { module: 'Project Allocation', admin: true, finance: true, auditor: false, staff: false, donor: false },
  { module: 'Expenditure Approval', admin: true, finance: true, auditor: false, staff: false, donor: false },
  { module: 'Report Generation', admin: true, finance: true, auditor: true, staff: false, donor: true },
  { module: 'User Management', admin: true, finance: false, auditor: false, staff: false, donor: false },
  { module: 'System Settings', admin: true, finance: false, auditor: false, staff: false, donor: false },
];

export const UserManagement: React.FC = () => {
  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-[#dee2e6] mb-8">
        <h2 className="text-3xl font-bold text-[#212529] m-0">User & Access Management Module</h2>
        <p className="text-[#6c757d] text-sm mt-2">Manage secure, role-based access for administrators, finance officers, and auditors with granular permission control and activity monitoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value="48" icon={Users} iconBgClass="bg-[rgba(255,152,0,0.1)] text-[#FF9800]" trend="5 new this month" trendDirection="up" />
        <StatCard title="Active Sessions" value="12" icon={Clock} iconBgClass="bg-[rgba(255,152,0,0.1)] text-[#FF9800]" trend="Normal" trendDirection="up" />
        <StatCard title="Failed Logins" value="3" icon={AlertTriangle} iconBgClass="bg-[rgba(255,152,0,0.1)] text-[#FF9800]" trend="Low risk" trendDirection="down" />
        <StatCard title="Access Compliance" value="100%" icon={ShieldCheck} iconBgClass="bg-[rgba(255,152,0,0.1)] text-[#FF9800]" trend="Compliant" trendDirection="up" />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-[#dee2e6] mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-[#212529]">Filter by:</label>
          <select className="border border-[#dee2e6] rounded-lg px-3 py-2 text-sm">
            <option>All Roles</option>
            <option>Administrator</option>
            <option>Finance Officer</option>
            <option>Auditor</option>
            <option>Staff</option>
            <option>Donor</option>
          </select>
        </div>
        <select className="border border-[#dee2e6] rounded-lg px-3 py-2 text-sm">
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>Suspended</option>
          <option>Pending</option>
        </select>
        <div className="flex-1"></div>
        <Button icon={UserPlus}>Add User</Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] overflow-hidden mb-8">
        <div className="bg-[#f8f9fa] px-6 py-4 flex justify-between items-center border-b border-[#dee2e6]">
          <h3 className="text-xl font-bold text-[#212529] m-0">User Management Table</h3>
          <div className="flex gap-2">
            <Button variant="outline" icon={Download}>Export Users</Button>
            <Button variant="outline" icon={RefreshCw}>Refresh</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8f9fa]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">User ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Full Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Department</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Last Login</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[#dee2e6] hover:bg-[#f8f9fa]">
                  <td className="px-6 py-4 text-sm text-[#495057]">{user.id}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'Administrator' ? 'bg-[rgba(255,152,0,0.2)] text-[#FF9800]' :
                      user.role === 'Finance Officer' ? 'bg-[rgba(33,150,243,0.2)] text-[#2196F3]' :
                      user.role === 'Auditor' ? 'bg-[rgba(156,39,176,0.2)] text-[#9C27B0]' :
                      user.role === 'Donor' ? 'bg-[rgba(76,175,80,0.2)] text-[#4CAF50]' :
                      'bg-[rgba(108,117,125,0.2)] text-[#6c757d]'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{user.department}</td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{user.lastLogin}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'Active' ? 'bg-[rgba(76,175,80,0.15)] text-[#4CAF50]' : 'bg-[rgba(255,152,0,0.15)] text-[#FF9800]'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {user.status === 'Pending' ? (
                        <>
                          <Button variant="outline" size="sm" icon={Check}></Button>
                          <Button variant="outline" size="sm" icon={X}></Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" icon={Edit}></Button>
                          <Button variant="outline" size="sm" icon={Trash2}></Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Role Distribution</h3>
          <UserRoleChart />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Login Activity (Last 7 Days)</h3>
          <LoginActivityChart />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-[#212529] mb-4 pb-3 border-b border-[#dee2e6]">Permission Matrix Editor</h3>
      <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] overflow-hidden mb-8">
        <div className="bg-[#f8f9fa] px-6 py-4 flex justify-between items-center border-b border-[#dee2e6]">
          <h3 className="text-xl font-bold text-[#212529] m-0">Role-Based Access Control</h3>
          <Button icon={Save}>Save Permissions</Button>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8f9fa]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#212529]">Module/Permission</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#212529]">Administrator</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#212529]">Finance Officer</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#212529]">Auditor</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#212529]">Staff</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#212529]">Donor</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, index) => (
                <tr key={index} className="border-b border-[#dee2e6]">
                  <td className="px-6 py-4 text-sm text-[#495057]">{perm.module}</td>
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" defaultChecked={perm.admin} className="w-4 h-4 text-[#FF9800] rounded" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" defaultChecked={perm.finance} className="w-4 h-4 text-[#2196F3] rounded" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" defaultChecked={perm.auditor} className="w-4 h-4 text-[#9C27B0] rounded" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" defaultChecked={perm.staff} className="w-4 h-4 text-[#6c757d] rounded" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" defaultChecked={perm.donor} className="w-4 h-4 text-[#4CAF50] rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 text-center border border-[#dee2e6] hover:border-[#FFC857] hover:shadow-md transition-all cursor-pointer">
          <div className="w-15 h-15 bg-[rgba(255,200,87,0.1)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <Key className="w-7 h-7 text-[#FFC857]" />
          </div>
          <div className="font-semibold text-[#212529] mb-2">Reset Password</div>
          <p className="text-sm text-[#6c757d]">Reset user credentials</p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center border border-[#dee2e6] hover:border-[#FFC857] hover:shadow-md transition-all cursor-pointer">
          <div className="w-15 h-15 bg-[rgba(255,200,87,0.1)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-[#FFC857]" />
          </div>
          <div className="font-semibold text-[#212529] mb-2">Manage Sessions</div>
          <p className="text-sm text-[#6c757d]">View/terminate sessions</p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center border border-[#dee2e6] hover:border-[#FFC857] hover:shadow-md transition-all cursor-pointer">
          <div className="w-15 h-15 bg-[rgba(255,200,87,0.1)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <History className="w-7 h-7 text-[#FFC857]" />
          </div>
          <div className="font-semibold text-[#212529] mb-2">Audit Logs</div>
          <p className="text-sm text-[#6c757d]">View user activity</p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center border border-[#dee2e6] hover:border-[#FFC857] hover:shadow-md transition-all cursor-pointer">
          <div className="w-15 h-15 bg-[rgba(255,200,87,0.1)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-[#FFC857]" />
          </div>
          <div className="font-semibold text-[#212529] mb-2">Security Settings</div>
          <p className="text-sm text-[#6c757d]">Configure access policies</p>
        </div>
      </div>
    </div>
  );
};