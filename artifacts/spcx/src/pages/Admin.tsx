import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  getState,
  getAllTransactions,
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  deleteUser,
  updatePrice,
  addNews,
} from '@/lib/store';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, DollarSign, Users, TrendingUp, FileText, Check, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Admin() {
  const isAdmin =
    new URLSearchParams(window.location.search).get('admin') === 'spcx2026' ||
    sessionStorage.getItem('spcx_admin') === 'true';

  const [state, setState] = useState(getState());
  const [newPrice, setNewPrice] = useState(state.spcxPrice.toString());
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsCategory, setNewsCategory] = useState<'earnings' | 'launch' | 'starlink' | 'starship' | 'corporate'>('earnings');
  const [newsImpact, setNewsImpact] = useState<'positive' | 'neutral' | 'negative'>('positive');

  useEffect(() => {
    if (isAdmin) {
      sessionStorage.setItem('spcx_admin', 'true');
    }
  }, [isAdmin]);

  useEffect(() => {
    const interval = setInterval(() => {
      setState(getState());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={64} className="mx-auto mb-4 text-destructive" />
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-white/60 mb-6">Admin credentials required</p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-black font-semibold">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalUsers = state.users.length;
  const totalBalance = state.users.reduce((sum, u) => sum + u.balance, 0);
  const pendingWithdrawals = getPendingWithdrawals();
  const pendingAmount = pendingWithdrawals.reduce((sum, tx) => sum + tx.amount, 0);

  const handleUpdatePrice = () => {
    const price = Number(newPrice);
    if (!price || price <= 0) {
      toast.error('Invalid price');
      return;
    }
    updatePrice(price);
    setState(getState());
    toast.success(`✅ Price updated to ${formatCurrency(price)}`);
  };

  const handleApprove = (txId: string) => {
    approveWithdrawal(txId);
    setState(getState());
    toast.success('✅ Withdrawal approved');
  };

  const handleReject = (txId: string) => {
    rejectWithdrawal(txId);
    setState(getState());
    toast.info('Withdrawal rejected');
  };

  const handleDeleteUser = (userId: string, username: string) => {
    if (!confirm(`Delete user ${username}? This cannot be undone.`)) return;
    
    try {
      deleteUser(userId);
      setState(getState());
      toast.success(`User ${username} deleted`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  const handlePublishNews = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsTitle || !newsSummary) {
      toast.error('Please fill in all fields');
      return;
    }

    addNews({
      title: newsTitle,
      summary: newsSummary,
      category: newsCategory,
      impact: newsImpact,
    });
    
    setState(getState());
    toast.success('✅ News published');
    setNewsTitle('');
    setNewsSummary('');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-xl bg-destructive/20 border-2 border-destructive"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-destructive" size={24} />
            <div className="flex-1">
              <div className="font-bold text-lg">ADMIN MODE — MISSION CONTROL</div>
              <div className="text-sm text-white/80">Full system access enabled</div>
            </div>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold mb-2">Admin Panel</h1>
          <p className="text-white/60 text-lg">Platform management and oversight</p>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-card border border-white/20">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="news">Publish News</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glassmorphism p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="text-primary" size={20} />
                  <span className="text-sm text-white/60">Total Users</span>
                </div>
                <div className="text-3xl font-bold">{totalUsers}</div>
              </div>

              <div className="glassmorphism p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="text-chart-2" size={20} />
                  <span className="text-sm text-white/60">Platform Balance</span>
                </div>
                <div className="text-3xl font-bold">{formatCurrency(totalBalance)}</div>
              </div>

              <div className="glassmorphism p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="text-chart-4" size={20} />
                  <span className="text-sm text-white/60">Pending Withdrawals</span>
                </div>
                <div className="text-3xl font-bold">{pendingWithdrawals.length}</div>
                <div className="text-sm text-white/60 mt-1">{formatCurrency(pendingAmount)}</div>
              </div>

              <div className="glassmorphism p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="text-primary" size={20} />
                  <span className="text-sm text-white/60">SPCX Price</span>
                </div>
                <div className="text-3xl font-bold">{formatCurrency(state.spcxPrice)}</div>
              </div>
            </div>

            <div className="glassmorphism p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">Update SPCX Price</h2>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="bg-input border-white/10 text-2xl font-bold"
                    data-testid="input-admin-price"
                  />
                </div>
                <Button
                  onClick={handleUpdatePrice}
                  className="bg-primary hover:bg-primary/90 text-black font-semibold px-8"
                  data-testid="button-update-price"
                >
                  Update Price
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="glassmorphism p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-6">User Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4">Username</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-right py-3 px-4">Balance</th>
                      <th className="text-right py-3 px-4">Shares</th>
                      <th className="text-right py-3 px-4">Portfolio Value</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.users.map((user) => {
                      const portfolioValue = user.balance + (user.shares * state.spcxPrice);
                      return (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4 font-semibold">{user.username}</td>
                          <td className="py-3 px-4 text-white/60">{user.email}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(user.balance)}</td>
                          <td className="py-3 px-4 text-right">{user.shares}</td>
                          <td className="py-3 px-4 text-right font-bold">{formatCurrency(portfolioValue)}</td>
                          <td className="py-3 px-4 text-right">
                            {user.id !== 'demo-user' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id, user.username)}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 size={16} />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <div className="glassmorphism p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-6">Transaction Management</h2>
              
              {pendingWithdrawals.length > 0 && (
                <div className="mb-8 p-4 rounded-lg bg-chart-4/10 border border-chart-4/20">
                  <div className="font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-chart-4" />
                    Pending Withdrawals Requiring Approval
                  </div>
                  <div className="space-y-3">
                    {pendingWithdrawals.map((tx) => {
                      const user = state.users.find(u => u.id === tx.userId);
                      return (
                        <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-black/30">
                          <div>
                            <div className="font-bold">{formatCurrency(tx.amount)}</div>
                            <div className="text-sm text-white/60">
                              {user?.username} • {new Date(tx.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(tx.id)}
                              className="bg-chart-2 hover:bg-chart-2/90 text-black"
                            >
                              <Check size={16} className="mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(tx.id)}
                              className="border-destructive/50 text-destructive hover:bg-destructive/10"
                            >
                              <X size={16} className="mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-right py-3 px-4">Amount</th>
                      <th className="text-center py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getAllTransactions().slice(0, 50).map((tx) => {
                      const user = state.users.find(u => u.id === tx.userId);
                      return (
                        <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4">{user?.username || 'Unknown'}</td>
                          <td className="py-3 px-4 capitalize">{tx.type}</td>
                          <td className="py-3 px-4 text-right font-semibold">{formatCurrency(tx.amount)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              tx.status === 'completed' ? 'bg-chart-2/20 text-chart-2' :
                              tx.status === 'pending' ? 'bg-chart-4/20 text-chart-4' :
                              'bg-destructive/20 text-destructive'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white/60">{new Date(tx.timestamp).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Publish News Tab */}
          <TabsContent value="news">
            <div className="glassmorphism p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-6">Publish Market News</h2>
              <form onSubmit={handlePublishNews} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="news-title">Title</Label>
                  <Input
                    id="news-title"
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="Breaking: SpaceX announces..."
                    className="bg-input border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="news-summary">Summary</Label>
                  <Textarea
                    id="news-summary"
                    value={newsSummary}
                    onChange={(e) => setNewsSummary(e.target.value)}
                    placeholder="Brief summary of the news..."
                    className="bg-input border-white/10 min-h-24"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newsCategory} onValueChange={(v: any) => setNewsCategory(v)}>
                      <SelectTrigger className="bg-input border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="earnings">Earnings</SelectItem>
                        <SelectItem value="launch">Launch</SelectItem>
                        <SelectItem value="starlink">Starlink</SelectItem>
                        <SelectItem value="starship">Starship</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Market Impact</Label>
                    <Select value={newsImpact} onValueChange={(v: any) => setNewsImpact(v)}>
                      <SelectTrigger className="bg-input border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-black font-bold text-lg py-6"
                >
                  <FileText size={20} className="mr-2" />
                  Publish News
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
