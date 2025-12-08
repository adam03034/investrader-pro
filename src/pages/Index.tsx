import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { PortfolioStats } from "@/components/dashboard/PortfolioStats";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { AssetList } from "@/components/dashboard/AssetList";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { AddAssetDialog } from "@/components/dashboard/AddAssetDialog";
import { mockAssets, mockPriceHistory } from "@/data/mockData";
import { useStockQuotes, useMarketData, updateAssetsWithLiveData } from "@/hooks/useStockData";
import { PortfolioStats as PortfolioStatsType } from "@/types/portfolio";

const Index = () => {
  const [addAssetOpen, setAddAssetOpen] = useState(false);
  
  // Get symbols from mock assets
  const symbols = useMemo(() => mockAssets.map(a => a.symbol), []);
  
  // Fetch live stock quotes
  const { data: quotes, isLoading: quotesLoading } = useStockQuotes(symbols);
  
  // Fetch live market data
  const { data: marketData, isLoading: marketLoading } = useMarketData();
  
  // Update assets with live prices
  const assets = useMemo(() => {
    if (!quotes) return mockAssets;
    return updateAssetsWithLiveData(mockAssets, quotes);
  }, [quotes]);
  
  // Calculate portfolio stats from live data
  const portfolioStats: PortfolioStatsType = useMemo(() => {
    const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
    const totalCostBasis = assets.reduce((sum, a) => sum + (a.quantity * a.avgPrice), 0);
    const totalProfit = totalValue - totalCostBasis;
    const totalProfitPercent = totalCostBasis > 0 ? (totalProfit / totalCostBasis) * 100 : 0;
    const dailyChange = assets.reduce((sum, a) => sum + (a.quantity * a.change24h), 0);
    const dailyChangePercent = totalValue > 0 ? (dailyChange / (totalValue - dailyChange)) * 100 : 0;
    
    return {
      totalValue,
      totalProfit,
      totalProfitPercent,
      dailyChange,
      dailyChangePercent,
    };
  }, [assets]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 lg:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome back, John</h1>
            <p className="text-muted-foreground">
              Here's an overview of your investment portfolio.
              {quotesLoading && <span className="ml-2 text-xs text-primary animate-pulse">Fetching live data...</span>}
            </p>
          </div>

          <PortfolioStats stats={portfolioStats} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <PortfolioChart data={mockPriceHistory} />
            </div>
            <MarketOverview data={marketData || []} isLoading={marketLoading} />
          </div>

          <AssetList assets={assets} onAddAsset={() => setAddAssetOpen(true)} isLoading={quotesLoading} />
        </main>
      </div>

      <AddAssetDialog open={addAssetOpen} onOpenChange={setAddAssetOpen} />
    </div>
  );
};

export default Index;
