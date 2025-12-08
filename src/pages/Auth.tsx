import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Neplatný email");
const passwordSchema = z.string().min(6, "Heslo musí mať minimálne 6 znakov");

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const validateForm = (): boolean => {
    setError("");
    
    try {
      emailSchema.parse(email);
    } catch {
      setError("Neplatný formát emailu");
      return false;
    }

    try {
      passwordSchema.parse(password);
    } catch {
      setError("Heslo musí mať minimálne 6 znakov");
      return false;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Heslá sa nezhodujú");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setError("Nesprávny email alebo heslo");
          } else {
            setError(error.message);
          }
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            setError("Tento email je už zaregistrovaný");
          } else {
            setError(error.message);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-background items-center justify-center p-12">
        <div className="max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20 glow-primary">
              <TrendingUp className="h-10 w-10 text-primary" />
            </div>
            <span className="text-3xl font-bold text-gradient">TradePro</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight">
            Spravujte svoje investície efektívne
          </h1>
          <p className="text-muted-foreground text-lg">
            Platforma pre obchodovanie s cennými papiermi s real-time cenami, 
            analýzou trhových trendov a reportmi o výkonnosti portfólia.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="glass-card p-4">
              <p className="text-2xl font-bold text-primary">Real-time</p>
              <p className="text-muted-foreground text-sm">Ceny akcií</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-2xl font-bold text-success">Analýza</p>
              <p className="text-muted-foreground text-sm">Trhových trendov</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/20">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <span className="text-2xl font-bold text-gradient">TradePro</span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {isLogin ? "Prihlásenie" : "Registrácia"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLogin 
                ? "Zadajte svoje prihlasovacie údaje" 
                : "Vytvorte si nový účet"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vas@email.sk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Heslo</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potvrďte heslo</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-secondary border-border"
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "Prihlásiť sa" : "Registrovať sa"}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-primary hover:underline text-sm"
            >
              {isLogin 
                ? "Nemáte účet? Zaregistrujte sa" 
                : "Už máte účet? Prihláste sa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
