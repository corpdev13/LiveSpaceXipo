import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Lock, Check, X, DollarSign, Wallet, TrendingUp, ArrowDownToLine, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

type Investor = { id: number; fullName: string; email: string; status: 'pending' | 'approved' | 'rejected'; createdAt: string; shares: string; avgCost: string; withdrawalEnabled: boolean };
type Deposit = { id: number; investorId: number; fullName: string; email: string; amount: string; method: 'card' | 'crypto'; coin: string | null; status: 'pending' | 'completed' | 'failed'; createdAt: string };
type DepositAddress = { coin: string; address: string; updatedAt: string };
type Withdrawal = { id: number; investorId: number; fullName: string; email: string; amount: string; coin: string; address: string; status: 'pending' | 'completed' | 'failed'; createdAt: string };

const TABS = ['Investors', 'Deposits', 'Credit', 'Withdrawals', 'Notify User', 'Deposit Addresses', 'Trading'] as const;
type Tab = typeof TABS[number];

async function adminFetch(path: string, password: string, options: RequestInit = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': password,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export default function Admin() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState<Tab>('Investors');

  const [investors, setInvestors] = useState<Investor[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [addresses, setAddresses] = useState<DepositAddress[]>([]);
  const [loading, setLoading] = useState(false);

  const [creditInvestorId, setCreditInvestorId] = useState('');
  const [creditShares, setCreditShares] = useState('');
  const [creditPrice, setCreditPrice] = useState('');
  const [addressEdits, setAddressEdits] = useState<Record<string, string>>({});
  const [sellingEnabled, setSellingEnabled] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);

  const loadInvestors = async (pw: string) => {
    const data = await adminFetch('/admin/investors', pw);
    setInvestors(data);
  };
  const loadDeposits = async (pw: string) => {
    const data = await adminFetch('/admin/deposits', pw);
    setDeposits(data);
  };
  const loadWithdrawals = async (pw: string) => {
    const data = await adminFetch('/admin/withdrawals', pw);
    setWithdrawals(data);
  };
  const loadAddresses = async (pw: string) => {
    const data = await adminFetch('/admin/deposit-addresses', pw);
    setAddresses(data);
    const edits: Record<string, string> = {};
    data.forEach((a: DepositAddress) => { edits[a.coin] = a.address; });
    setAddressEdits(edits);
  };
  const loadSiteConfig = async () => {
    const res = await fetch('/api/site-config');
    if (!res.ok) throw new Error('Failed to load site config.');
    const data = await res.json();
    setSellingEnabled(data.sellingEnabled);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      await adminFetch('/admin/investors', passwordInput);
      setPassword(passwordInput);
      setAuthed(true);
    } catch (err: any) {
      setAuthError('Invalid password.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    const load = tab === 'Investors' || tab === 'Credit' || tab === 'Notify User' ? loadInvestors
      : tab === 'Deposits' ? loadDeposits
      : tab === 'Withdrawals' ? loadWithdrawals
      : tab === 'Trading' ? loadSiteConfig
      : loadAddresses;
    load(password).catch((err) => toast.error(err.message)).finally(() => setLoading(false));
  }, [authed, tab]);

  const handleToggleSelling = async () => {
    setSavingConfig(true);
    try {
      await adminFetch('/admin/site-config', password, {
        method: 'PATCH',
        body: JSON.stringify({ sellingEnabled: !sellingEnabled }),
      });
      setSellingEnabled(!sellingEnabled);
      toast.success(`Selling ${!sellingEnabled ? 'enabled' : 'disabled'} for investors.`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await adminFetch(`/admin/investors/${id}/status`, password, { method: 'PATCH', body: JSON.stringify({ status }) });
      toast.success(`Investor ${status}.`);
      loadInvestors(password);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDepositStatus = async (id: number, status: 'completed' | 'failed') => {
    try {
      await adminFetch(`/admin/deposits/${id}/status`, password, { method: 'PATCH', body: JSON.stringify({ status }) });
      toast.success(`Deposit marked ${status}.`);
      loadDeposits(password);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleWithdrawalAccess = async (investor: Investor) => {
    try {
      await adminFetch(`/admin/investors/${investor.id}/withdrawal-access`, password, {
        method: 'PATCH',
        body: JSON.stringify({ withdrawalEnabled: !investor.withdrawalEnabled }),
      });
      toast.success(`Withdrawals ${!investor.withdrawalEnabled ? 'enabled' : 'disabled'} for ${investor.fullName}.`);
      await loadInvestors(password);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleWithdrawalStatus = async (id: number, status: 'completed' | 'failed') => {
    try {
      await adminFetch(`/admin/withdrawals/${id}/status`, password, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      toast.success(`Withdrawal marked ${status}.`);
      await loadWithdrawals(password);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditInvestorId || !creditShares || !creditPrice) {
      toast.error('Fill in all fields.');
      return;
    }
    try {
      await adminFetch(`/admin/investors/${creditInvestorId}/credit`, password, {
        method: 'POST',
        body: JSON.stringify({ shares: parseFloat(creditShares), pricePerShare: parseFloat(creditPrice) }),
      });
      toast.success('Shares credited.');
      setCreditShares('');
      setCreditPrice('');
      loadInvestors(password);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddressSave = async (coin: string) => {
    try {
      await adminFetch(`/admin/deposit-addresses/${coin}`, password, {
        method: 'PUT',
        body: JSON.stringify({ address: addressEdits[coin] }),
      });
      toast.success(`${coin} address updated.`);
      loadAddresses(password);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationEmail || !notificationMessage.trim()) {
      toast.error('Enter an investor email and message.');
      return;
    }

    setSendingNotification(true);
    adminFetch('/admin/notifications', password, {
      method: 'POST',
      body: JSON.stringify({
        email: notificationEmail.trim(),
        message: notificationMessage.trim(),
      }),
    })
      .then(() => {
        toast.success('Message sent to the investor.');
        setNotificationMessage('');
      })
      .catch((err: any) => toast.error(err.message || 'Failed to send message.'))
      .finally(() => setSendingNotification(false));
  };

  if (!authed) {
    return (
      <div className="min-h-[100dvh] bg-[#050a0f] text-white flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-10">
            <Lock className="w-8 h-8 text-white/50 mb-4" />
            <h1 className="text-2xl font-bold font-display uppercase tracking-widest">Admin Access</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="password"
              placeholder="ADMIN PASSWORD"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-black/50 border border-white/30 text-white placeholder:text-white/40 px-5 py-4 focus:outline-none focus:border-white/80 transition-all font-display tracking-widest uppercase"
              autoFocus
            />
            {authError && <p className="text-red-400 font-display tracking-wider text-sm">{authError}</p>}
            <button type="submit" disabled={loading} className="w-full bg-white text-black font-display font-bold text-lg tracking-widest uppercase py-4 hover:bg-white/90 disabled:opacity-50 transition-colors cursor-pointer">
              {loading ? 'Checking...' : 'Enter'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#050a0f] text-white">
      <header className="px-6 py-6 border-b border-white/10">
        <h1 className="text-2xl font-bold font-display uppercase tracking-widest">SPCX Admin</h1>
      </header>

      <div className="flex overflow-x-auto border-b border-white/10">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-4 font-display text-sm tracking-widest uppercase whitespace-nowrap transition-colors cursor-pointer border-b-2 ${tab === t ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white/80'}`}>
            {t}
          </button>
        ))}
      </div>

      <main className="p-6 max-w-5xl mx-auto">
        {loading && <p className="text-white/40 font-display tracking-widest uppercase text-sm">Loading...</p>}

        {!loading && tab === 'Investors' && (
          <div className="space-y-3">
            {investors.length === 0 && <p className="text-white/40">No investors yet.</p>}
            {investors.map(inv => (
                <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/10 p-4">
                <div>
                  <div className="font-display font-bold tracking-wider">{inv.fullName}</div>
                  <div className="text-sm text-white/50">{inv.email}</div>
                  <div className="text-xs text-white/30 mt-1">Shares: {parseFloat(inv.shares).toFixed(4)} · Avg Cost: ${parseFloat(inv.avgCost).toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-display tracking-widest uppercase px-3 py-1 rounded-full ${inv.status === 'approved' ? 'bg-green-500/20 text-green-400' : inv.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {inv.status}
                  </span>
                  {inv.status !== 'approved' && (
                    <button onClick={() => handleStatusUpdate(inv.id, 'approved')} className="p-2 border border-white/10 hover:border-green-400 hover:text-green-400 transition-colors cursor-pointer"><Check className="w-4 h-4" /></button>
                  )}
                  {inv.status !== 'rejected' && (
                    <button onClick={() => handleStatusUpdate(inv.id, 'rejected')} className="p-2 border border-white/10 hover:border-red-400 hover:text-red-400 transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
                  )}
                    <button
                      onClick={() => handleWithdrawalAccess(inv)}
                      disabled={inv.status !== 'approved'}
                      className={`px-3 py-2 border text-[10px] font-display tracking-widest uppercase transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${inv.withdrawalEnabled ? 'border-green-400/50 text-green-400 hover:border-green-400' : 'border-white/20 text-white/50 hover:border-white/50 hover:text-white'}`}
                      title={inv.status !== 'approved' ? 'Approve this investor first' : undefined}
                    >
                      {inv.withdrawalEnabled ? 'Withdrawals On' : 'Enable Withdrawals'}
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === 'Deposits' && (
          <div className="space-y-3">
            {deposits.length === 0 && <p className="text-white/40">No deposits yet.</p>}
            {deposits.map(dep => (
              <div key={dep.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/10 p-4">
                <div>
                  <div className="font-display font-bold tracking-wider">{dep.fullName} <span className="text-white/40 text-sm">({dep.email})</span></div>
                  <div className="text-sm text-white/50">${parseFloat(dep.amount).toFixed(2)} · {dep.method}{dep.coin ? ` (${dep.coin})` : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-display tracking-widest uppercase px-3 py-1 rounded-full ${dep.status === 'completed' ? 'bg-green-500/20 text-green-400' : dep.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {dep.status}
                  </span>
                  {dep.status === 'pending' && (
                    <>
                      <button onClick={() => handleDepositStatus(dep.id, 'completed')} className="p-2 border border-white/10 hover:border-green-400 hover:text-green-400 transition-colors cursor-pointer"><Check className="w-4 h-4" /></button>
                      <button onClick={() => handleDepositStatus(dep.id, 'failed')} className="p-2 border border-white/10 hover:border-red-400 hover:text-red-400 transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

         {!loading && tab === 'Credit' && (
          <form onSubmit={handleCredit} className="max-w-md space-y-5">
            <div>
              <label className="block text-xs text-white/40 font-display tracking-widest uppercase mb-2">Investor</label>
              <select value={creditInvestorId} onChange={(e) => setCreditInvestorId(e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white px-5 py-4 focus:outline-none focus:border-white/80 font-display tracking-wider">
                <option value="">Select investor</option>
                {investors.filter(i => i.status === 'approved').map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.fullName} ({inv.email})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-white/40 font-display tracking-widest uppercase mb-2">Shares</label>
                <input type="number" step="0.0001" value={creditShares} onChange={(e) => setCreditShares(e.target.value)}
                  className="w-full bg-black/50 border border-white/30 text-white px-5 py-4 focus:outline-none focus:border-white/80 font-display tracking-wider" />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-white/40 font-display tracking-widest uppercase mb-2">Price / Share</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input type="number" step="0.01" value={creditPrice} onChange={(e) => setCreditPrice(e.target.value)}
                    className="w-full bg-black/50 border border-white/30 text-white pl-9 pr-5 py-4 focus:outline-none focus:border-white/80 font-display tracking-wider" />
                </div>
              </div>
            </div>
            <button type="submit" className="w-full bg-white text-black font-display font-bold text-lg tracking-widest uppercase py-4 hover:bg-white/90 transition-colors cursor-pointer">
              Credit Shares
            </button>
          </form>
        )}

         {!loading && tab === 'Withdrawals' && (
           <div className="space-y-3">
             <div className="flex items-center gap-3 mb-5">
               <ArrowDownToLine className="w-5 h-5 text-white/50" />
               <div>
                 <h2 className="font-display font-bold tracking-widest uppercase">Crypto Withdrawals</h2>
                 <p className="text-xs text-white/40 mt-1">Review requests and mark completed only after sending funds.</p>
               </div>
             </div>
             {withdrawals.length === 0 && <p className="text-white/40">No withdrawal requests yet.</p>}
             {withdrawals.map((withdrawal) => (
               <div key={withdrawal.id} className="border border-white/10 p-4 space-y-3">
                 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                   <div>
                     <div className="font-display font-bold tracking-wider">{withdrawal.fullName} <span className="text-white/40 text-sm">({withdrawal.email})</span></div>
                     <div className="text-lg font-display font-bold mt-1">${parseFloat(withdrawal.amount).toFixed(2)} · {withdrawal.coin}</div>
                     <div className="text-xs text-white/40 mt-1 break-all flex items-start gap-2"><span>{withdrawal.address}</span><button onClick={() => navigator.clipboard.writeText(withdrawal.address)} title="Copy wallet address" className="shrink-0 hover:text-white cursor-pointer"><Copy className="w-3.5 h-3.5" /></button></div>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className={`text-xs font-display tracking-widest uppercase px-3 py-1 rounded-full ${withdrawal.status === 'completed' ? 'bg-green-500/20 text-green-400' : withdrawal.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                       {withdrawal.status}
                     </span>
                     {withdrawal.status === 'pending' && (
                       <>
                         <button onClick={() => handleWithdrawalStatus(withdrawal.id, 'completed')} className="p-2 border border-white/10 hover:border-green-400 hover:text-green-400 transition-colors cursor-pointer" title="Mark completed"><Check className="w-4 h-4" /></button>
                         <button onClick={() => handleWithdrawalStatus(withdrawal.id, 'failed')} className="p-2 border border-white/10 hover:border-red-400 hover:text-red-400 transition-colors cursor-pointer" title="Fail and refund"><X className="w-4 h-4" /></button>
                       </>
                     )}
                   </div>
                 </div>
                 <div className="text-[10px] text-white/30 font-display tracking-widest uppercase">{new Date(withdrawal.createdAt).toLocaleString()}</div>
               </div>
             ))}
           </div>
         )}

        {!loading && tab === 'Notify User' && (
          <form onSubmit={handleSendNotification} className="max-w-lg space-y-5">
            <div>
              <label className="block text-xs text-white/40 font-display tracking-widest uppercase mb-2">Investor Email</label>
              <input
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder="INVESTOR EMAIL ADDRESS"
                className="w-full bg-black/50 border border-white/30 text-white placeholder:text-white/30 px-5 py-4 focus:outline-none focus:border-white/80 font-display tracking-wider"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 font-display tracking-widest uppercase mb-2">Message</label>
              <textarea
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Write the message for this investor..."
                rows={7}
                maxLength={2000}
                className="w-full resize-y bg-black/50 border border-white/30 text-white placeholder:text-white/30 px-5 py-4 focus:outline-none focus:border-white/80 font-display tracking-wider"
              />
              <div className="text-right text-xs text-white/30 mt-1">{notificationMessage.length}/2000</div>
            </div>
            <button
              type="submit"
              disabled={sendingNotification}
              className="w-full bg-white text-black font-display font-bold text-lg tracking-widest uppercase py-4 hover:bg-white/90 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {sendingNotification ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}

        {!loading && tab === 'Trading' && (
          <div className="max-w-md">
            <div className="border border-white/10 p-6 flex items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <TrendingUp className="w-5 h-5 text-white/50 mt-0.5 shrink-0" />
                <div>
                  <div className="font-display font-bold tracking-widest uppercase">Investor Selling</div>
                  <div className="text-xs text-white/40 mt-1 max-w-xs">
                    Buying is always available to approved investors. Toggle this to allow them to sell shares back for cash.
                  </div>
                </div>
              </div>
              <button
                onClick={handleToggleSelling}
                disabled={savingConfig}
                className={`w-14 h-8 rounded-full relative transition-colors shrink-0 cursor-pointer disabled:opacity-50 ${sellingEnabled ? 'bg-[#1a8a4a]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${sellingEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <p className="text-xs text-white/30 mt-4 tracking-wider">
              Status: <span className={sellingEnabled ? 'text-green-400' : 'text-white/50'}>{sellingEnabled ? 'Selling enabled' : 'Selling disabled'}</span>
            </p>
          </div>
        )}

        {!loading && tab === 'Deposit Addresses' && (
          <div className="space-y-5 max-w-lg">
            {['BTC', 'ETH', 'DOGE'].map(coin => (
              <div key={coin} className="border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-4 h-4 text-white/50" />
                  <span className="font-display font-bold tracking-widest">{coin}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={addressEdits[coin] ?? ''}
                    onChange={(e) => setAddressEdits({ ...addressEdits, [coin]: e.target.value })}
                    className="flex-1 bg-black/50 border border-white/30 text-white px-4 py-3 focus:outline-none focus:border-white/80 text-sm"
                  />
                  <button onClick={() => handleAddressSave(coin)} className="px-4 py-2 border border-white/30 font-display text-xs tracking-widest uppercase hover:bg-white/5 transition-colors cursor-pointer">
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
