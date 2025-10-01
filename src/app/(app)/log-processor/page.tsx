
'use client';

import { useState, ChangeEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Download, ArrowDownUp, CheckCircle, FileText, FileCog } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNotificationStore } from '@/stores/notification-store';

type LogLine = {
  timestamp: string;
  timestampObj: Date;
  content: string;
};

type ProcessedFile = {
  name: string;
  sortedContent: string;
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

    const ms = timePart.includes('.') ? parseInt(timePart.split('.')[1], 10) : 0;
    
    const date = new Date(year, month, day, hours, minutes, Math.floor(seconds));
    date.setMilliseconds(ms);

    if (!isNaN(date.getTime())) {
      return [date, line];
    }
  }
  return [new Date(0), line]; // Fallback for sorting lines without timestamps
};


export default function LogProcessorPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isProcessing, setIsProcessing] = useState(false);
  const { addNotification } = useNotificationStore();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
      setProcessedFiles([]);
    }
  };

  const processLogs = useCallback(async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const newProcessedFiles: ProcessedFile[] = [];

    for (const file of files) {
      const content = await file.text();
      const lines = content.split('\n').filter(Boolean);
      const logLines: LogLine[] = lines.map(line => {
        const [timestampObj, content] = extractTimestamp(line);
        return { timestamp: timestampObj?.toISOString() ?? '', timestampObj: timestampObj ?? new Date(0), content };
      });

      logLines.sort((a, b) => {
        const timeA = a.timestampObj.getTime();
        const timeB = b.timestampObj.getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      });
      
      newProcessedFiles.push({
        name: file.name,
        sortedContent: logLines.map(line => line.content).join('\n'),
      });
    }

    setProcessedFiles(newProcessedFiles);
    setIsProcessing(false);
    addNotification({
      icon: FileCog,
      title: 'Logs Processed',
      description: `Successfully processed and sorted ${files.length} log file(s).`,
    });
  }, [files, sortOrder, addNotification]);
  
  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sorted-${filename}`;
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
          <CardDescription>Upload, sort, and download your FIX log files individually.</CardDescription>
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
            {isProcessing ? 'Processing...' : `Process ${files.length} File(s)`}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Processed Output</CardTitle>
          <CardDescription>The sorted log content for each file will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <ScrollArea className="h-full max-h-[calc(80vh-160px)] w-full">
            {processedFiles.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                  {processedFiles.map((file, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>
                            <div className="flex items-center gap-2">
                                <FileCog className="h-4 w-4 text-primary" />
                                <span className="font-medium">{file.name}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <div className="space-y-4">
                             <Textarea
                                value={file.sortedContent}
                                readOnly
                                rows={10}
                                className="font-code text-xs bg-muted/50 h-64"
                              />
                              <Button onClick={() => downloadFile(file.name, file.sortedContent)} size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Download {file.name}
                              </Button>
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
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
      </Card>
    </div>
  );
}
