import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Menu, ArrowUpRight, Wallet, BarChart3, History, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGetHoldings, getGetHoldingsQueryKey, useGetStockQuote, useListDeposits, getListDepositsQueryKey, useListWithdrawals, getListWithdrawalsQueryKey } from '@workspace/api-client-react';
import SideNav from '../components/SideNav';
import NotificationBell from '../components/NotificationBell';
import elonPhoto from '@assets/IMG_0319_1784055905752.jpeg';

export default function Management() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('spcx_user') || 'null') : null;
  const email: string = user?.email ?? '';
  const { data: holdings } = useGetHoldings({ email }, { query: { enabled: !!email, queryKey: getGetHoldingsQueryKey({ email }) } });
  const { data: quote } = useGetStockQuote();
  const { data: deposits } = useListDeposits({ email }, { query: { enabled: !!email, queryKey: getListDepositsQueryKey({ email }) } });
  const { data: withdrawals } = useListWithdrawals({ email }, { query: { enabled: !!email, queryKey: getListWithdrawalsQueryKey({ email }) } });

  useEffect(() => {
    if (!user) setLocation('/signin');
  }, [user, setLocation]);

  const handleSignOut = () => {
    localStorage.removeItem('spcx_user');
    setLocation('/');
  };

  const leaders = [
    { name: 'Elon Musk', role: 'Founder & CEO', photo: elonPhoto },
    { name: 'Gwynne Shotwell', role: 'President & Chief Operating Officer' },
    { name: 'Bret Johnsen', role: 'Chief Financial Officer' },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#050a0f] text-white selection:bg-white/20 flex flex-col">
      <SideNav open={menuOpen} onClose={() => setMenuOpen(false)} onSignOut={handleSignOut} />

      <header className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <button onClick={() => setMenuOpen(true)} className="text-white/70 hover:text-white transition-colors cursor-pointer">
          <Menu className="w-6 h-6" />
        </button>
          <NotificationBell />
      </header>

      <main className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
          <h1 className="text-3xl font-bold font-display uppercase tracking-widest mb-2">Management</h1>
          <p className="text-sm text-white/50 tracking-wider font-display uppercase">Account management, portfolio oversight & corporate governance.</p>
        </motion.div>

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mb-14">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xs text-white/40 font-display tracking-widest uppercase mb-1">Investor account</h2>
              <p className="text-lg font-display font-bold tracking-wider">{user?.fullName || 'Your SPCX account'}</p>
            </div>
            <span className="flex items-center gap-2 text-xs text-green-400 font-display tracking-widest uppercase"><ShieldCheck className="w-4 h-4" /> Approved</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Cash Balance', value: `$${parseFloat(holdings?.cashBalance ?? '0').toFixed(2)}`, icon: Wallet },
              { label: 'Shares Owned', value: parseFloat(holdings?.shares ?? '0').toFixed(4), icon: BarChart3 },
              { label: 'Share Value', value: `$${(parseFloat(holdings?.shares ?? '0') * (quote?.price ?? 147.62)).toFixed(2)}`, icon: BarChart3 },
              { label: 'Withdrawals', value: holdings?.withdrawalEnabled ? 'Enabled' : 'By approval', icon: ArrowUpRight },
            ].map((stat) => (
              <div key={stat.label} className="border border-white/10 bg-[#0a0f14] p-4">
                <stat.icon className="w-4 h-4 text-white/40 mb-3" />
                <div className="text-[10px] text-white/40 font-display tracking-widest uppercase mb-1">{stat.label}</div>
                <div className="text-base font-display font-bold tracking-wider">{stat.value}</div>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-4"><History className="w-4 h-4 text-white/40" /><h3 className="text-xs font-display font-bold tracking-widest uppercase">Recent deposits</h3></div>
              <div className="space-y-3">
                {!deposits?.length && <p className="text-sm text-white/40">No deposits recorded.</p>}
                {deposits?.slice(0, 3).map((deposit) => (
                  <div key={deposit.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-white/60">{deposit.coin || deposit.method} · {deposit.status}</span>
                    <span className="font-display font-bold">${parseFloat(deposit.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-4"><ArrowUpRight className="w-4 h-4 text-white/40" /><h3 className="text-xs font-display font-bold tracking-widest uppercase">Withdrawal activity</h3></div>
              <div className="space-y-3">
                {!withdrawals?.length && <p className="text-sm text-white/40">No withdrawal requests.</p>}
                {withdrawals?.slice(0, 3).map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-white/60">{withdrawal.coin} · {withdrawal.status}</span>
                    <span className="font-display font-bold">${parseFloat(withdrawal.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <div className="flex flex-col gap-6 mb-12">
          {leaders.map((leader, i) => (
            <motion.div
              key={leader.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
              className="flex items-start gap-5 border-b border-white/10 pb-6 last:border-0"
            >
              {leader.photo ? (
                <img src={leader.photo} alt={leader.name} className="w-20 h-20 object-cover grayscale contrast-125 shrink-0" />
              ) : (
                <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center shrink-0 font-display text-lg tracking-widest text-white/40">
                  {leader.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold font-display uppercase tracking-widest mb-1">{leader.name}</h2>
                <p className="text-sm text-white/50 tracking-wider font-display uppercase mb-4">{leader.role}</p>
                <button className="px-4 py-2 text-xs font-display tracking-widest uppercase border border-white/20 text-white/70 hover:text-white hover:border-white/50 transition-colors cursor-pointer">
                  LEARN MORE
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
          <button className="px-6 py-3 text-sm font-display font-bold tracking-widest uppercase border border-white/20 text-white hover:bg-white/5 transition-colors cursor-pointer inline-block">
            CONTACT MANAGEMENT
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.6 }} className="mt-16 border-t border-white/10 pt-8 flex flex-col gap-4">
          <button className="flex items-center justify-between text-white/50 hover:text-white transition-colors cursor-pointer group w-full text-left">
            <span className="text-sm font-display tracking-widest uppercase">Audit Committee Charter</span>
            <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
          </button>
          <button className="flex items-center justify-between text-white/50 hover:text-white transition-colors cursor-pointer group w-full text-left">
            <span className="text-sm font-display tracking-widest uppercase">Compensation and Nominating Committee Charter</span>
            <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
          </button>
        </motion.div>
      </main>
    </div>
  );
}
