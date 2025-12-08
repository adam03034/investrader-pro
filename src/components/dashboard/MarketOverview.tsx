import { TrendingUp, TrendingDown } from "lucide-react";
import { MarketData } from "@/types/portfolio";
import { cn } from "@/lib/utils";

interface MarketOverviewProps {
  data: MarketData[];
}

export function MarketOverview({ data }: MarketOverviewProps) {
  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '600ms' }}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Market Overview</h2>
        <p className="text-muted-foreground text-sm">Major indices & ETFs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.map((item, index) => (
          <div 
            key={item.symbol}
            className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-all cursor-pointer animate-fade-in"
            style={{ animationDelay: `${700 + index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold">{item.symbol}</p>
                <p className="text-muted-foreground text-xs">{item.name}</p>
              </div>
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                item.changePercent24h >= 0 
                  ? "bg-success/20 text-success" 
                  : "bg-destructive/20 text-destructive"
              )}>
                {item.changePercent24h >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {item.changePercent24h >= 0 ? '+' : ''}{item.changePercent24h.toFixed(2)}%
              </div>
            </div>
            <p className="font-mono font-bold text-lg">
              ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
