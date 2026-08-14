import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Menu, User, Mail, ShieldCheck, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import SideNav from '../components/SideNav';
import NotificationBell from '../components/NotificationBell';

const PREFS_KEY = 'spcx_notification_prefs';

type Prefs = { statusEmails: boolean; marketUpdates: boolean };

function loadPrefs(): Prefs {
  if (typeof window === 'undefined') return { statusEmails: true, marketUpdates: false };
  try {
    return { statusEmails: true, marketUpdates: false, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') };
  } catch {
    return { statusEmails: true, marketUpdates: false };
  }
}

export default function Settings() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('spcx_user') || 'null') : null;

  useEffect(() => {
    if (!user) setLocation('/signin');
  }, [user, setLocation]);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const handleSignOut = () => {
    localStorage.removeItem('spcx_user');
    setLocation('/');
  };

  const togglePref = (key: keyof Prefs) => {
    setPrefs((p) => {
      const next = { ...p, [key]: !p[key] };
      toast.success(next[key] ? 'Preference enabled.' : 'Preference disabled.');
      return next;
    });
  };

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
          <h1 className="text-3xl font-bold font-display uppercase tracking-widest mb-1">Settings</h1>
          <p className="text-sm text-white/50 tracking-wider font-display uppercase">Manage your account and preferences.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mb-10">
          <h2 className="text-xs text-white/40 font-display tracking-widest uppercase mb-4">Account</h2>
          <div className="border border-white/10 divide-y divide-white/10">
            <div className="flex items-center gap-4 p-5">
              <User className="w-5 h-5 text-white/40 shrink-0" />
              <div>
                <div className="text-xs text-white/40 font-display tracking-widest uppercase">Full Name</div>
                <div className="font-display font-bold tracking-wider">{user?.fullName || '—'}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5">
              <Mail className="w-5 h-5 text-white/40 shrink-0" />
              <div>
                <div className="text-xs text-white/40 font-display tracking-widest uppercase">Email</div>
                <div className="font-display font-bold tracking-wider">{user?.email || '—'}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5">
              <ShieldCheck className="w-5 h-5 text-[#1a8a4a] shrink-0" />
              <div>
                <div className="text-xs text-white/40 font-display tracking-widest uppercase">Access Status</div>
                <div className="font-display font-bold tracking-wider">Approved Investor</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="mb-10">
          <h2 className="text-xs text-white/40 font-display tracking-widest uppercase mb-4">Notifications</h2>
          <div className="border border-white/10 divide-y divide-white/10">
            <button onClick={() => togglePref('statusEmails')} className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-white/5 transition-colors">
              <div>
                <div className="font-display font-bold tracking-wider">Account Status Emails</div>
                <div className="text-xs text-white/40 mt-1">Get notified when your investor access status changes.</div>
              </div>
              <div className={`w-12 h-7 rounded-full relative transition-colors shrink-0 ${prefs.statusEmails ? 'bg-[#1a8a4a]' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${prefs.statusEmails ? 'left-6' : 'left-1'}`} />
              </div>
            </button>
            <button onClick={() => togglePref('marketUpdates')} className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-white/5 transition-colors">
              <div>
                <div className="font-display font-bold tracking-wider">Market Updates</div>
                <div className="text-xs text-white/40 mt-1">Occasional news about SPCX price movement.</div>
              </div>
              <div className={`w-12 h-7 rounded-full relative transition-colors shrink-0 ${prefs.marketUpdates ? 'bg-[#1a8a4a]' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${prefs.marketUpdates ? 'left-6' : 'left-1'}`} />
              </div>
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <h2 className="text-xs text-white/40 font-display tracking-widest uppercase mb-4">Session</h2>
          <button onClick={handleSignOut} className="w-full flex items-center gap-4 border border-white/10 p-5 text-left hover:border-red-400/50 hover:text-red-400 transition-colors cursor-pointer">
            <LogOut className="w-5 h-5" />
            <span className="font-display font-bold tracking-widest uppercase text-sm">Sign Out</span>
          </button>
        </motion.div>
      </main>
    </div>
  );
}
