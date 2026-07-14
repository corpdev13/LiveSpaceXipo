import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { getCurrentUser, withdraw, getState } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Building2, Coins, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Withdraw() {
  const user = getCurrentUser();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');
  const [destination, setDestination] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Restricted</h1>
          <p className="text-white/60 mb-6">Please log in to make a withdrawal</p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-black font-semibold">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!destination) {
      toast.error('Please enter destination details');
      return;
    }

    if (withdrawAmount > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      const isLarge = withdrawAmount >= 10000;
      withdraw(
        withdrawAmount,
        method === 'bank' ? 'Bank Transfer' : 'USDC Crypto',
        destination
      );
      
      if (isLarge) {
        toast.info(`📤 Withdrawal of ${formatCurrency(withdrawAmount)} submitted. Under compliance review (1-3 business days). 📧 Confirmation email sent. 📱 SMS delivered.`);
      } else {
        toast.success(`📤 Withdrawal of ${formatCurrency(withdrawAmount)} submitted. 📧 Confirmation email sent. 📱 SMS delivered.`);
      }
      
      setAmount('');
      setDestination('');
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Withdrawal failed');
    }
  };

  const state = getState();
  const recentWithdrawals = state.transactions
    .filter(t => t.userId === user.id && t.type === 'withdrawal')
    .slice(0, 5);

  const withdrawAmount = Number(amount);
  const isLargeWithdrawal = withdrawAmount >= 10000;

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
          <h1 className="text-5xl font-bold mb-2">Withdraw Funds</h1>
          <p className="text-white/60 text-lg">Transfer funds from your SPCX account</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Withdraw Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glassmorphism p-8 rounded-xl"
          >
            <h2 className="text-2xl font-bold mb-6">Withdrawal Details</h2>
            
            <form onSubmit={handleWithdraw} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="5000.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-input border-white/10 text-2xl font-bold"
                  data-testid="input-withdraw-amount"
                />
                <div className="text-sm text-white/60">
                  Available: {formatCurrency(user.balance)}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Destination</Label>
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
                        <div className="text-sm text-white/60">1-2 hours</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">
                  {method === 'bank' ? 'Bank Account Number' : 'USDC Wallet Address'}
                </Label>
                <Input
                  id="destination"
                  type="text"
                  placeholder={method === 'bank' ? 'Enter account number' : '0x...'}
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="bg-input border-white/10 font-mono"
                  data-testid="input-destination"
                />
              </div>

              {isLargeWithdrawal && withdrawAmount > 0 && (
                <div className="p-4 rounded-lg bg-chart-4/10 border border-chart-4/20 flex gap-3">
                  <AlertCircle className="text-chart-4 flex-shrink-0" size={20} />
                  <div className="text-sm">
                    <div className="font-semibold text-chart-4 mb-1">Compliance Review Required</div>
                    <p className="text-white/60">
                      Withdrawals of $10,000 or more require manual compliance review. 
                      Your funds will remain in your account until approved (1-3 business days).
                    </p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold text-lg py-6"
                disabled={!amount || !destination || withdrawAmount > user.balance}
                data-testid="button-submit-withdraw"
              >
                Submit Withdrawal
              </Button>
            </form>
          </motion.div>

          {/* Recent Withdrawals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glassmorphism p-8 rounded-xl"
          >
            <h2 className="text-2xl font-bold mb-6">Recent Withdrawals</h2>
            
            {recentWithdrawals.length === 0 ? (
              <div className="text-center py-12 text-white/60">
                <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                <p>No withdrawals yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentWithdrawals.map((tx) => (
                  <div key={tx.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-lg">
                        -{formatCurrency(tx.amount)}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                        tx.status === 'completed' ? 'bg-chart-2/20 text-chart-2' :
                        tx.status === 'pending' ? 'bg-chart-4/20 text-chart-4' :
                        'bg-destructive/20 text-destructive'
                      }`}>
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
                <strong>Processing Times:</strong>
                <br />• Under $10,000: Instant
                <br />• $10,000+: 1-3 business days (compliance review)
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
