import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  usePythonAnalysis,
  usePythonAPIHealth,
  RSIResult,
  MACDResult,
  BollingerResult,
} from "@/hooks/usePythonAnalysis";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  Bar,
} from "recharts";

interface PythonAnalysisCardProps {
  prices: number[];
  dates?: string[];
  symbol?: string;
}

export function PythonAnalysisCard({ prices, dates, symbol = "SYMBOL" }: PythonAnalysisCardProps) {
  const [activeTab, setActiveTab] = useState<"rsi" | "macd" | "bollinger">("rsi");
  const { analyze, analyzeAsync, data, isLoading, error, reset } = usePythonAnalysis();
  const { data: healthData, isError: isApiOffline } = usePythonAPIHealth();

  const handleAnalyze = async () => {
    try {
      await analyzeAsync({
        prices,
        indicators: {
          rsi: true,
          macd: true,
          bollinger: true,
        },
      });
    } catch (err) {
      console.error("Chyba pri Python analýze:", err);
    }
  };

  // Príprava dát pre grafy
  const prepareChartData = () => {
    if (!data) return [];

    return prices.map((price, index) => ({
      date: dates?.[index] || index.toString(),
      price,
      rsi: data.indicators.rsi?.values[index] ?? null,
      macd: data.indicators.macd?.macd_line[index] ?? null,
      signal: data.indicators.macd?.signal_line[index] ?? null,
      histogram: data.indicators.macd?.histogram[index] ?? null,
      upper: data.indicators.bollinger?.upper_band[index] ?? null,
      middle: data.indicators.bollinger?.middle_band[index] ?? null,
      lower: data.indicators.bollinger?.lower_band[index] ?? null,
    }));
  };

  const chartData = prepareChartData();

  // Získanie aktuálnych hodnôt
  const getCurrentRSI = () => {
    if (!data?.indicators.rsi) return null;
    const values = data.indicators.rsi.values.filter((v) => v !== null);
    return values[values.length - 1];
  };

  const getCurrentMACD = () => {
    if (!data?.indicators.macd) return null;
    const macdValues = data.indicators.macd.macd_line.filter((v) => v !== null);
    const signalValues = data.indicators.macd.signal_line.filter((v) => v !== null);
    return {
      macd: macdValues[macdValues.length - 1],
      signal: signalValues[signalValues.length - 1],
    };
  };

  const getRSISignal = () => {
    const rsi = getCurrentRSI();
    if (!rsi) return null;
    if (rsi > 70) return { text: "Prekúpené", color: "text-loss" };
    if (rsi < 30) return { text: "Prepredané", color: "text-profit" };
    return { text: "Neutrálne", color: "text-muted-foreground" };
  };

  const getMACDSignal = () => {
    const macd = getCurrentMACD();
    if (!macd) return null;
    if (macd.macd > macd.signal) return { text: "Býčí signál", color: "text-profit" };
    return { text: "Medvedí signál", color: "text-loss" };
  };

  return (
    <Card className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Python Technická Analýza</h2>
            <Badge variant="outline" className="text-xs">
              Flask API
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Pokročilá analýza pomocou Python (NumPy)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isApiOffline ? (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              API Offline
            </Badge>
          ) : healthData ? (
            <Badge variant="secondary" className="gap-1 text-profit">
              <CheckCircle2 className="h-3 w-3" />
              API Online
            </Badge>
          ) : null}

          <Button
            onClick={handleAnalyze}
            disabled={isLoading || isApiOffline || prices.length < 30}
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzujem...
              </>
            ) : (
              "Spustiť analýzu"
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {prices.length < 30 && (
        <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg text-sm text-warning">
          Pre technickú analýzu je potrebných minimálne 30 cenových bodov.
        </div>
      )}

      {data && (
        <>
          {/* Záložky */}
          <div className="flex gap-1 mb-4 p-1 bg-secondary/30 rounded-lg w-fit">
            {[
              { key: "rsi" as const, label: "RSI" },
              { key: "macd" as const, label: "MACD" },
              { key: "bollinger" as const, label: "Bollinger" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Súhrn */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-secondary/30 rounded-lg">
              <div className="text-sm text-muted-foreground">RSI (14)</div>
              <div className="text-xl font-bold">{getCurrentRSI()?.toFixed(2) ?? "-"}</div>
              {getRSISignal() && (
                <div className={`text-xs ${getRSISignal()?.color}`}>
                  {getRSISignal()?.text}
                </div>
              )}
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg">
              <div className="text-sm text-muted-foreground">MACD</div>
              <div className="text-xl font-bold">
                {getCurrentMACD()?.macd?.toFixed(4) ?? "-"}
              </div>
              {getMACDSignal() && (
                <div className={`text-xs ${getMACDSignal()?.color}`}>
                  {getMACDSignal()?.text}
                </div>
              )}
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Bollinger</div>
              <div className="text-xl font-bold">
                {data.indicators.bollinger?.settings.period ?? 20} dní
              </div>
              <div className="text-xs text-muted-foreground">
                ±{data.indicators.bollinger?.settings.std_dev ?? 2}σ
              </div>
            </div>
          </div>

          {/* Graf */}
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === "rsi" ? (
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} hide />
                  <YAxis domain={[0, 100]} ticks={[30, 50, 70]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="3 3" />
                  <ReferenceLine y={30} stroke="#22C55E" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="rsi" stroke="#EC4899" strokeWidth={2} dot={false} connectNulls />
                </ComposedChart>
              ) : activeTab === "macd" ? (
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} hide />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--border))" />
                  <Bar dataKey="histogram" fill="hsl(var(--primary))" opacity={0.5} />
                  <Line type="monotone" dataKey="macd" stroke="#3B82F6" strokeWidth={2} dot={false} connectNulls />
                  <Line type="monotone" dataKey="signal" stroke="#F97316" strokeWidth={2} dot={false} connectNulls />
                </ComposedChart>
              ) : (
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} hide />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area type="monotone" dataKey="upper" stroke="#22C55E" fill="#22C55E" fillOpacity={0.1} dot={false} connectNulls />
                  <Area type="monotone" dataKey="lower" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} dot={false} connectNulls />
                  <Line type="monotone" dataKey="middle" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="3 3" dot={false} connectNulls />
                  <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 bg-secondary/20 rounded-lg text-xs text-muted-foreground">
            <strong>Poznámka:</strong> {data.indicators[activeTab]?.description}
          </div>
        </>
      )}

      {!data && !isLoading && (
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          Kliknutím na "Spustiť analýzu" získate technické indikátory z Python API
        </div>
      )}
    </Card>
  );
}
