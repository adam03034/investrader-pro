import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Loader2, BookOpen, Code, Database, Layers, Users, Target, Lightbulb, CheckCircle, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const Documentation = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

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

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Dokumentácia projektu TradePro</h1>
              <p className="text-muted-foreground">
                Bakalárska práca - Platforma pre správu investičného portfólia
              </p>
            </div>

            <Tabs defaultValue="uvod" className="space-y-6">
              <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full">
                <TabsTrigger value="uvod">Úvod</TabsTrigger>
                <TabsTrigger value="analyza">Analýza</TabsTrigger>
                <TabsTrigger value="navrh">Návrh</TabsTrigger>
                <TabsTrigger value="implementacia">Implementácia</TabsTrigger>
                <TabsTrigger value="zaver">Záver</TabsTrigger>
              </TabsList>

              {/* ÚVOD */}
              <TabsContent value="uvod" className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">1. Úvod</h2>
                  </div>
                  
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      V súčasnej dobe finančných trhov je efektívna správa investičného portfólia 
                      kľúčovým faktorom pre úspešné investovanie. Investori potrebujú nástroje, 
                      ktoré im umožnia sledovať svoje investície v reálnom čase, analyzovať 
                      historické trendy a prijímať informované rozhodnutia.
                    </p>
                    
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Cieľ práce
                      </h3>
                      <p>
                        Cieľom bakalárskej práce je návrh a implementácia webovej aplikácie 
                        pre správu investičného portfólia, ktorá poskytuje používateľom 
                        komplexný prehľad o ich investíciách, real-time sledovanie cien 
                        cenných papierov a nástroje pre technickú analýzu.
                      </p>
                    </div>

                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        Motivácia
                      </h3>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Rastúci záujem retailových investorov o finančné trhy</li>
                        <li>Potreba jednoduchých a prehľadných nástrojov pre správu portfólia</li>
                        <li>Dostupnosť real-time trhových dát cez API</li>
                        <li>Možnosť integrácie technickej analýzy pre lepšie rozhodovanie</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Štruktúra práce</h3>
                  <div className="space-y-3">
                    {[
                      { num: "1", title: "Úvod", desc: "Motivácia a ciele práce" },
                      { num: "2", title: "Teoretická časť", desc: "Analýza problémovej oblasti a existujúcich riešení" },
                      { num: "3", title: "Návrh riešenia", desc: "Architektúra systému a návrh databázy" },
                      { num: "4", title: "Implementácia", desc: "Popis implementácie jednotlivých modulov" },
                      { num: "5", title: "Záver", desc: "Zhodnotenie výsledkov a možnosti rozšírenia" },
                    ].map((item) => (
                      <div key={item.num} className="flex items-start gap-3 p-3 bg-secondary/20 rounded-lg">
                        <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {item.num}
                        </span>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* ANALÝZA */}
              <TabsContent value="analyza" className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">2. Analýza problémovej oblasti</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">2.1 Analýza požiadaviek</h3>
                      <div className="grid gap-3">
                        <div className="p-4 border border-border rounded-lg">
                          <h4 className="font-medium text-profit mb-2">Funkčné požiadavky</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-profit mt-0.5" />
                              <span>Správa portfólia - pridávanie, úprava a mazanie aktív</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-profit mt-0.5" />
                              <span>Real-time sledovanie cien akcií a ETF</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-profit mt-0.5" />
                              <span>Historická analýza cien s technickými indikátormi</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-profit mt-0.5" />
                              <span>Generovanie PDF reportov portfólia</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-profit mt-0.5" />
                              <span>Notifikácie o významných zmenách cien</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-profit mt-0.5" />
                              <span>Vizualizácia rozloženia portfólia</span>
                            </li>
                          </ul>
                        </div>
                        <div className="p-4 border border-border rounded-lg">
                          <h4 className="font-medium text-primary mb-2">Nefunkčné požiadavky</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                              <span>Responzívny dizajn pre mobilné zariadenia</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                              <span>Bezpečná autentifikácia používateľov</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                              <span>Rýchla odozva aplikácie (&lt;3s načítanie dát)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                              <span>Škálovateľná architektúra</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">2.2 Analýza existujúcich riešení</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-3">Platforma</th>
                              <th className="text-center py-2 px-3">Portfólio</th>
                              <th className="text-center py-2 px-3">Real-time</th>
                              <th className="text-center py-2 px-3">Indikátory</th>
                              <th className="text-center py-2 px-3">Reporty</th>
                            </tr>
                          </thead>
                          <tbody className="text-muted-foreground">
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3">Yahoo Finance</td>
                              <td className="text-center py-2 px-3">✓</td>
                              <td className="text-center py-2 px-3">✓</td>
                              <td className="text-center py-2 px-3">Limitované</td>
                              <td className="text-center py-2 px-3">✗</td>
                            </tr>
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3">TradingView</td>
                              <td className="text-center py-2 px-3">Limitované</td>
                              <td className="text-center py-2 px-3">✓</td>
                              <td className="text-center py-2 px-3">✓</td>
                              <td className="text-center py-2 px-3">✗</td>
                            </tr>
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3 font-medium text-foreground">TradePro</td>
                              <td className="text-center py-2 px-3 text-profit">✓</td>
                              <td className="text-center py-2 px-3 text-profit">✓</td>
                              <td className="text-center py-2 px-3 text-profit">✓</td>
                              <td className="text-center py-2 px-3 text-profit">✓</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* NÁVRH */}
              <TabsContent value="navrh" className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Layers className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">3. Návrh riešenia</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">3.1 Architektúra systému</h3>
                      <div className="bg-secondary/30 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-4">
                          Aplikácia využíva modernú trojvrstvovú architektúru s oddelením 
                          prezentačnej, aplikačnej a dátovej vrstvy.
                        </p>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="p-4 bg-background rounded-lg border border-border">
                            <h4 className="font-medium text-primary mb-2">Frontend</h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              <li>• React 18 + TypeScript</li>
                              <li>• Vite (build tool)</li>
                              <li>• Tailwind CSS</li>
                              <li>• Recharts (grafy)</li>
                              <li>• TanStack Query</li>
                            </ul>
                          </div>
                          <div className="p-4 bg-background rounded-lg border border-border">
                            <h4 className="font-medium text-primary mb-2">Backend</h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              <li>• Supabase Edge Functions</li>
                              <li>• Deno runtime</li>
                              <li>• REST API</li>
                              <li>• Finnhub API (trhové dáta)</li>
                            </ul>
                          </div>
                          <div className="p-4 bg-background rounded-lg border border-border">
                            <h4 className="font-medium text-primary mb-2">Databáza</h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              <li>• PostgreSQL</li>
                              <li>• Row Level Security</li>
                              <li>• Supabase Auth</li>
                              <li>• Real-time subscriptions</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">3.2 Databázový model</h3>
                      <div className="bg-secondary/30 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                        <pre className="text-muted-foreground">{`-- Tabuľka používateľských profilov
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabuľka aktív v portfóliu
CREATE TABLE portfolio_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  symbol VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  quantity NUMERIC NOT NULL,
  avg_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabuľka notifikácií
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);`}</pre>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* IMPLEMENTÁCIA */}
              <TabsContent value="implementacia" className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Code className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">4. Implementácia</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">4.1 Štruktúra projektu</h3>
                      <div className="bg-secondary/30 p-4 rounded-lg font-mono text-xs">
                        <pre className="text-muted-foreground">{`src/
