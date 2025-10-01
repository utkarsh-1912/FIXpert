
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { interpretFixMessage, type InterpretFixMessageOutput } from '@/ai/flows/interpret-fix-message';
import { Wand2, Loader2, ListCollapse, MessageSquareText } from 'lucide-react';
import { useNotificationStore } from '@/stores/notification-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const formatFixTimestamp = (ts: string) => {
    if (!ts || ts.length < 17) return ts;
    try {
        const year = ts.substring(0, 4);
        const month = ts.substring(4, 6);
        const day = ts.substring(6, 8);
        const time = ts.substring(9);
        return `${year}-${month}-${day} ${time}`;
    } catch {
        return ts;
    }
}

const parseLogs = (logs: string): FixMessage[] => {
  return logs.split('\n').filter(Boolean).map(line => {
    const raw = line.trim();
    const sendingTime = getTagValue(raw, '52');
    return {
      timestamp: sendingTime ? formatFixTimestamp(sendingTime) : 'N/A',
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
  'G': { label: 'Cancel/Replace Request', variant: 'outline'},
};

export default function LogAnalyzerPage() {
  const [logs, setLogs] = useState('');
  const [parsedLogs, setParsedLogs] = useState<FixMessage[]>([]);
  
  // State for filters
  const [msgTypeFilter, setMsgTypeFilter] = useState<string>('all');
  const [senderFilter, setSenderFilter] = useState<string>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');
  const [detailsFilter, setDetailsFilter] = useState('');

  // State for modal
  const [selectedLog, setSelectedLog] = useState<FixMessage | null>(null);
  const [interpretation, setInterpretation] = useState<InterpretFixMessageOutput | null>(null);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [interpretationError, setInterpretationError] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();


  const handleParse = () => {
    setParsedLogs(parseLogs(logs));
  };

  const filteredLogs = useMemo(() => {
    return parsedLogs.filter(log => {
        const msgTypeMatch = msgTypeFilter === 'all' || log.msgType === msgTypeFilter;
        const senderMatch = senderFilter === 'all' || log.sender === senderFilter;
        const targetMatch = targetFilter === 'all' || log.target === targetFilter;
        const detailsMatch = !detailsFilter || log.raw.toLowerCase().includes(detailsFilter.toLowerCase());
        return msgTypeMatch && senderMatch && targetMatch && detailsMatch;
    });
  }, [parsedLogs, msgTypeFilter, senderFilter, targetFilter, detailsFilter]);

  const { msgTypes, senders, targets } = useMemo(() => {
    const msgTypes = new Set<string>();
    const senders = new Set<string>();
    const targets = new Set<string>();
    parsedLogs.forEach(log => {
      if (log.msgType) msgTypes.add(log.msgType);
      if (log.sender) senders.add(log.sender);
      if (log.target) targets.add(log.target);
    });
    return { 
        msgTypes: Array.from(msgTypes), 
        senders: Array.from(senders), 
        targets: Array.from(targets) 
    };
  }, [parsedLogs]);
  
  useEffect(() => {
    handleParse();
  }, [logs]);

  const handleRowClick = (log: FixMessage) => {
    setSelectedLog(log);
    setInterpretation(null);
    setIsInterpreting(false);
    setInterpretationError(null);
  };

  const handleInterpret = async () => {
    if (!selectedLog) return;
    setIsInterpreting(true);
    setInterpretationError(null);

    try {
        const result = await interpretFixMessage({ rawFixMessage: selectedLog.raw });
        setInterpretation(result);
        addNotification({
            icon: Wand2,
            title: 'Interpretation Complete',
            description: 'Successfully interpreted the FIX message.',
        });
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        setInterpretationError(`Failed to interpret message: ${errorMessage}`);
    } finally {
        setIsInterpreting(false);
    }
  };

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
            placeholder={'8=FIX.4.2|9=154|35=D|49=SENDER|56=TARGET|52=20240725-10:00:00.123|...'}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleParse}>Analyze Logs</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Analyzed Logs</CardTitle>
          <CardDescription>Filter and view parsed log messages. Click a row to see details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
             <Select value={msgTypeFilter} onValueChange={setMsgTypeFilter} disabled={msgTypes.length === 0}>
                <SelectTrigger><SelectValue placeholder="Filter by Msg Type" /></SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All Message Types</SelectItem>
                {msgTypes.map(mt => <SelectItem key={mt} value={mt}>{msgTypeMap[mt]?.label || `Unknown (${mt})`}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={senderFilter} onValueChange={setSenderFilter} disabled={senders.length === 0}>
                <SelectTrigger><SelectValue placeholder="Filter by Sender" /></SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All Senders</SelectItem>
                {senders.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={targetFilter} onValueChange={setTargetFilter} disabled={targets.length === 0}>
                <SelectTrigger><SelectValue placeholder="Filter by Target" /></SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All Targets</SelectItem>
                {targets.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
            </Select>
            <Input
                placeholder="Filter by raw details..."
                value={detailsFilter}
                onChange={(e) => setDetailsFilter(e.target.value)}
                className="lg:col-span-1"
            />
          </div>
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead className="w-[200px]">Timestamp (Tag 52)</TableHead>
                  <TableHead>Msg Type</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <TableRow key={index} onClick={() => handleRowClick(log)} className="cursor-pointer">
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

        {selectedLog && (
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>FIX Message Details</DialogTitle>
                        <DialogDescription>
                            Detailed breakdown of the selected FIX message.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Raw Message</CardTitle>
                            </CardHeader>
                            <CardContent className="font-code text-sm bg-muted/50 p-4 rounded-md break-all">
                                {selectedLog.raw}
                            </CardContent>
                        </Card>

                        {!interpretation && !isInterpreting && !interpretationError && (
                            <Button onClick={handleInterpret} className="w-full">
                                <Wand2 className="mr-2 h-4 w-4" />
                                Interpret with AI
                            </Button>
                        )}
                        
                        {isInterpreting && (
                            <div className="flex justify-center items-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        )}

                        {interpretationError && (
                             <div className="text-destructive text-center p-4">
                                {interpretationError}
                            </div>
                        )}

                        {interpretation && (
                             <Card>
                                <CardHeader className="flex-row items-center gap-4 space-y-0">
                                    <MessageSquareText className="h-6 w-6 text-primary" />
                                    <div className='space-y-1'>
                                        <CardTitle className="text-lg">{interpretation.summary.messageType}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{interpretation.summary.purpose}</p>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tag</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Value</TableHead>
                                                <TableHead>Meaning</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {interpretation.fields.map((field) => (
                                                <TableRow key={field.tag}>
                                                    <TableCell className="font-mono">{field.tag}</TableCell>
                                                    <TableCell className="font-semibold">{field.name}</TableCell>
                                                    <TableCell className="font-mono">{field.value}</TableCell>
                                                    <TableCell>{field.meaning}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        )}
    </div>
  );
}
