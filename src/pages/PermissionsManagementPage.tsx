import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';

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
  permissions: string[];
}

export default function PermissionsManagementPage() {
  const currentProfile = useAuthStore((state) => state.currentProfile);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setMessage(null); // Clear any previous errors
    try {
      const token = localStorage.getItem('ngofund_access_token');
      
      if (!token) {
        setMessage({ type: 'error', text: 'Not authenticated. Please login again.' });
        setLoading(false);
        return;
      }

      const [rolesRes, permsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/roles/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/permissions/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!rolesRes.ok || !permsRes.ok) {
        setMessage({ type: 'error', text: 'Failed to fetch data. Check permissions.' });
        setLoading(false);
        return;
      }

      const rolesData = await rolesRes.json();
      const permsData = await permsRes.json();

      // Handle paginated responses
      const roles = Array.isArray(rolesData) ? rolesData : rolesData.results || [];
      const permissions = Array.isArray(permsData) ? permsData : permsData.results || [];

      // Fetch role permissions for each role
      const rolesWithPerms = await Promise.all(
        roles.map(async (role: any) => {
          const rpRes = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/role-permissions/?role=${role.role_key}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!rpRes.ok) return { ...role, permissions: [] };
          const rpData = await rpRes.json();
          const rps = Array.isArray(rpData) ? rpData : rpData.results || [];
          return {
            ...role,
            permissions: rps.map((rp: any) => rp.permission.permission_key),
          };
        })
      );

      setRoles(rolesWithPerms);
      setPermissions(permissions);
      if (rolesWithPerms.length > 0) setSelectedRole(rolesWithPerms[0].role_key);
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage({ type: 'error', text: `Failed to load data: ${error}` });
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (permissionKey: string) => {
    const role = roles.find((r) => r.role_key === selectedRole);
    if (!role) return;

    const hasPermission = role.permissions.includes(permissionKey);
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('ngofund_access_token');
      
      if (hasPermission) {
        // Remove permission
        const rpRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/role-permissions/?role=${selectedRole}&permission=${permissionKey}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const rpData = await rpRes.json();
        if (rpData.length > 0) {
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/role-permissions/${rpData[0].id}/`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } else {
        // Add permission
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/role-permissions/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: selectedRole, permission: permissionKey }),
        });
      }

      // Update local state
      setRoles((prev) =>
        prev.map((r) =>
          r.role_key === selectedRole
            ? {
                ...r,
                permissions: hasPermission
                  ? r.permissions.filter((p) => p !== permissionKey)
                  : [...r.permissions, permissionKey],
              }
            : r
        )
      );

      setMessage({ type: 'success', text: 'Permission updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update permission' });
    } finally {
      setSaving(false);
    }
  };

  if (currentProfile?.actor !== 'super_administrator') {
    return (
      <div className="p-8">
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-center">
          <h2 className="text-xl font-bold text-rose-900">Access Denied</h2>
          <p className="mt-2 text-rose-700">Only Super Administrators can manage permissions.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-slate-600">Loading permissions...</div>
      </div>
    );
  }

  const selectedRoleData = roles.find((r) => r.role_key === selectedRole);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Permissions Management</h1>
        <p className="mt-2 text-slate-600">Assign granular permissions to each role</p>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-xl p-4 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role Selector */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Roles</h2>
            <div className="space-y-2">
              {roles.map((role) => (
                <button
                  key={role.role_key}
                  type="button"
                  onClick={() => setSelectedRole(role.role_key)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedRole === role.role_key
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold text-slate-900">{role.role_name}</div>
                  <div className="text-xs text-slate-500 mt-1">{role.permissions.length} permissions</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions List */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">{selectedRoleData?.role_name}</h2>
              <p className="text-sm text-slate-600 mt-1">{selectedRoleData?.description}</p>
            </div>

            <div className="space-y-3">
              {permissions.map((permission) => {
                const isGranted = selectedRoleData?.permissions.includes(permission.permission_key);
                return (
                  <div
                    key={permission.id}
                    className="flex items-start justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{permission.permission_name}</div>
                      <div className="text-sm text-slate-600 mt-1">{permission.description}</div>
                      <div className="text-xs text-slate-500 mt-2 font-mono">{permission.permission_key}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePermission(permission.permission_key)}
                      disabled={saving}
                      className={`ml-4 px-4 py-2 rounded-lg font-semibold transition-all ${
                        isGranted
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isGranted ? '✓ Granted' : 'Grant'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
