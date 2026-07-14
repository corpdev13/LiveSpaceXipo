export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  shares: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'buy' | 'sell';
  amount: number;
  method?: string;
  status: 'completed' | 'pending' | 'rejected';
  timestamp: string;
  note?: string;
}

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  category: 'earnings' | 'launch' | 'starlink' | 'starship' | 'corporate';
  impact: 'positive' | 'neutral' | 'negative';
  time: string;
}

export interface SiteConfig {
  cryptoWalletAddress: string;
  cryptoNetwork: string;
  bankName: string;
  bankRouting: string;
  bankAccount: string;
  wireSwift: string;
  supportEmail: string;
}

export interface AppState {
  version: number;
  users: User[];
  currentUserId: string | null;
  transactions: Transaction[];
  news: MarketNews[];
  spcxPrice: number;
  spcxPriceHistory: number[];
  sessionOpen: number;
  siteConfig: SiteConfig;
}

const STATE_VERSION = 3; // bump to force reset of old localStorage
const STORAGE_KEY = 'spcx_app_state';

const defaultSiteConfig: SiteConfig = {
  cryptoWalletAddress: '0x742d35Cc6634C0532925a3b8D4C9dE8b6c1F3e2',
  cryptoNetwork: 'Ethereum (ERC-20) — USDC',
  bankName: 'SPCX Financial Corp',
  bankRouting: '021000021',
  bankAccount: 'SPCX-2026-IPO',
  wireSwift: 'SPCXUS33XXX',
  supportEmail: 'support@spcxipo.com',
};

const initialState: AppState = {
  version: STATE_VERSION,
  users: [],
  currentUserId: null,
  transactions: [],
  news: [
    {
      id: '1',
      title: 'Starship Successfully Completes 8th Integrated Flight Test',
      summary: "SpaceX's Starship vehicle achieved full mission success with precision splashdown, validating rapid reusability at scale.",
      category: 'starship',
      impact: 'positive',
      time: '2 hours ago',
    },
    {
      id: '2',
      title: 'Starlink Reaches 5 Million Active Subscribers Globally',
      summary: "Starlink's subscriber base surpassed 5 million, with revenue projections revised upward to $8.2B for fiscal 2026.",
      category: 'starlink',
      impact: 'positive',
      time: '5 hours ago',
    },
    {
      id: '3',
      title: 'SpaceX Q2 Revenue Exceeds $8B, Beating Estimates by 23%',
      summary: 'SpaceX posted record quarterly revenue driven by Starlink growth and government contracts, ahead of NASDAQ listing.',
      category: 'earnings',
      impact: 'positive',
      time: '1 day ago',
    },
  ],
  spcxPrice: 142.50,
  spcxPriceHistory: Array(20).fill(142.50),
  sessionOpen: 142.50,
  siteConfig: defaultSiteConfig,
};

function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AppState;
      // Force reset if version is old
      if (!parsed.version || parsed.version < STATE_VERSION) {
        localStorage.removeItem(STORAGE_KEY);
        return { ...initialState };
      }
      // Merge siteConfig in case new fields were added
      return {
        ...parsed,
        siteConfig: { ...defaultSiteConfig, ...(parsed.siteConfig || {}) },
      };
    }
  } catch (e) {
    // ignore
  }
  return { ...initialState };
}

function saveState(s: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    // ignore
  }
}

let state = loadState();

export function getState(): AppState {
  return state;
}

export function setState(newState: Partial<AppState>): void {
  state = { ...state, ...newState };
  saveState(state);
}

export function getCurrentUser(): User | null {
  if (!state.currentUserId) return null;
  return state.users.find((u) => u.id === state.currentUserId) || null;
}

// Login: requires approved status
export function login(username: string, email: string): User {
  const user = state.users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) throw new Error('No account found with these credentials. Please register or check your details.');
  if (user.status === 'pending') throw new Error('PENDING_APPROVAL');
  if (user.status === 'rejected') throw new Error('ACCOUNT_REJECTED');

  setState({ currentUserId: user.id });
  return user;
}

export function logout(): void {
  setState({ currentUserId: null });
}

// Register: creates user with pending status, $0 balance
export function register(username: string, email: string): User {
  const existing = state.users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
  );
  if (existing) throw new Error('Username or email already registered.');

  const newUser: User = {
    id: `user-${Date.now()}`,
    username,
    email,
    balance: 0,
    shares: 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  setState({ users: [...state.users, newUser] });
  return newUser;
}

// Admin: approve a user
export function approveUser(userId: string): void {
  setState({
    users: state.users.map((u) =>
      u.id === userId ? { ...u, status: 'approved' as const } : u
    ),
  });
}

// Admin: reject a user
export function rejectUser(userId: string): void {
  setState({
    users: state.users.map((u) =>
      u.id === userId ? { ...u, status: 'rejected' as const } : u
    ),
  });
}

// Admin: manually credit a user (e.g. after reviewing crypto deposit)
export function creditUser(userId: string, amount: number, txId?: string): void {
  setState({
    users: state.users.map((u) =>
      u.id === userId ? { ...u, balance: u.balance + amount } : u
    ),
    transactions: txId
      ? state.transactions.map((t) =>
          t.id === txId ? { ...t, status: 'completed' as const } : t
        )
      : state.transactions,
  });
}

// Card deposits always fail — returns error string
export function depositCard(_amount: number): never {
  throw new Error('CARD_DECLINED');
}

