'use client';

import { useState, useMemo, ChangeEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { GitCompareArrows, Upload, FileText, Type } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

type DiffPart = {
  value: string;
  type: 'same' | 'added' | 'removed';
};

type ComparisonResult = {
  line: number;
  messageA: string;
  messageB: string;
  diffA: DiffPart[];
  diffB: DiffPart[];
};

const parseFixToMap = (fix: string): Map<string, string> => {
    return new Map(fix.split('|').map(f => {
        const parts = f.split('=');
        return [parts[0], parts.slice(1).join('=')];
    }).filter(p => p[0]));
};

const createLineDiff = (text1: string, text2: string, compareByTagOnly: boolean): [DiffPart[], DiffPart[]] => {
  const map1 = parseFixToMap(text1);
  const map2 = parseFixToMap(text2);
  const diffA: DiffPart[] = [];
  const diffB: DiffPart[] = [];
  const allTags = new Set([...map1.keys(), ...map2.keys()]);

  allTags.forEach(tag => {
    const val1 = map1.get(tag);
    const val2 = map2.get(tag);

    if (val1 !== undefined && val2 !== undefined) {
      if (compareByTagOnly || val1 === val2) {
        diffA.push({ value: `${tag}=${val1}`, type: 'same' });
        diffB.push({ value: `${tag}=${val2}`, type: 'same' });
      } else {
        diffA.push({ value: `${tag}=${val1}`, type: 'removed' }); // Changed becomes 'removed' in A
        diffB.push({ value: `${tag}=${val2}`, type: 'added' });   // and 'added' in B
      }
    } else if (val1 !== undefined) {
      diffA.push({ value: `${tag}=${val1}`, type: 'removed' });
    } else if (val2 !== undefined) {
      diffB.push({ value: `${tag}=${val2}`, type: 'added' });
    }
  });

  return [diffA, diffB];
};

const DiffLine = ({ parts }: { parts: DiffPart[] }) => (
  <div className="font-code text-xs">
    {parts.map((part, i) => {
      let className = "px-1 py-0.5 rounded";
      if (part.type === 'added') className += ' bg-accent/20';
      if (part.type === 'removed') className += ' bg-destructive/20';
      return <span key={i} className={className}>{part.value}</span>;
    }).reduce((prev, curr, i) => [prev, <span key={`sep-${i}`} className="text-muted-foreground"> | </span>, curr] as any)}
  </div>
);

const FileUploader = ({ onFileUpload }: { onFileUpload: (content: string) => void }) => {
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const content = await file.text();
      onFileUpload(content);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-border p-8 text-center">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground">Drag & drop a file or click to select</p>
        <Input type="file" onChange={handleFileChange} className="w-full max-w-sm" />
    </div>
  );
};


export default function ComparatorPage() {
  const [msg1, setMsg1] = useState('8=FIX.4.2|9=123|35=D|11=ORDER1|55=GOOG|54=1|38=100|40=2\n8=FIX.4.2|9=124|35=D|11=ORDER2|55=MSFT|54=1|38=200|40=2');
  const [msg2, setMsg2] = useState('8=FIX.4.2|9=123|35=D|11=ORDER1|55=GOOG|54=1|38=150|40=2\n8=FIX.4.2|9=125|35=G|11=ORDER2|41=ORDER2OLD|55=MSFT|54=1|38=200|40=2');
  const [compareByTagOnly, setCompareByTagOnly] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResult[]>([]);
  
  const handleCompare = useCallback(() => {
    const lines1 = msg1.split('\n').filter(Boolean);
    const lines2 = msg2.split('\n').filter(Boolean);
    const newComparison: ComparisonResult[] = [];
    const maxLines = Math.max(lines1.length, lines2.length);

    for (let i = 0; i < maxLines; i++) {
      const lineA = lines1[i] || '';
      const lineB = lines2[i] || '';
      const [diffA, diffB] = createLineDiff(lineA, lineB, compareByTagOnly);
      newComparison.push({ line: i + 1, messageA: lineA, messageB: lineB, diffA, diffB });
    }
    setComparison(newComparison);
  }, [msg1, msg2, compareByTagOnly]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Message Set A</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="text">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text"><Type className="mr-2 h-4 w-4"/>Text Input</TabsTrigger>
                    <TabsTrigger value="file"><FileText className="mr-2 h-4 w-4"/>File Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="mt-4">
                    <Textarea value={msg1} onChange={e => setMsg1(e.target.value)} rows={10} className="font-code" />
                </TabsContent>
                <TabsContent value="file" className="mt-4">
                    <FileUploader onFileUpload={setMsg1} />
                </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Message Set B</CardTitle>
          </CardHeader>
          <CardContent>
             <Tabs defaultValue="text">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text"><Type className="mr-2 h-4 w-4"/>Text Input</TabsTrigger>
                    <TabsTrigger value="file"><FileText className="mr-2 h-4 w-4"/>File Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="mt-4">
                    <Textarea value={msg2} onChange={e => setMsg2(e.target.value)} rows={10} className="font-code" />
                </TabsContent>
                <TabsContent value="file" className="mt-4">
                    <FileUploader onFileUpload={setMsg2} />
                </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
       <Card>
        <CardContent className="flex items-center justify-center space-x-4 p-4">
            <div className="flex items-center space-x-2">
                <Switch id="compare-mode" checked={compareByTagOnly} onCheckedChange={setCompareByTagOnly} />
                <Label htmlFor="compare-mode">Compare by Tags Only</Label>
            </div>
            <Button onClick={handleCompare}><GitCompareArrows className="mr-2 h-4 w-4" />Compare Messages</Button>
        </CardContent>
      </Card>
      {comparison.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Result</CardTitle>
            <CardDescription>Differences are highlighted. Red for removed/changed in A, Blue for added/changed in B.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] w-full">
              <Table className="font-code text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Line</TableHead>
                    <TableHead>Message A</TableHead>
                    <TableHead>Message B</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparison.map(({ line, diffA, diffB }) => (
                    <TableRow key={line}>
                      <TableCell className="text-center font-sans text-muted-foreground">{line}</TableCell>
                      <TableCell><DiffLine parts={diffA} /></TableCell>
                      <TableCell><DiffLine parts={diffB} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
