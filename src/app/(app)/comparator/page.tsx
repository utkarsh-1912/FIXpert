'use client';

import { useState, useMemo, ChangeEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const extractFixFromLog = (log: string): string => {
  const fixMatch = log.match(/8=FIX\..*?(?:\r\n|\n|$)/);
  return fixMatch ? fixMatch[0].trim().replace(/\|/g, '\n') : log.replace(/\|/g, '\n');
};

const parseFixToMap = (fix: string): Map<string, string> => {
    const fields = fix.split('\n').map(f => f.trim()).filter(Boolean);
    return new Map(fields.map(f => {
        const parts = f.split('=');
        const tag = parts[0];
        const value = parts.slice(1).join('=');
        return [tag, value];
    }));
}

const createDiff = (text1: string, text2: string, compareByTagOnly: boolean): [DiffPart[], DiffPart[]] => {
  const map1 = parseFixToMap(extractFixFromLog(text1));
  const map2 = parseFixToMap(extractFixFromLog(text2));
  
  const diffA: DiffPart[] = [];
  const diffB: DiffPart[] = [];

  const allTags = new Set([...map1.keys(), ...map2.keys()]);

  allTags.forEach(tag => {
    const val1 = map1.get(tag);
    const val2 = map2.get(tag);

    if (val1 !== undefined && val2 === undefined) {
      diffA.push({ value: `${tag}=${val1}`, type: 'removed' });
    } else if (val1 === undefined && val2 !== undefined) {
      diffB.push({ value: `${tag}=${val2}`, type: 'added' });
    } else if (val1 !== undefined && val2 !== undefined) {
      if (compareByTagOnly || val1 === val2) {
        diffA.push({ value: `${tag}=${val1}`, type: 'same' });
        diffB.push({ value: `${tag}=${val2}`, type: 'same' });
      } else {
        diffA.push({ value: `${tag}=${val1}`, type: 'changed' });
        diffB.push({ value: `${tag}=${val2}`, type: 'changed' });
      }
    }
  });

  return [diffA, diffB];
};

const DiffLine = ({ parts }: { parts: DiffPart[] }) => (
  <pre className="overflow-x-auto rounded-md border bg-card p-4">
    {parts.map((part, i) => {
      let className = '';
      if (part.type === 'added') className = 'bg-accent/20';
      if (part.type === 'removed') className = 'bg-destructive/20';
      if (part.type === 'changed') className = 'bg-yellow-500/20';
      
      return (
        <span key={i} className={className}>
          {part.value}
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
  const [compareByTagOnly, setCompareByTagOnly] = useState(false);
  
  const diffResult = useMemo(() => createDiff(msg1, msg2, compareByTagOnly), [msg1, msg2, compareByTagOnly]);

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
            <Button onClick={() => createDiff(msg1, msg2, compareByTagOnly)}><GitCompareArrows className="mr-2 h-4 w-4" />Compare Messages</Button>
        </CardContent>
      </Card>
      {diffResult && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Result</CardTitle>
            <CardDescription>Differences are highlighted. Red for removed, Teal for added, Yellow for changed.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 font-code text-sm">
            <DiffLine parts={diffResult[0]} />
            <DiffLine parts={diffResult[1]} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
