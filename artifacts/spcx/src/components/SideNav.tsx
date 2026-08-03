import React from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, ClipboardList, TrendingUp, Bell, Users, Mail, Settings, LogOut, X } from 'lucide-react';

interface SideNavProps {
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

const navItems = [
  { label: 'Overview', path: '/dashboard', icon: Grid },
  { label: 'Trade', path: '/trade', icon: TrendingUp },
  { label: 'Orders', path: '/orders', icon: ClipboardList },
  { label: 'Updates', path: '/updates', icon: Bell },
  { label: 'Management', path: '/management', icon: Users },
  { label: 'Support', path: '/support', icon: Mail },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export default function SideNav({ open, onClose, onSignOut }: SideNavProps) {
  const [location] = useLocation();

  const handleSignOutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    onSignOut();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm cursor-pointer"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#0d1117]/95 backdrop-blur-md z-50 flex flex-col border-r border-white/10"
          >
            <div className="flex items-center justify-between p-6">
              <div className="text-2xl font-bold font-display tracking-widest text-white uppercase">SPCX</div>
              <button onClick={onClose} className="text-white/50 hover:text-white transition-colors cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
              {navItems.map((item, idx) => {
                const isActive = location === item.path;

                return (
                  <Link href={item.path} key={idx} onClick={onClose} className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors cursor-pointer ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white/90 hover:bg-white/5'}`}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-display tracking-widest uppercase text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/10">
              <button onClick={handleSignOutClick} className="flex items-center w-full gap-4 px-4 py-3 text-white/60 hover:text-white/90 transition-colors cursor-pointer">
                <LogOut className="w-5 h-5" />
                <span className="font-display tracking-widest uppercase text-sm">Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
