import { BarChart3, Bell, Search, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  userEmail?: string;
}

export function Header({ userEmail }: HeaderProps) {
  const { signOut } = useAuth();

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
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
          </Button>
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
