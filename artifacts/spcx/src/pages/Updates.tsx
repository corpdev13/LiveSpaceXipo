import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Menu, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  useListDeposits,
  getListDepositsQueryKey,
  useListNotifications,
  getListNotificationsQueryKey,
  useMarkNotificationsRead,
} from '@workspace/api-client-react';
import SideNav from '../components/SideNav';
import NotificationBell from '../components/NotificationBell';

export default function Updates() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('spcx_user') || 'null') : null;
  const email: string = user?.email ?? '';

  useEffect(() => {
    if (!user) setLocation('/signin');
  }, [user, setLocation]);

  const { data: deposits, isLoading } = useListDeposits({ email }, { query: { enabled: !!email, queryKey: getListDepositsQueryKey({ email }) } });
  const { data: notifications, isLoading: notificationsLoading } = useListNotifications(
    { email },
    { query: { enabled: !!email, queryKey: getListNotificationsQueryKey({ email }) } },
  );
  const markNotificationsRead = useMarkNotificationsRead();

  useEffect(() => {
    if (!notificationsLoading && notifications?.some((notification) => !notification.read)) {
      markNotificationsRead.mutate(
        { data: { email } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey({ email }) });
          },
        },
      );
    }
  }, [email, notificationsLoading, notifications, markNotificationsRead, queryClient]);

  const handleSignOut = () => {
    localStorage.removeItem('spcx_user');
    setLocation('/');
  };

  const depositStatusMeta = {
    completed: { icon: CheckCircle2, color: 'text-green-400', label: 'Deposit completed' },
    pending: { icon: Clock, color: 'text-yellow-400', label: 'Deposit pending review' },
    failed: { icon: XCircle, color: 'text-red-400', label: 'Deposit failed' },
  } as const;

  const items = [
    ...(deposits ?? []).map((d) => ({
      id: `deposit-${d.id}`,
      icon: depositStatusMeta[d.status].icon,
      color: depositStatusMeta[d.status].color,
      title: depositStatusMeta[d.status].label,
      detail: `$${parseFloat(d.amount).toFixed(2)} via ${d.method}${d.coin ? ` (${d.coin})` : ''}`,
      time: new Date(d.createdAt),
    })),
    {
      id: 'account-approved',
      icon: CheckCircle2,
      color: 'text-green-400',
      title: 'Investor access approved',
      detail: 'You can now trade and deposit funds.',
      time: null,
    },
  ].sort((a, b) => {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return b.time.getTime() - a.time.getTime();
  });

  return (
    <div className="min-h-[100dvh] bg-[#050a0f] text-white selection:bg-white/20 flex flex-col">
      <SideNav open={menuOpen} onClose={() => setMenuOpen(false)} onSignOut={handleSignOut} />

      <header className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <button onClick={() => setMenuOpen(true)} className="text-white/70 hover:text-white transition-colors cursor-pointer">
          <Menu className="w-6 h-6" />
        </button>
        <NotificationBell />
      </header>

      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
          <h1 className="text-3xl font-bold font-display uppercase tracking-widest mb-1">Updates</h1>
          <p className="text-sm text-white/50 tracking-wider font-display uppercase">Account and deposit activity.</p>
        </motion.div>

        {isLoading && <p className="text-white/40 font-display tracking-widest uppercase text-sm">Loading...</p>}

        {!isLoading && (
          <div className="flex flex-col gap-3">
            {notifications?.map((notification, i) => (
              <motion.div
                key={`notification-${notification.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="border border-red-500/30 bg-red-500/5 p-5"
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="text-xs text-red-400 font-display font-bold tracking-widest uppercase">Message from Broker Team</div>
                  <div className="text-xs text-white/30 font-display tracking-wider shrink-0">
                    {new Date(notification.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{notification.message}</p>
              </motion.div>
            ))}

            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-start gap-4 border border-white/10 p-4"
              >
                <item.icon className={`w-5 h-5 shrink-0 mt-0.5 ${item.color}`} />
                <div className="flex-1">
                  <div className="font-display font-bold tracking-wider">{item.title}</div>
                  <div className="text-sm text-white/50 mt-0.5">{item.detail}</div>
                </div>
                {item.time && (
                  <div className="text-xs text-white/30 font-display tracking-wider shrink-0">
                    {item.time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
