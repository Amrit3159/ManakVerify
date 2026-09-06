import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  CheckCheck,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import type { NotificationType } from '@/types';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userNotifications, markRead, markAllRead } = useData();

  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const filtered = userNotifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-rose-600" />;
      case 'INFO':
      default:
        return <Info className="w-5 h-5 text-primary-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Notifications & Alerts</h1>
          <p className="page-subtitle">
            Statutory metrological inspection notices, verification clearances, and renewal reminders.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<CheckCheck className="w-4 h-4" />}
            onClick={markAllRead}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setFilter('ALL')}
          className={[
            'text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors',
            filter === 'ALL'
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-500 hover:text-gray-900',
          ].join(' ')}
        >
          All ({userNotifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={[
            'text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors',
            filter === 'UNREAD'
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-500 hover:text-gray-900',
          ].join(' ')}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            title="No notifications"
            description={
              filter === 'UNREAD'
                ? "You're all caught up! No unread notices."
                : 'No alerts in your metrological inbox.'
            }
            icon={<Bell className="w-8 h-8 text-gray-400" />}
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(n => (
            <Card
              key={n.id}
              padding="sm"
              className={[
                'transition-all hover:border-gray-300',
                !n.isRead ? 'bg-indigo-50/30 border-indigo-100' : 'bg-white',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3 p-2">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-gray-400 font-mono pt-1">
                      {n.createdAt.replace('T', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {n.link && (
                    <Button
                      size="xs"
                      variant="ghost"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => {
                        markRead(n.id);
                        navigate(n.link!);
                      }}
                    >
                      View
                    </Button>
                  )}
                  {!n.isRead && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-[11px] text-gray-400 hover:text-gray-700 px-2 py-1 rounded"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
