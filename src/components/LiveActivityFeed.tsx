import { useEffect, useState } from 'react';
import { Activity, Clock, User, FileText, DollarSign } from 'lucide-react';
import { apiRequest } from '../lib/api';

interface ActivityItem {
  id: number;
  user_name: string;
  action_type: string;
  target_entity_type: string;
  target_entity_id: number;
  timestamp: string;
  details: string;
}

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const data = await apiRequest('/audit-logs/?ordering=-timestamp');
      const results = Array.isArray(data) ? data.slice(0, 20) : (data.results || []).slice(0, 20);
      setActivities(results);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (actionType: string) => {
    if (actionType.includes('CREATE')) return <FileText size={16} className="text-green-500" />;
    if (actionType.includes('UPDATE')) return <Activity size={16} className="text-blue-500" />;
    if (actionType.includes('DELETE')) return <Activity size={16} className="text-red-500" />;
    if (actionType.includes('LOGIN')) return <User size={16} className="text-purple-500" />;
    if (actionType.includes('PAYMENT') || actionType.includes('TRANSACTION')) return <DollarSign size={16} className="text-yellow-500" />;
    return <Activity size={16} className="text-gray-500" />;
  };

  const getActionColor = (actionType: string) => {
    if (actionType.includes('CREATE')) return 'text-green-600';
    if (actionType.includes('UPDATE')) return 'text-blue-600';
    if (actionType.includes('DELETE')) return 'text-red-600';
    if (actionType.includes('LOGIN')) return 'text-purple-600';
    return 'text-gray-600';
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Live Activity Feed</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live</span>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No recent activities</p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border-l-2 border-transparent hover:border-blue-500"
            >
              <div className="mt-1">{getActivityIcon(activity.action_type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium text-gray-900">{activity.user_name}</span>
                      {' '}
                      <span className={`font-medium ${getActionColor(activity.action_type)}`}>
                        {activity.action_type.toLowerCase()}
                      </span>
                      {' '}
                      <span className="text-gray-600">{activity.target_entity_type.toLowerCase()}</span>
                    </p>
                    {activity.details && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{activity.details}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                    <Clock size={12} />
                    <span>{getTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t text-center">
        <button
          onClick={fetchActivities}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Refresh Activities
        </button>
      </div>
    </div>
  );
}
