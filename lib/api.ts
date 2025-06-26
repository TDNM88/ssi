import axios from "axios"

const api = axios.create({ baseURL: "/api" })
const ALPHA_VANTAGE_API_KEY = 'EHXTVIOU7YN287DP' // In production, move this to environment variables

// User transactions
export const deposit = async (data: any) => {
  const response = await api.post("/deposits", data)
  return response.data
}

export const getDeposits = async (params: any) => {
  const response = await api.get("/deposits", { params })
  return response.data
}

export const withdraw = async (data: any) => {
  const response = await api.post("/withdraws", data)
  return response.data
}

export const getWithdraws = async (params: any) => {
  const response = await api.get("/withdraws", { params })
  return response.data
}

// Market Data API
export interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  volume: number
  timestamp: string
}

export const getIntradayData = async (symbol: string = 'XAUUSD', interval: string = '1min'): Promise<MarketData> => {
  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol: symbol.includes('/') ? `OANDA:${symbol}` : `OANDA:${symbol}_USD`,
        interval,
        apikey: ALPHA_VANTAGE_API_KEY,
        outputsize: 'compact',
        datatype: 'json'
      }
    })

    const timeSeries = response.data[`Time Series (${interval})`]
    if (!timeSeries) {
      throw new Error('No time series data found')
    }

    const timestamps = Object.keys(timeSeries).sort().reverse()
    const latest = timeSeries[timestamps[0]]
    const previous = timeSeries[timestamps[1]]
    
    const close = parseFloat(latest['4. close'])
    const prevClose = parseFloat(previous?.['4. close'] || latest['1. open'])
    const change = close - prevClose
    const changePercent = (change / prevClose) * 100

    return {
      symbol,
      price: close,
      change,
      changePercent,
      open: parseFloat(latest['1. open']),
      high: parseFloat(latest['2. high']),
      low: parseFloat(latest['3. low']),
      volume: parseFloat(latest['5. volume'] || '0'),
      timestamp: timestamps[0]
    }
  } catch (error) {
    console.error('Error fetching market data:', error)
    // Return mock data in case of error
    return {
      symbol,
      price: 0,
      change: 0,
      changePercent: 0,
      open: 0,
      high: 0,
      low: 0,
      volume: 0,
      timestamp: new Date().toISOString()
    }
  }
}

export const getMarketData = async (symbols: string[] = ['XAU/USD', 'OIL', 'S&P 500']): Promise<MarketData[]> => {
  try {
    const results = await Promise.allSettled(
      symbols.map(symbol => {
        // Map common symbols to their Alpha Vantage equivalents
        const symbolMap: Record<string, string> = {
          'XAU/USD': 'XAU',
          'OIL': 'CLF',  // Crude Oil Futures
          'S&P 500': 'SPY',
          'BTC/USD': 'BTC',
          'ETH/USD': 'ETH'
        }
        
        const avSymbol = symbolMap[symbol] || symbol
        return getIntradayData(avSymbol, '5min')
      })
    )

    return results
      .filter((result): result is PromiseFulfilledResult<MarketData> => result.status === 'fulfilled')
      .map(result => result.value)
  } catch (error) {
    console.error('Error fetching market data:', error)
    return []
  }
}