├── components/
│   ├── dashboard/
│   │   ├── AssetList.tsx        # Zoznam aktív
│   │   ├── PortfolioStats.tsx   # Štatistiky portfólia
│   │   ├── PortfolioChart.tsx   # Graf portfólia
│   │   ├── PortfolioAllocation.tsx # Rozloženie
│   │   ├── StockHistoryChart.tsx   # Historický graf
│   │   └── MarketOverview.tsx   # Prehľad trhu
│   ├── layout/
│   │   ├── Header.tsx           # Hlavička
│   │   ├── Sidebar.tsx          # Bočný panel
│   │   └── SearchBar.tsx        # Vyhľadávanie
│   └── ui/                      # UI komponenty
├── hooks/
│   ├── useAuth.ts               # Autentifikácia
│   ├── usePortfolio.ts          # Správa portfólia
│   ├── useStockData.ts          # Trhové dáta
│   └── useNotifications.ts      # Notifikácie
├── pages/
│   ├── Index.tsx                # Hlavná stránka
│   ├── Auth.tsx                 # Prihlásenie
│   ├── Reports.tsx              # Reporty
│   ├── Markets.tsx              # Trhy
│   └── Settings.tsx             # Nastavenia
├── utils/
│   └── technicalIndicators.ts   # Výpočty indikátorov
└── integrations/
    └── supabase/                # Supabase klient`}</pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">4.2 Kľúčové moduly</h3>
                      <div className="grid gap-4">
                        <div className="p-4 border border-border rounded-lg">
                          <h4 className="font-medium mb-2">Modul správy portfólia</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Umožňuje CRUD operácie nad aktívami portfólia s automatickým 
                            prepočtom priemernej nákupnej ceny pri dokúpení rovnakej akcie.
                          </p>
                          <div className="bg-secondary/30 p-3 rounded font-mono text-xs">
                            <code>usePortfolio() → assets, addAsset, updateAsset, removeAsset</code>
                          </div>
                        </div>

                        <div className="p-4 border border-border rounded-lg">
                          <h4 className="font-medium mb-2">Modul technických indikátorov</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Implementácia výpočtu SMA, EMA a RSI indikátorov pre technickú analýzu.
                          </p>
                          <div className="bg-secondary/30 p-3 rounded font-mono text-xs space-y-1">
                            <div><code>calculateSMA(data, period) → number[]</code></div>
                            <div><code>calculateEMA(data, period) → number[]</code></div>
                            <div><code>calculateRSI(data, period) → number[]</code></div>
                          </div>
                        </div>

                        <div className="p-4 border border-border rounded-lg">
                          <h4 className="font-medium mb-2">Modul real-time dát</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Integrácia s Finnhub API pre získavanie aktuálnych cien 
                            a historických dát s automatickou obnovou každú minútu.
                          </p>
                          <div className="bg-secondary/30 p-3 rounded font-mono text-xs space-y-1">
                            <div><code>useStockQuotes(symbols) → quotes, isLoading</code></div>
                            <div><code>useStockSearch(query) → results</code></div>
                            <div><code>useMarketData() → marketIndices</code></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">4.3 Bezpečnosť</h3>
                      <div className="bg-secondary/30 p-4 rounded-lg">
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-profit mt-0.5" />
                            <span><strong>Row Level Security (RLS)</strong> - používateľ vidí len svoje dáta</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-profit mt-0.5" />
                            <span><strong>JWT autentifikácia</strong> - bezpečné tokeny s expiráciou</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-profit mt-0.5" />
                            <span><strong>Edge Functions</strong> - API kľúče sú uložené na serveri</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-profit mt-0.5" />
                            <span><strong>HTTPS</strong> - šifrovaná komunikácia</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* ZÁVER */}
              <TabsContent value="zaver" className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">5. Záver</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">5.1 Zhodnotenie výsledkov</h3>
                      <p className="text-muted-foreground mb-4">
                        Výsledkom práce je funkčná webová aplikácia TradePro, ktorá spĺňa 
                        všetky stanovené ciele. Aplikácia umožňuje:
                      </p>
                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          "Komplexnú správu investičného portfólia",
                          "Real-time sledovanie cien akcií",
                          "Technickú analýzu s indikátormi SMA, EMA, RSI",
                          "Generovanie PDF reportov",
                          "Vizualizáciu rozloženia portfólia",
                          "Históriu transakcií a notifikácií",
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-secondary/20 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-profit" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">5.2 Možnosti rozšírenia</h3>
                      <div className="grid gap-3">
                        {[
                          {
                            title: "Backtesting modul",
                            desc: "Testovanie obchodných stratégií na historických dátach",
                          },
                          {
                            title: "Cenové alerty",
                            desc: "Automatické upozornenia pri dosiahnutí cieľovej ceny",
                          },
                          {
                            title: "Watchlist",
                            desc: "Sledovanie akcií, ktoré používateľ ešte nevlastní",
                          },
                          {
                            title: "Integrácia s brokerom",
                            desc: "Priame prepojenie s obchodným účtom pre automatický import",
                          },
                        ].map((item, i) => (
                          <div key={i} className="p-3 border border-border rounded-lg">
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">5.3 Použité technológie</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "React", "TypeScript", "Vite", "Tailwind CSS", "Supabase", 
                          "PostgreSQL", "Recharts", "TanStack Query", "Finnhub API",
                          "jsPDF", "date-fns", "Deno"
                        ].map((tech) => (
                          <span key={tech} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-primary/5 border-primary/20">
                  <div className="text-center">
                    <h3 className="font-semibold mb-2">Ekonomická univerzita v Bratislave</h3>
                    <p className="text-muted-foreground text-sm">
                      Fakulta hospodárskej informatiky
                    </p>
                    <p className="text-muted-foreground text-sm mt-4">
                      Bakalárska práca • Akademický rok 2024/2025
                    </p>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Documentation;
