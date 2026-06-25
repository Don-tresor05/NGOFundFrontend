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
  SuperAdminUserManagementPage,
  PermissionMatrixEditorPage,
  AuditTrailExplorerPage,
  LoginActivityViewerPage,
  SessionSettingsPage,
  CustomizableDashboardPage,
  ComplianceChecklistPage,
  DocumentRepositoryPage,
  ExceptionReportPage,
  TestDonationPage,
  DonorMessagesPage,
  FinanceDashboardPage,
  FinanceControlsPage,
  BudgetReallocationPage,
  ExpenseApprovalWorkflowPage,
  BankReconciliationPage,
  VendorPaymentTrackingPage,
  PaymentSchedulingPage,
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
        <Route path="/test-donation" element={<TestDonationPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password/confirm" element={<ConfirmPasswordPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/verify-account" element={<VerifyAccountPage />} />
        <Route path="/app" element={<ProtectedRoute />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="finance" element={<FinanceDashboardPage />} />
          <Route path="finance/controls" element={<FinanceControlsPage />} />
          <Route path="finance/reallocations" element={<BudgetReallocationPage />} />
          <Route path="finance/approvals" element={<ExpenseApprovalWorkflowPage />} />
          <Route path="finance/reconciliation" element={<BankReconciliationPage />} />
          <Route path="finance/vendors" element={<VendorPaymentTrackingPage />} />
          <Route path="finance/payments" element={<PaymentSchedulingPage />} />
          <Route path="donor-portal" element={<DonorPortalPage />} />
          <Route path="donor-messages" element={<DonorMessagesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="user-management" element={<UserManagementPage />} />
          <Route path="permissions" element={<PermissionsManagementPage />} />
          <Route path="user-permissions" element={<UserPermissionsPage />} />
          <Route path="use-cases/:useCaseId" element={<UseCasePage />} />
          {/* Super Admin Features */}
          <Route path="admin/users" element={<SuperAdminUserManagementPage />} />
          <Route path="admin/permissions" element={<PermissionMatrixEditorPage />} />
          <Route path="admin/audit-logs" element={<AuditTrailExplorerPage />} />
          <Route path="admin/login-activity" element={<LoginActivityViewerPage />} />
          <Route path="admin/session-settings" element={<SessionSettingsPage />} />
          <Route path="admin/custom-dashboard" element={<CustomizableDashboardPage />} />
          <Route path="admin/compliance-checklist" element={<ComplianceChecklistPage />} />
          <Route path="admin/document-repository" element={<DocumentRepositoryPage />} />
          <Route path="admin/exception-reports" element={<ExceptionReportPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
