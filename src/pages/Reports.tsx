import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useStockQuotes, updateAssetsWithLiveData } from "@/hooks/useStockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  BarChart3,
  Calendar
} from "lucide-react";
import { Asset } from "@/types/portfolio";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reports() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { assets: dbAssets, isLoading: portfolioLoading } = usePortfolio();
  const [generating, setGenerating] = useState(false);

  // Convert DB assets to Asset type format
  const baseAssets: Asset[] = useMemo(() => {
    return dbAssets.map((asset) => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      quantity: Number(asset.quantity),
      avgPrice: Number(asset.avg_price),
      currentPrice: 0,
      change24h: 0,
      changePercent24h: 0,
      value: 0,
      profit: 0,
      profitPercent: 0,
    }));
  }, [dbAssets]);

  const symbols = useMemo(() => baseAssets.map(a => a.symbol), [baseAssets]);
  const { data: quotes, isLoading: quotesLoading } = useStockQuotes(symbols);

  const assets = useMemo(() => {
    if (!quotes || baseAssets.length === 0) return baseAssets;
    return updateAssetsWithLiveData(baseAssets, quotes);
  }, [quotes, baseAssets]);

  // Calculate portfolio stats
  const stats = useMemo(() => {
    if (assets.length === 0) {
      return {
        totalValue: 0,
        totalCost: 0,
        totalProfit: 0,
        totalProfitPercent: 0,
        dailyChange: 0,
        dailyChangePercent: 0,
        winners: 0,
        losers: 0,
      };
    }

    const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
    const totalCost = assets.reduce((sum, a) => sum + (a.quantity * a.avgPrice), 0);
    const totalProfit = totalValue - totalCost;
    const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    const dailyChange = assets.reduce((sum, a) => sum + (a.quantity * a.change24h), 0);
    const dailyChangePercent = totalValue > 0 ? (dailyChange / (totalValue - dailyChange)) * 100 : 0;
    const winners = assets.filter(a => a.profit > 0).length;
    const losers = assets.filter(a => a.profit < 0).length;

    return {
      totalValue,
      totalCost,
      totalProfit,
      totalProfitPercent,
      dailyChange,
      dailyChangePercent,
      winners,
      losers,
    };
  }, [assets]);

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const today = new Date().toLocaleDateString('sk-SK', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      // Header
      doc.setFontSize(24);
      doc.setTextColor(0, 150, 200);
      doc.text("TradePro", 20, 25);
      
      doc.setFontSize(16);
      doc.setTextColor(60, 60, 60);
      doc.text("Report výkonnosti portfólia", 20, 35);
      
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(`Vygenerované: ${today}`, 20, 42);
      doc.text(`Investor: ${profile?.display_name || user?.email || 'N/A'}`, 20, 48);

      // Summary section
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("Súhrn portfólia", 20, 62);
      
      doc.setDrawColor(0, 150, 200);
      doc.setLineWidth(0.5);
      doc.line(20, 65, pageWidth - 20, 65);

      // Stats boxes
      const boxY = 72;
      const boxHeight = 25;
      const boxWidth = (pageWidth - 50) / 3;
      
      // Total Value
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(20, boxY, boxWidth, boxHeight, 3, 3, 'F');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Celková hodnota", 25, boxY + 8);
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text(`$${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 25, boxY + 18);

      // Total Profit
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(25 + boxWidth, boxY, boxWidth, boxHeight, 3, 3, 'F');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Celkový zisk/strata", 30 + boxWidth, boxY + 8);
      doc.setFontSize(14);
      doc.setTextColor(stats.totalProfit >= 0 ? 34 : 220, stats.totalProfit >= 0 ? 197 : 53, stats.totalProfit >= 0 ? 94 : 69);
      doc.text(`${stats.totalProfit >= 0 ? '+' : ''}$${stats.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${stats.totalProfitPercent.toFixed(2)}%)`, 30 + boxWidth, boxY + 18);

      // Daily Change
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(30 + boxWidth * 2, boxY, boxWidth, boxHeight, 3, 3, 'F');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Denná zmena", 35 + boxWidth * 2, boxY + 8);
      doc.setFontSize(14);
      doc.setTextColor(stats.dailyChange >= 0 ? 34 : 220, stats.dailyChange >= 0 ? 197 : 53, stats.dailyChange >= 0 ? 94 : 69);
      doc.text(`${stats.dailyChange >= 0 ? '+' : ''}$${stats.dailyChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 35 + boxWidth * 2, boxY + 18);

      // Assets table
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("Zoznam aktív", 20, 110);
      
      doc.setDrawColor(0, 150, 200);
      doc.line(20, 113, pageWidth - 20, 113);

      const tableData = assets.map(asset => [
        asset.symbol,
        asset.name,
        asset.quantity.toString(),
        `$${asset.avgPrice.toFixed(2)}`,
        `$${asset.currentPrice.toFixed(2)}`,
        `$${asset.value.toFixed(2)}`,
        `${asset.profit >= 0 ? '+' : ''}$${asset.profit.toFixed(2)}`,
        `${asset.profitPercent >= 0 ? '+' : ''}${asset.profitPercent.toFixed(2)}%`,
      ]);

      autoTable(doc, {
        startY: 118,
        head: [['Symbol', 'Názov', 'Množstvo', 'Priem. cena', 'Aktuálna', 'Hodnota', 'Zisk/Strata', '%']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [0, 150, 200],
          textColor: 255,
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
        },
      });

      // Footer
      const finalY = (doc as any).lastAutoTable.finalY || 200;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Tento report bol automaticky vygenerovaný aplikáciou TradePro.", 20, finalY + 15);
      doc.text("Údaje sú len informatívne a nemali by sa používať ako investičné poradenstvo.", 20, finalY + 20);

      // Save the PDF
      doc.save(`TradePro_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setGenerating(false);
    }
  };

  if (authLoading || portfolioLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userEmail={user.email} />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 lg:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Reporty</h1>
            <p className="text-muted-foreground">
              Generujte a stiahnite reporty o výkonnosti vášho portfólia.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Celková hodnota</p>
                    <p className="text-2xl font-bold">
                      ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/20">
                    <PieChart className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Celkový zisk/strata</p>
                    <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {stats.totalProfit >= 0 ? '+' : ''}${stats.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-sm ${stats.totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {stats.totalProfitPercent >= 0 ? '+' : ''}{stats.totalProfitPercent.toFixed(2)}%
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stats.totalProfit >= 0 ? 'bg-profit/20' : 'bg-loss/20'}`}>
                    {stats.totalProfit >= 0 ? (
                      <TrendingUp className="h-6 w-6 text-profit" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-loss" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Počet aktív</p>
                    <p className="text-2xl font-bold">{assets.length}</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.winners} ziskových, {stats.losers} stratových
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary">
                    <BarChart3 className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Denná zmena</p>
                    <p className={`text-2xl font-bold ${stats.dailyChange >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {stats.dailyChange >= 0 ? '+' : ''}${stats.dailyChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PDF Report Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                PDF Report
              </CardTitle>
              <CardDescription>
                Vygenerujte a stiahnite kompletný report vášho portfólia vo formáte PDF.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h4 className="font-medium mb-2">Report obsahuje:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Súhrn celkovej hodnoty portfólia</li>
                  <li>• Celkový zisk/strata a percentuálna zmena</li>
                  <li>• Kompletný zoznam všetkých aktív</li>
                  <li>• Aktuálne ceny a výkonnosť jednotlivých pozícií</li>
                  <li>• Denná zmena hodnoty</li>
                </ul>
              </div>

              <Button 
                onClick={generatePDF} 
                disabled={generating || quotesLoading || assets.length === 0}
                className="w-full sm:w-auto"
                size="lg"
              >
                {generating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {generating ? 'Generujem...' : 'Stiahnuť PDF Report'}
              </Button>

              {assets.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Pre generovanie reportu musíte mať v portfóliu aspoň jedno aktívum.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Assets Preview */}
          {assets.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Náhľad aktív</CardTitle>
                <CardDescription>
                  Prehľad aktív, ktoré budú zahrnuté v reporte.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium">Symbol</th>
                        <th className="text-left py-3 px-2 font-medium">Názov</th>
                        <th className="text-right py-3 px-2 font-medium">Množstvo</th>
                        <th className="text-right py-3 px-2 font-medium">Hodnota</th>
                        <th className="text-right py-3 px-2 font-medium">Zisk/Strata</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map((asset) => (
                        <tr key={asset.id} className="border-b border-border/50">
                          <td className="py-3 px-2 font-medium">{asset.symbol}</td>
                          <td className="py-3 px-2 text-muted-foreground">{asset.name}</td>
                          <td className="py-3 px-2 text-right">{asset.quantity}</td>
                          <td className="py-3 px-2 text-right">${asset.value.toFixed(2)}</td>
                          <td className={`py-3 px-2 text-right ${asset.profit >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {asset.profit >= 0 ? '+' : ''}${asset.profit.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
