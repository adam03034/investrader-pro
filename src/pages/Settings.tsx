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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Save, User, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

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

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmation !== "VYMAZAŤ") return;

    setDeleting(true);
    try {
      // Vymazanie všetkých dát používateľa
      // 1. Vymazanie notifikácií
      await supabase.from("notifications").delete().eq("user_id", user.id);

      // 2. Vymazanie portfólia
      await supabase.from("portfolio_assets").delete().eq("user_id", user.id);

      // 3. Vymazanie profilu
      await supabase.from("profiles").delete().eq("id", user.id);

      // 4. Odhlásenie používateľa
      await signOut();

      toast.success("Váš účet bol úspešne vymazaný");
      navigate("/auth");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Nepodarilo sa vymazať účet. Skúste to prosím neskôr.");
    } finally {
      setDeleting(false);
      setDeleteConfirmation("");
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

          {/* Nebezpečná zóna - Vymazanie účtu */}
          <Card className="glass-card max-w-xl border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Nebezpečná zóna
              </CardTitle>
              <CardDescription>
                Nezvratné akcie s vašim účtom.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <h4 className="font-medium text-destructive mb-2">Vymazanie účtu</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Po vymazaní účtu budú všetky vaše dáta, vrátane portfólia, notifikácií a nastavení, 
                  trvalo odstránené. Táto akcia je nezvratná.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Vymazať účet
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Naozaj chcete vymazať svoj účet?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>
                          Táto akcia je <strong>nezvratná</strong>. Všetky vaše dáta budú trvalo vymazané:
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Celé vaše portfólio a história</li>
                          <li>Všetky notifikácie</li>
                          <li>Profil a nastavenia</li>
                        </ul>
                        <div className="pt-2">
                          <Label htmlFor="deleteConfirm" className="text-foreground">
                            Pre potvrdenie napíšte <strong>VYMAZAŤ</strong>:
                          </Label>
                          <Input
                            id="deleteConfirm"
                            type="text"
                            placeholder="VYMAZAŤ"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
                        Zrušiť
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmation !== "VYMAZAŤ" || deleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Natrvalo vymazať účet
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
