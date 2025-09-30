'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { interpretFixMessage } from '@/ai/flows/interpret-fix-message';
import { Loader2, Wand2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function InterpreterPage() {
  const [rawMessage, setRawMessage] = useState('8=FIX.4.2|9=123|35=D|49=SENDER|56=TARGET|34=1|52=20240101-12:00:00|11=ORDER1|21=1|55=GOOG|54=1|38=100|40=2|59=0|10=168');
  const [interpretation, setInterpretation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInterpret = async () => {
    setIsLoading(true);
    setInterpretation('');
    try {
      const result = await interpretFixMessage({ rawFixMessage: rawMessage });
      setInterpretation(result.interpretation);
    } catch (error) {
      console.error(error);
      setInterpretation('An error occurred while interpreting the message.');
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
          <Button onClick={handleInterpret} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Interpret Message
          </Button>
        </CardFooter>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Interpretation</CardTitle>
          <CardDescription>AI-powered explanation of the FIX message.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <ScrollArea className="h-full max-h-[350px] w-full rounded-md border p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : interpretation ? (
            <pre className="whitespace-pre-wrap font-sans text-sm">{interpretation}</pre>
          ) : (
             <div className="flex h-full items-center justify-center text-muted-foreground">
              <p>AI interpretation will appear here.</p>
            </div>
          )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
