'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { interpretFixMessage, type InterpretFixMessageOutput } from '@/ai/flows/interpret-fix-message';
import { Loader2, Wand2, MessageSquareText, ListCollapse } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function InterpreterPage() {
  const [rawMessages, setRawMessages] = useState('8=FIX.4.2|9=123|35=D|49=SENDER|56=TARGET|34=1|52=20240101-12:00:00|11=ORDER1|55=GOOG|54=1|38=100|40=2|10=168\n8=FIX.4.2|9=178|35=8|34=2|49=TARGET|56=SENDER|52=20240101-12:00:01|11=ORDER1|37=E1|150=2|39=2|55=GOOG|54=1|38=100|10=145');
  const [interpretations, setInterpretations] = useState<InterpretFixMessageOutput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInterpret = async () => {
    setIsLoading(true);
    setInterpretations([]);
    setError(null);
    const messages = rawMessages.split('\n').filter(msg => msg.trim() !== '');
    if (messages.length === 0) {
        setError("Please enter at least one FIX message.");
        setIsLoading(false);
        return;
    }

    try {
      const results = await Promise.all(
        messages.map(rawFixMessage => interpretFixMessage({ rawFixMessage }))
      );
      setInterpretations(results);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setError(`An error occurred while interpreting the messages: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Raw FIX Messages</CardTitle>
          <CardDescription>Enter one or more pipe-separated FIX messages, each on a new line.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={rawMessages}
            onChange={(e) => setRawMessages(e.target.value)}
            rows={15}
            placeholder="e.g., 8=FIX.4.2|9=...|35=D|...\n8=FIX.4.2|9=...|35=8|..."
            className="font-code"
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleInterpret} disabled={isLoading || !rawMessages}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Interpret Messages
          </Button>
        </CardFooter>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>AI Interpretation</CardTitle>
          <CardDescription>A detailed breakdown of each FIX message.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <ScrollArea className="h-full max-h-[calc(80vh-100px)] w-full">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
                <div className="flex h-full items-center justify-center text-destructive">
                    <p>{error}</p>
                </div>
            ) : interpretations.length > 0 ? (
                <Accordion type="multiple" defaultValue={['item-0']} className="w-full">
                    {interpretations.map((interpretation, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-4 text-left">
                                    <MessageSquareText className="h-6 w-6 shrink-0 text-primary"/>
                                    <div className="space-y-1">
                                        <p className='font-semibold'>{`Message ${index + 1}: ${interpretation.summary.messageType}`}</p>
                                        <p className='text-sm text-muted-foreground'>{interpretation.summary.purpose}</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 pl-4 pt-2">
                                     <Card>
                                        <CardHeader className="flex-row items-center gap-4 space-y-0">
                                            <ListCollapse className="h-6 w-6 text-primary"/>
                                            <CardTitle className="text-lg">Field Breakdown</CardTitle>
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
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
              <div className="flex h-full items-center justify-center rounded-md border border-dashed">
                <div className="text-center text-muted-foreground">
                    <Wand2 className="mx-auto h-12 w-12" />
                    <p className="mt-4">AI interpretation will appear here.</p>
                    <p className="text-sm">Enter one or more FIX messages and click interpret.</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
