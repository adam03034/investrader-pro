import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { PortfolioStats as PortfolioStatsType } from "@/types/portfolio";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeValue?: number;
  icon: React.ReactNode;
  delay?: number;
}

function StatCard({ title, value, change, changeValue, icon, delay = 0 }: StatCardProps) {
  const isPositive = changeValue !== undefined ? changeValue >= 0 : true;
  
  return (
    <div 
      className="glass-card p-6 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-2 font-mono">{value}</p>
          {change && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-sm font-medium",
              isPositive ? "price-positive" : "price-negative"
            )}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}

interface PortfolioStatsProps {
  stats: PortfolioStatsType;
  assetCount?: number;
}

export function PortfolioStats({ stats, assetCount = 0 }: PortfolioStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Value"
        value={`$${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        change={`${stats.dailyChangePercent >= 0 ? '+' : ''}${stats.dailyChangePercent.toFixed(2)}% today`}
        changeValue={stats.dailyChangePercent}
        icon={<DollarSign className="h-6 w-6" />}
        delay={0}
      />
      <StatCard
        title="Total Profit/Loss"
        value={`${stats.totalProfit >= 0 ? '+' : ''}$${stats.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        change={`${stats.totalProfitPercent >= 0 ? '+' : ''}${stats.totalProfitPercent.toFixed(2)}%`}
        changeValue={stats.totalProfitPercent}
        icon={stats.totalProfit >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
        delay={100}
      />
      <StatCard
        title="Daily Change"
        value={`${stats.dailyChange >= 0 ? '+' : ''}$${stats.dailyChange.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        change={`${stats.dailyChangePercent >= 0 ? '+' : ''}${stats.dailyChangePercent.toFixed(2)}%`}
        changeValue={stats.dailyChangePercent}
        icon={stats.dailyChange >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
        delay={200}
      />
      <StatCard
        title="Assets"
        value={assetCount.toString()}
        icon={<PieChart className="h-6 w-6" />}
        delay={300}
      />
    </div>
  );
}
