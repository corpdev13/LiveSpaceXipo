import React from 'react';
import { Bell } from 'lucide-react';
import { useLocation } from 'wouter';
import { useListNotifications, getListNotificationsQueryKey } from '@workspace/api-client-react';

export default function NotificationBell() {
  const [, setLocation] = useLocation();
  const user = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('spcx_user') || 'null')
    : null;
  const email = user?.email ?? '';

  const { data } = useListNotifications(
    { email },
    {
      query: {
        enabled: !!email,
        queryKey: getListNotificationsQueryKey({ email }),
        refetchInterval: 30000,
      },
    },
  );

  const unreadCount = data?.filter((notification) => !notification.read).length ?? 0;

  return (
    <button
      onClick={() => setLocation('/updates')}
      aria-label={unreadCount ? `${unreadCount} unread notifications` : 'Notifications'}
      className="relative text-white/70 hover:text-white transition-colors cursor-pointer"
    >
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold font-display leading-5 text-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}