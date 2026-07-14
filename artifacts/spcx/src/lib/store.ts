export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  shares: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'buy' | 'sell';
  amount: number;
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

export interface AppState {
  users: User[];
  currentUserId: string | null;
  transactions: Transaction[];
  news: MarketNews[];
  spcxPrice: number;
  spcxPriceHistory: number[];
  sessionOpen: number;
}

const STORAGE_KEY = 'spcx_app_state';

const initialState: AppState = {
  users: [
    {
      id: 'demo-user',
      username: 'demo',
      email: 'demo@spcx.io',
      balance: 50000,
      shares: 125,
      createdAt: new Date().toISOString(),
    },
  ],
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
};

function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return initialState;
}

function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
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

export function login(username: string, email: string): User {
  const existingUser = state.users.find(
    (u) => u.username === username || u.email === email
  );
  
  if (existingUser) {
    setState({ currentUserId: existingUser.id });
    return existingUser;
  }
  
  const newUser: User = {
    id: `user-${Date.now()}`,
    username,
    email,
    balance: 10000,
    shares: 0,
    createdAt: new Date().toISOString(),
  };
  
  setState({
    users: [...state.users, newUser],
    currentUserId: newUser.id,
  });
  
  return newUser;
}

export function logout(): void {
  setState({ currentUserId: null });
}

export function register(username: string, email: string): User {
  const newUser: User = {
    id: `user-${Date.now()}`,
    username,
    email,
    balance: 10000,
    shares: 0,
    createdAt: new Date().toISOString(),
  };
  
  setState({
    users: [...state.users, newUser],
    currentUserId: newUser.id,
  });
  
  return newUser;
}

export function deposit(amount: number, method: string): Transaction {
  const user = getCurrentUser();
  if (!user) throw new Error('Not logged in');
  
  const transaction: Transaction = {
    id: `tx-${Date.now()}`,
    userId: user.id,
    type: 'deposit',
    amount,
    status: 'completed',
    timestamp: new Date().toISOString(),
    note: `Deposit via ${method}`,
  };
  
  const updatedUsers = state.users.map((u) =>
    u.id === user.id ? { ...u, balance: u.balance + amount } : u
  );
  
  setState({
    users: updatedUsers,
    transactions: [transaction, ...state.transactions],
  });
  
  return transaction;
}

export function withdraw(amount: number, method: string, destination: string): Transaction {
  const user = getCurrentUser();
  if (!user) throw new Error('Not logged in');
  
  if (amount > user.balance) {
    throw new Error('Insufficient balance');
  }
  
  const isLarge = amount >= 10000;
  
  const transaction: Transaction = {
    id: `tx-${Date.now()}`,
    userId: user.id,
    type: 'withdrawal',
    amount,
    status: isLarge ? 'pending' : 'completed',
    timestamp: new Date().toISOString(),
    note: `Withdrawal to ${method}: ${destination}`,
  };
  
  const updatedUsers = isLarge
    ? state.users
    : state.users.map((u) =>
        u.id === user.id ? { ...u, balance: u.balance - amount } : u
      );
  
  setState({
    users: updatedUsers,
    transactions: [transaction, ...state.transactions],
  });
  
  return transaction;
}

export function buyShares(shares: number): Transaction {
  const user = getCurrentUser();
  if (!user) throw new Error('Not logged in');
  
  const cost = shares * state.spcxPrice;
  
  if (cost > user.balance) {
    throw new Error('Insufficient balance');
  }
  
  const transaction: Transaction = {
    id: `tx-${Date.now()}`,
    userId: user.id,
    type: 'buy',
    amount: cost,
    status: 'completed',
    timestamp: new Date().toISOString(),
    note: `Bought ${shares} SPCX shares at $${state.spcxPrice.toFixed(2)}`,
  };
  
  const updatedUsers = state.users.map((u) =>
    u.id === user.id
      ? { ...u, balance: u.balance - cost, shares: u.shares + shares }
      : u
  );
  
  setState({
    users: updatedUsers,
    transactions: [transaction, ...state.transactions],
  });
  
  return transaction;
}

export function sellShares(shares: number): Transaction {
  const user = getCurrentUser();
  if (!user) throw new Error('Not logged in');
  
  if (shares > user.shares) {
    throw new Error('Insufficient shares');
  }
  
  const proceeds = shares * state.spcxPrice;
  
  const transaction: Transaction = {
    id: `tx-${Date.now()}`,
    userId: user.id,
    type: 'sell',
    amount: proceeds,
    status: 'completed',
    timestamp: new Date().toISOString(),
    note: `Sold ${shares} SPCX shares at $${state.spcxPrice.toFixed(2)}`,
  };
  
  const updatedUsers = state.users.map((u) =>
    u.id === user.id
      ? { ...u, balance: u.balance + proceeds, shares: u.shares - shares }
      : u
  );
  
  setState({
    users: updatedUsers,
    transactions: [transaction, ...state.transactions],
  });
  
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
  
  setState({
    transactions: updatedTransactions,
    users: updatedUsers,
  });
}

export function rejectWithdrawal(txId: string): void {
  const updatedTransactions = state.transactions.map((t) =>
    t.id === txId ? { ...t, status: 'rejected' as const } : t
  );
  
  setState({ transactions: updatedTransactions });
}

export function updatePrice(price: number): void {
  const newHistory = [...state.spcxPriceHistory.slice(1), price];
  setState({
    spcxPrice: price,
    spcxPriceHistory: newHistory,
  });
}

export function addNews(news: Omit<MarketNews, 'id' | 'time'>): void {
  const newNews: MarketNews = {
    ...news,
    id: `news-${Date.now()}`,
    time: 'Just now',
  };
  
  setState({
    news: [newNews, ...state.news],
  });
}

export function deleteUser(userId: string): void {
  if (userId === 'demo-user') {
    throw new Error('Cannot delete demo user');
  }
  
  setState({
    users: state.users.filter((u) => u.id !== userId),
    transactions: state.transactions.filter((t) => t.userId !== userId),
  });
}

export function getPendingWithdrawals(): Transaction[] {
  return state.transactions.filter(
    (t) => t.type === 'withdrawal' && t.status === 'pending'
  );
}

export function getAllTransactions(): Transaction[] {
  return state.transactions;
}
