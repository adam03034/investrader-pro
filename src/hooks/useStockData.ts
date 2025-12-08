import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Asset, MarketData } from "@/types/portfolio";

interface StockQuote {
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  changePercent24h: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
  marketCap?: number | null;
  error?: boolean;
}

interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
}

export function useStockQuotes(symbols: string[]) {
  return useQuery({
    queryKey: ["stock-quotes", symbols],
    queryFn: async (): Promise<StockQuote[]> => {
      if (symbols.length === 0) return [];
      
      const { data, error } = await supabase.functions.invoke("stock-data", {
        body: { action: "quotes", symbols },
      });

      if (error) {
        console.error("Error fetching stock quotes:", error);
        throw error;
      }

      return data.quotes;
    },
    refetchInterval: 60000, // Refetch every minute
    enabled: symbols.length > 0,
  });
}

export function useMarketData() {
  return useQuery({
    queryKey: ["market-data"],
    queryFn: async (): Promise<MarketData[]> => {
      const { data, error } = await supabase.functions.invoke("stock-data", {
        body: { action: "market-indices" },
      });

      if (error) {
        console.error("Error fetching market data:", error);
        throw error;
      }

      return data.marketData.map((item: MarketIndex) => ({
        symbol: item.symbol,
        name: item.name,
        price: item.price,
        change24h: item.change24h,
        changePercent24h: item.changePercent24h,
        volume: 0,
        marketCap: 0,
      }));
    },
    refetchInterval: 60000,
  });
}

export function useStockSearch(query: string) {
  return useQuery({
    queryKey: ["stock-search", query],
    queryFn: async () => {
      if (!query || query.length < 1) return [];

      const { data, error } = await supabase.functions.invoke("stock-data", {
        body: { action: "search", query },
      });

      if (error) {
        console.error("Error searching stocks:", error);
        throw error;
      }

      return data.results;
    },
    enabled: query.length >= 1,
  });
}

export function updateAssetsWithLiveData(
  assets: Asset[],
  quotes: StockQuote[]
): Asset[] {
  return assets.map((asset) => {
    const quote = quotes.find((q) => q.symbol === asset.symbol);
    if (!quote || quote.error) return asset;

    const value = asset.quantity * quote.currentPrice;
    const costBasis = asset.quantity * asset.avgPrice;
    const profit = value - costBasis;
    const profitPercent = costBasis > 0 ? (profit / costBasis) * 100 : 0;

    return {
      ...asset,
      currentPrice: quote.currentPrice,
      change24h: quote.change24h,
      changePercent24h: quote.changePercent24h,
      value,
      profit,
      profitPercent,
    };
  });
}
