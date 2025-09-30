
'use client';

import { useState, ChangeEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Download, ArrowDownUp, CheckCircle, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

type LogLine = {
  timestamp: string;
  timestampObj: Date;
  content: string;
};

const extractTimestamp = (line: string): [Date | null, string] => {
  const match = line.match(/\[(\d{8}-\d{2}:\d{2}:\d{2}(?:\.\d{3})?)\]/);
  if (match && match[1]) {
    const tsStr = match[1];
    const [datePart, timePart] = tsStr.split('-');
    const year = parseInt(datePart.substring(0, 4), 10);
    const month = parseInt(datePart.substring(4, 6), 10) - 1;
    const day = parseInt(datePart.substring(6, 8), 10);
    
    const [hours, minutes, seconds] = timePart.split(':').map(part => parseFloat(part));

    // Handle milliseconds which might be undefined
    const ms = timePart.includes('.') ? parseInt(timePart.split('.')[1], 10) : 0;
    
    const date = new Date(year, month, day, hours, minutes, Math.floor(seconds));
    date.setMilliseconds(ms);

    if (!isNaN(date.getTime())) {
      return [date, line];
    }
  }
  // Fallback if no timestamp found
  return [new Date(0), line];
};


export default function LogProcessorPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processedLogs, setProcessedLogs] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
      setProcessedLogs('');
    }
  };

  const processLogs = useCallback(async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const allLines: LogLine[] = [];

    for (const file of files) {
      const content = await file.text();
      const lines = content.split('\n').filter(Boolean);
      for (const line of lines) {
        const [timestampObj, content] = extractTimestamp(line);
        if (timestampObj) {
            allLines.push({ timestamp: timestampObj.toISOString(), timestampObj, content });
        }
      }
    }

    allLines.sort((a, b) => {
      const timeA = a.timestampObj.getTime();
      const timeB = b.timestampObj.getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    setProcessedLogs(allLines.map(line => line.content).join('\n'));
    setIsProcessing(false);
  }, [files, sortOrder]);
  
  const downloadLogs = () => {
    const blob = new Blob([processedLogs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'processed_logs.log';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Log Processor</CardTitle>
          <CardDescription>Upload, sort, and download your FIX log files.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="log-files">1. Upload Log Files</Label>
            <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-border p-8 text-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Drag & drop files or click to select</p>
                <Input id="log-files" type="file" onChange={handleFileChange} multiple className="w-full max-w-sm" />
            </div>
             {files.length > 0 && (
              <div className="space-y-2 pt-4">
                <p className="font-medium text-sm">Selected files:</p>
                <ul className="list-disc list-inside text-muted-foreground text-sm">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center gap-2">
                        <FileText className="h-4 w-4"/> {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort-order">2. Set Processing Options</Label>
            <Select value={sortOrder} onValueChange={(v: 'asc' | 'desc') => setSortOrder(v)}>
              <SelectTrigger id="sort-order">
                <SelectValue placeholder="Select sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Sort by timestamp (Ascending)</SelectItem>
                <SelectItem value="desc">Sort by timestamp (Descending)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={processLogs} disabled={files.length === 0 || isProcessing}>
            <ArrowDownUp className="mr-2 h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Process Logs'}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Processed Output</CardTitle>
          <CardDescription>The sorted log content will appear here. You can then download it.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <ScrollArea className="h-full max-h-[calc(80vh-160px)] w-full">
            {processedLogs ? (
               <Textarea
                    value={processedLogs}
                    readOnly
                    rows={20}
                    className="font-code text-xs bg-muted/50"
                />
            ) : (
              <div className="flex h-full items-center justify-center rounded-md border border-dashed p-8">
                <div className="text-center text-muted-foreground">
                    <CheckCircle className="mx-auto h-12 w-12" />
                    <p className="mt-4">Processed logs will be shown here.</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter>
            <Button onClick={downloadLogs} disabled={!processedLogs}>
              <Download className="mr-2 h-4 w-4" />
              Download Processed File
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
