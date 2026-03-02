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
    <aside className="w-64 bg-[#FFFED4] text-[#1a1a2e] flex flex-col border-r border-gray-300">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-300 flex items-center justify-center">
        <img src="/newlogo.png" alt="Logo" className="h-10 w-auto" />
      </div>

      {/* User Info Section */}
      <div className="p-5 border-b border-gray-300">
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 status-badge ${getBadgeClass(currentUser.role)}`}>
          {getRoleIcon(currentUser.badgeIcon)} {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
        </div>
        <div className="font-semibold text-[#1a1a2e] mb-1">{currentUser.name}</div>
        <div className="text-gray-700 text-sm">{currentUser.email}</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 overflow-y-auto">
        {currentUser.role === 'admin' && (
          <ul className="space-y-1 px-0">
            {ADMIN_MODULES.map((module) => (
              <li key={module.id}>
                <button
                  onClick={() => onPageChange(module.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:text-[#1a1a2e] transition-colors border-l-4 ${
                    currentPage === module.id
                      ? 'border-l-[#FFC857] bg-gray-200 text-[#1a1a2e]'
                      : 'border-l-transparent hover:bg-gray-100'
                  }`}
                >
                  <module.icon size={20} />
                  {module.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* Footer */}
      <div className="p-5 border-t border-gray-300 space-y-2">
        <Button
          variant="outline"
          block
          icon={ArrowRightLeft}
          onClick={onOpenUserSwitcher}
          className="!text-gray-700 !border-gray-400 hover:!text-[#1a1a2e]"
        >
          Switch Role
        </Button>
      </div>
    </aside>
  );
};
