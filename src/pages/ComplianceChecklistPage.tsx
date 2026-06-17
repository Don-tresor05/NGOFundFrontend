import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Plus, Calendar } from 'lucide-react';
import { Button } from '../components/Button';
import { apiRequest } from '../lib/api';

interface ComplianceItem {
  id: number;
  title: string;
  description: string;
  category: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  due_date: string;
  assigned_to: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  documents_required: number;
  documents_submitted: number;
  approval_status: string;
}

export default function ComplianceChecklistPage() {
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, statusFilter, categoryFilter]);

  const fetchItems = async () => {
    try {
      const data = await apiRequest('/compliance-items/');
      const results = Array.isArray(data) ? data : data.results || [];
      setItems(results);
    } catch (error) {
      console.error('Error fetching compliance items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let result = [...items];
    if (statusFilter !== 'ALL') result = result.filter(i => i.status === statusFilter);
    if (categoryFilter !== 'ALL') result = result.filter(i => i.category === categoryFilter);
    setFilteredItems(result);
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await apiRequest(`/compliance-items/${id}/`, 'PATCH', { status });
      fetchItems();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="text-green-500" size={20} />;
      case 'IN_PROGRESS': return <Clock className="text-blue-500" size={20} />;
      case 'OVERDUE': return <AlertTriangle className="text-red-500" size={20} />;
      default: return <XCircle className="text-gray-400" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: items.length,
    completed: items.filter(i => i.status === 'COMPLETED').length,
    inProgress: items.filter(i => i.status === 'IN_PROGRESS').length,
    overdue: items.filter(i => i.status === 'OVERDUE').length
  };

  const categories = [...new Set(items.map(i => i.category))];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Compliance Checklist</h1>
          <p className="text-gray-600 mt-1">Track regulatory requirements and submission deadlines</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus size={18} /> Add Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Total Items</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm p-4">
          <p className="text-sm text-green-600">Completed</p>
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-sm p-4">
          <p className="text-sm text-blue-600">In Progress</p>
          <p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow-sm p-4">
          <p className="text-sm text-red-600">Overdue</p>
          <p className="text-2xl font-bold text-red-700">{stats.overdue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="ALL">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            {filteredItems.length} items shown
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1">{getStatusIcon(item.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>Due: {new Date(item.due_date).toLocaleDateString()}</span>
                    </div>
                    <div>Category: {item.category}</div>
                    <div>Assigned: {item.assigned_to || 'Unassigned'}</div>
                    <div>Docs: {item.documents_submitted || 0}/{item.documents_required || 0}</div>
                    <div>Approval: {item.approval_status || 'Pending'}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {item.status !== 'COMPLETED' && (
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value)}
                    className="px-3 py-1 border rounded-lg text-sm"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                )}
              </div>
            </div>
            {/* Progress bar for documents */}
            {item.documents_required > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Document Submission</span>
                  <span>{Math.round((item.documents_submitted / item.documents_required) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min((item.documents_submitted / item.documents_required) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
