import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, TrendingUp, Users, Rocket, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getState } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import heroPhoto from '@assets/IMG_0358_1784055905752.jpeg';

export default function Home() {
  const state = getState();

  const stats = [
    { label: 'IPO Price', value: formatCurrency(142.50), icon: DollarSign },
    { label: 'Market Cap', value: '$182B', icon: TrendingUp },
    { label: 'Shares Offered', value: '1.2B', icon: Users },
    { label: 'Oversubscribed', value: '847%', icon: Rocket },
  ];

  const impactColors: Record<string, string> = {
    positive: 'border-l-chart-2',
    neutral: 'border-l-chart-4',
    negative: 'border-l-destructive',
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section — Full bleed real photo */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        {/* Background photo */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroPhoto}
            alt="SpaceX Starship launch"
            className="w-full h-full object-cover object-center"
          />
          {/* Dark overlay gradient — left side readable, right side photo visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-24">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-block mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-semibold text-primary tracking-widest uppercase">Live Now</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-7xl lg:text-9xl font-bold tracking-tight mb-4 leading-none"
            >
              SPCX<br />
              <span className="text-primary">IS LIVE</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="text-xl text-primary font-semibold mb-4">
              SpaceX IPO Access
            </motion.p>

            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="text-lg text-white/70 mb-10 max-w-xl leading-relaxed">
              Exclusive institutional-grade access to the most anticipated IPO of the decade.
              Real-time trading, live market data, zero friction.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="flex flex-wrap gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-black font-bold text-lg px-8 shadow-lg shadow-primary/20">
                  Access Dashboard
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link href="/market">
                <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5 text-lg px-8 backdrop-blur-sm">
                  View Market Data
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/10 bg-black/80">
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
              >
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon className="text-primary" size={20} />
                  <span className="text-sm text-white/50">{stat.label}</span>
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Intelligence */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full bg-chart-2 animate-pulse" />
              <h2 className="text-4xl font-bold">MARKET INTELLIGENCE</h2>
            </div>
            <p className="text-white/50 text-lg">Real-time updates on SpaceX operations and market impact</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`glassmorphism p-6 rounded-xl border-l-4 ${impactColors[item.impact] || 'border-l-white/20'} hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold uppercase tracking-wide">
                    {item.category}
                  </span>
                  <span className="text-xs text-white/30">{item.time}</span>
                </div>
                <h3 className="font-bold text-lg mb-2 leading-snug">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.summary}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-8 text-center">
            <Link href="/market">
              <Button variant="outline" className="border-white/20 hover:bg-white/5">
                View Full Market Analysis <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Performance */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold mb-8">SPCX Performance</h2>
            <div className="glassmorphism p-8 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-4xl font-bold">{formatCurrency(state.spcxPrice)}</div>
                  <div className="text-white/50 text-sm mt-1">Current Price</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-chart-2">NASDAQ</div>
                  <div className="text-white/50 text-sm mt-1">Listing Exchange</div>
                </div>
              </div>
              <div className="h-28 flex items-end gap-1">
                {state.spcxPriceHistory.map((price, i) => {
                  const minP = Math.min(...state.spcxPriceHistory);
                  const maxP = Math.max(...state.spcxPriceHistory);
                  const range = maxP - minP || 1;
                  const h = ((price - minP) / range) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-primary/40 rounded-t transition-all hover:bg-primary"
                      style={{ height: `${Math.max(h, 8)}%` }}
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
