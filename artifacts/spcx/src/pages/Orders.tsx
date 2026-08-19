import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Menu, ArrowLeft, Copy, Check, CreditCard, Bitcoin, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Clock3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  useCreateDeposit,
  useGetDepositAddresses,
  useGetHoldings,
  getGetHoldingsQueryKey,
  useListWithdrawals,
  getListWithdrawalsQueryKey,
  useCreateWithdrawal,
  getListDepositsQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import SideNav from '../components/SideNav';
import NotificationBell from '../components/NotificationBell';

type Step = 'amount' | 'method' | 'card' | 'crypto' | 'success';
type OrderMode = 'deposit' | 'withdraw';

export default function Orders() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [selectedCoin, setSelectedCoin] = useState<'BTC' | 'ETH' | 'DOGE'>('BTC');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<OrderMode>(() => new URLSearchParams(window.location.search).get('mode') === 'withdraw' ? 'withdraw' : 'deposit');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [withdrawalCoin, setWithdrawalCoin] = useState<'BTC' | 'ETH' | 'DOGE'>('BTC');

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('spcx_user') || 'null') : null;
  const email: string = user?.email ?? '';

  useEffect(() => {
    if (!user) setLocation('/signin');
  }, [user, setLocation]);

  const createDeposit = useCreateDeposit();
  const { data: addresses } = useGetDepositAddresses();
  const queryClient = useQueryClient();
  const { data: holdings } = useGetHoldings({ email }, { query: { enabled: !!email, queryKey: getGetHoldingsQueryKey({ email }) } });
  const { data: withdrawals } = useListWithdrawals({ email }, { query: { enabled: !!email, queryKey: getListWithdrawalsQueryKey({ email }) } });
  const createWithdrawal = useCreateWithdrawal();

  const handleSignOut = () => {
    localStorage.removeItem('spcx_user');
    setLocation('/');
  };

  const handleAmountContinue = () => {
    const val = parseFloat(amount);
    if (!val || val < 1) {
      toast.error('Enter a valid amount.');
      return;
    }
    setStep('method');
  };

  const handleCryptoConfirm = () => {
    createDeposit.mutate({ data: { email, amount: parseFloat(amount), method: 'crypto', coin: selectedCoin } }, {
      onSuccess: () => {
        setStep('success');
        queryClient.invalidateQueries({ queryKey: getListDepositsQueryKey({ email }) });
      },
      onError: () => toast.error('Failed to submit deposit. Please try again.'),
    });
  };

  const handleWithdrawal = () => {
    const value = parseFloat(withdrawalAmount);
    if (!value || value < 1) {
      toast.error('Enter a valid withdrawal amount.');
      return;
    }
    if (value > parseFloat(holdings?.cashBalance ?? '0')) {
      toast.error('Withdrawal amount exceeds your available cash balance.');
      return;
    }
    if (withdrawalAddress.trim().length < 10) {
      toast.error('Enter a valid wallet address.');
      return;
    }

    createWithdrawal.mutate({
      data: { email, amount: value, coin: withdrawalCoin, address: withdrawalAddress.trim() },
    }, {
      onSuccess: () => {
        toast.success('Withdrawal request submitted.');
        setWithdrawalAmount('');
        setWithdrawalAddress('');
        queryClient.invalidateQueries({ queryKey: getGetHoldingsQueryKey({ email }) });
        queryClient.invalidateQueries({ queryKey: getListWithdrawalsQueryKey({ email }) });
      },
      onError: (err: any) => toast.error(err?.data?.error || 'Failed to submit withdrawal.'),
    });
  };

  const handleCopyAddress = () => {
    const addr = addresses?.find(a => a.coin === selectedCoin)?.address;
    if (addr) {
      navigator.clipboard.writeText(addr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const goBack = () => {
    if (step === 'method') setStep('amount');
    else if (step === 'card' || step === 'crypto') setStep('method');
    else setLocation('/dashboard');
  };

  const currentAddress = addresses?.find(a => a.coin === selectedCoin)?.address;

  return (
    <div className="min-h-[100dvh] bg-[#050a0f] text-white selection:bg-white/20 flex flex-col">
      <SideNav open={menuOpen} onClose={() => setMenuOpen(false)} onSignOut={handleSignOut} />

      <header className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        {step === 'success' || mode === 'withdraw' ? (
          <button onClick={() => setMenuOpen(true)} className="text-white/70 hover:text-white transition-colors cursor-pointer">
            <Menu className="w-6 h-6" />
          </button>
        ) : (
          <button onClick={goBack} className="text-white/70 hover:text-white transition-colors cursor-pointer">
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <NotificationBell />
      </header>

        <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full flex flex-col">
          {step === 'amount' && (
            <div className="flex border border-white/10 mb-8">
              <button onClick={() => setMode('deposit')} className={`flex-1 py-3 flex items-center justify-center gap-2 font-display font-bold text-xs tracking-widest uppercase cursor-pointer ${mode === 'deposit' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}>
                <ArrowDownToLine className="w-4 h-4" /> Deposit
              </button>
              <button onClick={() => setMode('withdraw')} className={`flex-1 py-3 flex items-center justify-center gap-2 font-display font-bold text-xs tracking-widest uppercase cursor-pointer ${mode === 'withdraw' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}>
                <ArrowUpFromLine className="w-4 h-4" /> Withdraw
              </button>
            </div>
          )}
          {mode === 'withdraw' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold font-display uppercase tracking-widest mb-2">Withdraw Crypto</h1>
              <p className="text-sm text-white/50 tracking-wider font-display uppercase mb-8">Send available cash to your verified wallet.</p>

              {!holdings?.withdrawalEnabled ? (
                <div className="border border-yellow-500/30 bg-yellow-500/5 p-6">
                  <h2 className="font-display font-bold tracking-widest uppercase text-yellow-400 mb-2">Access not enabled</h2>
                  <p className="text-sm text-white/60 leading-relaxed">Crypto withdrawals are available after the Broker Team enables access for your investor account. You can still deposit funds and trade SPCX shares.</p>
                </div>
              ) : (
                <>
                  <div className="border border-white/10 p-4 mb-6">
                    <div className="text-xs text-white/40 font-display tracking-widest uppercase mb-1">Available to withdraw</div>
                    <div className="text-2xl font-display font-bold">${parseFloat(holdings.cashBalance).toFixed(2)}</div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs text-white/40 font-display tracking-widest uppercase mb-3">Amount (USD)</label>
                      <div className="relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-display font-bold">$</span>
                        <input type="number" min="1" step="0.01" value={withdrawalAmount} onChange={(e) => setWithdrawalAmount(e.target.value)} placeholder="0.00" className="w-full bg-transparent border-b border-white/20 pl-8 pb-2 text-3xl font-display font-bold focus:outline-none focus:border-white/60 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 font-display tracking-widest uppercase mb-3">Crypto network</label>
                      <div className="flex gap-2">
                        {(['BTC', 'ETH', 'DOGE'] as const).map((coin) => (
                          <button key={coin} onClick={() => setWithdrawalCoin(coin)} className={`flex-1 py-3 border font-display font-bold tracking-widest text-sm cursor-pointer ${withdrawalCoin === coin ? 'border-white bg-white text-black' : 'border-white/20 text-white/60 hover:border-white/40'}`}>{coin}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 font-display tracking-widest uppercase mb-3">Wallet address</label>
                      <input type="text" value={withdrawalAddress} onChange={(e) => setWithdrawalAddress(e.target.value)} placeholder={`${withdrawalCoin} wallet address`} className="w-full bg-black/30 border border-white/20 px-4 py-4 text-sm focus:outline-none focus:border-white/60 transition-colors" />
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed">Your balance is reserved when this request is submitted. If the Broker Team cannot complete it, the reserved amount is returned to your cash balance.</p>
                    <button onClick={handleWithdrawal} disabled={createWithdrawal.isPending} className="w-full bg-white text-black font-display font-bold text-lg tracking-widest uppercase py-4 disabled:opacity-50 cursor-pointer">
                      {createWithdrawal.isPending ? 'Submitting...' : 'Request Withdrawal'}
                    </button>
                  </div>
                </>
              )}

              <div className="mt-12">
                <h2 className="text-lg font-display font-bold tracking-widest uppercase mb-4">Withdrawal history</h2>
                <div className="border border-white/10 divide-y divide-white/10">
                  {!withdrawals?.length && <div className="p-4 text-sm text-white/40">No withdrawal requests yet.</div>}
                  {withdrawals?.map((withdrawal) => (
                    <div key={withdrawal.id} className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-display font-bold tracking-wider">${parseFloat(withdrawal.amount).toFixed(2)} · {withdrawal.coin}</div>
                        <div className="text-xs text-white/40 mt-1">{new Date(withdrawal.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-display tracking-widest uppercase ${withdrawal.status === 'completed' ? 'text-green-400' : withdrawal.status === 'failed' ? 'text-red-400' : 'text-yellow-400'}`}>
                        {withdrawal.status === 'pending' && <Clock3 className="w-3.5 h-3.5" />}
                        {withdrawal.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          {mode === 'deposit' && (
        <AnimatePresence mode="wait">
          {step === 'amount' && (
            <motion.div key="amount" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h1 className="text-3xl font-bold font-display uppercase tracking-widest mb-2">Deposit Funds</h1>
              <p className="text-sm text-white/50 tracking-wider font-display uppercase mb-10">Add funds to invest in SPCX shares.</p>

              <div className="mb-10">
                <label className="block text-xs text-white/40 font-display tracking-widest uppercase mb-3">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-display font-bold">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent border-b border-white/20 pl-8 pb-2 text-4xl font-display font-bold focus:outline-none focus:border-white/60 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-2 mb-10">
                {[100, 500, 1000, 5000].map(v => (
                  <button key={v} onClick={() => setAmount(String(v))} className="flex-1 py-2 border border-white/10 text-xs font-display tracking-widest text-white/60 hover:text-white hover:border-white/30 transition-colors cursor-pointer">
                    ${v.toLocaleString()}
                  </button>
                ))}
              </div>

              <button onClick={handleAmountContinue} className="w-full bg-white text-black font-display font-bold text-lg tracking-widest uppercase py-4 hover:bg-white/90 transition-colors cursor-pointer">
                Continue
              </button>
            </motion.div>
          )}

          {step === 'method' && (
            <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h1 className="text-3xl font-bold font-display uppercase tracking-widest mb-2">Payment Method</h1>
              <p className="text-sm text-white/50 tracking-wider font-display uppercase mb-10">Depositing ${parseFloat(amount || '0').toLocaleString()}</p>

              <div className="flex flex-col gap-4">
                <button onClick={() => setStep('card')} className="flex items-center gap-4 p-5 border border-white/10 hover:border-white/40 hover:bg-white/5 transition-colors text-left cursor-pointer">
                  <CreditCard className="w-6 h-6 text-red-400/80" />
                  <div>
                    <div className="font-display font-bold tracking-widest uppercase">Debit / Credit Card</div>
                    <div className="text-xs text-red-400 tracking-wider">Not available at the moment · Kindly use Crypto Payment</div>
                  </div>
                </button>
                <button onClick={() => setStep('crypto')} className="flex items-center gap-4 p-5 border border-white/10 hover:border-white/40 hover:bg-white/5 transition-colors text-left cursor-pointer">
                  <Bitcoin className="w-6 h-6 text-white/70" />
                  <div>
                    <div className="font-display font-bold tracking-widest uppercase">Cryptocurrency</div>
                    <div className="text-xs text-white/40 tracking-wider">BTC, ETH, DOGE</div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'card' && (
            <motion.div key="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="border border-red-500/40 bg-red-500/5 p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold font-display uppercase tracking-widest mb-3">Card Payment Unavailable</h1>
                <p className="text-sm text-red-300/90 leading-relaxed">
                  Card payments are not available at the moment. Kindly use Crypto Payment.
                </p>
              </div>

              <button onClick={() => setStep('crypto')} className="w-full bg-white text-black font-display font-bold text-lg tracking-widest uppercase py-4 mt-10 hover:bg-white/90 transition-colors cursor-pointer">
                Use Crypto Payment
              </button>
            </motion.div>
          )}

          {step === 'crypto' && (
            <motion.div key="crypto" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h1 className="text-3xl font-bold font-display uppercase tracking-widest mb-2">Send Crypto</h1>
              <p className="text-sm text-white/50 tracking-wider font-display uppercase mb-8">${parseFloat(amount || '0').toLocaleString()} equivalent</p>

              <div className="flex gap-2 mb-8">
                {(['BTC', 'ETH', 'DOGE'] as const).map(coin => (
                  <button key={coin} onClick={() => setSelectedCoin(coin)}
                    className={`flex-1 py-3 border font-display font-bold tracking-widest text-sm transition-colors cursor-pointer ${selectedCoin === coin ? 'border-white bg-white text-black' : 'border-white/20 text-white/60 hover:border-white/40'}`}>
                    {coin}
                  </button>
                ))}
              </div>

              <div className="border border-white/10 p-5 mb-4">
                <div className="text-xs text-white/40 font-display tracking-widest uppercase mb-2">Deposit Address</div>
                <div className="flex items-center justify-between gap-3">
                  <code className="text-sm break-all text-white/90">{currentAddress || 'Loading...'}</code>
                  <button onClick={handleCopyAddress} className="shrink-0 text-white/50 hover:text-white transition-colors cursor-pointer">
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-white/40 leading-relaxed mb-10">
                Send only {selectedCoin} to this address. Deposits are credited after network confirmation, typically within 30 minutes.
              </p>

              <button onClick={handleCryptoConfirm} disabled={createDeposit.isPending || !currentAddress} className="w-full bg-white text-black font-display font-bold text-lg tracking-widest uppercase py-4 hover:bg-white/90 disabled:opacity-50 transition-colors cursor-pointer">
                {createDeposit.isPending ? 'Submitting...' : "I've Sent the Funds"}
              </button>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="flex flex-col items-center text-center py-16">
              <div className="w-20 h-20 rounded-full bg-[#1a8a4a]/20 flex items-center justify-center mb-8">
                <Check className="w-10 h-10 text-[#1a8a4a]" />
              </div>
              <h1 className="text-3xl font-bold font-display uppercase tracking-widest mb-4">Deposit Submitted</h1>
              <p className="text-white/60 mb-10 max-w-xs">
                Your ${parseFloat(amount || '0').toLocaleString()} deposit is pending review. Funds will reflect in your holdings once confirmed.
              </p>
              <button onClick={() => setLocation('/dashboard')} className="w-full bg-white text-black font-display font-bold text-lg tracking-widest uppercase py-4 hover:bg-white/90 transition-colors cursor-pointer">
                Back to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
          )}
      </main>
    </div>
  );
}
