import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';

interface Permission {
  id: number;
  permission_key: string;
  permission_name: string;
  description: string;
}

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  permissions: string[];
}

export default function UserPermissionsPage() {
  const currentProfile = useAuthStore((state) => state.currentProfile);
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUser, setSelectedUser] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setMessage(null);
    try {
      const token = localStorage.getItem('ngofund_access_token');
      
      if (!token) {
        setMessage({ type: 'error', text: 'Not authenticated' });
        setLoading(false);
        return;
      }

      const [usersRes, permsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/permissions/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!usersRes.ok || !permsRes.ok) {
        setMessage({ type: 'error', text: 'Failed to load data' });
        setLoading(false);
        return;
      }

      const usersData = await usersRes.json();
      const permsData = await permsRes.json();

      const users = Array.isArray(usersData) ? usersData : usersData.results || [];
      const permissions = Array.isArray(permsData) ? permsData : permsData.results || [];

      // For now, use empty permissions array (backend would need user_permissions field)
      const usersWithPerms = users.map((user: any) => ({
        ...user,
        permissions: user.permissions || [],
      }));

      setUsers(usersWithPerms);
      setPermissions(permissions);
      if (usersWithPerms.length > 0) setSelectedUser(usersWithPerms[0].id);
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (permissionKey: string) => {
    const user = users.find((u) => u.id === selectedUser);
    if (!user) return;

    const hasPermission = user.permissions.includes(permissionKey);
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('ngofund_access_token');
      
      // Update user permissions via PATCH
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${selectedUser}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          permissions: hasPermission
            ? user.permissions.filter((p) => p !== permissionKey)
            : [...user.permissions, permissionKey],
        }),
      });

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser
            ? {
                ...u,
                permissions: hasPermission
                  ? u.permissions.filter((p) => p !== permissionKey)
                  : [...u.permissions, permissionKey],
              }
            : u
        )
      );

      setMessage({ type: 'success', text: 'Permission updated' });
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
          <p className="mt-2 text-rose-700">Only Super Administrators can manage user permissions.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-slate-600">Loading users...</div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const selectedUserData = users.find((u) => u.id === selectedUser);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">User Permissions</h1>
        <p className="mt-2 text-slate-600">Assign individual permissions to specific users</p>
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
        {/* User Selector */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Users</h2>
            
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4 text-sm"
            />

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUser(user.id)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    selectedUser === user.id
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold text-slate-900 text-sm">{user.full_name}</div>
                  <div className="text-xs text-slate-500 mt-1">{user.email}</div>
                  <div className="text-xs text-slate-400 mt-1">{user.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions List */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50">
              <h2 className="text-xl font-bold text-slate-900">{selectedUserData?.full_name}</h2>
              <p className="text-sm text-slate-600 mt-1">{selectedUserData?.email}</p>
              <div className="mt-2 inline-block px-3 py-1 rounded-lg bg-white text-xs font-semibold text-slate-700">
                {selectedUserData?.role}
              </div>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
              <strong>Note:</strong> User-specific permissions override role permissions. These are individual grants for this user only.
            </div>

            <div className="space-y-3">
              {permissions.map((permission) => {
                const isGranted = selectedUserData?.permissions.includes(permission.permission_key);
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
