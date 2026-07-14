import { motion } from 'framer-motion';
import { getState } from '@/lib/store';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Building2, TrendingUp, DollarSign, ExternalLink } from 'lucide-react';
import elonPhoto from '@assets/IMG_0319_1784055905752.jpeg';

export default function Market() {
  const state = getState();

  const chartData = state.spcxPriceHistory.map((price, i) => ({
    time: i,
    price: price,
  }));

  const timeline = [
    { label: 'SEC Filing', date: 'Dec 2025', status: 'completed' },
    { label: 'Price Range Set', date: 'Jan 2026', status: 'completed' },
    { label: 'Book Building', date: 'Feb 2026', status: 'completed' },
    { label: 'Application Deadline', date: 'Mar 15, 2026', status: 'completed' },
    { label: 'Pricing', date: 'Mar 20, 2026', status: 'current' },
    { label: 'Listing Day', date: 'Mar 22, 2026', status: 'upcoming' },
  ];

  const ipoDetails = [
    { label: 'Listing Date', value: 'March 22, 2026', icon: Calendar },
    { label: 'Exchange', value: 'NASDAQ', icon: Building2 },
    { label: 'Price Range', value: '$118-$165', icon: TrendingUp },
    { label: 'Shares Offered', value: '1.2B', icon: DollarSign },
  ];

  const allocation = [
    { category: 'Institutional', percentage: 65, color: 'bg-primary' },
    { category: 'Retail', percentage: 25, color: 'bg-chart-2' },
    { category: 'Employee', percentage: 10, color: 'bg-chart-4' },
  ];

  const impactColors = {
    positive: 'border-l-chart-2',
    neutral: 'border-l-chart-4',
    negative: 'border-l-destructive',
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold mb-4">Market Data</h1>
          <p className="text-white/60 text-lg">
            Real-time SPCX market intelligence and IPO analytics
          </p>
        </motion.div>

        {/* Price Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glassmorphism p-6 rounded-xl mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">SPCX Price Chart</h2>
              <div className="text-4xl font-bold text-primary">{formatCurrency(state.spcxPrice)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/60">24h Change</div>
              <div className="text-2xl font-bold text-chart-2">+2.3%</div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A0E9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00A0E9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#666" hide />
                <YAxis stroke="#666" hide domain={['dataMin', 'dataMax']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#00A0E9"
                  strokeWidth={2}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* IPO Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-6">IPO Details</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ipoDetails.map((detail, index) => (
              <div
                key={detail.label}
                className="glassmorphism p-6 rounded-xl"
                data-testid={`card-detail-${index}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <detail.icon className="text-primary" size={20} />
                  <span className="text-sm text-white/60">{detail.label}</span>
                </div>
                <div className="text-2xl font-bold">{detail.value}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glassmorphism p-8 rounded-xl mb-8"
        >
          <h2 className="text-3xl font-bold mb-8">IPO Timeline</h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />
            
            <div className="space-y-6">
              {timeline.map((item, index) => (
                <div key={index} className="relative flex items-center gap-6">
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                      item.status === 'completed'
                        ? 'bg-chart-2'
                        : item.status === 'current'
                        ? 'bg-primary animate-pulse-glow'
                        : 'bg-white/20'
                    }`}
                  >
                    {item.status === 'completed' && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg">{item.label}</div>
                    <div className="text-white/60">{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Allocation Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glassmorphism p-8 rounded-xl mb-8"
        >
          <h2 className="text-3xl font-bold mb-6">Allocation Breakdown</h2>
          <div className="space-y-4">
            {allocation.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{item.category}</span>
                  <span className="text-white/60">{item.percentage}%</span>
                </div>
                <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-1000`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Order Book Simulation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glassmorphism p-8 rounded-xl mb-8"
        >
          <h2 className="text-3xl font-bold mb-6">Order Book</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Buy Orders */}
            <div>
              <h3 className="text-chart-2 font-bold mb-4">BUY ORDERS</h3>
              <div className="space-y-2">
                {[
                  { price: 142.48, volume: 12450 },
                  { price: 142.45, volume: 8920 },
                  { price: 142.42, volume: 15670 },
                  { price: 142.40, volume: 22100 },
                  { price: 142.35, volume: 18450 },
                ].map((order, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-chart-2 font-mono">{formatCurrency(order.price)}</span>
                    <span className="text-white/60">{formatNumber(order.volume)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sell Orders */}
            <div>
              <h3 className="text-destructive font-bold mb-4">SELL ORDERS</h3>
              <div className="space-y-2">
                {[
                  { price: 142.52, volume: 9870 },
                  { price: 142.55, volume: 13200 },
                  { price: 142.58, volume: 11450 },
                  { price: 142.60, volume: 19800 },
                  { price: 142.65, volume: 16720 },
                ].map((order, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-destructive font-mono">{formatCurrency(order.price)}</span>
                    <span className="text-white/60">{formatNumber(order.volume)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* News Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-6">Market News</h2>
          <div className="space-y-4">
            {state.news.map((item) => (
              <div
                key={item.id}
                className={`glassmorphism p-6 rounded-xl border-l-4 ${impactColors[item.impact]}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase">
                    {item.category}
                  </span>
                  <span className="text-xs text-white/40">{item.time}</span>
                </div>
                <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-white/60">{item.summary}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-16"
        >
          {/* Hero banner with Elon photo */}
          <div className="relative rounded-2xl overflow-hidden mb-10">
            <img
              src={elonPhoto}
              alt="SpaceX leadership"
              className="w-full h-64 object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8">
              <div className="text-xs text-primary font-bold tracking-widest uppercase mb-1">Leadership</div>
              <h2 className="text-4xl font-bold">Management</h2>
              <p className="text-white/60 mt-1">Leadership &amp; corporate governance.</p>
            </div>
          </div>

          <div className="space-y-0 divide-y divide-white/5">
            {[
              { name: 'Elon Musk', role: 'Founder &amp; CEO', bio: 'Visionary entrepreneur and chief architect of SpaceX\'s mission to make humanity multi-planetary. Founder of Tesla, X, Neuralink, and The Boring Company.' },
              { name: 'Gwynne Shotwell', role: 'President &amp; Chief Operating Officer', bio: 'Responsible for day-to-day operations and corporate growth. Has overseen SpaceX\'s transformation from a startup to the world\'s leading private launch provider.' },
              { name: 'Bret Johnsen', role: 'Chief Financial Officer', bio: 'Oversees SpaceX\'s financial operations, capital strategy, and investor relations as the company prepares for its landmark NASDAQ listing.' },
            ].map((person) => (
              <div key={person.name} className="py-7 flex items-start justify-between gap-6 group">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-0.5">{person.name}</h3>
                  <p className="text-white/50 text-sm mb-3" dangerouslySetInnerHTML={{ __html: person.role }} />
                  <p className="text-white/40 text-sm leading-relaxed max-w-2xl">{person.bio}</p>
                </div>
                <button className="shrink-0 mt-1 px-4 py-1.5 rounded-lg border border-white/15 text-xs font-bold uppercase tracking-wider text-white/50 hover:border-primary/40 hover:text-primary transition-all flex items-center gap-1.5">
                  Learn More <ExternalLink size={11} />
                </button>
              </div>
            ))}
          </div>

          {/* Contact Management button */}
          <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
            <button className="px-6 py-2.5 rounded-lg border border-white/15 text-sm font-bold uppercase tracking-wider text-white/60 hover:border-primary/40 hover:text-primary transition-all">
              Contact Management
            </button>
            <div className="flex gap-6 text-sm">
              <button className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors">
                Audit Committee Charter <ExternalLink size={12} />
              </button>
              <button className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors">
                Compensation and Nominating Committee Charter <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
