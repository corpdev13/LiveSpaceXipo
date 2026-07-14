import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { getCurrentUser, getState, buyShares, sellShares } from '@/lib/store';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Wallet, PieChart as PieChartIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function Dashboard() {
  const user = getCurrentUser();
  const [, setLocation] = useLocation();
  const [state, setState] = useState(getState());
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setState(getState());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Restricted</h1>
          <p className="text-white/60 mb-6">Please log in to access your dashboard</p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-black font-semibold">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const portfolioValue = user.balance + (user.shares * state.spcxPrice);
  const avgCost = 118.40;
  const totalInvested = user.shares * avgCost;
  const unrealizedPL = (user.shares * state.spcxPrice) - totalInvested;
  const plPercent = totalInvested > 0 ? (unrealizedPL / totalInvested) * 100 : 0;

  const userTransactions = state.transactions.filter(t => t.userId === user.id).slice(0, 10);

  const portfolioData = [
    { name: 'Cash', value: user.balance, color: '#00A0E9' },
    { name: 'SPCX Holdings', value: user.shares * state.spcxPrice, color: '#00E5A0' },
  ];

  const handleBuy = () => {
    const shares = Number(buyAmount);
    if (!shares || shares <= 0) {
      toast.error('Please enter a valid number of shares');
      return;
    }

    const cost = shares * state.spcxPrice;
    if (cost > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      buyShares(shares);
      toast.success(`✅ Successfully bought ${shares} SPCX shares at ${formatCurrency(state.spcxPrice)}`);
      setBuyAmount('');
      setShowBuyModal(false);
      setState(getState());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Transaction failed');
    }
  };

  const handleSell = () => {
    const shares = Number(sellAmount);
    if (!shares || shares <= 0) {
      toast.error('Please enter a valid number of shares');
      return;
    }

    if (shares > user.shares) {
      toast.error('Insufficient shares');
      return;
    }

    try {
      sellShares(shares);
      toast.success(`✅ Successfully sold ${shares} SPCX shares at ${formatCurrency(state.spcxPrice)}`);
      setSellAmount('');
      setShowSellModal(false);
      setState(getState());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Transaction failed');
    }
  };

  const buyTotal = buyAmount ? Number(buyAmount) * state.spcxPrice : 0;
  const sellTotal = sellAmount ? Number(sellAmount) * state.spcxPrice : 0;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold mb-2">Dashboard</h1>
          <p className="text-white/60 text-lg">Welcome back, {user.username}</p>
        </motion.div>

        {/* Portfolio Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glassmorphism p-6 rounded-xl"
            data-testid="card-portfolio-value"
          >
            <div className="flex items-center gap-2 mb-3">
              <PieChartIcon className="text-primary" size={20} />
              <span className="text-sm text-white/60">Portfolio Value</span>
            </div>
            <div className="text-3xl font-bold">{formatCurrency(portfolioValue)}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glassmorphism p-6 rounded-xl"
            data-testid="card-cash-balance"
          >
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="text-chart-2" size={20} />
              <span className="text-sm text-white/60">Cash Balance</span>
            </div>
            <div className="text-3xl font-bold">{formatCurrency(user.balance)}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glassmorphism p-6 rounded-xl"
            data-testid="card-holdings"
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="text-chart-4" size={20} />
              <span className="text-sm text-white/60">SPCX Holdings</span>
            </div>
            <div className="text-3xl font-bold">{user.shares}</div>
            <div className="text-sm text-white/60 mt-1">{formatCurrency(user.shares * state.spcxPrice)}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glassmorphism p-6 rounded-xl"
            data-testid="card-pl"
          >
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className={unrealizedPL >= 0 ? 'text-chart-2' : 'text-destructive'} size={20} />
              <span className="text-sm text-white/60">Unrealized P&L</span>
            </div>
            <div className={`text-3xl font-bold ${unrealizedPL >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
              {unrealizedPL >= 0 ? '+' : ''}{formatCurrency(unrealizedPL)}
            </div>
            <div className={`text-sm mt-1 ${unrealizedPL >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
              {plPercent >= 0 ? '+' : ''}{plPercent.toFixed(2)}%
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glassmorphism p-6 rounded-xl mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/deposit">
              <Button className="w-full bg-chart-2 hover:bg-chart-2/90 text-black font-semibold" data-testid="button-deposit">
                <ArrowUpRight size={16} className="mr-2" />
                Deposit Funds
              </Button>
            </Link>
            <Link href="/withdraw">
              <Button variant="outline" className="w-full border-white/20" data-testid="button-withdraw">
                <ArrowDownRight size={16} className="mr-2" />
                Withdraw
              </Button>
            </Link>
            <Button
              onClick={() => setShowBuyModal(true)}
              className="w-full bg-primary hover:bg-primary/90 text-black font-semibold"
              data-testid="button-buy-shares"
            >
              Buy Shares
            </Button>
            <Button
              onClick={() => setShowSellModal(true)}
              variant="outline"
              className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
              data-testid="button-sell-shares"
            >
              Sell Shares
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Portfolio Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glassmorphism p-6 rounded-xl"
          >
            <h2 className="text-2xl font-bold mb-4">Portfolio Allocation</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glassmorphism p-6 rounded-xl"
          >
            <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
            <div className="space-y-3">
              {userTransactions.length === 0 ? (
                <p className="text-white/60 text-center py-8">No transactions yet</p>
              ) : (
                userTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex-1">
                      <div className="font-semibold capitalize">{tx.type}</div>
                      <div className="text-xs text-white/60">{new Date(tx.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${tx.type === 'deposit' || tx.type === 'sell' ? 'text-chart-2' : 'text-white'}`}>
                        {tx.type === 'deposit' || tx.type === 'sell' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </div>
                      <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                        tx.status === 'completed' ? 'bg-chart-2/20 text-chart-2' :
                        tx.status === 'pending' ? 'bg-chart-4/20 text-chart-4' :
                        'bg-destructive/20 text-destructive'
                      }`}>
                        {tx.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Buy Modal */}
      <Dialog open={showBuyModal} onOpenChange={setShowBuyModal}>
        <DialogContent className="sm:max-w-md bg-card border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Buy SPCX Shares</DialogTitle>
            <DialogDescription className="text-white/60">
              Current price: {formatCurrency(state.spcxPrice)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="buy-shares">Number of Shares</Label>
              <Input
                id="buy-shares"
                type="number"
                placeholder="0"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="bg-input border-white/10"
                data-testid="input-buy-shares"
              />
            </div>

            {buyAmount && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex justify-between mb-2">
                  <span className="text-white/60">Total Cost:</span>
                  <span className="font-bold text-xl">{formatCurrency(buyTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Available Balance:</span>
                  <span className={user.balance >= buyTotal ? 'text-chart-2' : 'text-destructive'}>
                    {formatCurrency(user.balance)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleBuy}
                className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold"
                disabled={!buyAmount || buyTotal > user.balance}
                data-testid="button-confirm-buy"
              >
                Confirm Purchase
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBuyModal(false)}
                className="border-white/20"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sell Modal */}
      <Dialog open={showSellModal} onOpenChange={setShowSellModal}>
        <DialogContent className="sm:max-w-md bg-card border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Sell SPCX Shares</DialogTitle>
            <DialogDescription className="text-white/60">
              Current price: {formatCurrency(state.spcxPrice)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="sell-shares">Number of Shares</Label>
              <Input
                id="sell-shares"
                type="number"
                placeholder="0"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                className="bg-input border-white/10"
                data-testid="input-sell-shares"
              />
            </div>

            {sellAmount && (
              <div className="p-4 rounded-lg bg-chart-2/10 border border-chart-2/20">
                <div className="flex justify-between mb-2">
                  <span className="text-white/60">Total Proceeds:</span>
                  <span className="font-bold text-xl text-chart-2">{formatCurrency(sellTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Available Shares:</span>
                  <span className={user.shares >= Number(sellAmount) ? 'text-chart-2' : 'text-destructive'}>
                    {user.shares}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSell}
                className="flex-1 bg-chart-2 hover:bg-chart-2/90 text-black font-semibold"
                disabled={!sellAmount || Number(sellAmount) > user.shares}
                data-testid="button-confirm-sell"
              >
                Confirm Sale
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSellModal(false)}
                className="border-white/20"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
