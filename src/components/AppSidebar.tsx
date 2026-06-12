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
            <NavLink to="/app/user-management" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <UsersRound size={18} />
              <span>User Management</span>
            </NavLink>
            <NavLink to="/app/user-permissions" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <ShieldCheck size={18} />
              <span>User Permissions</span>
            </NavLink>
            <NavLink to="/app/permissions" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <ShieldCheck size={18} />
              <span>Role Permissions</span>
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
