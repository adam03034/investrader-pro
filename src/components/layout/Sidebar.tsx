import { useState } from "react";
import { LayoutDashboard, TrendingUp, FileText, Settings, HelpCircle } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { HelpDialog } from "./HelpDialog";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: TrendingUp, label: "Trhy", path: "/markets" },
  { icon: FileText, label: "Reporty", path: "/reports" },
  { icon: Settings, label: "Nastavenia", path: "/settings" },
];

export function Sidebar() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border/50 bg-sidebar h-[calc(100vh-4rem)] sticky top-16">
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              isActive 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-2">
        <button
          onClick={() => setHelpOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
        >
          <HelpCircle className="h-5 w-5" />
          Pomoc
        </button>
      </div>

      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </aside>
  );
}
