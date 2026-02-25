import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { UserSwitcher } from './components/UserSwitcher';
import { useAuthStore } from './store/authStore';
import { ADMIN_MODULES } from './constants/modules';
import {
  AdminDashboard,
  DonorManagement,
  FundTracking,
  ProjectAllocation,
  ExpenditureMonitoring,
  StaffOperations,
  TestingValidation,
  UserManagement,
  ReportsAnalytics,
  AuditCompliance,
} from './pages';

const PAGES = {
  dashboard: { component: AdminDashboard, title: 'Dashboard & Transparency Portal' },
  'donor-management': { component: DonorManagement, title: 'Donor Management Module' },
  'fund-tracking': { component: FundTracking, title: 'Fund Collection & Tracking' },
  'project-allocation': { component: ProjectAllocation, title: 'Project Fund Allocation' },
  'expenditure-monitoring': { component: ExpenditureMonitoring, title: 'Expenditure Monitoring' },
  'staff-operations': { component: StaffOperations, title: 'Staff & Operations' },
  'testing-validation': { component: TestingValidation, title: 'Testing & Validation' },
  'user-management': { component: UserManagement, title: 'User Management' },
  'reports-analytics': { component: ReportsAnalytics, title: 'Reports & Analytics' },
  'audit-compliance': { component: AuditCompliance, title: 'Audit & Compliance' },
};

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const { currentUser } = useAuthStore();

  const pageConfig = PAGES[currentPage as keyof typeof PAGES] || PAGES.dashboard;
  const PageComponent = pageConfig.component;

  return (
    <div className="flex h-screen bg-[#f8f9fa]">
      {/* Sidebar */}
      <Sidebar
        onOpenUserSwitcher={() => setIsUserSwitcherOpen(true)}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <TopHeader pageTitle={pageConfig.title} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <PageComponent />
        </main>
      </div>

      {/* User Switcher Modal */}
      <UserSwitcher isOpen={isUserSwitcherOpen} onClose={() => setIsUserSwitcherOpen(false)} />
    </div>
  );
}

export default App;
