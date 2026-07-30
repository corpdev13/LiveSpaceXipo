import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { useLocation, Link } from 'wouter';
import rocketBg from '@assets/IMG_0358_1784055905752.jpeg';
import logoImg from '@assets/logo_1784056609292.png';

export default function AccessPending() {
  const [location] = useLocation();
  const email = new URLSearchParams(location.split('?')[1] || '').get('email') || '';

  return (
    <div className="min-h-[100dvh] bg-[#050a0f] text-white selection:bg-white/20 relative overflow-hidden flex flex-col">
      {/* Sticky Dark Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[2px]">
        <Link href="/" className="flex items-center">
          <img src={logoImg} alt="SPCX" className="h-8 sm:h-9 w-auto" />
        </Link>
        <Link href="/signin" className="flex items-center gap-2 text-sm sm:text-base font-medium tracking-widest hover:text-white/70 transition-colors uppercase">
          <span className="hidden sm:inline">Sign In</span>
          <User className="w-5 h-5" />
        </Link>
      </header>

      {/* Background Image at Bottom */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex flex-col justify-end">
        <img
          src={rocketBg}
          alt=""
          className="w-full h-1/2 object-cover object-bottom opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050a0f] via-[#050a0f]/80 to-[#050a0f]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 pt-24 pb-12 w-full max-w-2xl mx-auto text-center mt-12 sm:mt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="w-full"
        >
          <div className="mb-8">
            <h1 className="font-display text-5xl sm:text-7xl font-bold uppercase tracking-widest leading-none mb-4">
              SPACEX
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-white/20 bg-white/5 rounded-full text-xs font-display tracking-widest uppercase text-white/70">
              <span>SPCX</span>
              <span className="text-white/30">|</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>OPEN</span>
            </div>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-widest mb-6">
            Access Pending
          </h2>

          <p className="text-lg sm:text-xl font-light text-white/70 mb-2">
            Investor access requested for
          </p>
          <p className="text-xl sm:text-2xl font-bold underline decoration-white/30 underline-offset-4 mb-12 truncate max-w-full">
            {email || "unknown"}
          </p>

          <p className="text-white/60 text-base sm:text-lg max-w-md mx-auto mb-16 leading-relaxed">
            Our team personally reviews every request. You'll hear back within <span className="font-bold text-white">48 hours</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between w-full border-t border-white/10 pt-8 gap-6 sm:gap-0">
            <Link href="/" className="text-white/50 hover:text-white transition-colors uppercase font-display tracking-widest text-sm flex items-center gap-2">
              <span>&larr;</span> Different email
            </Link>
            <a href="mailto:investors@spcxipo.com" className="text-white/50 hover:text-white transition-colors uppercase font-display tracking-widest text-sm">
              investors@spcxipo.com
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
