'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

type FixMessage = {
  timestamp: string;
  msgType: string;
  sender: string;
  target: string;
  orderId: string;
  raw: string;
};

const getTagValue = (msg: string, tag: string) => {
  const match = msg.match(new RegExp(`\\b${tag}=([^|]+)`));
  return match ? match[1] : '';
};

const parseLogs = (logs: string): FixMessage[] => {
  return logs.split('\n').filter(Boolean).map(line => {
    const timestampMatch = line.match(/\[(.*?)\]/);
    const raw = line.substring(timestampMatch ? timestampMatch[0].length : 0).trim();
    return {
      timestamp: timestampMatch ? timestampMatch[1] : 'N/A',
      msgType: getTagValue(raw, '35'),
      sender: getTagValue(raw, '49'),
      target: getTagValue(raw, '56'),
      orderId: getTagValue(raw, '11'),
      raw: raw,
    };
  });
};

const msgTypeMap: { [key: string]: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } } = {
  'D': { label: 'New Order', variant: 'default' },
  '8': { label: 'Execution Report', variant: 'secondary' },
  '9': { label: 'Order Cancel Reject', variant: 'destructive' },
  'F': { label: 'Cancel Request', variant: 'outline' },
};

export default function LogAnalyzerPage() {
  const [logs, setLogs] = useState('');
  const [parsedLogs, setParsedLogs] = useState<FixMessage[]>([]);
  const [filter, setFilter] = useState('');

  const handleParse = () => {
    setParsedLogs(parseLogs(logs));
  };

  const filteredLogs = useMemo(() => {
    if (!filter) return parsedLogs;
    return parsedLogs.filter(log =>
      log.raw.toLowerCase().includes(filter.toLowerCase())
    );
  }, [parsedLogs, filter]);
  
  useEffect(() => {
    handleParse();
  }, [logs]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Log Input</CardTitle>
          <CardDescription>Paste your FIX log content here. One message per line.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
            rows={8}
            className="font-code"
            placeholder={'[20240725-10:00:00.123] 8=FIX.4.2|9=154|35=D|...'}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleParse}>Analyze Logs</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Analyzed Logs</CardTitle>
          <CardDescription>Filter and view parsed log messages.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Filter messages by any tag or value..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Msg Type</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium font-code text-xs">{log.timestamp}</TableCell>
                    <TableCell>
                      <Badge variant={msgTypeMap[log.msgType]?.variant || 'outline'}>
                        {msgTypeMap[log.msgType]?.label || `Unknown (${log.msgType})`}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.sender}</TableCell>
                    <TableCell>{log.target}</TableCell>
                    <TableCell>{log.orderId}</TableCell>
                    <TableCell className="truncate max-w-xs text-muted-foreground text-xs font-code">{log.raw}</TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && (
                   <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
