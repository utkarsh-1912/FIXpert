'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { visualizeFixWorkflow } from '@/ai/flows/visualize-fix-workflow';
import { Loader2, Wand2, PencilRuler, BrainCircuit } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const defaultMermaid = `flowchart LR
    A[Client] -->|NewOrderSingle| B(Broker);
    B -->|ExecutionReport - New| C(Exchange);
    C -->|ExecutionReport - Filled| B;
    B -->|ExecutionReport - Filled| A;
`;

export default function WorkflowVisualizerPage() {
  const [scenario, setScenario] = useState('A simple new order that gets fully filled.');
  const [mermaidCode, setMermaidCode] = useState(defaultMermaid);
  const [visualization, setVisualization] = useState<{ dataUri: string; description: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVisualize = async () => {
    setIsLoading(true);
    setVisualization(null);
    setError(null);
    try {
      const result = await visualizeFixWorkflow({ scenarioDescription: scenario });
      if (!result.flowchartDataUri.startsWith('data:image/svg+xml;base64,')) {
        throw new Error("Generated flowchart is not in the expected format.");
      }
      setVisualization({ dataUri: result.flowchartDataUri, description: result.description });
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate visualization: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomDesign = async () => {
    setIsLoading(true);
    setVisualization(null);
    setError(null);
    try {
      // Re-use the same flow, but pass Mermaid code in the scenario description.
      // The prompt is flexible enough to handle this.
      const result = await visualizeFixWorkflow({ scenarioDescription: `Generate a flowchart from the following Mermaid syntax: \n\n${mermaidCode}` });
      if (!result.flowchartDataUri.startsWith('data:image/svg+xml;base64,')) {
        throw new Error("Generated flowchart is not in the expected format.");
      }
      setVisualization({ dataUri: result.flowchartDataUri, description: 'Flowchart generated from custom Mermaid code.' });
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate visualization: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <Tabs defaultValue="scenario" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scenario"><BrainCircuit className="mr-2 h-4 w-4" />Generate from Scenario</TabsTrigger>
            <TabsTrigger value="custom"><PencilRuler className="mr-2 h-4 w-4" />Custom Flow</TabsTrigger>
          </TabsList>
          <TabsContent value="scenario">
            <CardHeader>
              <CardTitle>Workflow Scenario</CardTitle>
              <CardDescription>Describe a trading scenario, and let AI generate the message flow.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                rows={5}
                placeholder="e.g., A client sends a new order, it gets partially filled, then the rest is cancelled."
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleVisualize} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate Visualization
              </Button>
            </CardFooter>
          </TabsContent>
          <TabsContent value="custom">
            <CardHeader>
              <CardTitle>Custom Flow Designer</CardTitle>
              <CardDescription>Create a custom flowchart using MermaidJS syntax.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={mermaidCode}
                onChange={(e) => setMermaidCode(e.target.value)}
                rows={10}
                className="font-code"
                placeholder="flowchart LR
    A --> B"
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleCustomDesign} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PencilRuler className="mr-2 h-4 w-4" />}
                Design Flow
              </Button>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Workflow Visualization</CardTitle>
          <CardDescription>AI-generated flowchart of the message flow.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : error ? (
            <div className="text-center text-destructive">
              <p>Error</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : visualization ? (
            <div className="space-y-4 w-full">
              {visualization.dataUri ? (
                <div className="rounded-lg border bg-card-foreground/5 p-4 flex justify-center">
                  <Image
                    src={visualization.dataUri}
                    alt="FIX Workflow Visualization"
                    width={500}
                    height={300}
                    className="h-auto max-w-full"
                  />
                </div>
              ) : null}
              <p className="text-sm text-muted-foreground">{visualization.description}</p>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>Generated visualization will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
