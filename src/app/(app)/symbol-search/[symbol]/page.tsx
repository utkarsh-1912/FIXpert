
'use client';
import { useEffect, useState } from 'react';
import { getQuote } from '@/app/actions/symbol-search.actions';
import { generateFinancialInsight } from '@/ai/flows/generate-financial-insight';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, TrendingUp, TrendingDown, Newspaper, Lightbulb, Link as LinkIcon, Users } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


type QuoteData = Awaited<ReturnType<typeof getQuote>>;
type Period = '1d' | '5d' | '1m' | '6m' | '1y' | 'all';
type FinancialInsight = Awaited<ReturnType<typeof generateFinancialInsight>>;

const chartConfig = {
  price: {
    label: 'Price',
  },
} satisfies ChartConfig;

const DataPoint = ({ label, value }: { label: string; value: any; }) => (
    <div className="flex flex-col space-y-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
    </div>
);

function AIFinancialInsight({ symbolData }: { symbolData: QuoteData }) {
  const [insight, setInsight] = useState<FinancialInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsight() {
      if (!symbolData || !symbolData.quote || !symbolData.summary) return;
      setLoading(true);
      try {
        const result = await generateFinancialInsight({
          symbol: symbolData.quote.symbol,
          companyName: symbolData.quote.longName || symbolData.quote.shortName || '',
          country: symbolData.summary.assetProfile?.country,
          sector: symbolData.summary.assetProfile?.sector,
          summary: symbolData.summary.assetProfile?.longBusinessSummary,
        });
        setInsight(result);
      } catch (error) {
        console.error("Failed to generate financial insight:", error);
        setInsight({ insight: "Could not generate AI insight at this time." });
      } finally {
        setLoading(false);
      }
    }
    fetchInsight();
  }, [symbolData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Lightbulb className="h-6 w-6 text-primary" />
          <CardTitle>AI Financial Insight</CardTitle>
        </div>
        <CardDescription>AI-generated analysis based on current market data.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>Generating analysis...</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{insight?.insight}</p>
        )}
      </CardContent>
    </Card>
  );
}


