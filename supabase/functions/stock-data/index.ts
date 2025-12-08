import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

interface QuoteResponse {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
}

interface CompanyProfile {
  name: string;
  ticker: string;
  marketCapitalization: number;
}

function getPeriodDays(period: string): number {
  switch (period) {
    case '1W': return 7;
    case '1M': return 30;
    case '3M': return 90;
    case '6M': return 180;
    case '1Y': return 365;
    default: return 30;
  }
}

// Generate realistic historical data based on current price
function generateHistoricalData(currentPrice: number, days: number, period: string): any[] {
  const data = [];
  const now = new Date();
  const volatility = 0.02; // 2% daily volatility
  
  let price = currentPrice;
  // Work backwards from current price
  const priceHistory = [currentPrice];
  
  for (let i = 1; i < days; i++) {
    const change = price * volatility * (Math.random() - 0.48); // Slight upward bias
    price = price - change; // Going backwards in time
    priceHistory.unshift(price);
  }
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const basePrice = priceHistory[i];
    const dailyVolatility = basePrice * 0.015;
    
    const open = basePrice + (Math.random() - 0.5) * dailyVolatility;
    const close = basePrice;
    const high = Math.max(open, close) + Math.random() * dailyVolatility;
    const low = Math.min(open, close) - Math.random() * dailyVolatility;
    
    data.push({
      date: date.toISOString().split('T')[0],
      close: Number(close.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      open: Number(open.toFixed(2)),
      volume: Math.floor(Math.random() * 50000000) + 10000000,
    });
  }
  
  return data;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, symbols, query, symbol, period } = await req.json();
    console.log(`Received request: action=${action}, symbols=${JSON.stringify(symbols)}, query=${query}, symbol=${symbol}, period=${period}`);

    if (!FINNHUB_API_KEY) {
      throw new Error('FINNHUB_API_KEY is not configured');
    }

    if (action === 'history') {
      // Fetch historical candle data for a single symbol
      const days = getPeriodDays(period || '1M');
      const now = Math.floor(Date.now() / 1000);
      const from = now - days * 24 * 60 * 60;
      
      // Determine resolution based on period
      let resolution = 'D'; // Daily by default
      if (period === '1W') resolution = '60'; // Hourly for 1 week
      
      try {
        const [candleRes, quoteRes, profileRes] = await Promise.all([
          fetch(`${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${now}&token=${FINNHUB_API_KEY}`),
          fetch(`${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
          fetch(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`)
        ]);

        const candles = await candleRes.json();
        const quote: QuoteResponse = await quoteRes.json();
        const profile: CompanyProfile = await profileRes.json();

        console.log(`Fetched history for ${symbol}:`, { candlesCount: candles.t?.length, quote, profile });

        // If no candle data available, generate realistic demo data
        if (candles.s === 'no_data' || !candles.t) {
          const generatedData = quote.c > 0 ? generateHistoricalData(quote.c, days, period || '1M') : [];
          
          return new Response(JSON.stringify({ 
            symbol, 
            name: profile.name || symbol,
            data: generatedData,
            currentPrice: quote.c,
            change: quote.d,
            changePercent: quote.dp,
            isDemo: true
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const data = candles.t.map((timestamp: number, i: number) => ({
          date: new Date(timestamp * 1000).toISOString().split('T')[0],
          close: candles.c[i],
          high: candles.h[i],
          low: candles.l[i],
          open: candles.o[i],
          volume: candles.v[i],
        }));

        return new Response(JSON.stringify({
          symbol,
          name: profile.name || symbol,
          data,
          currentPrice: quote.c,
          change: quote.d,
          changePercent: quote.dp
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error(`Error fetching history for ${symbol}:`, error);
        throw error;
      }
    }

    if (action === 'quotes') {
      // Fetch quotes for multiple symbols
      const quotes = await Promise.all(
        symbols.map(async (sym: string) => {
          try {
            const [quoteRes, profileRes] = await Promise.all([
              fetch(`${FINNHUB_BASE_URL}/quote?symbol=${sym}&token=${FINNHUB_API_KEY}`),
              fetch(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${sym}&token=${FINNHUB_API_KEY}`)
            ]);

            const quote: QuoteResponse = await quoteRes.json();
            const profile: CompanyProfile = await profileRes.json();

            console.log(`Fetched data for ${sym}:`, { quote, profile });

            return {
              symbol: sym,
              name: profile.name || sym,
              currentPrice: quote.c,
              change24h: quote.d,
              changePercent24h: quote.dp,
              high: quote.h,
              low: quote.l,
              open: quote.o,
              previousClose: quote.pc,
              marketCap: profile.marketCapitalization ? profile.marketCapitalization * 1000000 : null,
            };
          } catch (error) {
            console.error(`Error fetching data for ${sym}:`, error);
            return {
              symbol: sym,
              name: sym,
              currentPrice: 0,
              change24h: 0,
              changePercent24h: 0,
              error: true,
            };
          }
        })
      );

      return new Response(JSON.stringify({ quotes }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'market-indices') {
      // Fetch major market indices/ETFs
      const marketSymbols = ['SPY', 'QQQ', 'DIA', 'VTI'];
      const marketData = await Promise.all(
        marketSymbols.map(async (sym) => {
          try {
            const quoteRes = await fetch(
              `${FINNHUB_BASE_URL}/quote?symbol=${sym}&token=${FINNHUB_API_KEY}`
            );
            const quote: QuoteResponse = await quoteRes.json();

            const names: Record<string, string> = {
              SPY: 'S&P 500 ETF',
              QQQ: 'Nasdaq 100 ETF',
              DIA: 'Dow Jones ETF',
              VTI: 'Total Stock Market',
            };

            return {
              symbol: sym,
              name: names[sym] || sym,
              price: quote.c,
              change24h: quote.d,
              changePercent24h: quote.dp,
            };
          } catch (error) {
            console.error(`Error fetching market data for ${sym}:`, error);
            return { symbol: sym, name: sym, price: 0, change24h: 0, changePercent24h: 0 };
          }
        })
      );

      return new Response(JSON.stringify({ marketData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'search') {
      if (!query) {
        return new Response(JSON.stringify({ results: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const searchRes = await fetch(
        `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`
      );
      const searchData = await searchRes.json();
      
      console.log(`Search results for "${query}":`, searchData);

      return new Response(JSON.stringify({ results: searchData.result || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in stock-data function:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
