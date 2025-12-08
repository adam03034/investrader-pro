import { useMemo } from "react";
import { BarChart3, Bell, Search, Settings, LogOut, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useStockQuotes, updateAssetsWithLiveData } from "@/hooks/useStockData";
import { Asset } from "@/types/portfolio";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HeaderProps {
  userEmail?: string;
}

interface Notification {
  id: string;
  type: "gain" | "loss" | "alert";
  title: string;
  message: string;
  symbol: string;
  value: number;
}

export function Header({ userEmail }: HeaderProps) {
  const { signOut } = useAuth();
  const { assets: dbAssets } = usePortfolio();

  // Get portfolio data for notifications
  const baseAssets: Asset[] = useMemo(() => {
    return dbAssets.map((asset) => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      quantity: Number(asset.quantity),
      avgPrice: Number(asset.avg_price),
      currentPrice: 0,
      change24h: 0,
      changePercent24h: 0,
      value: 0,
      profit: 0,
      profitPercent: 0,
    }));
  }, [dbAssets]);

  const symbols = useMemo(() => baseAssets.map(a => a.symbol), [baseAssets]);
  const { data: quotes } = useStockQuotes(symbols);

  const assets = useMemo(() => {
    if (!quotes || baseAssets.length === 0) return baseAssets;
    return updateAssetsWithLiveData(baseAssets, quotes);
  }, [quotes, baseAssets]);

  // Generate notifications based on portfolio performance
  const notifications: Notification[] = useMemo(() => {
    const notifs: Notification[] = [];

    assets.forEach((asset) => {
      // Significant daily change (> 2%)
      if (Math.abs(asset.changePercent24h) > 2) {
        const isGain = asset.changePercent24h > 0;
        notifs.push({
          id: `daily-${asset.id}`,
          type: isGain ? "gain" : "loss",
          title: `${asset.symbol} ${isGain ? "rastie" : "klesá"}`,
          message: `${isGain ? "+" : ""}${asset.changePercent24h.toFixed(2)}% za posledných 24h`,
          symbol: asset.symbol,
          value: asset.changePercent24h,
        });
      }

      // Significant profit/loss (> 10%)
      if (Math.abs(asset.profitPercent) > 10) {
        const isGain = asset.profitPercent > 0;
        notifs.push({
          id: `profit-${asset.id}`,
          type: isGain ? "gain" : "loss",
          title: `${asset.symbol} - ${isGain ? "Zisk" : "Strata"}`,
          message: `${isGain ? "+" : ""}${asset.profitPercent.toFixed(2)}% od nákupu`,
          symbol: asset.symbol,
          value: asset.profitPercent,
        });
      }
    });

    // Sort by absolute value (most significant first)
    return notifs.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 10);
  }, [assets]);

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (email?: string) => {
    if (!email) return "U";
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-4">
          <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="p-2 rounded-xl bg-primary/20 glow-primary">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">TradePro</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Hľadať aktíva, trhy..." 
              className="pl-10 bg-secondary border-border/50 focus:border-primary/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Upozornenia</h3>
                <p className="text-xs text-muted-foreground">
                  Významné zmeny vo vašom portfóliu
                </p>
              </div>
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Žiadne nové upozornenia</p>
                    <p className="text-xs mt-1">
                      Upozorníme vás pri významných zmenách cien.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3 hover:bg-secondary/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              notif.type === "gain"
                                ? "bg-profit/20"
                                : notif.type === "loss"
                                ? "bg-loss/20"
                                : "bg-primary/20"
                            }`}
                          >
                            {notif.type === "gain" ? (
                              <TrendingUp className="h-4 w-4 text-profit" />
                            ) : notif.type === "loss" ? (
                              <TrendingDown className="h-4 w-4 text-loss" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{notif.title}</p>
                            <p
                              className={`text-xs ${
                                notif.type === "gain"
                                  ? "text-profit"
                                  : notif.type === "loss"
                                  ? "text-loss"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {notif.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-border">
                  <Link to="/reports">
                    <Button variant="outline" size="sm" className="w-full">
                      Zobraziť všetky reporty
                    </Button>
                  </Link>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" asChild>
            <Link to="/settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground font-semibold text-sm ml-2 hover:opacity-80 transition-opacity">
                {getInitials(userEmail)}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userEmail}</p>
                <p className="text-xs text-muted-foreground">Účet</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Odhlásiť sa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
