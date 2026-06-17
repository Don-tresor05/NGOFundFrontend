import { useEffect, useState } from 'react';
import { Check, X, Save, RefreshCw } from 'lucide-react';
import { Button } from '../components/Button';
import { apiRequest } from '../lib/api';

interface Permission {
  id: number;
  permission_key: string;
  permission_name: string;
  description: string;
}

interface Role {
  role_key: string;
  role_name: string;
  description: string;
}

interface RolePermission {
  role: string;
  permission: number;
}

export default function PermissionMatrixEditorPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [matrix, setMatrix] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rolesData, permsData, rolePermsData] = await Promise.all([
        apiRequest('/roles/'),
        apiRequest('/permissions/'),
        apiRequest('/role-permissions/')
      ]);

      setRoles(Array.isArray(rolesData) ? rolesData : rolesData.results || []);
      setPermissions(Array.isArray(permsData) ? permsData : permsData.results || []);

      const rolePerms = Array.isArray(rolePermsData) ? rolePermsData : rolePermsData.results || [];
      const matrixSet = new Set<string>();
      rolePerms.forEach((rp: RolePermission) => {
        matrixSet.add(`${rp.role}-${rp.permission}`);
      });
      setMatrix(matrixSet);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (roleKey: string, permId: number) => {
    const key = `${roleKey}-${permId}`;
    const newMatrix = new Set(matrix);
    
    if (newMatrix.has(key)) {
      newMatrix.delete(key);
    } else {
      newMatrix.add(key);
    }
    
    setMatrix(newMatrix);
    setHasChanges(true);
  };

  const hasPermission = (roleKey: string, permId: number) => {
    return matrix.has(`${roleKey}-${permId}`);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const updates = Array.from(matrix).map(key => {
        const [roleKey, permId] = key.split('-');
        return { role: roleKey, permission: parseInt(permId) };
      });

      await apiRequest('role-permissions/bulk-update/', 'POST', { permissions: updates });
      setHasChanges(false);
      alert('Permissions updated successfully!');
    } catch (error) {
      console.error('Error saving permissions:', error);
      alert('Error saving permissions');
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    if (confirm('Discard all unsaved changes?')) {
      fetchData();
      setHasChanges(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Permission Matrix Editor</h1>
          <p className="text-gray-600 mt-1">Manage role-based permissions across the system</p>
        </div>
        <div className="flex gap-3">
          {hasChanges && (
            <Button variant="outline" onClick={resetChanges} className="flex items-center gap-2">
              <RefreshCw size={18} /> Reset
            </Button>
          )}
          <Button 
            onClick={saveChanges} 
            disabled={!hasChanges || saving}
            className="flex items-center gap-2"
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-medium">⚠️ You have unsaved changes</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r">
                Permission
              </th>
              {roles.map((role) => (
                <th key={role.role_key} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  <div>{role.role_name.replace('_', ' ')}</div>
                  <div className="text-xs font-normal text-gray-400 normal-case mt-1">
                    {role.description}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {permissions.map((permission) => (
              <tr key={permission.id} className="hover:bg-gray-50">
                <td className="sticky left-0 z-10 bg-white px-6 py-4 border-r">
                  <div className="text-sm font-medium text-gray-900">{permission.permission_name}</div>
                  <div className="text-xs text-gray-500">{permission.description}</div>
                </td>
                {roles.map((role) => (
                  <td key={`${role.role_key}-${permission.id}`} className="px-4 py-4 text-center">
                    <button
                      onClick={() => togglePermission(role.role_key, permission.id)}
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                        hasPermission(role.role_key, permission.id)
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {hasPermission(role.role_key, permission.id) ? (
                        <Check size={20} strokeWidth={3} />
                      ) : (
                        <X size={20} />
                      )}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Guide</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click checkboxes to toggle permissions for each role</li>
          <li>• Green = Permission granted, Gray = Permission denied</li>
          <li>• Changes are saved only when you click "Save Changes"</li>
          <li>• Use "Reset" to discard unsaved modifications</li>
        </ul>
      </div>
    </div>
  );
}
