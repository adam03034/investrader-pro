import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { PortfolioStats } from "@/components/dashboard/PortfolioStats";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { AssetList } from "@/components/dashboard/AssetList";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { AddAssetDialog } from "@/components/dashboard/AddAssetDialog";
import { mockAssets, mockPortfolioStats, mockPriceHistory, mockMarketData } from "@/data/mockData";

const Index = () => {
  const [addAssetOpen, setAddAssetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 lg:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome back, John</h1>
            <p className="text-muted-foreground">Here's an overview of your investment portfolio.</p>
          </div>

          <PortfolioStats stats={mockPortfolioStats} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <PortfolioChart data={mockPriceHistory} />
            </div>
            <MarketOverview data={mockMarketData} />
          </div>

          <AssetList assets={mockAssets} onAddAsset={() => setAddAssetOpen(true)} />
        </main>
      </div>

      <AddAssetDialog open={addAssetOpen} onOpenChange={setAddAssetOpen} />
    </div>
  );
};

export default Index;
