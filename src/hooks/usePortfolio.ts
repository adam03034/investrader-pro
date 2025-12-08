import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface PortfolioAsset {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  quantity: number;
  avg_price: number;
  created_at: string;
  updated_at: string;
}

interface AddAssetInput {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
}

export function usePortfolio() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: assets, isLoading, error } = useQuery({
    queryKey: ["portfolio-assets", user?.id],
    queryFn: async (): Promise<PortfolioAsset[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("portfolio_assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching portfolio:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  const addAssetMutation = useMutation({
    mutationFn: async (input: AddAssetInput) => {
      if (!user) throw new Error("Not authenticated");

      // Check if asset already exists
      const { data: existing } = await supabase
        .from("portfolio_assets")
        .select("id, quantity, avg_price")
        .eq("symbol", input.symbol)
        .maybeSingle();

      if (existing) {
        // Update existing asset (average the price)
        const totalQuantity = Number(existing.quantity) + input.quantity;
        const totalValue = (Number(existing.quantity) * Number(existing.avg_price)) + 
                          (input.quantity * input.avgPrice);
        const newAvgPrice = totalValue / totalQuantity;

        const { error } = await supabase
          .from("portfolio_assets")
          .update({
            quantity: totalQuantity,
            avg_price: newAvgPrice,
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Insert new asset
        const { error } = await supabase
          .from("portfolio_assets")
          .insert({
            user_id: user.id,
            symbol: input.symbol,
            name: input.name,
            quantity: input.quantity,
            avg_price: input.avgPrice,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-assets"] });
      toast.success("Aktívum bolo pridané do portfólia");
    },
    onError: (error) => {
      console.error("Error adding asset:", error);
      toast.error("Nepodarilo sa pridať aktívum");
    },
  });

  const removeAssetMutation = useMutation({
    mutationFn: async (assetId: string) => {
      const { error } = await supabase
        .from("portfolio_assets")
        .delete()
        .eq("id", assetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-assets"] });
      toast.success("Aktívum bolo odstránené z portfólia");
    },
    onError: (error) => {
      console.error("Error removing asset:", error);
      toast.error("Nepodarilo sa odstrániť aktívum");
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: async ({ id, quantity, avgPrice }: { id: string; quantity: number; avgPrice: number }) => {
      const { error } = await supabase
        .from("portfolio_assets")
        .update({
          quantity,
          avg_price: avgPrice,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-assets"] });
      toast.success("Aktívum bolo aktualizované");
    },
    onError: (error) => {
      console.error("Error updating asset:", error);
      toast.error("Nepodarilo sa aktualizovať aktívum");
    },
  });

  return {
    assets: assets || [],
    isLoading,
    error,
    addAsset: addAssetMutation.mutate,
    removeAsset: removeAssetMutation.mutate,
    updateAsset: updateAssetMutation.mutate,
    isAdding: addAssetMutation.isPending,
    isRemoving: removeAssetMutation.isPending,
  };
}
