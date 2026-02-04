import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  LayoutDashboard, 
  TrendingUp, 
  FileText, 
  Settings, 
  Search,
  Bell,
  PlusCircle,
  BarChart3
} from "lucide-react";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const helpSections = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description: "Prehľad vášho portfólia, grafy výkonnosti a rýchle štatistiky.",
  },
  {
    icon: Search,
    title: "Vyhľadávanie",
    description: "Vyhľadajte akcie podľa symbolu alebo názvu a pridajte ich do portfólia.",
  },
  {
    icon: PlusCircle,
    title: "Pridanie aktíva",
    description: "Kliknite na výsledok vyhľadávania alebo použite tlačidlo + pre pridanie novej akcie.",
  },
  {
    icon: TrendingUp,
    title: "Trhy",
    description: "Sledujte trhové indexy, objavujte nové akcie a spravujte watchlist.",
  },
  {
    icon: BarChart3,
    title: "Grafy",
    description: "Kliknite na akciu v portfóliu pre zobrazenie historického grafu s technickými indikátormi.",
  },
  {
    icon: Bell,
    title: "Upozornenia",
    description: "Sledujte cenové zmeny a históriu nákupov cez ikonu zvončeka.",
  },
  {
    icon: FileText,
    title: "Reporty",
    description: "Generujte PDF reporty s analýzou vášho portfólia.",
  },
  {
    icon: Settings,
    title: "Nastavenia",
    description: "Upravte profil, preferencie a nastavenia aplikácie.",
  },
];

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            Pomoc - TradePro
          </DialogTitle>
          <DialogDescription>
            Sprievodca základnými funkciami aplikácie
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {helpSections.map((section) => (
            <div 
              key={section.title}
              className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <section.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">{section.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {section.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Pre technickú analýzu kliknite na 
            akciu v portfóliu a aktivujte indikátory SMA, EMA alebo RSI v grafe.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
