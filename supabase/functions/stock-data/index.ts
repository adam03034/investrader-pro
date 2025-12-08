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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, symbols } = await req.json();
    console.log(`Received request: action=${action}, symbols=${JSON.stringify(symbols)}`);

    if (!FINNHUB_API_KEY) {
      throw new Error('FINNHUB_API_KEY is not configured');
    }

    if (action === 'quotes') {
      // Fetch quotes for multiple symbols
      const quotes = await Promise.all(
        symbols.map(async (symbol: string) => {
          try {
            const [quoteRes, profileRes] = await Promise.all([
              fetch(`${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
              fetch(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`)
            ]);

            const quote: QuoteResponse = await quoteRes.json();
            const profile: CompanyProfile = await profileRes.json();

            console.log(`Fetched data for ${symbol}:`, { quote, profile });

            return {
              symbol,
              name: profile.name || symbol,
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
            console.error(`Error fetching data for ${symbol}:`, error);
            return {
              symbol,
              name: symbol,
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
        marketSymbols.map(async (symbol) => {
          try {
            const quoteRes = await fetch(
              `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
            );
            const quote: QuoteResponse = await quoteRes.json();

            const names: Record<string, string> = {
              SPY: 'S&P 500 ETF',
              QQQ: 'Nasdaq 100 ETF',
              DIA: 'Dow Jones ETF',
              VTI: 'Total Stock Market',
            };

            return {
              symbol,
              name: names[symbol] || symbol,
              price: quote.c,
              change24h: quote.d,
              changePercent24h: quote.dp,
            };
          } catch (error) {
            console.error(`Error fetching market data for ${symbol}:`, error);
            return { symbol, name: symbol, price: 0, change24h: 0, changePercent24h: 0 };
          }
        })
      );

      return new Response(JSON.stringify({ marketData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'search') {
      const { query } = await req.json();
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
