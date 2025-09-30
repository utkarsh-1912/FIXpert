'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CodeXml } from 'lucide-react';

const formatToXml = (fix: string): string => {
  if (!fix.trim()) return '';
  const fields = fix.split('|');
  const xmlFields = fields.map(field => {
    const [tag, ...valueParts] = field.split('=');
    const value = valueParts.join('=');
    if (!tag || value === undefined) return '';
    return `  <field tag="${tag}">${value}</field>`;
  }).filter(Boolean).join('\n');
  return `<fix-message>\n${xmlFields}\n</fix-message>`;
};

export default function FormatterPage() {
  const [rawMessage, setRawMessage] = useState('8=FIX.4.2|9=123|35=D|11=ORDER1|55=GOOG|38=100');
  const [xmlMessage, setXmlMessage] = useState('');

  const handleFormat = () => {
    setXmlMessage(formatToXml(rawMessage));
  };

  useEffect(() => {
    handleFormat();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleFormat}><CodeXml className="mr-2 h-4 w-4" />Format to XML</Button>
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
  );
}
