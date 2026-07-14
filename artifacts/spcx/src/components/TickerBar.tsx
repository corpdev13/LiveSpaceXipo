import { useEffect, useState, useRef } from 'react';
import { getState, updatePrice } from '@/lib/store';
import { formatCurrency, formatPercent } from '@/lib/utils';

export function TickerBar() {
  const [price, setPrice] = useState(getState().spcxPrice);
  const [priceChange, setPriceChange] = useState(0);
  const [flashClass, setFlashClass] = useState('');
  const prevPriceRef = useRef(price);

  useEffect(() => {
    const interval = setInterval(() => {
      const state = getState();
      const currentPrice = state.spcxPrice;
      
      // Generate small random fluctuation with slight upward bias
      const change = (Math.random() - 0.48) * 0.006; // -0.52% to +0.52%
      const newPrice = currentPrice * (1 + change);
      
      updatePrice(newPrice);
      
      const changePercent = ((newPrice - state.sessionOpen) / state.sessionOpen) * 100;
      setPriceChange(changePercent);
      
      // Flash animation
      if (newPrice > prevPriceRef.current) {
        setFlashClass('animate-price-flash-up');
      } else if (newPrice < prevPriceRef.current) {
        setFlashClass('animate-price-flash-down');
      }
      
      setTimeout(() => setFlashClass(''), 500);
      
      prevPriceRef.current = newPrice;
      setPrice(newPrice);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const isPositive = priceChange >= 0;

  return (
    <div className="sticky top-16 z-40 bg-card/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Ticker Info */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-black">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
              <span className="font-bold text-lg">SPCX</span>
            </div>
            
            <div className={`flex items-center gap-3 ${flashClass}`}>
              <span className="text-2xl font-bold text-white" data-testid="text-price">
                {formatCurrency(price)}
              </span>
              <span
                className={`text-sm font-semibold ${
                  isPositive ? 'text-chart-2' : 'text-destructive'
                }`}
                data-testid="text-price-change"
              >
                {isPositive ? '▲' : '▼'} {formatPercent(Math.abs(priceChange))}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-sm text-white/60">
              <div>
                <span className="text-white/40">Vol</span> 2.4M
              </div>
              <div>
                <span className="text-white/40">Mkt Cap</span> $182B
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-chart-2 animate-pulse-glow" />
                <span className="text-chart-2 font-medium">MARKET OPEN</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="overflow-hidden bg-muted/30 border-t border-white/5">
        <div className="flex animate-marquee whitespace-nowrap py-2">
          <div className="flex items-center gap-8 px-4 text-sm">
            <span>SPCX {formatCurrency(price)} {isPositive ? '▲' : '▼'} {formatPercent(Math.abs(priceChange))}</span>
            <span>STARLINK SUBS: 5.1M</span>
            <span>Q2 REV: $8.2B</span>
            <span>STARSHIP FLIGHT 9: T-14 DAYS</span>
            <span>NASDAQ LISTING CONFIRMED</span>
          </div>
          <div className="flex items-center gap-8 px-4 text-sm">
            <span>SPCX {formatCurrency(price)} {isPositive ? '▲' : '▼'} {formatPercent(Math.abs(priceChange))}</span>
            <span>STARLINK SUBS: 5.1M</span>
            <span>Q2 REV: $8.2B</span>
            <span>STARSHIP FLIGHT 9: T-14 DAYS</span>
            <span>NASDAQ LISTING CONFIRMED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
