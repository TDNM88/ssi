import { useEffect, useRef } from 'react';

interface TradingViewAdvancedChartProps {
  symbol?: string; // e.g. "TVC:GOLD"
  interval?: string; // e.g. "15" for 15 minutes
  theme?: 'light' | 'dark';
  height?: number | string;
  interactive?: boolean; // if false, disable user interaction
  style?: number; // 1 = Candles, 3 = Line, etc.
}

// Embeds TradingView Advanced Chart widget using external script
// Docs: https://www.tradingview.com/widget/advanced-chart/
export default function TradingViewAdvancedChart({
  symbol = 'TVC:GOLD',
  interval = '15',
  theme = 'dark',
  height = 500,
  style = 1,
  interactive = true,
}: TradingViewAdvancedChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget (Hot reload)
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;

    script.innerHTML = JSON.stringify({
      autosize: true,
      theme,
      interval,
      symbol,
      timezone: 'Etc/UTC',
      allow_symbol_change: false,
      hide_side_toolbar: false,
      hide_volume: false,
      hide_legend: true,
      locale: 'en',
      disabled_features: [],
      style,
      withdateranges: false,
      hide_top_toolbar: false,
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [symbol, interval, theme, interactive, style]);

  return (
    <div className="relative tradingview-widget-container w-full" style={{ height }} ref={containerRef}>
      <div className="tradingview-widget-container__widget" style={{ height }} />
      {!interactive && (
        <div className="absolute inset-0 z-10" style={{ pointerEvents: 'auto' }} />
      )}
    </div>
  );
}
