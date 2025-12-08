import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, TrendingUp, TrendingDown, Loader2, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addIndicatorsToData, IndicatorData } from "@/utils/technicalIndicators";

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
  change: number | null;
  changePercent: number | null;
  isDemo?: boolean;
}

interface IndicatorSettings {
  sma20: boolean;
  sma50: boolean;
  ema12: boolean;
  ema26: boolean;
  rsi: boolean;
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
  const [showIndicators, setShowIndicators] = useState(false);
  const [indicators, setIndicators] = useState<IndicatorSettings>({
    sma20: true,
    sma50: false,
    ema12: false,
    ema26: false,
    rsi: false,
  });

  const { data: historyData, isLoading, error } = useStockHistory(activeSymbol, period);

  // Calculate data with indicators
  const chartData = useMemo(() => {
    if (!historyData?.data) return [];
    return addIndicatorsToData(historyData.data, indicators);
  }, [historyData?.data, indicators]);

  // Get RSI data for separate chart
  const rsiData = useMemo(() => {
    return chartData.map(d => ({
      date: d.date,
      rsi: d.rsi,
    }));
  }, [chartData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveSymbol(searchQuery.trim().toUpperCase());
    }
  };

  const toggleIndicator = (key: keyof IndicatorSettings) => {
    setIndicators(prev => ({ ...prev, [key]: !prev[key] }));
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

  const hasActiveIndicators = indicators.sma20 || indicators.sma50 || indicators.ema12 || indicators.ema26;

  return (
    <Card className="glass-card p-6 animate-fade-in">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Historická Analýza Cien</h2>
            <p className="text-muted-foreground text-sm">
              Analyzujte historický vývoj cien akcií
              {historyData?.isDemo && <span className="ml-2 text-xs text-primary">(simulované dáta)</span>}
            </p>
          </div>
          <Button
            variant={showIndicators ? "default" : "outline"}
            size="sm"
            onClick={() => setShowIndicators(!showIndicators)}
            className="gap-2"
          >
            <Activity className="h-4 w-4" />
            Indikátory
          </Button>
        </div>

        {showIndicators && (
          <div className="flex flex-wrap gap-4 p-4 bg-secondary/30 rounded-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <Checkbox
                id="sma20"
                checked={indicators.sma20}
                onCheckedChange={() => toggleIndicator("sma20")}
              />
              <Label htmlFor="sma20" className="text-sm cursor-pointer flex items-center gap-2">
                <span className="w-3 h-0.5 bg-yellow-500"></span>
                SMA 20
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="sma50"
                checked={indicators.sma50}
                onCheckedChange={() => toggleIndicator("sma50")}
              />
              <Label htmlFor="sma50" className="text-sm cursor-pointer flex items-center gap-2">
                <span className="w-3 h-0.5 bg-orange-500"></span>
                SMA 50
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="ema12"
                checked={indicators.ema12}
                onCheckedChange={() => toggleIndicator("ema12")}
              />
              <Label htmlFor="ema12" className="text-sm cursor-pointer flex items-center gap-2">
                <span className="w-3 h-0.5 bg-cyan-500"></span>
                EMA 12
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="ema26"
                checked={indicators.ema26}
                onCheckedChange={() => toggleIndicator("ema26")}
              />
              <Label htmlFor="ema26" className="text-sm cursor-pointer flex items-center gap-2">
                <span className="w-3 h-0.5 bg-purple-500"></span>
                EMA 26
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="rsi"
                checked={indicators.rsi}
                onCheckedChange={() => toggleIndicator("rsi")}
              />
              <Label htmlFor="rsi" className="text-sm cursor-pointer flex items-center gap-2">
                <span className="w-3 h-0.5 bg-pink-500"></span>
                RSI (14)
              </Label>
            </div>
          </div>
        )}

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

      <div className={`w-full ${indicators.rsi ? "h-[280px]" : "h-[350px]"}`}>
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
        ) : chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
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
                    sma20: "SMA 20",
                    sma50: "SMA 50",
                    ema12: "EMA 12",
                    ema26: "EMA 26",
                  };
                  if (value === undefined) return ["-", labels[name] || name];
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
              {indicators.sma20 && (
                <Line
                  type="monotone"
                  dataKey="sma20"
                  stroke="#EAB308"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                />
              )}
              {indicators.sma50 && (
                <Line
                  type="monotone"
                  dataKey="sma50"
                  stroke="#F97316"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                />
              )}
              {indicators.ema12 && (
                <Line
                  type="monotone"
                  dataKey="ema12"
                  stroke="#06B6D4"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                />
              )}
              {indicators.ema26 && (
                <Line
                  type="monotone"
                  dataKey="ema26"
                  stroke="#A855F7"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Zadajte symbol akcie pre zobrazenie histórie
          </div>
        )}
      </div>

      {/* RSI Chart */}
      {indicators.rsi && chartData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">RSI (14)</span>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Prekúpené: &gt;70</span>
              <span>Prepredané: &lt;30</span>
            </div>
          </div>
          <div className="h-[100px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={rsiData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  hide
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[30, 50, 70]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="3 3" />
                <ReferenceLine y={30} stroke="#22C55E" strokeDasharray="3 3" />
                <ReferenceLine y={50} stroke="hsl(var(--border))" strokeDasharray="2 2" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [value?.toFixed(2) ?? "-", "RSI"]}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Line
                  type="monotone"
                  dataKey="rsi"
                  stroke="#EC4899"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  );
}
