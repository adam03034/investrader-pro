import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Asset } from "@/types/portfolio";

interface PortfolioAllocationProps {
  assets: Asset[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(142 76% 36%)",
  "hsl(262 83% 58%)",
  "hsl(24 95% 53%)",
  "hsl(340 82% 52%)",
];

export function PortfolioAllocation({ assets }: PortfolioAllocationProps) {
  const chartData = useMemo(() => {
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    
    return assets
      .map((asset) => ({
        name: asset.symbol,
        value: asset.value,
        percentage: totalValue > 0 ? ((asset.value / totalValue) * 100).toFixed(1) : "0",
        fullName: asset.name,
      }))
      .sort((a, b) => b.value - a.value);
  }, [assets]);

  const totalValue = useMemo(() => {
    return assets.reduce((sum, asset) => sum + asset.value, 0);
  }, [assets]);

  if (assets.length === 0) {
    return (
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
        <h2 className="text-lg font-semibold mb-4">Rozloženie portfólia</h2>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Pridajte aktíva pre zobrazenie grafu
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Rozloženie portfólia</h2>
        <p className="text-muted-foreground text-sm">Podiel jednotlivých aktív</p>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{data.name}</p>
                      <p className="text-sm text-muted-foreground">{data.fullName}</p>
                      <p className="text-sm font-mono mt-1">
                        ${data.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-primary font-medium">
                        {data.percentage}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2 max-h-[150px] overflow-y-auto">
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium">{item.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground font-mono">
                ${item.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="font-medium w-14 text-right">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
