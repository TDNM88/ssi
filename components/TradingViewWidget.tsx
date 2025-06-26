'use client'

import React, { useEffect, useRef, memo } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewWidgetProps {
  symbol: string;
  interval: string;
}

// Add display name for the component
const TradingViewWidgetComponent: React.FC<TradingViewWidgetProps> = ({ symbol, interval }) => {
  const containerId = `tradingview_${symbol}`;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined' || !containerRef.current) {
      return;
    }

    // Clear previous widget if exists
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // Create script element if TradingView is not loaded
    if (!document.getElementById('tradingview-widget-script')) {
      const script = document.createElement('script');
      script.id = 'tradingview-widget-script';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = createWidget;
      document.head.appendChild(script);
    } else if (window.TradingView) {
      createWidget();
    } else {
      const onTradingViewReady = () => {
        createWidget();
        document.removeEventListener('tradingview_ready', onTradingViewReady);
      };
      document.addEventListener('tradingview_ready', onTradingViewReady);
    }

    function createWidget() {
      if (window.TradingView && containerRef.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: interval,
          timezone: 'Asia/Ho_Chi_Minh',
          theme: 'dark',
          style: '1',
          locale: 'vi_VN',
          toolbar_bg: '#1e1e2d',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: false,
          container_id: containerId,
          hide_volume: true,
          studies: [
            'MASimple@tv-basicstudies',
            'Volume@tv-basicstudies',
            'RSI@tv-basicstudies',
          ],
          overrides: {
            'paneProperties.background': '#1e1e2d',
            'paneProperties.vertGridProperties.color': '#2a2e39',
            'paneProperties.horzGridProperties.color': '#2a2e39',
            'symbolWatermarkProperties.transparency': 90,
            'scalesProperties.textColor': '#AAA',
          },
          disabled_features: [
            'header_widget',
            'left_toolbar',
            'header_indicators',
            'header_chart_type',
            'header_compare',
            'header_undo_redo',
            'header_screenshot',
            'header_saveload',
            'header_fullscreen_button',
            'header_settings',
            'header_indicators',
            'create_volume_indicator_by_default',
            'volume_force_overlay',
          ],
        });
      }
    }

    return () => {
      // Clean up
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, [symbol, interval, containerId]);

  return <div id={containerId} ref={containerRef} className="w-full h-full" />;
};

// Add display name for better debugging
TradingViewWidgetComponent.displayName = 'TradingViewWidget';

export default memo(TradingViewWidgetComponent);
