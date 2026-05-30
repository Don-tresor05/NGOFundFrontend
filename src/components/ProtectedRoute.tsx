import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppDataStore } from '../store/appDataStore';
import { useAuthStore } from '../store/authStore';
import { AppSidebar } from './AppSidebar';
import { WorkspaceSyncScreen } from './WorkspaceSyncScreen';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authReady = useAuthStore((state) => state.authReady);
  const currentProfile = useAuthStore((state) => state.currentProfile);
  const hydrateProfile = useAuthStore((state) => state.hydrateProfile);
  const fetchAll = useAppDataStore((state) => state.fetchAll);
  const isLoading = useAppDataStore((state) => state.isLoading);
  const dataReady = useAppDataStore((state) => state.dataReady);
  const apiError = useAppDataStore((state) => state.apiError);

  useEffect(() => {
    hydrateProfile();
  }, [hydrateProfile]);

  useEffect(() => {
    if (isAuthenticated && authReady) {
      fetchAll();
    }
  }, [authReady, fetchAll, isAuthenticated]);

  if (!authReady) {
    return <div className="auth-shell text-sm font-semibold text-slate-600">Restoring secure session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!dataReady || !currentProfile) {
    if (!currentProfile) {
      return null;
    }

    return (
      <WorkspaceSyncScreen
        profile={currentProfile}
        isLoading={isLoading}
        apiError={apiError}
        onRetry={fetchAll}
      />
    );
  }

  return (
    <div className="app-shell">
      <AppSidebar />
      <div className="app-main">
        <Outlet />
      </div>
    </div>
  );
}
