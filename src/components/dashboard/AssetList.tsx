import { useState } from "react";
import { TrendingUp, TrendingDown, Plus, RefreshCw, Trash2, Edit2 } from "lucide-react";
import { Asset } from "@/types/portfolio";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditAssetDialog } from "./EditAssetDialog";

interface AssetListProps {
  assets: Asset[];
  onAddAsset: () => void;
  onRemoveAsset?: (assetId: string) => void;
  onUpdateAsset?: (data: { id: string; quantity: number; avgPrice: number }) => void;
  isLoading?: boolean;
}

export function AssetList({ assets, onAddAsset, onRemoveAsset, onUpdateAsset, isLoading }: AssetListProps) {
  const [deleteAsset, setDeleteAsset] = useState<Asset | null>(null);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);

  const handleConfirmDelete = () => {
    if (deleteAsset && onRemoveAsset) {
      onRemoveAsset(deleteAsset.id);
    }
    setDeleteAsset(null);
  };

  const handleUpdateAsset = (quantity: number, avgPrice: number) => {
    if (editAsset && onUpdateAsset) {
      onUpdateAsset({ id: editAsset.id, quantity, avgPrice });
    }
    setEditAsset(null);
  };

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Aktíva portfólia</h2>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            Vaše aktuálne držby
            {isLoading && <RefreshCw className="h-3 w-3 animate-spin text-primary" />}
          </p>
        </div>
        <Button onClick={onAddAsset} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Pridať aktívum
        </Button>
      </div>

      {assets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Zatiaľ nemáte žiadne aktíva v portfóliu.</p>
          <Button onClick={onAddAsset} variant="outline" className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Pridať prvé aktívum
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground text-sm font-medium">Aktívum</th>
                <th className="text-right py-3 px-4 text-muted-foreground text-sm font-medium">Cena</th>
                <th className="text-right py-3 px-4 text-muted-foreground text-sm font-medium">24h zmena</th>
                <th className="text-right py-3 px-4 text-muted-foreground text-sm font-medium">Držba</th>
                <th className="text-right py-3 px-4 text-muted-foreground text-sm font-medium">Hodnota</th>
                <th className="text-right py-3 px-4 text-muted-foreground text-sm font-medium">Zisk/Strata</th>
                <th className="text-right py-3 px-4 text-muted-foreground text-sm font-medium">Akcie</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => (
                <tr 
                  key={asset.id} 
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors animate-slide-in"
                  style={{ animationDelay: `${600 + index * 100}ms` }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {asset.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold">{asset.symbol}</p>
                        <p className="text-muted-foreground text-sm truncate max-w-[150px]">{asset.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4 font-mono font-medium">
                    ${asset.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-right py-4 px-4">
                    <div className={cn(
                      "flex items-center justify-end gap-1 font-medium",
                      asset.changePercent24h >= 0 ? "price-positive" : "price-negative"
                    )}>
                      {asset.changePercent24h >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span>{asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(2)}%</span>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4">
                    <p className="font-medium">{asset.quantity}</p>
                    <p className="text-muted-foreground text-sm">@ ${asset.avgPrice.toFixed(2)}</p>
                  </td>
                  <td className="text-right py-4 px-4 font-mono font-medium">
                    ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-right py-4 px-4">
                    <p className={cn(
                      "font-mono font-medium",
                      asset.profit >= 0 ? "price-positive" : "price-negative"
                    )}>
                      {asset.profit >= 0 ? '+' : ''}${asset.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className={cn(
                      "text-sm",
                      asset.profitPercent >= 0 ? "price-positive" : "price-negative"
                    )}>
                      {asset.profitPercent >= 0 ? '+' : ''}{asset.profitPercent.toFixed(2)}%
                    </p>
                  </td>
                  <td className="text-right py-4 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditAsset(asset)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteAsset(asset)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteAsset} onOpenChange={() => setDeleteAsset(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Odstrániť aktívum?</AlertDialogTitle>
            <AlertDialogDescription>
              Naozaj chcete odstrániť <strong>{deleteAsset?.symbol}</strong> z vášho portfólia? 
              Táto akcia sa nedá vrátiť späť.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušiť</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Odstrániť
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <EditAssetDialog
        asset={editAsset}
        open={!!editAsset}
        onOpenChange={() => setEditAsset(null)}
        onSave={handleUpdateAsset}
      />
    </div>
  );
}