export default function SymbolDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const rawSymbol = Array.isArray(params.symbol) ? params.symbol[0] : params.symbol;
  const symbol = rawSymbol ? decodeURIComponent(rawSymbol) : '';
  const [data, setData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<Period>('1y');
  const [showFullSummary, setShowFullSummary] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    const fetchData = async (period: Period) => {
      setLoading(true);
      const result = await getQuote(symbol, period);
      setData(result);
      setLoading(false);
    };
    fetchData(timeRange);
  }, [symbol, timeRange]);

  const chartData = (data?.history || [])
    .map(h => ({ date: h.date, price: h.close}))
    .filter(h => h.date && h.price !== null && h.price !== undefined);

  if (loading && !data) { // Show full-page loader only on initial load
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || !data.quote) {
    return (
      <div className="text-center">
        <p className="text-destructive mb-4">Failed to load data for symbol: {symbol}.</p>
        <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
        </Button>
      </div>
    );
  }

  const { quote, news, summary, recommendations } = data;
  const priceUp = (quote.regularMarketChange ?? 0) > 0;
  const priceNeutral = (quote.regularMarketChange ?? 0) === 0;
  
  const priceColor = priceUp ? 'text-green-500' : priceNeutral ? 'text-primary' : 'text-red-500';
  const chartColor = priceUp ? 'hsl(142.1 76.2% 36.3%)' : priceNeutral ? 'hsl(var(--muted))' : 'hsl(0 84.2% 60.2%)';

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
  
  const isSummaryLong = summary?.assetProfile?.longBusinessSummary && summary.assetProfile.longBusinessSummary.length > 300;


  return (
    <div className="space-y-6">
        <div className="flex items-center">
            <Link href="/symbol-search" passHref>
            <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Search
            </Button>
            </Link>
        </div>

        <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">{quote.longName || quote.shortName}</h1>
            <p className="text-lg text-muted-foreground font-medium">Symbol: {quote.symbol}</p>
            <div className="flex items-end gap-4 mt-2">
                <p className={`text-4xl font-bold ${priceColor}`}>
                    {quote.regularMarketPrice?.toFixed(2)}
                    {quote.currency && <span className="ml-2 text-2xl text-muted-foreground">{quote.currency}</span>}
                </p>
                <p className={`flex items-center gap-2 text-lg font-medium ${priceColor} mb-1`}>
                    {priceUp ? <TrendingUp /> : <TrendingDown />}
                    {quote.regularMarketChange?.toFixed(2)} ({quote.regularMarketChangePercent?.toFixed(2)}%)
                </p>
            </div>
            <p className="text-muted-foreground">{quote.fullExchangeName}</p>
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
            <CardContent className="h-[400px] w-full relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-card/50 z-10">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                )}
              <div className="h-full w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                {chartData && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`chart-gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColor} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={chartColor} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => format(new Date(value), getDateFormat(timeRange))}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
                      <Tooltip 
                        content={
                            <ChartTooltipContent 
                                indicator="line"
                                className="border-l-4"
                                style={{
                                    borderLeftColor: chartColor,
                                }}
                                formatter={(value, name, item) => (
                                    <div className="grid gap-1.5">
                                        <div className="flex justify-between items-center gap-4">
                                            <span className="text-muted-foreground">Price:</span>
                                            <span className="font-bold">{typeof value === 'number' ? value.toFixed(2) : value}</span>
                                        </div>
                                        {item.payload.date && (
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-muted-foreground">Date:</span>
                                                <span className="font-bold">{format(new Date(item.payload.date), 'MMM dd, yyyy HH:mm')}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            />
                        }
                      />
                      <Area type="monotone" dataKey="price" stroke={chartColor} strokeWidth={2} fill={`url(#chart-gradient-${symbol})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    No chart data available for this time range.
                  </div>
                )}
              </ChartContainer>
              </div>
            </CardContent>
          </Card>
            {data && <AIFinancialInsight symbolData={data} />}
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
                <DataPoint label="Day Low" value={quote.regularMarketDayLow?.toFixed(2) ?? 'NA'} />
                <DataPoint label="52-Wk High" value={quote.fiftyTwoWeekHigh?.toFixed(2) ?? 'N/A'} />
                <DataPoint label="52-Wk Low" value={quote.fiftyTwoWeekLow?.toFixed(2) ?? 'N/A'} />
                <DataPoint label="Volume" value={quote.regularMarketVolume?.toLocaleString() ?? 'N/A'} />
                <DataPoint label="Market Cap" value={quote.marketCap?.toLocaleString() ?? 'N/A'} />
                <DataPoint label="P/E Ratio" value={quote.trailingPE?.toFixed(2) ?? 'N/A'} />
                <DataPoint label="EPS" value={quote.epsTrailingTwelveMonths?.toFixed(2) ?? 'N/A'} />
            </CardContent>
          </Card>
          
           {recommendations && recommendations.length > 0 && (
                <Card>
                    <CardHeader>
                         <div className="flex items-center gap-3">
                            <Users className="h-6 w-6 text-primary" />
                            <CardTitle>Related Symbols</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {recommendations.map(rec => (
                           <Link key={rec.symbol} href={`/symbol-search/${encodeURIComponent(rec.symbol)}`} passHref>
                                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">
                                    <LinkIcon className="h-3 w-3 mr-1.5" />
                                    {rec.symbol}
                                </Badge>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            )}

           {summary?.assetProfile?.longBusinessSummary && (
                <Card>
                    <CardHeader>
                        <CardTitle>About {quote.shortName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-sm text-muted-foreground ${isSummaryLong && !showFullSummary ? 'line-clamp-6' : ''}`}>
                            {summary.assetProfile.longBusinessSummary}
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
