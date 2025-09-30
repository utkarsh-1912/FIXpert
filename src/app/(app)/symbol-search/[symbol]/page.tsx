
'use client';
import { useEffect, useState } from 'react';
import { getQuote } from '@/app/actions/symbol-search.actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Newspaper } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format, subDays } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

type QuoteData = Awaited<ReturnType<typeof getQuote>>;

const chartConfig = {
  price: {
    label: 'Price',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const DataPoint = ({ label, value, change, isPercentage }: { label: string; value: any; change?: number; isPercentage?: boolean }) => (
    <div className="flex justify-between py-2 border-b border-border/50">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
            <span>{value}</span>
            {change !== undefined && (
                <span className={`flex items-center text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {isPercentage ? `${change.toFixed(2)}%` : change.toFixed(2)}
                </span>
            )}
        </div>
    </div>
);


export default function SymbolDashboardPage() {
  const params = useParams();
  const symbol = params.symbol as string;
  const [data, setData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1y');

  useEffect(() => {
    if (!symbol) return;
    const fetchData = async () => {
      setLoading(true);
      const result = await getQuote(symbol);
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, [symbol]);

  const chartData = (data?.history || [])
    .map(h => ({ date: format(new Date(h.date), 'yyyy-MM-dd'), price: h.close?.toFixed(2) }))
    .filter(h => {
        if (!h.date) return false;
        const historyDate = new Date(h.date);
        let startDate;
        switch (timeRange) {
            case '1d': startDate = subDays(new Date(), 1); break;
            case '5d': startDate = subDays(new Date(), 5); break;
            case '1m': startDate = subDays(new Date(), 30); break;
            case '6m': startDate = subDays(new Date(), 180); break;
            case '1y': startDate = subDays(new Date(), 365); break;
            default: return true;
        }
        return historyDate >= startDate;
    });

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || !data.quote) {
    return (
      <div className="text-center text-destructive">
        Failed to load data for symbol {symbol}. Please try again.
      </div>
    );
  }

  const { quote, news, summary } = data;
  const priceUp = (quote.regularMarketChange ?? 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{quote.longName || quote.shortName} ({quote.symbol})</h1>
          <p className="text-muted-foreground">{quote.fullExchangeName}</p>
        </div>
        <div className="text-right">
          <p className={`text-4xl font-bold ${priceUp ? 'text-green-500' : 'text-red-500'}`}>
            {quote.regularMarketPrice?.toFixed(2)}
          </p>
          <p className={`flex items-center justify-end gap-2 text-lg ${priceUp ? 'text-green-500' : 'text-red-500'}`}>
            {priceUp ? <TrendingUp /> : <TrendingDown />}
            {quote.regularMarketChange?.toFixed(2)} ({quote.regularMarketChangePercent?.toFixed(2)}%)
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
           <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Price Chart</CardTitle>
                    <div className="flex items-center gap-1">
                        {['1D', '5D', '1M', '6M', '1Y'].map(range => (
                            <Button key={range} variant={timeRange.toUpperCase() === range ? "secondary" : "ghost"} size="sm" onClick={() => setTimeRange(range.toLowerCase())}>
                                {range}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={priceUp ? "var(--color-price)" : "hsl(var(--destructive))"} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={priceUp ? "var(--color-price)" : "hsl(var(--destructive))"} stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                            tickLine={false}
                            axisLine={false}
                            />
                        <YAxis orientation="right" tickLine={false} axisLine={false} domain={['dataMin', 'dataMax']} />
                        <Tooltip content={<ChartTooltipContent indicator="line" />} />
                        <Area type="monotone" dataKey="price" stroke={priceUp ? "var(--color-price)" : "hsl(var(--destructive))"} fill="url(#chart-gradient)" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>

           <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Newspaper className="h-6 w-6 text-primary" />
                        <CardTitle>Recent News</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {news.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex flex-col p-3 rounded-lg hover:bg-muted/50">
                            <Link href={item.link} target="_blank" rel="noopener noreferrer">
                                <p className="font-semibold text-base hover:underline">{item.title}</p>
                                <p className="text-xs text-muted-foreground pt-1">{item.publisher} &bull; {format(new Date(item.providerPublishTime * 1000), 'MMM dd, yyyy')}</p>
                            </Link>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Data</CardTitle>
            </CardHeader>
            <CardContent>
                <DataPoint label="Open" value={quote.regularMarketOpen?.toFixed(2)} />
                <DataPoint label="Previous Close" value={quote.regularMarketPreviousClose?.toFixed(2)} />
                <DataPoint label="Day High" value={quote.regularMarketDayHigh?.toFixed(2)} />
                <DataPoint label="Day Low" value={quote.regularMarketDayLow?.toFixed(2)} />
                <DataPoint label="52-Wk High" value={quote.fiftyTwoWeekHigh?.toFixed(2)} />
                <DataPoint label="52-Wk Low" value={quote.fiftyTwoWeekLow?.toFixed(2)} />
                <DataPoint label="Volume" value={quote.regularMarketVolume?.toLocaleString()} />
                <DataPoint label="Market Cap" value={quote.marketCap?.toLocaleString()} />
                <DataPoint label="P/E Ratio" value={quote.trailingPE?.toFixed(2)} />
                <DataPoint label="EPS" value={quote.epsTrailingTwelveMonths?.toFixed(2)} />
            </CardContent>
          </Card>
          
           {summary?.longBusinessSummary && (
                <Card>
                    <CardHeader>
                        <CardTitle>About {quote.shortName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{summary.longBusinessSummary}</p>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
