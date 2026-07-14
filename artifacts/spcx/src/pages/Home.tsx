import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, TrendingUp, Users, Rocket, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getState } from '@/lib/store';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function Home() {
  const state = getState();

  const stats = [
    { label: 'IPO Price', value: formatCurrency(142.50), icon: DollarSign },
    { label: 'Market Cap', value: '$182B', icon: TrendingUp },
    { label: 'Shares Offered', value: '1.2B', icon: Users },
    { label: 'Oversubscribed', value: '847%', icon: Rocket },
  ];

  const impactColors = {
    positive: 'border-l-chart-2',
    neutral: 'border-l-chart-4',
    negative: 'border-l-destructive',
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block mb-6"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                  <span className="text-sm font-semibold text-primary">LIVE NOW</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-6xl lg:text-8xl font-bold tracking-tight mb-4"
              >
                SPCX IS <span className="text-primary">LIVE</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-primary mb-6"
              >
                SpaceX IPO Access
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg text-white/60 mb-8 max-w-xl"
              >
                Exclusive institutional-grade access to the most anticipated IPO of the decade. 
                Real-time trading, live market data, zero friction.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-black font-bold text-lg px-8"
                    data-testid="button-access-dashboard"
                  >
                    Access Dashboard
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
                <Link href="/market">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 hover:bg-white/5 text-lg px-8"
                    data-testid="button-view-market"
                  >
                    View Market Data
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right - Animated Rocket */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative flex items-center justify-center"
            >
              <div className="relative">
                {/* Rocket SVG */}
                <svg
                  viewBox="0 0 200 300"
                  className="w-64 h-96 animate-float"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Exhaust Trail */}
                  <g className="animate-pulse-glow">
                    <ellipse cx="100" cy="260" rx="30" ry="15" fill="url(#exhaust1)" opacity="0.8" />
                    <ellipse cx="100" cy="270" rx="25" ry="12" fill="url(#exhaust2)" opacity="0.6" />
                    <ellipse cx="100" cy="280" rx="20" ry="10" fill="url(#exhaust3)" opacity="0.4" />
                  </g>
                  
                  {/* Rocket Body */}
                  <path
                    d="M100 40 L130 240 L100 220 L70 240 Z"
                    fill="#ffffff"
                    stroke="#00A0E9"
                    strokeWidth="2"
                  />
                  
                  {/* Nose Cone */}
                  <path
                    d="M100 20 L120 60 L80 60 Z"
                    fill="#00A0E9"
                  />
                  
                  {/* Window */}
                  <circle cx="100" cy="100" r="12" fill="#0a0a0a" stroke="#00A0E9" strokeWidth="2" />
                  
                  {/* Fins */}
                  <path d="M70 200 L50 240 L70 230 Z" fill="#00A0E9" />
                  <path d="M130 200 L150 240 L130 230 Z" fill="#00A0E9" />
                  
                  {/* Detail Lines */}
                  <line x1="100" y1="60" x2="100" y2="220" stroke="#00A0E9" strokeWidth="1" opacity="0.5" />
                  
                  <defs>
                    <radialGradient id="exhaust1">
                      <stop offset="0%" stopColor="#00A0E9" />
                      <stop offset="100%" stopColor="#00E5A0" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="exhaust2">
                      <stop offset="0%" stopColor="#00E5A0" />
                      <stop offset="100%" stopColor="#00A0E9" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="exhaust3">
                      <stop offset="0%" stopColor="#00A0E9" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>
                </svg>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-white/10 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glassmorphism p-6 rounded-xl hover:scale-105 transition-transform"
                data-testid={`card-stat-${index}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon className="text-primary" size={20} />
                  <span className="text-sm text-white/60">{stat.label}</span>
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Intelligence Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-chart-2 animate-pulse-glow" />
              <h2 className="text-4xl font-bold">MARKET INTELLIGENCE</h2>
            </div>
            <p className="text-white/60 text-lg">Real-time updates on SpaceX operations and market impact</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`glassmorphism p-6 rounded-xl border-l-4 ${impactColors[item.impact]} hover:scale-105 transition-transform`}
                data-testid={`card-news-${item.id}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase">
                    {item.category}
                  </span>
                  <span className="text-xs text-white/40">{item.time}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.summary}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <Link href="/market">
              <Button variant="outline" className="border-white/20 hover:bg-white/5">
                View Full Market Analysis
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Performance Chart Section */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8">SPCX Performance</h2>
            <div className="glassmorphism p-8 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-4xl font-bold">{formatCurrency(state.spcxPrice)}</div>
                  <div className="text-white/60 text-sm mt-1">Current Price</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-chart-2">
                    {formatNumber(state.spcxPriceHistory.length * 47230)}
                  </div>
                  <div className="text-white/60 text-sm mt-1">24h Volume</div>
                </div>
              </div>
              
              {/* Simple Mini Chart */}
              <div className="h-32 flex items-end gap-1">
                {state.spcxPriceHistory.map((price, i) => {
                  const height = ((price - Math.min(...state.spcxPriceHistory)) / 
                    (Math.max(...state.spcxPriceHistory) - Math.min(...state.spcxPriceHistory))) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-primary/50 rounded-t transition-all hover:bg-primary"
                      style={{ height: `${Math.max(height, 10)}%` }}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
