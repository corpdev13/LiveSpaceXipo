import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  getState,
  getAllTransactions,
  getPendingWithdrawals,
  getPendingDeposits,
  getPendingUsers,
  approveWithdrawal,
  rejectWithdrawal,
  rejectDeposit,
  creditUser,
  approveUser,
  rejectUser,
  deleteUser,
  updatePrice,
  addNews,
  updateSiteConfig,
} from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle, DollarSign, Users, TrendingUp, FileText,
  Check, X, Trash2, UserCheck, Settings, Coins
} from 'lucide-react';
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
  const [txFilter, setTxFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
  const [creditAmounts, setCreditAmounts] = useState<Record<string, string>>({});
  const [siteConfig, setSiteConfig] = useState(state.siteConfig);

  useEffect(() => {
    if (isAdmin) sessionStorage.setItem('spcx_admin', 'true');
  }, [isAdmin]);

  useEffect(() => {
    const interval = setInterval(() => {
      const s = getState();
      setState(s);
      setSiteConfig(s.siteConfig);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={64} className="mx-auto mb-4 text-destructive" />
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-white/60 mb-6">Admin credentials required</p>
          <Link href="/"><Button className="bg-primary hover:bg-primary/90 text-black font-semibold">Return to Home</Button></Link>
        </div>
      </div>
    );
  }

  const totalUsers = state.users.length;
  const approvedUsers = state.users.filter(u => u.status === 'approved').length;
  const totalBalance = state.users.reduce((sum, u) => sum + u.balance, 0);
  const pendingWithdrawals = getPendingWithdrawals();
  const pendingDeposits = getPendingDeposits();
  const pendingUsers = getPendingUsers();
  const pendingAmount = pendingWithdrawals.reduce((sum, tx) => sum + tx.amount, 0);

  const refresh = () => setState(getState());

  const handleUpdatePrice = () => {
    const price = Number(newPrice);
    if (!price || price <= 0) { toast.error('Invalid price'); return; }
    updatePrice(price);
    refresh();
    toast.success(`Price updated to ${formatCurrency(price)}`);
  };

  const handleApproveWithdrawal = (txId: string) => {
    approveWithdrawal(txId);
    refresh();
    toast.success('Withdrawal approved and processed');
  };

  const handleRejectWithdrawal = (txId: string) => {
    rejectWithdrawal(txId);
    refresh();
    toast.info('Withdrawal rejected');
  };

  const handleCreditDeposit = (txId: string, userId: string) => {
    const amt = Number(creditAmounts[txId]);
    if (!amt || amt <= 0) { toast.error('Enter a credit amount'); return; }
    creditUser(userId, amt, txId);
    setCreditAmounts(prev => { const n = { ...prev }; delete n[txId]; return n; });
    refresh();
    toast.success(`Credited ${formatCurrency(amt)} to user`);
  };

  const handleRejectDeposit = (txId: string) => {
    rejectDeposit(txId);
    refresh();
    toast.info('Deposit rejected');
  };

  const handleApproveUser = (userId: string, username: string) => {
    approveUser(userId);
    refresh();
    toast.success(`${username} approved — account activated`);
  };

  const handleRejectUser = (userId: string, username: string) => {
    rejectUser(userId);
    refresh();
    toast.info(`${username} rejected`);
  };

  const handleDeleteUser = (userId: string, username: string) => {
    if (!confirm(`Delete user ${username}? This cannot be undone.`)) return;
    try {
      deleteUser(userId);
      refresh();
      toast.success(`User ${username} deleted`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  const handlePublishNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsSummary) { toast.error('Fill in all fields'); return; }
    addNews({ title: newsTitle, summary: newsSummary, category: newsCategory, impact: newsImpact });
    refresh();
    toast.success('News published');
    setNewsTitle('');
    setNewsSummary('');
  };

  const handleSaveConfig = () => {
    updateSiteConfig(siteConfig);
    refresh();
    toast.success('Site configuration saved');
  };

  const allTx = getAllTransactions();
  const filteredTx = txFilter === 'all' ? allTx : allTx.filter(t => t.status === txFilter);

  const statusBadge = (status: string) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
      status === 'completed' ? 'bg-chart-2/20 text-chart-2' :
      status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
      'bg-destructive/20 text-destructive'
    }`}>{status}</span>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Banner */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 rounded-xl bg-destructive/10 border-2 border-destructive/60">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-destructive" size={22} />
            <div className="flex-1">
              <div className="font-bold text-lg tracking-wide">ADMIN MODE — MISSION CONTROL</div>
              <div className="text-sm text-white/60">Full system access enabled — handle with care</div>
            </div>
            {pendingUsers.length > 0 && (
              <div className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-sm font-bold">
                {pendingUsers.length} pending approval
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-5xl font-bold mb-1">Admin Panel</h1>
          <p className="text-white/50 text-lg">Platform management and oversight</p>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto bg-card border border-white/10 p-1 rounded-xl">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="approvals" className="flex-1 relative">
              Approvals
              {pendingUsers.length > 0 && (
                <span className="ml-2 w-5 h-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center">{pendingUsers.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="deposits" className="flex-1 relative">
              Deposits
              {pendingDeposits.length > 0 && (
                <span className="ml-2 w-5 h-5 rounded-full bg-yellow-500 text-black text-xs flex items-center justify-center">{pendingDeposits.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
            <TabsTrigger value="transactions" className="flex-1">Transactions</TabsTrigger>
            <TabsTrigger value="news" className="flex-1">News</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: totalUsers, sub: `${approvedUsers} approved`, icon: Users, color: 'text-primary' },
                { label: 'Platform Balance', value: formatCurrency(totalBalance), icon: DollarSign, color: 'text-chart-2' },
                { label: 'Pending Withdrawals', value: pendingWithdrawals.length, sub: formatCurrency(pendingAmount), icon: AlertTriangle, color: 'text-yellow-400' },
                { label: 'SPCX Price', value: formatCurrency(state.spcxPrice), icon: TrendingUp, color: 'text-primary' },
              ].map((card) => (
                <div key={card.label} className="glassmorphism p-6 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <card.icon className={card.color} size={18} />
                    <span className="text-sm text-white/50">{card.label}</span>
                  </div>
                  <div className="text-3xl font-bold">{card.value}</div>
                  {card.sub && <div className="text-xs text-white/40 mt-1">{card.sub}</div>}
                </div>
              ))}
            </div>

            <div className="glassmorphism p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">Live Price Control</h2>
              <div className="flex gap-4">
                <Input
                  type="number"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="bg-input border-white/10 text-2xl font-bold flex-1"
                />
                <Button onClick={handleUpdatePrice} className="bg-primary hover:bg-primary/90 text-black font-bold px-8">
                  Update Price
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* User Approvals */}
          <TabsContent value="approvals">
            <div className="glassmorphism p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <UserCheck size={24} className="text-primary" />
                Account Approvals
              </h2>

              {pendingUsers.length === 0 ? (
                <div className="text-center py-16 text-white/40">
                  <UserCheck size={48} className="mx-auto mb-3 opacity-30" />
                  <p>No pending applications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/8">
                      <div>
                        <div className="font-bold text-lg">{u.username}</div>
                        <div className="text-sm text-white/50">{u.email}</div>
                        <div className="text-xs text-white/30 mt-0.5">Applied {new Date(u.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApproveUser(u.id, u.username)} className="bg-chart-2 hover:bg-chart-2/90 text-black font-bold">
                          <Check size={14} className="mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectUser(u.id, u.username)} className="border-destructive/50 text-destructive hover:bg-destructive/10">
                          <X size={14} className="mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show all user statuses */}
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4 text-white/70">All Applications</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50">
                        <th className="text-left py-2 px-3">Username</th>
                        <th className="text-left py-2 px-3">Email</th>
                        <th className="text-center py-2 px-3">Status</th>
                        <th className="text-right py-2 px-3">Registered</th>
                        <th className="text-right py-2 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.users.map((u) => (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/3">
                          <td className="py-2 px-3 font-semibold">{u.username}</td>
                          <td className="py-2 px-3 text-white/50">{u.email}</td>
                          <td className="py-2 px-3 text-center">{statusBadge(u.status)}</td>
                          <td className="py-2 px-3 text-right text-white/40">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="py-2 px-3 text-right">
                            {u.status !== 'approved' && (
                              <Button size="sm" onClick={() => handleApproveUser(u.id, u.username)} className="bg-chart-2/20 text-chart-2 hover:bg-chart-2/30 mr-1 text-xs h-7">
                                Approve
                              </Button>
                            )}
                            {u.status !== 'rejected' && u.status !== 'pending' && (
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(u.id, u.username)} className="text-destructive hover:bg-destructive/10 h-7">
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Deposit Review */}
          <TabsContent value="deposits">
            <div className="glassmorphism p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Coins size={24} className="text-primary" />
                Deposit Review
              </h2>
              <p className="text-white/50 text-sm mb-6">Review crypto deposits and manually credit user accounts upon verification.</p>

              {pendingDeposits.length === 0 ? (
                <div className="text-center py-16 text-white/40">
                  <Coins size={48} className="mx-auto mb-3 opacity-30" />
                  <p>No pending deposits</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingDeposits.map((tx) => {
                    const user = state.users.find(u => u.id === tx.userId);
                    return (
                      <div key={tx.id} className="p-5 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div>
                            <div className="font-bold text-xl text-yellow-400">{formatCurrency(tx.amount)} claimed</div>
                            <div className="text-sm text-white/60 mt-0.5">{user?.username} ({user?.email})</div>
                            <div className="text-xs text-white/40 mt-0.5">{new Date(tx.timestamp).toLocaleString()}</div>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">Pending Review</span>
                        </div>
                        {tx.note && <div className="text-xs text-white/40 mb-4 font-mono break-all">{tx.note}</div>}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex-1 min-w-36">
                            <Label className="text-xs text-white/50 mb-1 block">Credit Amount (USD)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder={tx.amount.toString()}
                              value={creditAmounts[tx.id] || ''}
                              onChange={(e) => setCreditAmounts(prev => ({ ...prev, [tx.id]: e.target.value }))}
                              className="bg-input border-white/10 h-9 text-sm"
                            />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button size="sm" onClick={() => handleCreditDeposit(tx.id, tx.userId)} className="bg-chart-2 hover:bg-chart-2/90 text-black font-bold">
                              <Check size={14} className="mr-1" /> Credit & Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRejectDeposit(tx.id)} className="border-destructive/50 text-destructive hover:bg-destructive/10">
                              <X size={14} className="mr-1" /> Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <div className="glassmorphism p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-6">User Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50">
                      <th className="text-left py-3 px-3">Username</th>
                      <th className="text-left py-3 px-3">Email</th>
                      <th className="text-center py-3 px-3">Status</th>
                      <th className="text-right py-3 px-3">Balance</th>
                      <th className="text-right py-3 px-3">Shares</th>
                      <th className="text-right py-3 px-3">Portfolio</th>
                      <th className="text-right py-3 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.users.map((user) => {
                      const portfolioValue = user.balance + user.shares * state.spcxPrice;
                      return (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/3">
                          <td className="py-3 px-3 font-semibold">{user.username}</td>
                          <td className="py-3 px-3 text-white/50">{user.email}</td>
                          <td className="py-3 px-3 text-center">{statusBadge(user.status)}</td>
                          <td className="py-3 px-3 text-right">{formatCurrency(user.balance)}</td>
                          <td className="py-3 px-3 text-right">{user.shares}</td>
                          <td className="py-3 px-3 text-right font-bold">{formatCurrency(portfolioValue)}</td>
                          <td className="py-3 px-3 text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id, user.username)} className="text-destructive hover:bg-destructive/10">
                              <Trash2 size={15} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions">
            <div className="glassmorphism p-8 rounded-xl">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold">Transaction Ledger</h2>
                <div className="flex gap-2">
                  {(['all', 'pending', 'completed', 'rejected'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setTxFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${txFilter === f ? 'bg-primary text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {pendingWithdrawals.length > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                  <div className="font-semibold mb-3 text-yellow-400 flex items-center gap-2">
                    <AlertTriangle size={18} /> Pending Withdrawals
                  </div>
                  <div className="space-y-2">
                    {pendingWithdrawals.map((tx) => {
                      const user = state.users.find(u => u.id === tx.userId);
                      return (
                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-black/30">
                          <div>
                            <span className="font-bold">{formatCurrency(tx.amount)}</span>
                            <span className="text-sm text-white/50 ml-2">{user?.username} • {new Date(tx.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApproveWithdrawal(tx.id)} className="bg-chart-2 hover:bg-chart-2/90 text-black font-bold h-8">
                              <Check size={14} className="mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRejectWithdrawal(tx.id)} className="border-destructive/50 text-destructive hover:bg-destructive/10 h-8">
                              <X size={14} className="mr-1" /> Reject
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
                    <tr className="border-b border-white/10 text-white/50">
                      <th className="text-left py-2 px-3">User</th>
                      <th className="text-left py-2 px-3">Type</th>
                      <th className="text-right py-2 px-3">Amount</th>
                      <th className="text-center py-2 px-3">Status</th>
                      <th className="text-left py-2 px-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTx.slice(0, 80).map((tx) => {
                      const user = state.users.find(u => u.id === tx.userId);
                      return (
                        <tr key={tx.id} className="border-b border-white/5 hover:bg-white/3">
                          <td className="py-2 px-3">{user?.username || 'Unknown'}</td>
                          <td className="py-2 px-3 capitalize">{tx.type}</td>
                          <td className="py-2 px-3 text-right font-semibold">{formatCurrency(tx.amount)}</td>
                          <td className="py-2 px-3 text-center">{statusBadge(tx.status)}</td>
                          <td className="py-2 px-3 text-white/40 text-xs">{new Date(tx.timestamp).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* News */}
          <TabsContent value="news">
            <div className="glassmorphism p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-6">Publish Market News</h2>
              <form onSubmit={handlePublishNews} className="space-y-6">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} placeholder="Breaking: SpaceX announces..." className="bg-input border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Summary</Label>
                  <Textarea value={newsSummary} onChange={(e) => setNewsSummary(e.target.value)} placeholder="Brief summary..." className="bg-input border-white/10 min-h-24" />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newsCategory} onValueChange={(v: any) => setNewsCategory(v)}>
                      <SelectTrigger className="bg-input border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['earnings', 'launch', 'starlink', 'starship', 'corporate'].map(c => (
                          <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Market Impact</Label>
                    <Select value={newsImpact} onValueChange={(v: any) => setNewsImpact(v)}>
                      <SelectTrigger className="bg-input border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['positive', 'neutral', 'negative'].map(c => (
                          <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-black font-bold text-lg py-6">
                  <FileText size={18} className="mr-2" /> Publish News
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <div className="glassmorphism p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3"><Settings size={22} /> Platform Configuration</h2>
              <p className="text-white/50 text-sm mb-8">Update deposit addresses, bank details, and contact information. Changes apply immediately to all users.</p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-primary border-b border-primary/20 pb-2">Crypto Deposit</h3>
                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs">USDC Wallet Address</Label>
                    <Input value={siteConfig.cryptoWalletAddress} onChange={(e) => setSiteConfig(p => ({ ...p, cryptoWalletAddress: e.target.value }))} className="bg-input border-white/10 font-mono text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs">Network / Token Description</Label>
                    <Input value={siteConfig.cryptoNetwork} onChange={(e) => setSiteConfig(p => ({ ...p, cryptoNetwork: e.target.value }))} className="bg-input border-white/10 text-sm" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-primary border-b border-primary/20 pb-2">Bank / Wire Transfer</h3>
                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs">Bank Name</Label>
                    <Input value={siteConfig.bankName} onChange={(e) => setSiteConfig(p => ({ ...p, bankName: e.target.value }))} className="bg-input border-white/10 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-white/60 text-xs">Routing Number</Label>
                      <Input value={siteConfig.bankRouting} onChange={(e) => setSiteConfig(p => ({ ...p, bankRouting: e.target.value }))} className="bg-input border-white/10 font-mono text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/60 text-xs">Account Number</Label>
                      <Input value={siteConfig.bankAccount} onChange={(e) => setSiteConfig(p => ({ ...p, bankAccount: e.target.value }))} className="bg-input border-white/10 font-mono text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs">SWIFT / BIC Code</Label>
                    <Input value={siteConfig.wireSwift} onChange={(e) => setSiteConfig(p => ({ ...p, wireSwift: e.target.value }))} className="bg-input border-white/10 font-mono text-sm" />
                  </div>
                </div>

                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-bold text-primary border-b border-primary/20 pb-2">Contact</h3>
                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs">Support Email</Label>
                    <Input value={siteConfig.supportEmail} onChange={(e) => setSiteConfig(p => ({ ...p, supportEmail: e.target.value }))} className="bg-input border-white/10 text-sm" />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveConfig} className="mt-8 w-full bg-primary hover:bg-primary/90 text-black font-bold text-lg py-6">
                Save Configuration
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
