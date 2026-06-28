import { useEffect, useState } from 'react';
import { Search, Download, User, Activity } from 'lucide-react';
import { AppHeader } from '../components';
import { Button } from '../components/Button';
import { apiRequest } from '../lib/api';

interface AuditLog {
  id: number;
  user: number;
  user_name?: string;
  user_email?: string;
  action_type: string;
  target_entity_type: string;
  target_entity_id: number;
  timestamp: string;
  ip_address?: string | null;
  details?: string;
}

export default function AuditTrailExplorerPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchQuery, actionFilter, entityFilter, dateFrom, dateTo]);

  const fetchLogs = async () => {
    try {
      const data = await apiRequest<any>('/audit-logs/');
      setLogs(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let result = [...logs];

    if (searchQuery) {
      result = result.filter(log =>
        (log.user_name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.user_email ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (actionFilter !== 'ALL') {
      result = result.filter(log => log.action_type === actionFilter);
    }

    if (entityFilter !== 'ALL') {
      result = result.filter(log => log.target_entity_type === entityFilter);
    }

    if (dateFrom) {
      result = result.filter(log => new Date(log.timestamp) >= new Date(dateFrom));
    }

    if (dateTo) {
      result = result.filter(log => new Date(log.timestamp) <= new Date(dateTo + 'T23:59:59'));
    }

    setFilteredLogs(result);
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'User', 'Email', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Details'];
    const csv = [
      headers.join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.user_name ?? `User ${log.user}`,
        log.user_email ?? '',
        log.action_type,
        log.target_entity_type,
        log.target_entity_id,
        log.ip_address ?? '',
        `"${(log.details ?? '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const actionTypes = [...new Set(logs.map(l => l.action_type))];
  const entityTypes = [...new Set(logs.map(l => l.target_entity_type))];

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
    if (action.includes('LOGIN')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="page">
      <AppHeader title="Audit Trail Explorer" summary="Track and monitor all system activities." />

      <div className="container">
        <div className="mb-6 flex justify-end">
          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download size={18} /> Export CSV
          </Button>
        </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="ALL">All Actions</option>
            {actionTypes.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="ALL">All Entities</option>
            {entityTypes.map(entity => (
              <option key={entity} value={entity}>{entity}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Activity size={18} />
            <span>{filteredLogs.length} logs</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr 
                  key={log.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.user_name || `User ${log.user}`}</div>
                        <div className="text-xs text-gray-500">{log.user_email || 'No email available'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action_type)}`}>
                      {log.action_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{log.target_entity_type}</div>
                    <div className="text-xs text-gray-500">ID: {log.target_entity_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ip_address || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {log.details || 'No details available'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Audit Log Details</h2>
              <button onClick={() => setSelectedLog(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Timestamp</label>
                <p className="text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User</label>
                <p className="text-gray-900">{selectedLog.user_name || `User ${selectedLog.user}`} ({selectedLog.user_email || 'No email available'})</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Action</label>
                <p className="text-gray-900">{selectedLog.action_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Target Entity</label>
                <p className="text-gray-900">{selectedLog.target_entity_type} (ID: {selectedLog.target_entity_id})</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">IP Address</label>
                <p className="text-gray-900">{selectedLog.ip_address || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Details</label>
                <pre className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {selectedLog.details || 'No details available'}
                </pre>
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={() => setSelectedLog(null)} className="w-full">Close</Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
