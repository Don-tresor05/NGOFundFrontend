import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Bell } from 'lucide-react';

interface TopHeaderProps {
  pageTitle: string;
  notificationCount?: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ pageTitle, notificationCount = 3 }) => {
  const { currentUser } = useAuthStore();

  return (
    <div className="bg-white px-8 py-0 h-[70px] flex items-center justify-between border-b border-[#dee2e6] sticky top-0 z-40">
      <div>
        <h2 className="text-2xl text-[#212529] m-0">{pageTitle}</h2>
        <div className="text-sm text-[#6c757d]">Welcome back, {currentUser.name}</div>
      </div>

      <div className="flex items-center gap-5">
        {/* Notifications */}
        <div className="relative cursor-pointer text-[#6c757d] hover:text-[#212529] transition-colors">
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#F44336] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e9ecef] flex items-center justify-center text-[#212529] font-semibold">
            {currentUser.avatarText}
          </div>
          <div>
            <div className="font-semibold text-[#212529]">{currentUser.name}</div>
            <div className="text-xs text-[#6c757d] capitalize">{currentUser.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
