import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  PanelLeftClose,
  Bell,
  LogOut,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

// ============================================================
// Types
// ============================================================

interface HeaderProps {
  onToggleSidebar:    () => void;
  onOpenMobileSidebar: () => void;
}

// ============================================================
// Component
// ============================================================

export function Header({ onToggleSidebar, onOpenMobileSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const { unreadCount, userNotifications, markRead } = useData();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadge: Record<string, string> = {
    business: 'Business Owner',
    inspector: 'Inspector',
    admin: 'Government Admin',
  };

  return (
    <header className="shrink-0 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between gap-4">
      {/* Left */}
      <div className="flex items-center gap-2">
        {/* Mobile menu */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Desktop collapse */}
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>

        {/* Breadcrumb area - left empty for pages to fill via portal if needed */}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Public verify link */}
        <a
          href="/verify"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Public Verify
          <ExternalLink className="w-3 h-3" />
        </a>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(p => !p)}
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 animate-slide-in">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-primary-700 font-medium">{unreadCount} unread</span>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {userNotifications.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
                ) : (
                  userNotifications.slice(0, 6).map(n => (
                    <button
                      key={n.id}
                      onClick={() => { markRead(n.id); setNotifOpen(false); }}
                      className={[
                        'w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50',
                        !n.isRead ? 'bg-indigo-50/40' : '',
                      ].join(' ')}
                    >
                      <div className="flex items-start gap-2">
                        {!n.isRead && (
                          <span className="w-2 h-2 bg-primary-600 rounded-full mt-1.5 shrink-0" />
                        )}
                        <div className={!n.isRead ? '' : 'ml-4'}>
                          <p className="text-xs font-semibold text-gray-900">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(p => !p)}
            className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-primary-700">
                {user?.name.charAt(0) ?? '?'}
              </span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-800 max-w-[120px] truncate">
              {user?.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl border border-gray-200 shadow-xl z-50 animate-slide-in">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                  {user?.role ? roleBadge[user.role] : ''}
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
