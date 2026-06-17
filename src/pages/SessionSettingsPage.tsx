import { useEffect, useState } from 'react';
import { Clock, Save, RefreshCw, Shield } from 'lucide-react';
import { Button } from '../components/Button';
import { apiRequest } from '../lib/api';

interface SystemSetting {
  id?: number;
  setting_key: string;
  setting_value: string;
  label: string;
  setting_group: string;
  description?: string;
}

export default function SessionSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [autoLogout, setAutoLogout] = useState('true');
  const [maxSessions, setMaxSessions] = useState('5');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await apiRequest('/system-settings/');
      const results = Array.isArray(data) ? data : data.results || [];
      setSettings(results);

      // Load current values
      const timeoutSetting = results.find((s: SystemSetting) => s.setting_key === 'session_timeout_minutes');
      const autoLogoutSetting = results.find((s: SystemSetting) => s.setting_key === 'auto_logout_enabled');
      const maxSessionsSetting = results.find((s: SystemSetting) => s.setting_key === 'max_concurrent_sessions');

      if (timeoutSetting) setSessionTimeout(timeoutSetting.setting_value);
      if (autoLogoutSetting) setAutoLogout(autoLogoutSetting.setting_value);
      if (maxSessionsSetting) setMaxSessions(maxSessionsSetting.setting_value);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        {
          setting_key: 'session_timeout_minutes',
          setting_value: sessionTimeout,
          label: 'Session Timeout (Minutes)',
          setting_group: 'ACCESS'
        },
        {
          setting_key: 'auto_logout_enabled',
          setting_value: autoLogout,
          label: 'Auto Logout Enabled',
          setting_group: 'ACCESS'
        },
        {
          setting_key: 'max_concurrent_sessions',
          setting_value: maxSessions,
          label: 'Max Concurrent Sessions',
          setting_group: 'ACCESS'
        }
      ];

      await apiRequest('/system-settings/bulk-update/', 'POST', updates);
      setHasChanges(false);
      alert('Session settings updated successfully!');
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset to default values?')) {
      setSessionTimeout('60');
      setAutoLogout('true');
      setMaxSessions('5');
      setHasChanges(true);
    }
  };

  const handleChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setHasChanges(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Session Settings</h1>
          <p className="text-gray-600 mt-1">Manage session timeout and security options</p>
        </div>
        <Shield className="text-blue-500" size={48} />
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-medium">⚠️ You have unsaved changes</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Session Timeout */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Clock size={18} />
            Session Timeout Duration (Minutes)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Users will be automatically logged out after this period of inactivity
          </p>
          <div className="flex gap-4">
            <input
              type="number"
              value={sessionTimeout}
              onChange={(e) => handleChange(setSessionTimeout, e.target.value)}
              min="1"
              max="1440"
              className="w-32 px-4 py-2 border rounded-lg"
            />
            <div className="flex gap-2">
              {[15, 30, 60, 120, 240].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => handleChange(setSessionTimeout, String(minutes))}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    sessionTimeout === String(minutes)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {minutes}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Auto Logout */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            Auto Logout on Inactivity
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Automatically log out users when they exceed the session timeout
          </p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="true"
                checked={autoLogout === 'true'}
                onChange={(e) => handleChange(setAutoLogout, e.target.value)}
                className="w-4 h-4"
              />
              <span className="text-sm">Enabled</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="false"
                checked={autoLogout === 'false'}
                onChange={(e) => handleChange(setAutoLogout, e.target.value)}
                className="w-4 h-4"
              />
              <span className="text-sm">Disabled</span>
            </label>
          </div>
        </div>

        {/* Max Concurrent Sessions */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            Maximum Concurrent Sessions
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Maximum number of active sessions a user can have simultaneously
          </p>
          <input
            type="number"
            value={maxSessions}
            onChange={(e) => handleChange(setMaxSessions, e.target.value)}
            min="1"
            max="10"
            className="w-32 px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Reset to Defaults
          </Button>
        </div>
      </div>

      {/* Information Panel */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Set timeout to 30-60 minutes for most users</li>
          <li>• Auto-logout helps keep accounts secure</li>
          <li>• Limit sessions to stop account sharing</li>
          <li>• Check login activity often to spot issues</li>
        </ul>
      </div>

      {/* Current Settings Summary */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Current Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">Session Timeout</p>
            <p className="text-2xl font-bold text-gray-900">{sessionTimeout} min</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">Auto Logout</p>
            <p className="text-2xl font-bold text-gray-900">
              {autoLogout === 'true' ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">Max Sessions</p>
            <p className="text-2xl font-bold text-gray-900">{maxSessions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
