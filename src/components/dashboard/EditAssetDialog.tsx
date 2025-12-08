import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { Asset } from "@/types/portfolio";

interface EditAssetDialogProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (quantity: number, avgPrice: number) => void;
}

export function EditAssetDialog({ asset, open, onOpenChange, onSave }: EditAssetDialogProps) {
  const [quantity, setQuantity] = useState("");
  const [avgPrice, setAvgPrice] = useState("");

  useEffect(() => {
    if (asset) {
      setQuantity(asset.quantity.toString());
      setAvgPrice(asset.avgPrice.toString());
    }
  }, [asset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || !avgPrice) return;
    onSave(parseFloat(quantity), parseFloat(avgPrice));
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Upraviť {asset.symbol}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upravte množstvo alebo priemernú nákupnú cenu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 mb-4">
            <p className="font-medium">{asset.symbol}</p>
            <p className="text-muted-foreground text-sm truncate">{asset.name}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-quantity">Množstvo</Label>
            <Input
              id="edit-quantity"
              type="number"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-secondary border-border"
              min="0.00000001"
              step="any"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-price">Priemerná nákupná cena ($)</Label>
            <Input
              id="edit-price"
              type="number"
              placeholder="0.00"
              value={avgPrice}
              onChange={(e) => setAvgPrice(e.target.value)}
              className="bg-secondary border-border"
              min="0"
              step="any"
              required
            />
          </div>

          <Button type="submit" className="w-full gap-2">
            <Save className="h-4 w-4" />
            Uložiť zmeny
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
