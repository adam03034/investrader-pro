import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Loader2, 
  Star, 
  StarOff,
  Building2,
  Cpu,
  Heart,
  ShoppingCart,
  Zap,
  Factory,
  Landmark,
  Plane,
  Filter,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useMarketData, useStockSearch } from "@/hooks/useStockData";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect } from "react";

// Stock categories with icons
const stockCategories = [
  { id: "all", label: "Všetky", icon: Filter },
  { id: "tech", label: "Technológie", icon: Cpu, stocks: ["AAPL", "MSFT", "GOOGL", "META", "NVDA", "TSLA", "ADBE", "CRM", "NFLX", "PYPL"] },
  { id: "finance", label: "Financie", icon: Landmark, stocks: ["JPM", "V", "MA", "BAC", "WFC", "GS", "MS", "AXP", "BLK", "C"] },
  { id: "healthcare", label: "Zdravotníctvo", icon: Heart, stocks: ["JNJ", "UNH", "PFE", "ABBV", "MRK", "TMO", "ABT", "DHR", "LLY", "BMY"] },
  { id: "consumer", label: "Spotrebný tovar", icon: ShoppingCart, stocks: ["AMZN", "WMT", "HD", "NKE", "MCD", "SBUX", "TGT", "COST", "LOW", "TJX"] },
  { id: "energy", label: "Energia", icon: Zap, stocks: ["XOM", "CVX", "COP", "SLB", "EOG", "PXD", "MPC", "VLO", "PSX", "OXY"] },
  { id: "industrial", label: "Priemysel", icon: Factory, stocks: ["CAT", "DE", "HON", "UPS", "BA", "GE", "MMM", "LMT", "RTX", "UNP"] },
];

// Featured stocks with extra info
const featuredStocks = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technológie", description: "Svetový líder v spotrebnej elektronike" },
  { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technológie", description: "Softvérový gigant a cloud provider" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technológie", description: "Materská spoločnosť Google" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Spotrebný tovar", description: "E-commerce a cloud computing líder" },
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Technológie", description: "Líder v GPU a AI čipoch" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Automobilky", description: "Elektrické vozidlá a čistá energia" },
];

export default function Markets() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem("watchlist");
    return saved ? JSON.parse(saved) : [];
  });
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const { data: marketData, isLoading: marketLoading } = useMarketData();
  const { data: searchResults, isLoading: searchLoading } = useStockSearch(debouncedSearch);

  // Save watchlist to localStorage
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  // Get stocks for selected category
  const categoryStocks = useMemo(() => {
    if (selectedCategory === "all") {
      return stockCategories.flatMap(c => c.stocks || []).slice(0, 20);
    }
    const category = stockCategories.find(c => c.id === selectedCategory);
    return category?.stocks || [];
  }, [selectedCategory]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header userEmail={user.email} />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Trhy</h1>
              <p className="text-muted-foreground">
                Prehľad akciových trhov a vyhľadávanie cenných papierov
              </p>
            </div>
            
            {/* Enhanced Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Hľadať podľa symbolu alebo názvu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 bg-secondary/50 border-border/50 focus:border-primary/50 focus:bg-secondary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {searchLoading && (
                <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
              )}
            </div>
          </div>

          {/* Search Results Dropdown */}
          {searchQuery && (
            <div className="glass-card p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  {searchLoading ? "Hľadám..." : `Výsledky pre "${searchQuery}"`}
                </h3>
                {searchResults && searchResults.length > 0 && (
                  <Badge variant="secondary">{searchResults.length} nájdených</Badge>
                )}
              </div>
              
              {searchLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {searchResults.slice(0, 9).map((result: { symbol: string; description: string; type: string }) => (
                    <div
                      key={result.symbol}
                      className="group p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-all cursor-pointer border border-transparent hover:border-primary/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm">
                          {result.symbol.slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{result.symbol}</p>
                            <Badge variant="outline" className="text-xs">{result.type}</Badge>
                          </div>
                          <p className="text-muted-foreground text-xs truncate">{result.description}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(result.symbol);
                            }}
                          >
                            {watchlist.includes(result.symbol) ? (
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>Žiadne výsledky pre "{searchQuery}"</p>
                  <p className="text-xs mt-1">Skúste iný symbol alebo názov spoločnosti</p>
                </div>
              )}
            </div>
          )}

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="overview">Prehľad</TabsTrigger>
              <TabsTrigger value="watchlist">
                Sledované
                {watchlist.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5">{watchlist.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="categories">Kategórie</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Market Indices */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Hlavné indexy</h2>
                  <Badge variant="outline" className="text-xs">
                    Aktualizované automaticky
                  </Badge>
                </div>
                {marketLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {marketData?.map((item) => (
                      <div
                        key={item.symbol}
                        className="group p-4 rounded-xl bg-gradient-to-br from-secondary/50 to-secondary/20 hover:from-secondary/70 hover:to-secondary/40 transition-all cursor-pointer border border-border/30 hover:border-primary/20"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-bold text-lg">{item.symbol}</p>
                            <p className="text-muted-foreground text-xs">{item.name}</p>
                          </div>
                          <div className={cn(
                            "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold",
                            item.changePercent24h >= 0 
                              ? "bg-success/20 text-success" 
                              : "bg-destructive/20 text-destructive"
                          )}>
                            {item.changePercent24h >= 0 ? (
                              <TrendingUp className="h-3.5 w-3.5" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5" />
                            )}
                            {item.changePercent24h >= 0 ? '+' : ''}{item.changePercent24h?.toFixed(2) || '0.00'}%
                          </div>
                        </div>
                        <p className="font-mono font-bold text-2xl">
                          ${item.price?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Featured Stocks */}
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4">Odporúčané akcie</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredStocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="group p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer border border-transparent hover:border-primary/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold">
                            {stock.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold">{stock.symbol}</p>
                            <p className="text-muted-foreground text-sm">{stock.name}</p>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => toggleWatchlist(stock.symbol)}
                        >
                          {watchlist.includes(stock.symbol) ? (
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{stock.description}</p>
                      <Badge variant="secondary" className="text-xs">{stock.sector}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Watchlist Tab */}
            <TabsContent value="watchlist" className="space-y-6">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Sledované akcie</h2>
                  {watchlist.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setWatchlist([])}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      Vymazať všetky
                    </Button>
                  )}
                </div>
                
                {watchlist.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Zatiaľ nemáte sledované akcie</p>
                    <p className="text-sm mt-1">Kliknite na hviezdičku pri akcii pre pridanie do sledovaných</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {watchlist.map((symbol) => (
                      <div
                        key={symbol}
                        className="group p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer border border-transparent hover:border-primary/20"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 flex items-center justify-center text-yellow-500 font-bold text-sm">
                              {symbol.slice(0, 2)}
                            </div>
                            <p className="font-bold">{symbol}</p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => toggleWatchlist(symbol)}
                          >
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-6">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {stockCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {category.label}
                    </Button>
                  );
                })}
              </div>

              {/* Stocks Grid */}
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4">
                  {stockCategories.find(c => c.id === selectedCategory)?.label || "Všetky"} akcie
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {categoryStocks.map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => setSearchQuery(symbol)}
                      className="group p-4 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-all text-center border border-transparent hover:border-primary/20"
                    >
                      <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm group-hover:scale-110 transition-transform">
                        {symbol.slice(0, 2)}
                      </div>
                      <p className="font-semibold">{symbol}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(symbol);
                        }}
                      >
                        {watchlist.includes(symbol) ? (
                          <>
                            <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                            Sledované
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3 mr-1" />
                            Sledovať
                          </>
                        )}
                      </Button>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}