import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, TrendingDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useMarketData, useStockSearch } from "@/hooks/useStockData";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const popularStocks = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA", "JPM", "V", "JNJ",
  "WMT", "PG", "MA", "UNH", "HD", "DIS", "PYPL", "NFLX", "ADBE", "CRM"
];

export default function Markets() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const { data: marketData, isLoading: marketLoading } = useMarketData();
  const { data: searchResults, isLoading: searchLoading } = useStockSearch(debouncedSearch);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const getUserDisplayName = (email?: string) => {
    if (!email) return "Používateľ";
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userEmail={user.email} />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 lg:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Trhy</h1>
            <p className="text-muted-foreground">
              Prehľad akciových trhov a vyhľadávanie akcií
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Hľadať akcie podľa symbolu alebo názvu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
            )}
          </div>

          {/* Search Results */}
          {searchQuery && searchResults && searchResults.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">Výsledky vyhľadávania</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.slice(0, 12).map((result: { symbol: string; description: string; type: string }) => (
                  <div
                    key={result.symbol}
                    className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {result.symbol.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{result.symbol}</p>
                        <p className="text-muted-foreground text-sm truncate">{result.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{result.type}</span>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Plus className="h-3 w-3" />
                        Pridať
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchQuery && searchResults && searchResults.length === 0 && !searchLoading && (
            <div className="glass-card p-6 text-center">
              <p className="text-muted-foreground">Žiadne výsledky pre "{searchQuery}"</p>
            </div>
          )}

          {/* Market Indices */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Hlavné indexy</h2>
            {marketLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {marketData?.map((item) => (
                  <div
                    key={item.symbol}
                    className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-all cursor-pointer"
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
                        {item.changePercent24h >= 0 ? '+' : ''}{item.changePercent24h?.toFixed(2) || '0.00'}%
                      </div>
                    </div>
                    <p className="font-mono font-bold text-lg">
                      ${item.price?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Popular Stocks */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Populárne akcie</h2>
            <div className="flex flex-wrap gap-2">
              {popularStocks.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => setSearchQuery(symbol)}
                  className="px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-sm font-medium transition-all"
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
