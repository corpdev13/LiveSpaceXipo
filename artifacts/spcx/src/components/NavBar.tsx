import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { getCurrentUser, logout, getState } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '@assets/logo_1784056609292.png';

interface NavBarProps {
  onShowLogin: () => void;
  onShowRegister: () => void;
}

export function NavBar({ onShowLogin, onShowRegister }: NavBarProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = getCurrentUser();
  
  // Check admin mode
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'spcx2026' ||
    sessionStorage.getItem('spcx_admin') === 'true';

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/market', label: 'Market' },
    { path: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <nav className="sticky top-0 z-50 glassmorphism border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src={logoImg} alt="SPCX" className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.path ? 'text-primary' : 'text-white/60'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {isAdmin && (
              <span className="px-3 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-bold border border-destructive/50">
                ADMIN
              </span>
            )}
            {user ? (
              <>
                <span className="text-sm text-white/60">{user.username}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-white/20 hover:bg-white/5"
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShowLogin}
                  className="hover:bg-white/5"
                >
                  Log In
                </Button>
                <Button
                  size="sm"
                  onClick={onShowRegister}
                  className="bg-primary hover:bg-primary/90 text-black font-semibold"
                >
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-card/95 backdrop-blur-lg"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location === link.path
                      ? 'bg-primary/20 text-primary'
                      : 'text-white/60 hover:bg-white/5'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/10 space-y-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-white/60">{user.username}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full border-white/20"
                    >
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onShowLogin();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      Log In
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        onShowRegister();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-primary text-black font-semibold"
                    >
                      Register
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
