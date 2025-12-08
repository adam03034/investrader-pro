import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PriceHistoryPoint } from '@/types/portfolio';

interface PortfolioChartProps {
  data: PriceHistoryPoint[];
}

export function PortfolioChart({ data }: PortfolioChartProps) {
  const formatValue = (value: number) => `$${value.toLocaleString()}`;
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Portfolio Performance</h2>
          <p className="text-muted-foreground text-sm">Last 6 months</p>
        </div>
        <div className="flex gap-2">
          {['1W', '1M', '3M', '6M', '1Y', 'ALL'].map((period) => (
            <button
              key={period}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                period === '6M' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(222, 47%, 18%)" 
              vertical={false} 
            />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="hsl(215, 20%, 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tickFormatter={formatValue}
              stroke="hsl(215, 20%, 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(222, 47%, 10%)',
                border: '1px solid hsl(222, 47%, 16%)',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: 'hsl(215, 20%, 55%)' }}
              formatter={(value: number) => [formatValue(value), 'Value']}
              labelFormatter={(label) => formatDate(label)}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(199, 89%, 48%)" 
              strokeWidth={2}
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
