import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Menu, Bell, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetStockQuote,
  getGetStockQuoteQueryKey,
  useGetHoldings,
  getGetHoldingsQueryKey,
  useGetSiteConfig,
  useBuyShares,
  useSellShares,
} from '@workspace/api-client-react';
import SideNav from '../components/SideNav';

type Mode = 'buy' | 'sell';

export default function Trade() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('buy');
  const [buyAmount, setBuyAmount] = useState('');
  const [sellShares, setSellShares] = useState('');

  const queryClient = useQueryClient();

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('spcx_user') || 'null') : null;
  const email: string = user?.email ?? '';

  useEffect(() => {
    if (!user) setLocation('/signin');
  }, [user, setLocation]);

  const { data: quote } = useGetStockQuote({ query: { refetchInterval: 30000, queryKey: getGetStockQuoteQueryKey() } });
  const { data: holdings } = useGetHoldings({ email }, { query: { enabled: !!email, queryKey: getGetHoldingsQueryKey({ email }) } });
  const { data: siteConfig } = useGetSiteConfig();

  const buyMutation = useBuyShares();
  const sellMutation = useSellShares();

  const handleSignOut = () => {
    localStorage.removeItem('spcx_user');
    setLocation('/');
  };

  const price = quote?.price ?? 147.62;
  const cashBalance = parseFloat(holdings?.cashBalance ?? '0');
  const ownedShares = parseFloat(holdings?.shares ?? '0');
  const sellingEnabled = siteConfig?.sellingEnabled ?? false;

  const buyAmountNum = parseFloat(buyAmount || '0');
  const estimatedShares = buyAmountNum > 0 ? buyAmountNum / price : 0;

  const sellSharesNum = parseFloat(sellShares || '0');
  const estimatedProceeds = sellSharesNum > 0 ? sellSharesNum * price : 0;

  const handleBuy = () => {
    if (!buyAmountNum || buyAmountNum <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }
    if (buyAmountNum > cashBalance) {
      toast.error('Insufficient cash balance. Deposit funds first.');
      return;
    }
    buyMutation.mutate({ data: { email, amountUsd: buyAmountNum } }, {
      onSuccess: () => {
        toast.success(`Bought ~${estimatedShares.toFixed(4)} shares.`);
        setBuyAmount('');
        queryClient.invalidateQueries({ queryKey: getGetHoldingsQueryKey({ email }) });
      },
      onError: (err: any) => toast.error(err?.data?.error || 'Failed to buy shares.'),
    });
  };

  const handleSell = () => {
    if (!sellSharesNum || sellSharesNum <= 0) {
      toast.error('Enter a valid number of shares.');
      return;
    }
    if (sellSharesNum > ownedShares) {
      toast.error('You cannot sell more shares than you own.');
      return;
    }
    sellMutation.mutate({ data: { email, shares: sellSharesNum } }, {
      onSuccess: () => {
        toast.success(`Sold ${sellSharesNum.toFixed(4)} shares for $${estimatedProceeds.toFixed(2)}.`);
        setSellShares('');
        queryClient.invalidateQueries({ queryKey: getGetHoldingsQueryKey({ email }) });
      },
      onError: (err: any) => toast.error(err?.data?.error || 'Failed to sell shares.'),
    });
  };

  return (
    <div className="min-h-[100dvh] bg-[#050a0f] text-white selection:bg-white/20 flex flex-col">
      <SideNav open={menuOpen} onClose={() => setMenuOpen(false)} onSignOut={handleSignOut} />

      <header className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <button onClick={() => setLocation('/dashboard')} className="text-white/70 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button onClick={() => setMenuOpen(true)} className="text-white/70 hover:text-white transition-colors cursor-pointer">
          <Menu className="w-6 h-6" />
        </button>
        <button className="text-white/70 hover:text-white transition-colors cursor-pointer">
          <Bell className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
          <h1 className="text-3xl font-bold font-display uppercase tracking-widest mb-1">Trade SPCX</h1>
          <p className="text-sm text-white/50 tracking-wider font-display uppercase">Current price: ${price.toFixed(2)}</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#0a0f14] p-4 border border-white/5">
            <div className="text-xs text-white/50 font-display tracking-widest uppercase mb-1">Cash Balance</div>
            <div className="text-lg font-bold font-display tracking-wider">${cashBalance.toFixed(2)}</div>
          </div>
          <div className="bg-[#0a0f14] p-4 border border-white/5">
            <div className="text-xs text-white/50 font-display tracking-widest uppercase mb-1">Shares Owned</div>
            <div className="text-lg font-bold font-display tracking-wider">{ownedShares.toFixed(4)}</div>
          </div>
        </div>

        <div className="flex mb-8 border border-white/10">
          <button
            onClick={() => setMode('buy')}
            className={`flex-1 py-3 font-display font-bold text-sm tracking-widest uppercase transition-colors cursor-pointer ${mode === 'buy' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
          >
            Buy
          </button>
          <button
            onClick={() => setMode('sell')}
            className={`flex-1 py-3 font-display font-bold text-sm tracking-widest uppercase transition-colors cursor-pointer ${mode === 'sell' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
          >
            Sell
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'buy' && (
            <motion.div key="buy" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.25 }}>
              <label className="block text-xs text-white/40 font-display tracking-widest uppercase mb-3">Amount (USD)</label>
              <div className="relative mb-4">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-display font-bold">$</span>
                <input
                  type="number"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent border-b border-white/20 pl-8 pb-2 text-3xl font-display font-bold focus:outline-none focus:border-white/60 transition-colors"
                />
              </div>
              <p className="text-xs text-white/40 tracking-wider mb-8">
                ≈ {estimatedShares.toFixed(4)} shares at ${price.toFixed(2)} · Available: ${cashBalance.toFixed(2)}
              </p>

              {cashBalance <= 0 && (
                <p className="text-xs text-yellow-400/80 tracking-wider mb-4 uppercase font-display">
                  No cash balance yet. <button onClick={() => setLocation('/orders')} className="underline cursor-pointer">Deposit funds</button> to start buying.
                </p>
              )}

              <button
                onClick={handleBuy}
                disabled={buyMutation.isPending}
                className="w-full bg-[#1a8a4a] hover:bg-[#1a9a52] text-white font-display font-bold text-lg tracking-widest uppercase py-4 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {buyMutation.isPending ? 'Placing Order...' : 'Buy Shares'}
              </button>
            </motion.div>
          )}

          {mode === 'sell' && (
            <motion.div key="sell" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.25 }}>
              {!sellingEnabled ? (
                <div className="border border-white/10 p-6 text-center">
                  <p className="text-sm text-white/60 tracking-wider">
                    Selling is currently disabled by the platform admin. Check back later.
                  </p>
                </div>
              ) : (
                <>
                  <label className="block text-xs text-white/40 font-display tracking-widest uppercase mb-3">Shares to Sell</label>
                  <div className="relative mb-4">
                    <input
                      type="number"
                      value={sellShares}
                      onChange={(e) => setSellShares(e.target.value)}
                      placeholder="0.0000"
                      className="w-full bg-transparent border-b border-white/20 pb-2 text-3xl font-display font-bold focus:outline-none focus:border-white/60 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-white/40 tracking-wider mb-8">
                    ≈ ${estimatedProceeds.toFixed(2)} at ${price.toFixed(2)} · Owned: {ownedShares.toFixed(4)}
                  </p>

                  <button
                    onClick={handleSell}
                    disabled={sellMutation.isPending || ownedShares <= 0}
                    className="w-full bg-white text-black font-display font-bold text-lg tracking-widest uppercase py-4 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {sellMutation.isPending ? 'Placing Order...' : 'Sell Shares'}
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
