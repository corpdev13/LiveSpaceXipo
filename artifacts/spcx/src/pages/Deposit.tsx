import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { getCurrentUser, depositCrypto, getState } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Coins, CreditCard, AlertTriangle, Clock, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

type Method = 'card' | 'crypto';

export default function Deposit() {
  const user = getCurrentUser();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<Method>('crypto');
  const [txHash, setTxHash] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardProcessing, setCardProcessing] = useState(false);
  const [cardDeclined, setCardDeclined] = useState(false);
  const [copied, setCopied] = useState(false);

  const state = getState();
  const cfg = state.siteConfig;
  const recentDeposits = state.transactions
    .filter((t) => t.userId === user?.id && t.type === 'deposit')
    .slice(0, 5);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Restricted</h1>
          <p className="text-white/60 mb-6">Please log in to make a deposit</p>
          <Link href="/"><Button className="bg-primary hover:bg-primary/90 text-black font-semibold">Return to Home</Button></Link>
        </div>
      </div>
    );
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(cfg.cryptoWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Wallet address copied');
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !cardNumber || !cardExpiry || !cardCvc) {
      toast.error('Please fill in all card details');
      return;
    }
    setCardProcessing(true);
    setCardDeclined(false);
    setTimeout(() => {
      setCardProcessing(false);
      setCardDeclined(true);
      toast.error('Card declined. Please use crypto deposit or contact support.');
    }, 2200);
  };

  const handleCryptoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const depositAmount = Number(amount);
    if (!depositAmount || depositAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      depositCrypto(depositAmount, txHash || undefined);
      toast.success('Crypto deposit submitted — pending admin review and confirmation.');
      setAmount('');
      setTxHash('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Submission failed');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 hover:bg-white/5">
              <ArrowLeft size={16} className="mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-5xl font-bold mb-2">Deposit Funds</h1>
          <p className="text-white/60 text-lg">Fund your SPCX trading account</p>
        </motion.div>

        {/* Method Selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => { setMethod('crypto'); setCardDeclined(false); }}
              className={`flex-1 p-4 rounded-xl border transition-all flex items-center gap-3 ${method === 'crypto' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 bg-white/3 text-white/60 hover:bg-white/5'}`}
            >
              <Coins size={20} />
              <div className="text-left">
                <div className="font-bold text-sm">Crypto (USDC)</div>
                <div className="text-xs opacity-70">Recommended</div>
              </div>
            </button>
            <button
              onClick={() => { setMethod('card'); setCardDeclined(false); }}
              className={`flex-1 p-4 rounded-xl border transition-all flex items-center gap-3 ${method === 'card' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 bg-white/3 text-white/60 hover:bg-white/5'}`}
            >
              <CreditCard size={20} />
              <div className="text-left">
                <div className="font-bold text-sm">Credit / Debit Card</div>
                <div className="text-xs opacity-70">Visa / Mastercard</div>
              </div>
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Deposit Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glassmorphism p-8 rounded-xl"
          >
            <AnimatePresence mode="wait">
              {method === 'crypto' ? (
                <motion.div key="crypto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-2">Crypto Deposit</h2>
                  <p className="text-white/50 text-sm mb-6">Send USDC to the address below, then submit your transaction details for admin confirmation.</p>

                  {/* Wallet address */}
                  <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="text-xs text-white/50 mb-1">USDC Deposit Address</div>
                    <div className="text-xs text-primary/60 mb-2">{cfg.cryptoNetwork}</div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs font-mono break-all text-white/80 bg-black/30 p-2 rounded">{cfg.cryptoWalletAddress}</code>
                      <button onClick={handleCopyAddress} className="shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors">
                        {copied ? <CheckCircle size={16} className="text-primary" /> : <Copy size={16} className="text-white/50" />}
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleCryptoSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/70">Amount Sent (USD equivalent)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 5000.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-input border-white/10 text-xl font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Transaction Hash (optional)</Label>
                      <Input
                        type="text"
                        placeholder="0x... (paste your tx hash to speed up review)"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        className="bg-input border-white/10 font-mono text-sm"
                      />
                    </div>

                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
                      <Clock size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-yellow-300/80">After sending, submit this form. An admin will review and manually credit your account — typically within 1 hour.</p>
                    </div>

                    <Button
                      type="submit"
                      disabled={!amount}
                      className="w-full bg-primary hover:bg-primary/90 text-black font-bold text-lg py-6"
                    >
                      Submit Deposit for Review
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-2">Card Deposit</h2>
                  <p className="text-white/50 text-sm mb-6">Visa and Mastercard accepted. Processing is instant upon approval.</p>

                  <form onSubmit={handleCardSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/70">Amount (USD)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 1000.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-input border-white/10 text-xl font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Card Number</Label>
                      <Input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                          setCardNumber(v.replace(/(.{4})/g, '$1 ').trim());
                        }}
                        className="bg-input border-white/10 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white/70">Expiry</Label>
                        <Input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                            if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                            setCardExpiry(v);
                          }}
                          className="bg-input border-white/10 font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70">CVC</Label>
                        <Input
                          type="text"
                          placeholder="123"
                          maxLength={4}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="bg-input border-white/10 font-mono"
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {cardDeclined && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
                        >
                          <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-red-400">Card Declined</p>
                            <p className="text-xs text-red-300/70 mt-1">
                              Your card was declined. Please use crypto (USDC) deposit or contact{' '}
                              <span className="text-primary">{cfg.supportEmail}</span> for assistance.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      type="submit"
                      disabled={cardProcessing}
                      className="w-full bg-primary hover:bg-primary/90 text-black font-bold text-lg py-6"
                    >
                      {cardProcessing ? 'Processing...' : 'Charge Card'}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Recent Deposits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glassmorphism p-8 rounded-xl"
          >
            <h2 className="text-2xl font-bold mb-6">Deposit History</h2>

            {recentDeposits.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <Coins size={40} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No deposits yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDeposits.map((tx) => (
                  <div key={tx.id} className="p-4 rounded-lg bg-white/3 border border-white/8">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-lg text-primary">+{formatCurrency(tx.amount)}</div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        tx.status === 'completed' ? 'bg-chart-2/20 text-chart-2' :
                        tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-destructive/20 text-destructive'
                      }`}>
                        {tx.status === 'pending' ? 'Pending Review' : tx.status}
                      </span>
                    </div>
                    <div className="text-xs text-white/40">{new Date(tx.timestamp).toLocaleString()}</div>
                    {tx.note && <div className="text-xs text-white/30 mt-1 truncate">{tx.note}</div>}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/15">
              <p className="text-xs text-white/50 leading-relaxed">
                Crypto deposits are reviewed by our compliance team and manually credited to your account within 1 hour during business hours.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
