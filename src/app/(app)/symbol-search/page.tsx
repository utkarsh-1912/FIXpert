'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const mockSymbols = [
  { symbol: 'AAPL', name: 'Apple Inc.', assetClass: 'Stock', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', assetClass: 'Stock', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', assetClass: 'Stock', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', assetClass: 'Stock', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', assetClass: 'Stock', exchange: 'NASDAQ' },
  { symbol: 'EUR/USD', name: 'Euro to US Dollar', assetClass: 'Forex', exchange: 'FX' },
  { symbol: 'GBP/USD', name: 'Pound Sterling to US Dollar', assetClass: 'Forex', exchange: 'FX' },
  { symbol: 'USD/JPY', name: 'US Dollar to Japanese Yen', assetClass: 'Forex', exchange: 'FX' },
  { symbol: 'BTC/USD', name: 'Bitcoin to US Dollar', assetClass: 'Crypto', exchange: 'CRYPTO' },
  { symbol: 'ETH/USD', name: 'Ethereum to US Dollar', assetClass: 'Crypto', exchange: 'CRYPTO' },
  { symbol: 'ESU24', name: 'E-mini S&P 500 Futures', assetClass: 'Futures', exchange: 'CME' },
  { symbol: 'NQU24', name: 'E-mini NASDAQ 100 Futures', assetClass: 'Futures', exchange: 'CME' },
  { symbol: 'CLV24', name: 'Crude Oil WTI Futures', assetClass: 'Commodity', exchange: 'NYMEX' },
  { symbol: 'GCZ24', name: 'Gold Futures', assetClass: 'Commodity', exchange: 'COMEX' },
];

export default function SymbolSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const searchResults = useMemo(() => {
    if (!searchTerm) return mockSymbols;
    const lowercasedFilter = searchTerm.toLowerCase();
    return mockSymbols.filter(
      ({ symbol, name, assetClass }) =>
        symbol.toLowerCase().includes(lowercasedFilter) ||
        name.toLowerCase().includes(lowercasedFilter) ||
        assetClass.toLowerCase().includes(lowercasedFilter)
    );
  }, [searchTerm]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Symbol Search</CardTitle>
        <CardDescription>Find trading symbols by name, ticker, or asset class.</CardDescription>
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
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <TableRow key={item.symbol}>
                    <TableCell className="font-medium">{item.symbol}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.assetClass}</Badge>
                    </TableCell>
                    <TableCell>{item.exchange}</TableCell>
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
