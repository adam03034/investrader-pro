import { useMemo, useState } from "react";
import { BarChart3, Bell, Search, Settings, LogOut, TrendingUp, TrendingDown, AlertCircle, ShoppingCart, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useStockQuotes, updateAssetsWithLiveData } from "@/hooks/useStockData";
import { useNotifications } from "@/hooks/useNotifications";
import { SearchBar } from "./SearchBar";
import { AddAssetDialog } from "@/components/dashboard/AddAssetDialog";
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
import { formatDistanceToNow } from "date-fns";
import { sk } from "date-fns/locale";

interface HeaderProps {
  userEmail?: string;
}

interface DisplayNotification {
  id: string;
  type: "gain" | "loss" | "purchase" | "alert";
  title: string;
  message: string;
  created_at?: string;
  is_read?: boolean;
}

export function Header({ userEmail }: HeaderProps) {
  const { signOut } = useAuth();
  const { assets: dbAssets, addAsset, isAdding } = usePortfolio();
  const { notifications: dbNotifications, unreadCount, markAllAsRead } = useNotifications();
  const [addAssetOpen, setAddAssetOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string } | null>(null);

  const handleSelectStock = (symbol: string, name: string) => {
    setSelectedStock({ symbol, name });
    setAddAssetOpen(true);
  };

  const handleAddAsset = (data: { symbol: string; name: string; quantity: number; avgPrice: number }) => {
    addAsset(data);
  };

  // Get portfolio data for real-time notifications
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

  // Combine database notifications with real-time price alerts
  const allNotifications: DisplayNotification[] = useMemo(() => {
    const notifs: DisplayNotification[] = [];

    // Add database notifications (purchase history)
    dbNotifications.forEach((notif) => {
      notifs.push({
        id: notif.id,
        type: notif.type as "gain" | "loss" | "purchase" | "alert",
        title: notif.title,
        message: notif.message,
        created_at: notif.created_at,
        is_read: notif.is_read,
      });
    });

    // Add real-time price alerts
    assets.forEach((asset) => {
      if (Math.abs(asset.changePercent24h) > 2) {
        const isGain = asset.changePercent24h > 0;
        notifs.push({
          id: `daily-${asset.id}`,
          type: isGain ? "gain" : "loss",
          title: `${asset.symbol} ${isGain ? "rastie" : "klesá"}`,
          message: `${isGain ? "+" : ""}${asset.changePercent24h.toFixed(2)}% za posledných 24h`,
        });
      }
    });

    return notifs.slice(0, 20);
  }, [dbNotifications, assets]);

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (email?: string) => {
    if (!email) return "U";
    return email.slice(0, 2).toUpperCase();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "gain":
        return <TrendingUp className="h-4 w-4 text-profit" />;
      case "loss":
        return <TrendingDown className="h-4 w-4 text-loss" />;
      case "purchase":
        return <ShoppingCart className="h-4 w-4 text-primary" />;
      default:
        return <AlertCircle className="h-4 w-4 text-primary" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case "gain":
        return "bg-profit/20";
      case "loss":
        return "bg-loss/20";
      case "purchase":
        return "bg-primary/20";
      default:
        return "bg-primary/20";
    }
  };

  const getNotificationTextColor = (type: string) => {
    switch (type) {
      case "gain":
        return "text-profit";
      case "loss":
        return "text-loss";
      default:
        return "text-muted-foreground";
    }
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
          <SearchBar onSelectStock={handleSelectStock} />
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {(allNotifications.length > 0 || unreadCount > 0) && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Upozornenia</h3>
                  <p className="text-xs text-muted-foreground">
                    História nákupov a zmeny cien
                  </p>
                </div>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => markAllAsRead()}
                    className="text-xs"
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Prečítať
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                {allNotifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Žiadne upozornenia</p>
                    <p className="text-xs mt-1">
                      Tu uvidíte históriu nákupov a cenové upozornenia.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {allNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 hover:bg-secondary/50 transition-colors cursor-pointer ${
                          notif.is_read === false ? "bg-secondary/30" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getNotificationBgColor(notif.type)}`}>
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{notif.title}</p>
                            <p className={`text-xs ${getNotificationTextColor(notif.type)}`}>
                              {notif.message}
                            </p>
                            {notif.created_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notif.created_at), {
                                  addSuffix: true,
                                  locale: sk,
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {allNotifications.length > 0 && (
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

      <AddAssetDialog
        open={addAssetOpen}
        onOpenChange={setAddAssetOpen}
        onAddAsset={handleAddAsset}
        isAdding={isAdding}
        prefilledSymbol={selectedStock?.symbol}
        prefilledName={selectedStock?.name}
      />
    </header>
  );
}