// Crypto deposit: creates pending transaction, does NOT credit balance
export function depositCrypto(amount: number, txHash?: string): Transaction {
  const user = getCurrentUser();
  if (!user) throw new Error('Not logged in');

  const transaction: Transaction = {
    id: `tx-${Date.now()}`,
    userId: user.id,
    type: 'deposit',
    amount,
    method: 'crypto',
    status: 'pending',
    timestamp: new Date().toISOString(),
    note: `Crypto deposit (USDC)${txHash ? ` — TxHash: ${txHash}` : ''}. Awaiting admin confirmation.`,
  };

  setState({ transactions: [transaction, ...state.transactions] });
  return transaction;
}

export function withdraw(amount: number, method: string, destination: string): Transaction {
  const user = getCurrentUser();
  if (!user) throw new Error('Not logged in');
  if (amount > user.balance) throw new Error('Insufficient balance');

  const isLarge = amount >= 10000;

  const transaction: Transaction = {
    id: `tx-${Date.now()}`,
    userId: user.id,
    type: 'withdrawal',
    amount,
    method,
    status: isLarge ? 'pending' : 'completed',
    timestamp: new Date().toISOString(),
    note: `Withdrawal to ${method}: ${destination}`,
  };

  const updatedUsers = isLarge
    ? state.users
    : state.users.map((u) =>
        u.id === user.id ? { ...u, balance: u.balance - amount } : u
      );

  setState({ users: updatedUsers, transactions: [transaction, ...state.transactions] });
  return transaction;
}

export function buyShares(shares: number): Transaction {
  const user = getCurrentUser();
  if (!user) throw new Error('Not logged in');
  const cost = shares * state.spcxPrice;
  if (cost > user.balance) throw new Error('Insufficient balance');

  const transaction: Transaction = {
    id: `tx-${Date.now()}`,
    userId: user.id,
    type: 'buy',
    amount: cost,
    status: 'completed',
    timestamp: new Date().toISOString(),
    note: `Bought ${shares} SPCX @ $${state.spcxPrice.toFixed(2)}`,
  };

  const updatedUsers = state.users.map((u) =>
    u.id === user.id ? { ...u, balance: u.balance - cost, shares: u.shares + shares } : u
  );
  setState({ users: updatedUsers, transactions: [transaction, ...state.transactions] });
  return transaction;
}

export function sellShares(shares: number): Transaction {
  const user = getCurrentUser();
  if (!user) throw new Error('Not logged in');
  if (shares > user.shares) throw new Error('Insufficient shares');

  const proceeds = shares * state.spcxPrice;
  const transaction: Transaction = {
    id: `tx-${Date.now()}`,
    userId: user.id,
    type: 'sell',
    amount: proceeds,
    status: 'completed',
    timestamp: new Date().toISOString(),
    note: `Sold ${shares} SPCX @ $${state.spcxPrice.toFixed(2)}`,
  };

  const updatedUsers = state.users.map((u) =>
    u.id === user.id ? { ...u, balance: u.balance + proceeds, shares: u.shares - shares } : u
  );
  setState({ users: updatedUsers, transactions: [transaction, ...state.transactions] });
  return transaction;
}

export function approveWithdrawal(txId: string): void {
  const tx = state.transactions.find((t) => t.id === txId);
  if (!tx || tx.type !== 'withdrawal') return;

  const updatedTransactions = state.transactions.map((t) =>
    t.id === txId ? { ...t, status: 'completed' as const } : t
  );
  const updatedUsers = state.users.map((u) =>
    u.id === tx.userId ? { ...u, balance: u.balance - tx.amount } : u
  );
  setState({ transactions: updatedTransactions, users: updatedUsers });
}

export function rejectWithdrawal(txId: string): void {
  setState({
    transactions: state.transactions.map((t) =>
      t.id === txId ? { ...t, status: 'rejected' as const } : t
    ),
  });
}

export function rejectDeposit(txId: string): void {
  setState({
    transactions: state.transactions.map((t) =>
      t.id === txId ? { ...t, status: 'rejected' as const } : t
    ),
  });
}

export function updatePrice(price: number): void {
  const newHistory = [...state.spcxPriceHistory.slice(1), price];
  setState({ spcxPrice: price, spcxPriceHistory: newHistory });
}

export function addNews(news: Omit<MarketNews, 'id' | 'time'>): void {
  const newNews: MarketNews = { ...news, id: `news-${Date.now()}`, time: 'Just now' };
  setState({ news: [newNews, ...state.news] });
}

export function deleteUser(userId: string): void {
  setState({
    users: state.users.filter((u) => u.id !== userId),
    transactions: state.transactions.filter((t) => t.userId !== userId),
    currentUserId: state.currentUserId === userId ? null : state.currentUserId,
  });
}

export function updateSiteConfig(config: Partial<SiteConfig>): void {
  setState({ siteConfig: { ...state.siteConfig, ...config } });
}

export function getPendingWithdrawals(): Transaction[] {
  return state.transactions.filter((t) => t.type === 'withdrawal' && t.status === 'pending');
}

export function getPendingDeposits(): Transaction[] {
  return state.transactions.filter((t) => t.type === 'deposit' && t.status === 'pending');
}

export function getPendingUsers(): User[] {
  return state.users.filter((u) => u.status === 'pending');
}

export function getAllTransactions(): Transaction[] {
  return state.transactions;
}
