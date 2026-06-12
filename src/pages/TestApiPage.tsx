import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAppDataStore } from '../store/appDataStore';

export default function TestApiPage() {
  const { login, logout, isAuthenticated, currentProfile } = useAuthStore();
  const { fetchAll, dataReady, users, donors, grants, isLoading, apiError } = useAppDataStore();
  const [loginStatus, setLoginStatus] = useState('');

  const handleLogin = async () => {
    setLoginStatus('Logging in...');
    const success = await login({
      actor: 'super_administrator',
      email: 'admin@ngofund.local',
      password: 'admin123',
    });
    if (success) {
      setLoginStatus('✓ Logged in successfully');
      await fetchAll();
    } else {
      setLoginStatus('✗ Login failed');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAll();
    }
  }, [isAuthenticated, fetchAll]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Integration Test</h1>

        {/* Auth Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          
          {!isAuthenticated ? (
            <div>
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Login as Super Admin
              </button>
              {loginStatus && <p className="mt-2 text-sm">{loginStatus}</p>}
            </div>
          ) : (
            <div>
              <p className="text-green-600 mb-2">✓ Authenticated</p>
              <p className="text-sm text-gray-600 mb-2">
                User: {currentProfile?.name} ({currentProfile?.email})
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Role: {currentProfile?.actor}
              </p>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Data Loading Section */}
        {isAuthenticated && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Data Loading Status</h2>
            
            {isLoading && <p className="text-blue-600">Loading data...</p>}
            {apiError && <p className="text-red-600">Error: {apiError}</p>}
            {dataReady && <p className="text-green-600">✓ Data loaded successfully</p>}
          </div>
        )}

        {/* Data Summary */}
        {dataReady && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Data Summary</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-gray-600">Users</p>
                <p className="text-2xl font-bold text-blue-600">{users.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-sm text-gray-600">Donors</p>
                <p className="text-2xl font-bold text-green-600">{donors.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <p className="text-sm text-gray-600">Grants</p>
                <p className="text-2xl font-bold text-purple-600">{grants.length}</p>
              </div>
            </div>

            {/* Users List */}
            {users.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Users</h3>
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.user_id} className="text-sm p-2 bg-gray-50 rounded">
                      <span className="font-medium">{user.full_name}</span>
                      <span className="text-gray-600"> - {user.email}</span>
                      <span className="text-gray-500"> ({user.role})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
