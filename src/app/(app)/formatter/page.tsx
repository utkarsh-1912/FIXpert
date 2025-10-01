
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CodeXml, Braces } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const formatFixToXml = (fix: string, delimiter: string): string => {
  if (!fix.trim()) return '';
  const effectiveDelimiter = delimiter === '\\u0001' ? String.fromCharCode(1) : delimiter;
  const fields = fix.split(effectiveDelimiter);
  const xmlFields = fields.map(field => {
    const [tag, ...valueParts] = field.split('=');
    const value = valueParts.join('=');
    if (!tag || value === undefined) return '';
    return `  <field tag="${tag}">${value}</field>`;
  }).filter(Boolean).join('\n');
  return `<fix-message>\n${xmlFields}\n</fix-message>`;
};

const formatXml = (xml: string): string => {
    try {
        let formatted = '', indent = '';
        const tab = '  ';
        xml.split(/>\s*</).forEach(node => {
            if (node.match( /^\/\w/ )) indent = indent.substring(tab.length);
            formatted += indent + '<' + node + '>\r\n';
            if (node.match( /^<?\w[^>]*[^\/]$/ )) indent += tab;
        });
        return formatted.substring(1, formatted.length - 3);
    } catch (e) {
        return "Invalid XML content.";
    }
};

export default function FormatterPage() {
  const [rawMessage, setRawMessage] = useState('');
  const [xmlMessage, setXmlMessage] = useState('');
  const [rawXml, setRawXml] = useState('');
  const [formattedXml, setFormattedXml] = useState('');
  const [delimiter, setDelimiter] = useState('|');

  const handleFormatFix = () => {
    setXmlMessage(formatFixToXml(rawMessage, delimiter));
  };
  
  const handleFormatXml = () => {
    setFormattedXml(formatXml(rawXml));
  }

  useEffect(() => {
    handleFormatFix();
  }, [rawMessage, delimiter]);

  useEffect(() => {
    handleFormatXml();
  }, [rawXml]);

  return (
    <Tabs defaultValue="fix-to-xml">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="fix-to-xml">FIX to XML</TabsTrigger>
        <TabsTrigger value="xml-formatter">XML Formatter</TabsTrigger>
      </TabsList>
      <TabsContent value="fix-to-xml" className="mt-4">
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                <CardTitle>Raw FIX Message</CardTitle>
                <CardDescription>Enter a pipe-separated FIX message to format.</CardDescription>
                </CardHeader>
                <CardContent>
                <Textarea
                    value={rawMessage}
                    onChange={(e) => setRawMessage(e.target.value)}
                    rows={15}
                    className="font-code"
                    placeholder="8=FIX.4.2|9=123|35=D|11=ORDER1|55=GOOG|38=100"
                />
                </CardContent>
                <CardFooter className="flex-wrap gap-4">
                  <Button onClick={handleFormatFix}><CodeXml className="mr-2 h-4 w-4" />Format to XML</Button>
                  <div className="flex items-center gap-2">
                      <Label htmlFor="delimiter" className="shrink-0">Delimiter</Label>
                      <Input 
                          id="delimiter" 
                          value={delimiter}
                          onChange={(e) => setDelimiter(e.target.value)}
                          className="w-24 font-code"
                          placeholder="|"
                      />
                  </div>
                </CardFooter>
            </Card>
            <Card className="flex flex-col">
                <CardHeader>
                <CardTitle>XML Output</CardTitle>
                <CardDescription>Formatted FIX message in XML.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                <ScrollArea className="h-full max-h-[365px] w-full rounded-md border p-4">
                    <pre className="font-code text-sm text-accent-foreground">{xmlMessage}</pre>
                </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </TabsContent>
      <TabsContent value="xml-formatter" className="mt-4">
         <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                <CardTitle>Raw XML</CardTitle>
                <CardDescription>Paste raw XML content here to format it.</CardDescription>
                </CardHeader>
                <CardContent>
                <Textarea
                    value={rawXml}
                    onChange={(e) => setRawXml(e.target.value)}
                    rows={15}
                    className="font-code"
                    placeholder='<SerisableHashTable><isTuned>true</isTuned><price></price><compare><symbol>aapl</symbol></compare></SerisableHashTable>'
                />
                </CardContent>
                <CardFooter>
                <Button onClick={handleFormatXml}><Braces className="mr-2 h-4 w-4" />Format XML</Button>
                </CardFooter>
            </Card>
            <Card className="flex flex-col">
                <CardHeader>
                <CardTitle>Formatted XML</CardTitle>
                <CardDescription>Pretty-printed XML output.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                <ScrollArea className="h-full max-h-[365px] w-full rounded-md border p-4">
                    <pre className="font-code text-sm text-accent-foreground">{formattedXml}</pre>
                </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
