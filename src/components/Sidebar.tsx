import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from './Button';
import { LogOut, ArrowRightLeft } from 'lucide-react';
import { ADMIN_MODULES } from '../constants/modules';

interface SidebarProps {
  onOpenUserSwitcher: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenUserSwitcher, currentPage, onPageChange }) => {
  const { currentUser } = useAuthStore();

  const getBadgeClass = (role: string) => {
    const badgeMap: Record<string, string> = {
      admin: 'badge-admin',
      finance: 'badge-finance',
      auditor: 'badge-auditor',
      donor: 'badge-donor',
    };
    return badgeMap[role] || '';
  };

  const getRoleIcon = (icon: string) => {
    const iconMap: Record<string, string> = {
      'shield': '🛡️',
      'chart-line': '📈',
      'search': '🔍',
      'heart': '❤️',
      'user': '👤',
    };
    return iconMap[icon] || icon;
  };

  return (
    <aside className="w-64 bg-[#1a1a2e] text-white flex flex-col border-r border-white/10">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#FFC857] rounded-lg flex items-center justify-center text-[#1a1a2e] font-bold text-sm">
          RPA
        </div>
        <div className="font-bold text-lg">
          <span className="text-[#FFC857]">RPA</span> Platform
        </div>
      </div>

      {/* User Info Section */}
      <div className="p-5 border-b border-white/10">
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 status-badge ${getBadgeClass(currentUser.role)}`}>
          {getRoleIcon(currentUser.badgeIcon)} {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
        </div>
        <div className="font-semibold text-white mb-1">{currentUser.name}</div>
        <div className="text-white/70 text-sm">{currentUser.email}</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 overflow-y-auto">
        {currentUser.role === 'admin' && (
          <ul className="space-y-1 px-0">
            {ADMIN_MODULES.map((module) => (
              <li key={module.id}>
                <button
                  onClick={() => onPageChange(module.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-sm text-white/70 hover:text-white transition-colors border-l-4 ${
                    currentPage === module.id
                      ? 'border-l-[#FFC857] bg-white/5 text-white'
                      : 'border-l-transparent hover:bg-white/5'
                  }`}
                >
                  <span>{module.icon}</span>
                  {module.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* Footer */}
      <div className="p-5 border-t border-white/10 space-y-2">
        <Button
          variant="outline"
          block
          icon={ArrowRightLeft}
          onClick={onOpenUserSwitcher}
          className="!text-white/80 !border-white/30 hover:!text-white"
        >
          Switch Role
        </Button>
      </div>
    </aside>
  );
};
