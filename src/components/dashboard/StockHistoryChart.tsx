import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Period = "1W" | "1M" | "3M" | "6M" | "1Y";

interface HistoricalDataPoint {
  date: string;
  close: number;
  high: number;
  low: number;
  open: number;
  volume: number;
}

interface StockHistoryResponse {
  symbol: string;
  name: string;
  data: HistoricalDataPoint[];
  currentPrice: number;
  change: number;
  changePercent: number;
}

function useStockHistory(symbol: string, period: Period) {
  return useQuery({
    queryKey: ["stock-history", symbol, period],
    queryFn: async (): Promise<StockHistoryResponse | null> => {
      if (!symbol) return null;

      const { data, error } = await supabase.functions.invoke("stock-data", {
        body: { action: "history", symbol: symbol.toUpperCase(), period },
      });

      if (error) {
        console.error("Error fetching stock history:", error);
        throw error;
      }

      return data;
    },
    enabled: symbol.length > 0,
  });
}

export function StockHistoryChart() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSymbol, setActiveSymbol] = useState("AAPL");
  const [period, setPeriod] = useState<Period>("1M");

  const { data: historyData, isLoading, error } = useStockHistory(activeSymbol, period);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveSymbol(searchQuery.trim().toUpperCase());
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    if (period === "1W" || period === "1M") {
      return d.toLocaleDateString("sk-SK", { day: "numeric", month: "short" });
    }
    return d.toLocaleDateString("sk-SK", { month: "short", year: "2-digit" });
  };

  const formatPrice = (value: number) => `$${value.toFixed(2)}`;

  const periods: Period[] = ["1W", "1M", "3M", "6M", "1Y"];

  return (
    <Card className="glass-card p-6 animate-fade-in">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Historická Analýza Cien</h2>
            <p className="text-muted-foreground text-sm">
              Analyzujte historický vývoj cien akcií
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zadajte symbol (napr. AAPL, MSFT)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              Hľadať
            </Button>
          </form>

          <div className="flex gap-1">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  period === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {historyData && !isLoading && (
        <div className="flex items-center gap-4 mb-4 p-4 bg-secondary/30 rounded-lg">
          <div>
            <span className="text-xl font-bold">{historyData.symbol}</span>
            <span className="text-muted-foreground text-sm ml-2">
              {historyData.name}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-2xl font-bold">
              ${historyData.currentPrice?.toFixed(2) ?? "N/A"}
            </span>
            {historyData.change !== null && historyData.changePercent !== null && (
              <div
                className={`flex items-center gap-1 ${
                  (historyData.change ?? 0) >= 0 ? "text-profit" : "text-loss"
                }`}
              >
                {(historyData.change ?? 0) >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {(historyData.change ?? 0) >= 0 ? "+" : ""}
                  {historyData.change?.toFixed(2) ?? "0.00"} ({historyData.changePercent?.toFixed(2) ?? "0.00"}%)
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="h-[350px] w-full">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <p>Nepodarilo sa načítať dáta pre "{activeSymbol}".</p>
            <p className="text-sm">Skontrolujte, či je symbol správny (napr. AAPL, MSFT, GOOGL).</p>
          </div>
        ) : historyData && (!historyData.data || historyData.data.length === 0) ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <p>Pre {historyData.symbol} nie sú dostupné historické dáta.</p>
            <p className="text-sm">Skúste iné časové obdobie alebo iný symbol.</p>
            {historyData.currentPrice > 0 && (
              <p className="text-sm text-primary">Aktuálna cena: ${historyData.currentPrice.toFixed(2)}</p>
            )}
          </div>
        ) : historyData?.data && historyData.data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={historyData.data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={formatPrice}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={70}
                domain={["dataMin - 5", "dataMax + 5"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    close: "Záver",
                    high: "Max",
                    low: "Min",
                    open: "Otvorenie",
                  };
                  return [formatPrice(value), labels[name] || name];
                }}
                labelFormatter={(label) => formatDate(label)}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorClose)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Zadajte symbol akcie pre zobrazenie histórie
          </div>
        )}
      </div>
    </Card>
  );
}
