export interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  change24h: number;
  changePercent24h: number;
  value: number;
  profit: number;
  profitPercent: number;
}

export interface PortfolioStats {
  totalValue: number;
  totalProfit: number;
  totalProfitPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
}

export interface PriceHistoryPoint {
  date: string;
  value: number;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume: number;
  marketCap: number;
}
