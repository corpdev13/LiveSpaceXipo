import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { getCurrentUser, deposit, getState } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Building2, Coins, Banknote } from 'lucide-react';
import { toast } from 'sonner';

export default function Deposit() {
  const user = getCurrentUser();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Restricted</h1>
          <p className="text-white/60 mb-6">Please log in to make a deposit</p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-black font-semibold">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const depositAmount = Number(amount);
    if (!depositAmount || depositAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      deposit(depositAmount, method === 'bank' ? 'Bank Transfer' : method === 'crypto' ? 'USDC Crypto' : 'Wire Transfer');
      toast.success(`✅ Deposit of ${formatCurrency(depositAmount)} confirmed. 📧 Email sent via Google. 📱 SMS delivered.`);
      setAmount('');
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Deposit failed');
    }
  };

  const state = getState();
  const recentDeposits = state.transactions
    .filter(t => t.userId === user.id && t.type === 'deposit')
    .slice(0, 5);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 hover:bg-white/5" data-testid="button-back">
              <ArrowLeft size={16} className="mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-5xl font-bold mb-2">Deposit Funds</h1>
          <p className="text-white/60 text-lg">Add funds to your SPCX trading account</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Deposit Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glassmorphism p-8 rounded-xl"
          >
            <h2 className="text-2xl font-bold mb-6">Deposit Details</h2>
            
            <form onSubmit={handleDeposit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="10000.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-input border-white/10 text-2xl font-bold"
                  data-testid="input-deposit-amount"
                />
              </div>

              <div className="space-y-3">
                <Label>Payment Method</Label>
                <RadioGroup value={method} onValueChange={setMethod}>
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex-1 cursor-pointer flex items-center gap-3">
                      <Building2 className="text-primary" size={20} />
                      <div>
                        <div className="font-semibold">Bank Transfer</div>
                        <div className="text-sm text-white/60">1-3 business days</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer">
                    <RadioGroupItem value="crypto" id="crypto" />
                    <Label htmlFor="crypto" className="flex-1 cursor-pointer flex items-center gap-3">
                      <Coins className="text-chart-2" size={20} />
                      <div>
                        <div className="font-semibold">USDC Crypto</div>
                        <div className="text-sm text-white/60">Instant</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer">
                    <RadioGroupItem value="wire" id="wire" />
                    <Label htmlFor="wire" className="flex-1 cursor-pointer flex items-center gap-3">
                      <Banknote className="text-chart-4" size={20} />
                      <div>
                        <div className="font-semibold">Wire Transfer</div>
                        <div className="text-sm text-white/60">Same day</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {method === 'bank' && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white/60">Routing Number:</span>
                      <span className="font-mono font-semibold">021000021</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Account Number:</span>
                      <span className="font-mono font-semibold">SPCX-DEMO-{user.id.slice(-5).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              )}

              {method === 'crypto' && (
                <div className="p-4 rounded-lg bg-chart-2/10 border border-chart-2/20">
                  <div className="text-sm">
                    <div className="text-white/60 mb-2">USDC Wallet Address:</div>
                    <div className="font-mono text-xs break-all p-3 bg-black/30 rounded">
                      0x742d35Cc6634C0532925a3b8D4C9dE8b6c1F3e2
                    </div>
                  </div>
                </div>
              )}

              {method === 'wire' && (
                <div className="p-4 rounded-lg bg-chart-4/10 border border-chart-4/20">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white/60">SWIFT/BIC:</span>
                      <span className="font-mono font-semibold">SPCXUS33</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Bank Name:</span>
                      <span className="font-semibold">SPCX Financial</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold text-lg py-6"
                disabled={!amount}
                data-testid="button-submit-deposit"
              >
                Confirm Deposit
              </Button>
            </form>
          </motion.div>

          {/* Recent Deposits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glassmorphism p-8 rounded-xl"
          >
            <h2 className="text-2xl font-bold mb-6">Recent Deposits</h2>
            
            {recentDeposits.length === 0 ? (
              <div className="text-center py-12 text-white/60">
                <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                <p>No deposits yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDeposits.map((tx) => (
                  <div key={tx.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-lg text-chart-2">
                        +{formatCurrency(tx.amount)}
                      </div>
                      <div className="px-2 py-1 rounded-full bg-chart-2/20 text-chart-2 text-xs font-bold">
                        {tx.status}
                      </div>
                    </div>
                    <div className="text-sm text-white/60">
                      {new Date(tx.timestamp).toLocaleString()}
                    </div>
                    {tx.note && (
                      <div className="text-xs text-white/40 mt-1">{tx.note}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-400">
                <strong>Note:</strong> All deposits are processed instantly in demo mode. 
                Actual processing times vary by payment method.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
