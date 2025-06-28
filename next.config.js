/**
 * Next.js configuration
 * Adds a permissive CSP header for TradingView widget so that
 * websocket connections to widgetdata.tradingview.com are allowed.
 */

// NOTE: after creating or editing this file you need to restart `npm run dev`.

const TRADINGVIEW_WS = 'wss://widgetdata.tradingview.com';
const TRADINGVIEW_HTTP = 'https://widgetdata.tradingview.com';
const TRADINGVIEW_SCRIPT = 'https://s3.tradingview.com';

module.exports = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Apply these headers to all routes in the application.
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Note: CSP must be on a single line. Adjust as necessary.
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-eval' ${TRADINGVIEW_SCRIPT}`,
              "style-src 'self' 'unsafe-inline'", // inline styles required by TradingView
              "img-src * data:",
              `connect-src 'self' ${TRADINGVIEW_HTTP} ${TRADINGVIEW_WS} https://widget-sheriff.tradingview-widget.com https://telemetry.tradingview.com`,
              "frame-src *",
              "font-src 'self' data:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};
