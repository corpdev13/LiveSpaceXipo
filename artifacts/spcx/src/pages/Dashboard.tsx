import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGetStockQuote, useGetStockHistory, GetStockHistoryPeriod, getGetStockQuoteQueryKey, getGetStockHistoryQueryKey, useGetHoldings, getGetHoldingsQueryKey } from '@workspace/api-client-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import SideNav from '../components/SideNav';
import NotificationBell from '../components/NotificationBell';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [activePeriod, setActivePeriod] = useState<GetStockHistoryPeriod>('1D' as GetStockHistoryPeriod);
  const [isLive, setIsLive] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('spcx_user') || 'null') : null;
  const email: string = user?.email ?? '';

  useEffect(() => {
    if (!user) setLocation('/signin');
  }, [user, setLocation]);

  const { data: quote } = useGetStockQuote({ query: { refetchInterval: 30000, queryKey: getGetStockQuoteQueryKey() } });
  const { data: history } = useGetStockHistory({ period: activePeriod }, { query: { refetchInterval: 30000, queryKey: getGetStockHistoryQueryKey({ period: activePeriod }) } });
  const { data: holdings } = useGetHoldings({ email }, { query: { enabled: !!email, queryKey: getGetHoldingsQueryKey({ email }) } });

  const handleSignOut = () => {
    localStorage.removeItem('spcx_user');
    setLocation('/');
  };

  const periods = ['Live', '1D', '1W', '1M', '3M', '1Y', '5Y'];

  const handlePeriodClick = (p: string) => {
    if (p === 'Live') {
      setIsLive(true);
      setActivePeriod('1D' as GetStockHistoryPeriod);
    } else {
      setIsLive(false);
      setActivePeriod(p as GetStockHistoryPeriod);
    }
  };

  const shares = parseFloat(holdings?.shares ?? '0');
  const currentPrice = quote?.price ?? 147.62;
  const marketValue = (shares * currentPrice).toFixed(2);

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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="text-3xl font-bold font-display uppercase tracking-widest mb-1">SpaceX</h1>
          <p className="text-sm text-white/50 tracking-wider font-display">SPCX • NASDAQ • USD</p>
          {user?.fullName && <p className="text-xs text-white/30 tracking-widest font-display mt-1 uppercase">Welcome, {user.fullName}</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mb-6">
          <div className="text-6xl sm:text-7xl font-bold font-display tracking-tight mb-2">
            ${quote?.price ? quote.price.toFixed(2) : '147.62'}
          </div>
          <div className="flex items-center gap-2 text-red-500 font-display text-lg tracking-wider">
            <span className="text-xs">▼</span>
            <span>${quote?.change ? Math.abs(quote.change).toFixed(2) : '1.86'} ({quote?.changePct ? Math.abs(quote.changePct).toFixed(2) : '1.24'}%)</span>
            <span className="text-white/50 ml-2">Today</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="flex flex-wrap gap-2 mb-8">
          {periods.map(p => {
            const isActive = p === 'Live' ? isLive : (!isLive && activePeriod === p);
            return (
              <button key={p} onClick={() => handlePeriodClick(p)}
                className={`px-4 py-1.5 rounded-full text-xs font-display font-medium tracking-widest transition-all cursor-pointer ${isActive ? 'bg-white/10 text-white border border-white/20' : 'text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent'}`}>
                {p === 'Live' && isActive && <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse" />}
                {p}
              </button>
            );
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} className="h-[200px] w-full mb-12 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history?.data || []}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <YAxis domain={['auto', 'auto']} hide />
              <Area type="monotone" dataKey="price" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" isAnimationActive={true} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
          <h2 className="text-xl font-bold font-display uppercase tracking-widest mb-6">Key Market Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: '24h Vol', value: quote?.volume || '25.69M' },
              { label: 'Mkt Cap', value: quote?.marketCap || '$1.92T' },
              { label: 'Bid', value: quote?.bid ? `$${quote.bid.toFixed(2)}` : '$147.63' },
              { label: 'Ask', value: quote?.ask ? `$${quote.ask.toFixed(2)}` : '$147.72' },
              { label: 'Day Range', value: quote?.dayLow ? `$${quote.dayLow.toFixed(2)} – $${quote.dayHigh?.toFixed(2)}` : '$147.36 – $158.93' },
              { label: '52W High', value: quote?.week52High ? `$${quote.week52High.toFixed(2)}` : '$178.45' },
              { label: '52W Low', value: quote?.week52Low ? `$${quote.week52Low.toFixed(2)}` : '$135.00' },
              { label: 'P/E Ratio', value: quote?.peRatio || '—' },
              { label: 'Avg Vol (30D)', value: quote?.avgVolume || '25.69M' },
              { label: 'Shares Out', value: quote?.sharesOut || '13.00B' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }} className="bg-[#0a0f14] p-4 border border-white/5">
                <div className="text-xs text-white/50 font-display tracking-widest uppercase mb-1">{stat.label}</div>
                <div className="text-lg font-bold font-display tracking-wider">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.8 }} className="mt-12">
          <div className="bg-[#0a0f14] p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-white/20" />
            <div className="flex justify-between items-end mb-1">
              <div>
                <div className="text-xs text-white/50 font-display tracking-widest uppercase mb-2">Your Holdings</div>
                <div className="text-2xl font-bold font-display tracking-wider">{shares > 0 ? shares.toFixed(4) : '0'} Shares</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/50 font-display tracking-widest uppercase mb-1">Market Value</div>
                <div className="text-xl font-bold font-display tracking-wider">${shares > 0 ? marketValue : '0.00'}</div>
              </div>
            </div>
            <div className="text-sm text-white/50 font-display tracking-widest uppercase mt-4">
              Avg Cost: ${holdings?.avgCost ? parseFloat(holdings.avgCost).toFixed(2) : '0.00'}
            </div>
            <div className="text-sm text-white/50 font-display tracking-widest uppercase mt-2">
              Cash Balance: ${parseFloat(holdings?.cashBalance ?? '0').toFixed(2)}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setLocation('/orders')} className="flex-1 border border-white/20 hover:border-white/40 text-white font-display font-bold text-sm tracking-widest uppercase py-3 transition-colors cursor-pointer">
                Deposit Funds
              </button>
              <button onClick={() => setLocation('/trade')} className="flex-1 bg-[#1a8a4a] hover:bg-[#1a9a52] text-white font-display font-bold text-sm tracking-widest uppercase py-3 transition-colors cursor-pointer">
                Trade
              </button>
            </div>
          </div>
        </motion.div>

        <div className="mt-16 mb-8 text-center">
          <button onClick={handleSignOut} className="text-white/40 hover:text-white transition-colors text-sm font-display tracking-widest uppercase underline decoration-white/20 underline-offset-4 cursor-pointer">
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}
