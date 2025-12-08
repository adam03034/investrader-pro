import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, User } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user || !displayName.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profil bol úspešne aktualizovaný");
      // Refresh the page to update the profile in context
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Nepodarilo sa aktualizovať profil");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userEmail={user.email} />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 lg:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Nastavenia</h1>
            <p className="text-muted-foreground">Spravujte svoj profil a preferencie.</p>
          </div>

          <Card className="glass-card max-w-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil
              </CardTitle>
              <CardDescription>
                Upravte svoje zobrazované meno a ďalšie informácie.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="bg-secondary/50"
                />
                <p className="text-xs text-muted-foreground">Email nie je možné zmeniť.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Zobrazované meno</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Vaše meno"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-secondary border-border"
                />
                <p className="text-xs text-muted-foreground">Toto meno sa zobrazí na hlavnej stránke.</p>
              </div>

              <Button 
                onClick={handleSave} 
                disabled={saving || !displayName.trim()}
                className="w-full sm:w-auto"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Uložiť zmeny
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
