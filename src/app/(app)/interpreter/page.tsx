'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { interpretFixMessage, type InterpretFixMessageOutput } from '@/ai/flows/interpret-fix-message';
import { Loader2, Wand2, MessageSquareText, ListCollapse } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function InterpreterPage() {
  const [rawMessage, setRawMessage] = useState('8=FIX.4.2|9=123|35=D|49=SENDER|56=TARGET|34=1|52=20240101-12:00:00|11=ORDER1|21=1|55=GOOG|54=1|38=100|40=2|59=0|10=168');
  const [interpretation, setInterpretation] = useState<InterpretFixMessageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInterpret = async () => {
    setIsLoading(true);
    setInterpretation(null);
    setError(null);
    try {
      const result = await interpretFixMessage({ rawFixMessage: rawMessage });
      setInterpretation(result);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setError(`An error occurred while interpreting the message: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Raw FIX Message</CardTitle>
          <CardDescription>Enter a pipe-separated FIX message to interpret.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={rawMessage}
            onChange={(e) => setRawMessage(e.target.value)}
            rows={15}
            placeholder="e.g., 8=FIX.4.2|9=...|35=D|..."
            className="font-code"
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleInterpret} disabled={isLoading || !rawMessage}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Interpret Message
          </Button>
        </CardFooter>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>AI Interpretation</CardTitle>
          <CardDescription>A detailed breakdown of the FIX message.</CardDescription>
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
            ) : interpretation ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <MessageSquareText className="h-8 w-8 text-primary"/>
                    <div className="space-y-1">
                      <CardTitle>{interpretation.summary.messageType}</CardTitle>
                      <CardDescription>{interpretation.summary.purpose}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="flex-row items-center gap-4 space-y-0">
                      <ListCollapse className="h-8 w-8 text-primary"/>
                      <CardTitle>Field Breakdown</CardTitle>
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
            ) : (
              <div className="flex h-full items-center justify-center rounded-md border border-dashed">
                <div className="text-center text-muted-foreground">
                    <Wand2 className="mx-auto h-12 w-12" />
                    <p className="mt-4">AI interpretation will appear here.</p>
                    <p className="text-sm">Enter a FIX message and click interpret.</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
