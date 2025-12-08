import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { PortfolioStats } from "@/components/dashboard/PortfolioStats";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { AssetList } from "@/components/dashboard/AssetList";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { AddAssetDialog } from "@/components/dashboard/AddAssetDialog";
import { mockPriceHistory } from "@/data/mockData";
import { useStockQuotes, useMarketData, updateAssetsWithLiveData } from "@/hooks/useStockData";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { PortfolioStats as PortfolioStatsType, Asset } from "@/types/portfolio";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [addAssetOpen, setAddAssetOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { assets: dbAssets, isLoading: portfolioLoading, addAsset, removeAsset, updateAsset, isAdding } = usePortfolio();
  const navigate = useNavigate();
  
  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Convert DB assets to Asset type format
  const baseAssets: Asset[] = useMemo(() => {
    return dbAssets.map((asset) => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      quantity: Number(asset.quantity),
      avgPrice: Number(asset.avg_price),
      currentPrice: 0,
      change24h: 0,
      changePercent24h: 0,
      value: 0,
      profit: 0,
      profitPercent: 0,
    }));
  }, [dbAssets]);
  
  // Get symbols from portfolio assets
  const symbols = useMemo(() => baseAssets.map(a => a.symbol), [baseAssets]);
  
  // Fetch live stock quotes
  const { data: quotes, isLoading: quotesLoading } = useStockQuotes(symbols);
  
  // Fetch live market data
  const { data: marketData, isLoading: marketLoading } = useMarketData();
  
  // Update assets with live prices
  const assets = useMemo(() => {
    if (!quotes || baseAssets.length === 0) return baseAssets;
    return updateAssetsWithLiveData(baseAssets, quotes);
  }, [quotes, baseAssets]);
  
  // Calculate portfolio stats from live data
  const portfolioStats: PortfolioStatsType = useMemo(() => {
    if (assets.length === 0) {
      return {
        totalValue: 0,
        totalProfit: 0,
        totalProfitPercent: 0,
        dailyChange: 0,
        dailyChangePercent: 0,
      };
    }

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

  const getUserDisplayName = (email?: string) => {
    if (!email) return "Používateľ";
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const handleAddAsset = (data: { symbol: string; name: string; quantity: number; avgPrice: number }) => {
    addAsset(data);
  };

  if (authLoading || portfolioLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userEmail={user.email} />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 lg:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Vitajte späť, {getUserDisplayName(user.email)}</h1>
            <p className="text-muted-foreground">
              Prehľad vášho investičného portfólia.
              {quotesLoading && <span className="ml-2 text-xs text-primary animate-pulse">Načítavam live dáta...</span>}
            </p>
          </div>

          <PortfolioStats stats={portfolioStats} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <PortfolioChart data={mockPriceHistory} />
            </div>
            <MarketOverview data={marketData || []} isLoading={marketLoading} />
          </div>

          <AssetList 
            assets={assets} 
            onAddAsset={() => setAddAssetOpen(true)} 
            onRemoveAsset={removeAsset}
            onUpdateAsset={updateAsset}
            isLoading={quotesLoading} 
          />
        </main>
      </div>

      <AddAssetDialog 
        open={addAssetOpen} 
        onOpenChange={setAddAssetOpen}
        onAddAsset={handleAddAsset}
        isAdding={isAdding}
      />
    </div>
  );
};

export default Index;
