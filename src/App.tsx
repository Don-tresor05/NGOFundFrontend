import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components';
import {
  CreateAccountPage,
  ConfirmPasswordPage,
  DashboardPage,
  DonorPortalPage,
  LoginPage,
  NotFoundPage,
  ProfilePage,
  ResetPasswordPage,
  VerifyAccountPage,
  UseCasePage,
  PublicProjectsPage,
} from './pages';
import TestApiPage from './pages/TestApiPage';
import UserManagementPage from './pages/UserManagementPage';
import PermissionsManagementPage from './pages/PermissionsManagementPage';
import UserPermissionsPage from './pages/UserPermissionsPage';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/projects" element={<PublicProjectsPage />} />
        <Route path="/test-api" element={<TestApiPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password/confirm" element={<ConfirmPasswordPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/verify-account" element={<VerifyAccountPage />} />
        <Route path="/app" element={<ProtectedRoute />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="donor-portal" element={<DonorPortalPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="user-management" element={<UserManagementPage />} />
          <Route path="permissions" element={<PermissionsManagementPage />} />
          <Route path="user-permissions" element={<UserPermissionsPage />} />
          <Route path="use-cases/:useCaseId" element={<UseCasePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
