import { useState, useRef, useEffect } from "react";
import { Search, TrendingUp, Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useStockSearch } from "@/hooks/useStockData";
import { cn } from "@/lib/utils";

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
}

interface SearchBarProps {
  onSelectStock?: (symbol: string, name: string) => void;
}

export function SearchBar({ onSelectStock }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const { data: results, isLoading } = useStockSearch(debouncedQuery);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    if (onSelectStock) {
      onSelectStock(result.symbol, result.name);
    }
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Hľadať akcie (napr. AAPL, TSLA)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query && setIsOpen(true)}
          className="pl-10 bg-secondary border-border/50 focus:border-primary/50"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && query.length >= 1 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              <p className="text-sm">Hľadám...</p>
            </div>
          ) : results && results.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto">
              {results.slice(0, 8).map((result) => (
                <button
                  key={result.symbol}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left",
                    "border-b border-border/50 last:border-0"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {result.symbol.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{result.symbol}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                      {result.type}
                    </span>
                    {onSelectStock && (
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Žiadne výsledky pre "{query}"</p>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">Zadajte aspoň 2 znaky</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
