import { TrendingUp, TrendingDown, Plus, RefreshCw } from "lucide-react";
import { Asset } from "@/types/portfolio";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface AssetListProps {
  assets: Asset[];
  onAddAsset: () => void;
  isLoading?: boolean;
}

export function AssetList({ assets, onAddAsset, isLoading }: AssetListProps) {
  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Portfolio Assets</h2>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            Your current holdings
            {isLoading && <RefreshCw className="h-3 w-3 animate-spin text-primary" />}
          </p>
        </div>
        <Button onClick={onAddAsset} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted-foreground text-sm font-medium">Asset</th>
              <th className="text-right py-3 px-4 text-muted-foreground text-sm font-medium">Price</th>
              <th className="text-right py-3 px-4 text-muted-foreground text-sm font-medium">24h Change</th>
              <th className="text-right py-3 px-4 text-muted-foreground text-sm font-medium">Holdings</th>
              <th className="text-right py-3 px-4 text-muted-foreground text-sm font-medium">Value</th>
              <th className="text-right py-3 px-4 text-muted-foreground text-sm font-medium">Profit/Loss</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, index) => (
              <tr 
                key={asset.id} 
                className="border-b border-border/50 hover:bg-secondary/30 transition-colors animate-slide-in"
                style={{ animationDelay: `${600 + index * 100}ms` }}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {asset.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold">{asset.symbol}</p>
                      <p className="text-muted-foreground text-sm">{asset.name}</p>
                    </div>
                  </div>
                </td>
                <td className="text-right py-4 px-4 font-mono font-medium">
                  ${asset.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="text-right py-4 px-4">
                  <div className={cn(
                    "flex items-center justify-end gap-1 font-medium",
                    asset.changePercent24h >= 0 ? "price-positive" : "price-negative"
                  )}>
                    {asset.changePercent24h >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(2)}%</span>
                  </div>
                </td>
                <td className="text-right py-4 px-4">
                  <p className="font-medium">{asset.quantity}</p>
                  <p className="text-muted-foreground text-sm">@ ${asset.avgPrice.toFixed(2)}</p>
                </td>
                <td className="text-right py-4 px-4 font-mono font-medium">
                  ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="text-right py-4 px-4">
                  <p className={cn(
                    "font-mono font-medium",
                    asset.profit >= 0 ? "price-positive" : "price-negative"
                  )}>
                    {asset.profit >= 0 ? '+' : ''}${asset.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className={cn(
                    "text-sm",
                    asset.profitPercent >= 0 ? "price-positive" : "price-negative"
                  )}>
                    {asset.profitPercent >= 0 ? '+' : ''}{asset.profitPercent.toFixed(2)}%
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
