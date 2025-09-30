'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { GitCompareArrows, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type DiffPart = {
  value: string;
  type: 'same' | 'added' | 'removed' | 'changed';
};

type DiffResult = {
  a: DiffPart[];
  b: DiffPart[];
};

const extractFixFromLog = (log: string): string => {
  const fixMatch = log.match(/8=FIX\..*?(?:\r\n|\n|$)/);
  return fixMatch ? fixMatch[0].trim() : log;
};

const createDiff = (text1: string, text2: string, compareByTagOnly: boolean): DiffResult => {
  const msg1 = extractFixFromLog(text1);
  const msg2 = extractFixFromLog(text2);
  
  const fields1 = msg1.split('|').map(f => f.trim());
  const map1 = new Map(fields1.map(f => { const [tag, ...val] = f.split('='); return [tag, val.join('=')]; }));
  
  const fields2 = msg2.split('|').map(f => f.trim());
  const map2 = new Map(fields2.map(f => { const [tag, ...val] = f.split('='); return [tag, val.join('=')]; }));

  const res: DiffResult = { a: [], b: [] };

  fields1.forEach(field => {
    const [tag, val] = field.split('=');
    if (!map2.has(tag)) {
      res.a.push({ value: field, type: 'removed' });
    } else if (!compareByTagOnly && map2.get(tag) !== val) {
      res.a.push({ value: field, type: 'changed' });
    } else {
      res.a.push({ value: field, type: 'same' });
    }
  });

  fields2.forEach(field => {
    const [tag, val] = field.split('=');
    if (!map1.has(tag)) {
      res.b.push({ value: field, type: 'added' });
    } else if (!compareByTagOnly && map1.get(tag) !== val) {
      res.b.push({ value: field, type: 'changed' });
    } else {
      res.b.push({ value: field, type: 'same' });
    }
  });

  return res;
};

const DiffLine = ({ parts }: { parts: DiffPart[] }) => (
  <pre className="overflow-x-auto rounded-md border bg-card p-4">
    {parts.map((part, i) => {
      let className = '';
      if (part.type === 'added') className = 'bg-accent/20';
      if (part.type === 'removed') className = 'bg-destructive/20';
      if (part.type === 'changed') className = 'bg-yellow-500/20';
      
      return (
        <span key={i}>
          <span className={className}>{part.value}</span>
          {i < parts.length - 1 && <span className="text-muted-foreground"> | </span>}
        </span>
      );
    })}
  </pre>
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
  const [msg1, setMsg1] = useState('8=FIX.4.2|9=123|35=D|11=ORDER1|55=GOOG|54=1|38=100|40=2');
  const [msg2, setMsg2] = useState('8=FIX.4.2|9=123|35=G|11=ORDER1|41=ORDER1-OLD|55=GOOG|54=1|38=150|40=2');
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [compareByTagOnly, setCompareByTagOnly] = useState(false);
  
  const handleCompare = () => {
    setDiffResult(createDiff(msg1, msg2, compareByTagOnly));
  };
  
  useEffect(() => {
    handleCompare();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareByTagOnly]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Message A</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="text">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">Text Input</TabsTrigger>
                    <TabsTrigger value="file">File Upload</TabsTrigger>
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
            <CardTitle>Message B</CardTitle>
          </CardHeader>
          <CardContent>
             <Tabs defaultValue="text">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">Text Input</TabsTrigger>
                    <TabsTrigger value="file">File Upload</TabsTrigger>
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
      {diffResult && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Result</CardTitle>
            <CardDescription>Differences are highlighted. Red for removed, Teal for added, Yellow for changed.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 font-code text-sm">
            <DiffLine parts={diffResult.a} />
            <DiffLine parts={diffResult.b} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
