import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppDataStore } from '../store/appDataStore';
import { useAuthStore } from '../store/authStore';
import { AppSidebar } from './AppSidebar';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authReady = useAuthStore((state) => state.authReady);
  const hydrateProfile = useAuthStore((state) => state.hydrateProfile);
  const fetchAll = useAppDataStore((state) => state.fetchAll);

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

  return (
    <div className="app-shell">
      <AppSidebar />
      <div className="app-main">
        <Outlet />
      </div>
    </div>
  );
}
