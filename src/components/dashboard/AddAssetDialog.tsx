import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStockSearch, useStockQuotes } from "@/hooks/useStockData";
import { useDebounce } from "@/hooks/useDebounce";

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAsset?: (data: { symbol: string; name: string; quantity: number; avgPrice: number }) => void;
  isAdding?: boolean;
}

export function AddAssetDialog({ open, onOpenChange, onAddAsset, isAdding }: AddAssetDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<{ symbol: string; description: string } | null>(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  
  const debouncedSearch = useDebounce(search, 300);
  const { data: searchResults, isLoading: searchLoading } = useStockSearch(debouncedSearch);
  
  // Fetch quote for selected asset
  const { data: quotes } = useStockQuotes(selectedAsset ? [selectedAsset.symbol] : []);
  
  // Update price when quote is received
  useEffect(() => {
    if (quotes && quotes.length > 0 && quotes[0].currentPrice) {
      setPrice(quotes[0].currentPrice.toString());
    }
  }, [quotes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !quantity || !price) return;

    onAddAsset?.({
      symbol: selectedAsset.symbol,
      name: selectedAsset.description,
      quantity: parseFloat(quantity),
      avgPrice: parseFloat(price),
    });
    
    // Reset form
    setSelectedAsset(null);
    setQuantity("");
    setPrice("");
    setSearch("");
    onOpenChange(false);
  };

  const handleClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setSelectedAsset(null);
      setQuantity("");
      setPrice("");
      setSearch("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Pridať aktívum do portfólia</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Vyhľadajte akciu a zadajte množstvo, ktoré vlastníte.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Hľadať podľa symbolu alebo názvu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
            )}
          </div>

          <div className="max-h-[200px] overflow-y-auto space-y-2">
            {searchResults && searchResults.length > 0 ? (
              searchResults.slice(0, 10).map((result: { symbol: string; description: string; type: string }) => (
                <button
                  key={result.symbol}
                  onClick={() => {
                    setSelectedAsset({ symbol: result.symbol, description: result.description });
                    setSearch("");
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg transition-all",
                    selectedAsset?.symbol === result.symbol 
                      ? "bg-primary/20 border border-primary/50" 
                      : "bg-secondary/50 hover:bg-secondary border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                      {result.symbol.slice(0, 2)}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">{result.symbol}</p>
                      <p className="text-muted-foreground text-xs truncate max-w-[250px]">{result.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{result.type}</span>
                </button>
              ))
            ) : search.length > 0 && !searchLoading ? (
              <p className="text-center text-muted-foreground text-sm py-4">Žiadne výsledky</p>
            ) : null}
          </div>

          {selectedAsset && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
              <p className="font-medium">{selectedAsset.symbol}</p>
              <p className="text-muted-foreground text-sm truncate">{selectedAsset.description}</p>
            </div>
          )}

          {selectedAsset && (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Množstvo</Label>
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
                  <Label htmlFor="price">Priem. nákupná cena</Label>
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
              
              <Button type="submit" className="w-full gap-2" disabled={isAdding}>
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Pridať do portfólia
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
