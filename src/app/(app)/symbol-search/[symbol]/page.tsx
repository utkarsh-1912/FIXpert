
'use client';
import { useEffect, useState } from 'react';
import { getQuote } from '@/app/actions/symbol-search.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, TrendingUp, TrendingDown, Newspaper } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

type QuoteData = Awaited<ReturnType<typeof getQuote>>;
type Period = '1d' | '5d' | '1m' | '6m' | '1y' | 'all';

const chartConfig = {
  price: {
    label: 'Price',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const DataPoint = ({ label, value }: { label: string; value: any; }) => (
    <div className="flex flex-col space-y-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
    </div>
);


export default function SymbolDashboardPage() {
  const params = useParams();
  const symbol = Array.isArray(params.symbol) ? params.symbol[0] : params.symbol;
  const [data, setData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<Period>('1y');
  const [showFullSummary, setShowFullSummary] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    const fetchData = async (period: Period) => {
      setLoading(true);
      const result = await getQuote(symbol as string, period);
      setData(result);
      setLoading(false);
    };
    fetchData(timeRange);
  }, [symbol, timeRange]);

  const chartData = (data?.history || [])
    .map(h => ({ date: h.date, price: h.close }))
    .filter(h => h.date && h.price);

  if (loading && !data) { // Show full-page loader only on initial load
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
  const priceColor = priceUp ? 'text-green-500' : 'text-red-500';

  const getDateFormat = (period: Period) => {
    switch (period) {
      case '1d':
        return 'HH:mm';
      case '5d':
      case '1m':
        return 'MMM dd';
      default:
        return 'MMM yyyy';
    }
  };
  
  const isSummaryLong = summary?.longBusinessSummary && summary.longBusinessSummary.length > 300;


  return (
    <div className="space-y-6">
      <Link href="/symbol-search" passHref>
        <Button variant="outline" className="hidden sm:inline-flex">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{quote.longName || quote.shortName} ({quote.symbol})</h1>
          <p className="text-muted-foreground">{quote.fullExchangeName}</p>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto">
          <p className={`text-4xl font-bold ${priceColor}`}>
            {quote.regularMarketPrice?.toFixed(2)}
          </p>
          <p className={`flex items-center sm:justify-end gap-2 text-lg ${priceColor}`}>
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <CardTitle>Price Chart</CardTitle>
                    <div className="flex items-center gap-1 mt-2 sm:mt-0">
                        {(['1d', '5d', '1m', '6m', '1y', 'all'] as Period[]).map(range => (
                            <Button key={range} variant={timeRange === range ? "secondary" : "ghost"} size="sm" onClick={() => setTimeRange(range)} disabled={loading}>
                                {range.toUpperCase()}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="h-[400px] w-full p-2 relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-card/50 z-10">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                )}
              <ChartContainer config={chartConfig} className="h-full w-full">
                {chartData && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={priceUp ? "hsl(var(--primary))" : "hsl(var(--destructive))"} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={priceUp ? "hsl(var(--primary))" : "hsl(var(--destructive))"} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => format(new Date(value), getDateFormat(timeRange))}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis orientation="right" tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
                      <Tooltip 
                        content={<ChartTooltipContent indicator="line" labelFormatter={(label, payload) => {
                            if (payload?.[0]?.payload?.date) {
                                return format(new Date(payload[0].payload.date), 'MMM dd, yyyy HH:mm');
                            }
                            return label;
                        }} formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />} 
                      />
                      <Area type="monotone" dataKey="price" stroke={priceUp ? "hsl(var(--primary))" : "hsl(var(--destructive))"} strokeWidth={2} fill="url(#chart-gradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    No chart data available for this time range.
                  </div>
                )}
              </ChartContainer>
            </CardContent>
          </Card>

           <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Newspaper className="h-6 w-6 text-primary" />
                        <CardTitle>Recent News</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-1">
                    {news && news.length > 0 ? (
                        news.slice(0, 5).map((item, index) => (
                            <Link key={index} href={item.link} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg hover:bg-muted/50">
                                <p className="font-semibold text-base hover:underline">{item.title}</p>
                                <p className="text-xs text-muted-foreground pt-1">{item.publisher} &bull; {format(new Date(item.providerPublishTime * 1000), 'MMM d, yyyy')}</p>
                            </Link>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground p-3">No recent news available for this symbol.</p>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Data</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <DataPoint label="Open" value={quote.regularMarketOpen?.toFixed(2) ?? 'N/A'} />
                <DataPoint label="Previous Close" value={quote.regularMarketPreviousClose?.toFixed(2) ?? 'N/A'} />
                <DataPoint label="Day High" value={quote.regularMarketDayHigh?.toFixed(2) ?? 'N/A'} />
                <DataPoint label="Day Low" value={quote.regularMarketDayLow?.toFixed(2) ?? 'N/A'} />
                <DataPoint label="52-Wk High" value={quote.fiftyTwoWeekHigh?.toFixed(2) ?? 'N/A'} />
                <DataPoint label="52-Wk Low" value={quote.fiftyTwoWeekLow?.toFixed(2) ?? 'N/A'} />
                <DataPoint label="Volume" value={quote.regularMarketVolume?.toLocaleString() ?? 'N/A'} />
                <DataPoint label="Market Cap" value={quote.marketCap?.toLocaleString() ?? 'N/A'} />
                <DataPoint label="P/E Ratio" value={quote.trailingPE?.toFixed(2) ?? 'N/A'} />
                <DataPoint label="EPS" value={quote.epsTrailingTwelveMonths?.toFixed(2) ?? 'N/A'} />
            </CardContent>
          </Card>
          
           {summary?.longBusinessSummary && (
                <Card>
                    <CardHeader>
                        <CardTitle>About {quote.shortName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-sm text-muted-foreground ${isSummaryLong && !showFullSummary ? 'line-clamp-6' : ''}`}>
                            {summary.longBusinessSummary}
                        </p>
                        {isSummaryLong && (
                            <Button variant="link" className="p-0 h-auto mt-2" onClick={() => setShowFullSummary(!showFullSummary)}>
                                {showFullSummary ? 'Show less' : 'Show more'}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
