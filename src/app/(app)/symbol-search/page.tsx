
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

type StockData = Partial<Quote> & {
  symbol: string;
  name?: string;
  assetClass?: string;
  exchange?: string;
};

export default function SymbolSearchPage() {
  const [searchTerm, setSearchTerm] = useState('AAPL');
  const [searchResults, setSearchResults] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
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
      handleSearch(searchTerm);
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, handleSearch]);

  const shouldShowValue = (value?: string) => {
    if (!value) return false;
    const lowerCaseValue = value.toLowerCase();
    return lowerCaseValue !== 'n/a' && lowerCaseValue !== 'unknown';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Symbol Search</CardTitle>
        <CardDescription>Find real-time trading symbols by name or ticker using Yahoo Finance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for symbols (e.g., AAPL, Bitcoin, Forex...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
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
              ) : searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <TableRow key={item.symbol}>
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
                    No symbols found for &quot;{searchTerm}&quot;.
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
