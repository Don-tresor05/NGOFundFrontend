import { Link, NavLink } from 'react-router-dom';
import {
  BarChart3,
  ClipboardCheck,
  FileCheck2,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Network,
  ShieldCheck,
  TestTube2,
  UserRound,
  UsersRound,
  WalletCards,
  Shield,
  Activity,
  Clock,
  Settings,
  Layout,
  FolderOpen,
  AlertTriangle,
} from 'lucide-react';
import { ACTORS, PLATFORM_MODULES, USE_CASES } from '../constants/appModel';
import { useAuthStore } from '../store/authStore';
import { ModuleId } from '../types';
import { BrandLogo } from './BrandLogo';
import { Button } from './Button';

const moduleIcons: Record<ModuleId, typeof UsersRound> = {
  'donor-management': UsersRound,
  'fund-collection-tracking': HandCoins,
  'project-fund-allocation': Network,
  'expenditure-monitoring': WalletCards,
  'reporting-analytics': BarChart3,
  'staff-operations': ClipboardCheck,
  'testing-validation': TestTube2,
  'user-access-management': ShieldCheck,
  'dashboard-transparency': LayoutDashboard,
  'audit-compliance': FileCheck2,
};

export function AppSidebar() {
  const currentProfile = useAuthStore((state) => state.currentProfile);
  const logout = useAuthStore((state) => state.logout);

  if (!currentProfile) {
    return null;
  }

  const actor = ACTORS.find((entry) => entry.id === currentProfile.actor);
  const useCases = USE_CASES.filter((useCase) => useCase.actors.includes(currentProfile.actor));
  const moduleGroups = PLATFORM_MODULES.map((module) => ({
    ...module,
    useCases: useCases.filter((useCase) => useCase.moduleId === module.id),
  })).filter((module) => module.useCases.length > 0);
  const homePath = currentProfile.actor === 'donor_user' ? '/app/donor-portal' : '/app/dashboard';
  const homeLabel = currentProfile.actor === 'donor_user' ? 'Donor Portal' : 'Dashboard';
  const homeIcon = currentProfile.actor === 'donor_user' ? HandCoins : LayoutDashboard;
  const HomeIcon = homeIcon;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <Link to="/app/dashboard" className="flex items-center gap-3">
          <BrandLogo />
        </Link>
      </div>

      <div className="sidebar-user">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
            {currentProfile.avatarText}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{currentProfile.name}</div>
            <div className="text-sm text-slate-600">{actor?.label}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-primary-nav">
        <NavLink to={homePath} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
          <HomeIcon size={18} />
          <span>{homeLabel}</span>
        </NavLink>
        <NavLink to="/app/profile" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
          <UserRound size={18} />
          <span>Profile</span>
        </NavLink>
        {currentProfile.actor === 'super_administrator' && (
          <>
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Administration
            </div>
            <NavLink to="/app/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <UsersRound size={18} />
              <span>User Management</span>
            </NavLink>
            <NavLink to="/app/admin/permissions" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <Shield size={18} />
              <span>Permission Matrix</span>
            </NavLink>
            <NavLink to="/app/admin/audit-logs" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <Activity size={18} />
              <span>Audit Logs</span>
            </NavLink>
            <NavLink to="/app/admin/login-activity" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <Activity size={18} />
              <span>Login Activity</span>
            </NavLink>
            <NavLink to="/app/admin/session-settings" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <Clock size={18} />
              <span>Session Settings</span>
            </NavLink>
            <div className="my-2 border-t border-gray-200"></div>
            <NavLink to="/app/admin/custom-dashboard" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <Layout size={18} />
              <span>Custom Dashboard</span>
            </NavLink>
            <NavLink to="/app/admin/compliance-checklist" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <ClipboardCheck size={18} />
              <span>Compliance Checklist</span>
            </NavLink>
            <NavLink to="/app/admin/document-repository" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <FolderOpen size={18} />
              <span>Document Repository</span>
            </NavLink>
            <NavLink to="/app/admin/exception-reports" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <AlertTriangle size={18} />
              <span>Exception Reports</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-use-cases">
        <div className="sidebar-use-cases-header">
          <p className="section-label">Modules</p>
          <span>{moduleGroups.length}</span>
        </div>
        <div className="sidebar-use-cases-list">
          {moduleGroups.map((module) => {
            const Icon = moduleIcons[module.id];

            return (
              <section key={module.id} className="sidebar-module-group">
                <div className="sidebar-module-title">
                  <Icon size={15} />
                  <span>{module.title}</span>
                </div>
                <div className="mt-2 space-y-2">
                  {module.useCases.map((useCase) => (
                    <NavLink
                      key={`${module.id}-${useCase.id}`}
                      to={`/app/use-cases/${useCase.id}`}
                      className={({ isActive }) => `use-case-link ${isActive ? 'use-case-link-active' : ''}`}
                    >
                      <span className="block font-semibold text-slate-900">{useCase.title}</span>
                      <span className="mt-1 block text-xs text-slate-500">{useCase.summary}</span>
                    </NavLink>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <div className="sidebar-footer">
        <Button variant="outline" block icon={LogOut} onClick={logout}>
          Log Out
        </Button>
      </div>
    </aside>
  );
}
