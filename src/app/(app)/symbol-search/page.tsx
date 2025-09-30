
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Quote } from 'yahoo-finance2/dist/esm/src/modules/quote';
import { searchQuotes } from '@/app/actions/symbol-search.actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

type StockData = Partial<Quote> & {
  symbol: string;
  name?: string;
  assetClass?: string;
  exchange?: string;
};

export default function SymbolSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assetClassFilter, setAssetClassFilter] = useState<string>('all');
  const [exchangeFilter, setExchangeFilter] = useState<string>('all');
  const router = useRouter();

  const handleSearch = useCallback(async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    setAssetClassFilter('all');
    setExchangeFilter('all');
    try {
      const results = await searchQuotes(query);
      const mappedResults: StockData[] = results.map(r => ({
          symbol: r.symbol,
          name: r.longname || r.shortname,
          assetClass: r.quoteType,
          exchange: r.exchDisp || r.exchange,
      }));
      setSearchResults(mappedResults);
    } catch (error) {
      console.error("Failed to fetch stock data", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, handleSearch]);

  const { assetClasses, exchanges } = useMemo(() => {
    const assetClasses = new Set<string>();
    const exchanges = new Set<string>();
    searchResults.forEach(item => {
      if (item.assetClass) assetClasses.add(item.assetClass);
      if (item.exchange) exchanges.add(item.exchange);
    });
    return { assetClasses: Array.from(assetClasses), exchanges: Array.from(exchanges) };
  }, [searchResults]);

  const filteredResults = useMemo(() => {
    return searchResults.filter(item => {
      const assetClassMatch = assetClassFilter === 'all' || item.assetClass === assetClassFilter;
      const exchangeMatch = exchangeFilter === 'all' || item.exchange === exchangeFilter;
      return assetClassMatch && exchangeMatch;
    });
  }, [searchResults, assetClassFilter, exchangeFilter]);

  const shouldShowValue = (value?: string) => {
    if (!value) return false;
    const lowerCaseValue = value.toLowerCase();
    return lowerCaseValue !== 'n/a' && lowerCaseValue !== 'unknown';
  }
  
  const handleRowClick = (symbol: string) => {
    router.push(`/symbol-search/${encodeURIComponent(symbol)}`);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Symbol Search</CardTitle>
        <CardDescription>Find real-time trading symbols by name or ticker using Yahoo Finance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for symbols... e.g. AAPL"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={assetClassFilter} onValueChange={setAssetClassFilter} disabled={assetClasses.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Asset Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Asset Classes</SelectItem>
              {assetClasses.map(ac => <SelectItem key={ac} value={ac}>{ac}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={exchangeFilter} onValueChange={setExchangeFilter} disabled={exchanges.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Exchange" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exchanges</SelectItem>
              {exchanges.map(ex => <SelectItem key={ex} value={ex}>{ex}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className="h-[60vh] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Asset Class</TableHead>
                <TableHead>Exchange</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : filteredResults.length > 0 ? (
                filteredResults.map((item, index) => (
                  <TableRow key={`${item.symbol}-${index}`} onClick={() => handleRowClick(item.symbol)} className="cursor-pointer">
                    <TableCell className="font-medium">{item.symbol}</TableCell>
                    <TableCell>{shouldShowValue(item.name) ? item.name : ''}</TableCell>
                    <TableCell>
                      {shouldShowValue(item.assetClass) && <Badge variant="outline">{item.assetClass}</Badge>}
                    </TableCell>
                    <TableCell>{shouldShowValue(item.exchange) ? item.exchange : ''}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No symbols found {searchTerm ? `for "${searchTerm}"` : "for your search"}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
