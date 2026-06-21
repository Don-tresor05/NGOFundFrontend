import { Bell } from 'lucide-react';
import { useState } from 'react';
import { ACTORS } from '../constants/appModel';
import { useAuthStore } from '../store/authStore';
import { useAppDataStore } from '../store/appDataStore';
import { BrandLogo } from './BrandLogo';
import { HighlightedText } from './HighlightedText';

interface AppHeaderProps {
  title: string;
  summary: string;
}

export function AppHeader({ title, summary }: AppHeaderProps) {
  const currentProfile = useAuthStore((state) => state.currentProfile);
  const notifications = useAppDataStore((state) => state.notifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const actor = ACTORS.find((entry) => entry.id === currentProfile?.actor);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const recentNotifications = notifications.slice(0, 5);

  const markAsRead = async (notificationId: number) => {
    try {
      console.log('Marking notification as read:', notificationId);
      const token = localStorage.getItem('access_token');
      console.log('Token exists:', !!token);
      
      const response = await fetch(`http://127.0.0.1:8000/api/notifications/${notificationId}/mark-read/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        console.log('Notification marked as read, reloading...');
        window.location.reload();
      } else {
        const error = await response.text();
        console.error('Failed to mark as read:', error);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <header className="panel-card sticky top-0 z-20 mb-6 border-amber-100 bg-white/95 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <BrandLogo compact />
          <div>
            <p className="eyebrow">{actor?.label}</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              <HighlightedText text={title} />
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">{summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-full border border-amber-200 bg-amber-50 p-3 text-slate-700 hover:bg-amber-100 transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-amber-100 bg-white shadow-2xl z-20">
                  <div className="border-b border-slate-200 p-4">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-xs text-slate-600 mt-1">{unreadCount} unread</p>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {recentNotifications.length > 0 ? (
                      recentNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`border-b border-slate-100 p-4 hover:bg-slate-50 cursor-pointer ${
                            !notification.is_read ? 'bg-amber-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`h-2 w-2 rounded-full mt-1.5 ${
                              !notification.is_read ? 'bg-rose-500' : 'bg-slate-300'
                            }`} />
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-slate-900">
                                {notification.title}
                              </p>
                              <p className="text-xs text-slate-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-400 mt-2">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 5 && (
                    <div className="border-t border-slate-200 p-3 text-center">
                      <button className="text-sm font-semibold text-[#0f766e] hover:text-[#1f6f78]">
                        View All Notifications
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="font-semibold text-slate-900">{currentProfile?.name}</div>
            <div className="text-xs text-slate-500">{currentProfile?.email}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
