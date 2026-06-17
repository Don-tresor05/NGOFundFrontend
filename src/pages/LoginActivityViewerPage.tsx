import { useEffect, useState } from 'react';
import { Activity, CheckCircle, XCircle, Monitor, Calendar, Clock, Users } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { apiRequest } from '../lib/api';

interface LoginActivity {
  id: number;
  user: number;
  user_name: string;
  user_email: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  failure_reason: string;
  created_at: string;
  logged_out_at: string | null;
  duration_minutes: number | null;
}

export default function LoginActivityViewerPage() {
  const [activities, setActivities] = useState<LoginActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<LoginActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedActivity, setSelectedActivity] = useState<LoginActivity | null>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchQuery, statusFilter]);

  const fetchActivities = async () => {
    try {
      const data = await apiRequest('/login-activities/');
      const results = Array.isArray(data) ? data : data.results || [];
      setActivities(results);
    } catch (error) {
      console.error('Error fetching login activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let result = [...activities];

    if (searchQuery) {
      result = result.filter(a =>
        a.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.ip_address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter === 'SUCCESS') {
      result = result.filter(a => a.success);
    } else if (statusFilter === 'FAILED') {
      result = result.filter(a => !a.success);
    }

    setFilteredActivities(result);
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const stats = {
    total: activities.length,
    successful: activities.filter(a => a.success).length,
    failed: activities.filter(a => !a.success).length,
    uniqueUsers: new Set(activities.map(a => a.user)).size
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Login Activity</h1>
        <p className="text-gray-600 mt-1">View login attempts and session history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard label="Total Logins" value={String(stats.total)} trend="All login attempts" trendDirection="neutral" icon={Activity} />
        <StatCard label="Successful" value={String(stats.successful)} trend="Successful logins" trendDirection="up" icon={CheckCircle} />
        <StatCard label="Failed" value={String(stats.failed)} trend="Failed attempts" trendDirection="down" icon={XCircle} />
        <StatCard label="Unique Users" value={String(stats.uniqueUsers)} trend="Different users" trendDirection="neutral" icon={Users} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by user or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Successful Only</option>
            <option value="FAILED">Failed Only</option>
          </select>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Activity size={18} />
            <span>{filteredActivities.length} activities</span>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Browser</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredActivities.map((activity) => (
              <tr
                key={activity.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedActivity(activity)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{activity.user_name}</div>
                    <div className="text-xs text-gray-500">{activity.user_email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {activity.success ? (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle size={16} /> Success
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-red-600">
                      <XCircle size={16} /> Failed
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.ip_address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getBrowserInfo(activity.user_agent)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(activity.created_at).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {activity.duration_minutes ? (
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {activity.duration_minutes} min
                    </div>
                  ) : (
                    <span className="text-gray-400">Active</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Login Activity Details</h2>
              <button onClick={() => setSelectedActivity(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">User</label>
                <p className="text-gray-900">{selectedActivity.user_name} ({selectedActivity.user_email})</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className={selectedActivity.success ? 'text-green-600' : 'text-red-600'}>
                  {selectedActivity.success ? 'Successful Login' : `Failed: ${selectedActivity.failure_reason}`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">IP Address</label>
                <p className="text-gray-900">{selectedActivity.ip_address}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User Agent</label>
                <p className="text-sm text-gray-900 break-all">{selectedActivity.user_agent}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Login Time</label>
                <p className="text-gray-900">{new Date(selectedActivity.created_at).toLocaleString()}</p>
              </div>
              {selectedActivity.logged_out_at && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Logout Time</label>
                    <p className="text-gray-900">{new Date(selectedActivity.logged_out_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Session Duration</label>
                    <p className="text-gray-900">{selectedActivity.duration_minutes} minutes</p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedActivity(null)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
