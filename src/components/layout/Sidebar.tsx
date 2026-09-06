import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Scale,
  FileText,
  ClipboardList,
  Award,
  Bell,
  ChevronRight,
  Microscope,
  History,
  Building2,
  BarChart3,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import type { UserRole } from '@/types';

// ============================================================
// Nav item config
// ============================================================

interface NavItem {
  path:  string;
  label: string;
  icon:  React.ReactNode;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  business: [
    { path: '/business/dashboard',    label: 'Dashboard',        icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: '/business/instruments',  label: 'Instruments',      icon: <Scale className="w-4 h-4" /> },
    { path: '/business/applications', label: 'Applications',     icon: <FileText className="w-4 h-4" /> },
    { path: '/business/inspections',  label: 'Inspections',      icon: <ClipboardList className="w-4 h-4" /> },
    { path: '/business/certificates', label: 'Certificates',     icon: <Award className="w-4 h-4" /> },
    { path: '/business/notifications',label: 'Notifications',    icon: <Bell className="w-4 h-4" /> },
  ],
  inspector: [
    { path: '/inspector/dashboard',   label: 'Dashboard',        icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: '/inspector/inspections', label: 'My Inspections',   icon: <Microscope className="w-4 h-4" /> },
    { path: '/inspector/history',     label: 'Inspection History',icon: <History className="w-4 h-4" /> },
  ],
  admin: [
    { path: '/admin/dashboard',       label: 'Dashboard',        icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: '/admin/applications',    label: 'Applications',     icon: <FileText className="w-4 h-4" /> },
    { path: '/admin/businesses',      label: 'Businesses',       icon: <Building2 className="w-4 h-4" /> },
    { path: '/admin/instruments',     label: 'Instruments',      icon: <Scale className="w-4 h-4" /> },
    { path: '/admin/inspections',     label: 'Inspections',      icon: <ClipboardList className="w-4 h-4" /> },
    { path: '/admin/certificates',    label: 'Certificates',     icon: <Award className="w-4 h-4" /> },
    { path: '/admin/analytics',       label: 'Analytics',        icon: <BarChart3 className="w-4 h-4" /> },
  ],
};

// ============================================================
// Sidebar Props
// ============================================================

interface SidebarProps {
  collapsed:     boolean;
  mobileOpen:    boolean;
  onCloseMobile: () => void;
}

// ============================================================
// Component
// ============================================================

export function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const { user } = useAuth();
  const { unreadCount } = useData();

  if (!user) return null;

  const navItems = NAV_ITEMS[user.role];

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={[
          'hidden lg:flex flex-col bg-white border-r border-gray-200',
          'transition-all duration-200 shrink-0',
          collapsed ? 'w-16' : 'w-60',
        ].join(' ')}
      >
        <SidebarContent
          user={user}
          navItems={navItems}
          collapsed={collapsed}
          unreadCount={unreadCount}
        />
      </aside>

      {/* Mobile sidebar (slide-over) */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex flex-col w-72 bg-white border-r border-gray-200',
          'lg:hidden transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <Logo />
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent
          user={user}
          navItems={navItems}
          collapsed={false}
          unreadCount={unreadCount}
          onNavigate={onCloseMobile}
        />
      </aside>
    </>
  );
}

// ============================================================
// Sidebar inner content
// ============================================================

interface SidebarContentProps {
  user:        { name: string; email: string; role: UserRole };
  navItems:    NavItem[];
  collapsed:   boolean;
  unreadCount: number;
  onNavigate?: () => void;
}

function SidebarContent({ user, navItems, collapsed, unreadCount, onNavigate }: SidebarContentProps) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      {!collapsed && (
        <div className="px-4 py-5 border-b border-gray-100">
          <Logo />
        </div>
      )}
      {collapsed && (
        <div className="px-3 py-5 border-b border-gray-100">
          <ShieldCheck className="w-7 h-7 text-primary-700" />
        </div>
      )}

      {/* Role label */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            {user.role === 'business' ? 'Business Portal'
              : user.role === 'inspector' ? 'Inspector Portal'
              : 'Admin Portal'}
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {navItems.map(item => {
          const isActive = location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');
          const isNotifications = item.path.includes('notifications');

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={[
                'sidebar-item',
                isActive ? 'sidebar-item-active' : 'sidebar-item-inactive',
                collapsed ? 'justify-center' : '',
              ].join(' ')}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {isNotifications && unreadCount > 0 && (
                    <span className="ml-auto bg-primary-100 text-primary-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User info */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-primary-700">
                {user.name.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Logo
// ============================================================

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <ShieldCheck className="w-7 h-7 text-primary-700 shrink-0" />
      <div>
        <span className="text-base font-bold text-gray-900 leading-none">Maanak</span>
        <span className="text-base font-bold text-primary-700 leading-none">Verify</span>
      </div>
    </div>
  );
}
