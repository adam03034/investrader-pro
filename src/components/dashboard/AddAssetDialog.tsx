import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const popularAssets = [
  { symbol: "AAPL", name: "Apple Inc.", price: 189.84, change: 1.15 },
  { symbol: "MSFT", name: "Microsoft Corporation", price: 415.50, change: -0.30 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 152.30, change: 2.32 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 178.25, change: 0.85 },
  { symbol: "META", name: "Meta Platforms Inc.", price: 505.75, change: 1.92 },
  { symbol: "NVDA", name: "NVIDIA Corporation", price: 495.22, change: 1.75 },
];

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAssetDialog({ open, onOpenChange }: AddAssetDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const filteredAssets = popularAssets.filter(
    asset => 
      asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
      asset.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would add the asset to the portfolio
    console.log({ selectedAsset, quantity, price });
    onOpenChange(false);
    setSelectedAsset(null);
    setQuantity("");
    setPrice("");
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Asset to Portfolio</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Search for an asset and specify the quantity you own.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by symbol or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>

          <div className="max-h-[200px] overflow-y-auto space-y-2">
            {filteredAssets.map((asset) => (
              <button
                key={asset.symbol}
                onClick={() => {
                  setSelectedAsset(asset.symbol);
                  setPrice(asset.price.toString());
                }}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg transition-all",
                  selectedAsset === asset.symbol 
                    ? "bg-primary/20 border border-primary/50" 
                    : "bg-secondary/50 hover:bg-secondary border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    {asset.symbol.slice(0, 2)}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{asset.symbol}</p>
                    <p className="text-muted-foreground text-xs">{asset.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-medium">${asset.price.toFixed(2)}</p>
                  <p className={cn(
                    "text-xs flex items-center justify-end gap-1",
                    asset.change >= 0 ? "price-positive" : "price-negative"
                  )}>
                    {asset.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                  </p>
                </div>
              </button>
            ))}
          </div>

          {selectedAsset && (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-secondary border-border"
                    min="0"
                    step="any"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Avg. Purchase Price</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-secondary border-border"
                    min="0"
                    step="any"
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Add to Portfolio
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
