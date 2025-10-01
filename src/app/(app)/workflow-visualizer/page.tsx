
'use client';

import { useState, useId, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { visualizeFixWorkflow } from '@/ai/flows/visualize-fix-workflow';
import { Loader2, Wand2, PencilRuler, BrainCircuit, Trash2, PlusCircle, CodeXml, ChevronsUpDown, ArrowRight, ArrowLeftRight, Minus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type Node = {
  id: string;
  label: string;
  shape: 'rect' | 'round-edge' | 'stadium' | 'circle';
};

type ConnectionType = 'uni' | 'bi' | 'none';

type Connection = {
  id: string;
  from: string;
  to: string;
  label: string;
  type: ConnectionType;
};

const connectionTypeMap: Record<ConnectionType, { icon: React.ElementType, syntax: string }> = {
    'uni': { icon: ArrowRight, syntax: '-->' },
    'bi': { icon: ArrowLeftRight, syntax: '<-->' },
    'none': { icon: Minus, syntax: '---' },
};


const shapeMap = {
  rect: (id: string, label: string) => `${id}["${label}"]`,
  'round-edge': (id: string, label: string) => `${id}(${label})`,
  stadium: (id: string, label: string) => `${id}([${label}])`,
  circle: (id: string, label: string) => `${id}((${label}))`,
};

const TABS = [
  { value: 'scenario', label: 'From Scenario', icon: BrainCircuit },
  { value: 'manual', label: 'Manual Designer', icon: PencilRuler },
  { value: 'mermaid', label: 'Mermaid Code', icon: CodeXml },
];

export default function WorkflowVisualizerPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].value);
  const [scenario, setScenario] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [visualization, setVisualization] = useState<{ dataUri: string; description: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<'LR' | 'TD'>('LR');
  
  // State for manual designer
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'A', label: 'Client', shape: 'rect' },
    { id: 'B', label: 'Broker', shape: 'round-edge' },
  ]);
  const [connections, setConnections] = useState<Connection[]>([
      {id: 'c1', from: 'A', to: 'B', label: 'NewOrderSingle', type: 'uni'},
  ]);

  const generateMermaidFromState = () => {
    let code = `flowchart ${layout}\n`;
    nodes.forEach(node => {
      code += `    ${shapeMap[node.shape](node.id, node.label)}\n`;
    });
    connections.forEach(conn => {
      if (conn.from && conn.to) {
        const arrow = connectionTypeMap[conn.type].syntax;
        code += `    ${conn.from} ${arrow}|${conn.label}| ${conn.to}\n`;
      }
    });
    setMermaidCode(code);
    return code;
  };
  
  useEffect(() => {
    generateMermaidFromState();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, connections, layout]);

  const addNode = () => {
    const newNodeId = String.fromCharCode(65 + nodes.length);
    setNodes([...nodes, { id: newNodeId, label: `Node ${newNodeId}`, shape: 'rect' }]);
  };
  
  const updateNode = (index: number, field: keyof Node, value: string) => {
    const newNodes = [...nodes];
    (newNodes[index] as any)[field] = value;
    setNodes(newNodes);
  };

  const removeNode = (index: number) => {
    const nodeIdToRemove = nodes[index].id;
    setNodes(nodes.filter((_, i) => i !== index));
    setConnections(connections.filter(c => c.from !== nodeIdToRemove && c.to !== nodeIdToRemove));
  };

  const addConnection = () => {
    setConnections([...connections, {id: `c${Date.now()}`, from: '', to: '', label: '', type: 'uni'}]);
  };

  const updateConnection = (index: number, field: keyof Connection, value: string) => {
    const newConnections = [...connections];
    (newConnections[index] as any)[field] = value;
    setConnections(newConnections);
  };
  
  const removeConnection = (index: number) => {
    setConnections(connections.filter((_, i) => i !== index));
  };
  
  const handleVisualize = async () => {
    setIsLoading(true);
    setVisualization(null);
    setError(null);
    try {
      const scenarioWithLayout = `${scenario}\n\nRender the flowchart with a ${layout === 'LR' ? 'horizontal (Left to Right)' : 'vertical (Top to Bottom)'} layout.`;
      const result = await visualizeFixWorkflow({ scenarioDescription: scenarioWithLayout });
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

  const handleCustomDesign = async (code: string) => {
    setIsLoading(true);
    setVisualization(null);
    setError(null);
    try {
      // The AI can derive the description from the code itself.
      const result = await visualizeFixWorkflow({ scenarioDescription: `Generate a flowchart from the following Mermaid syntax: \n\n${code}` });
      if (!result.flowchartDataUri.startsWith('data:image/svg+xml;base64,')) {
        throw new Error("Generated flowchart is not in the expected format.");
      }
      setVisualization({ dataUri: result.flowchartDataUri, description: result.description || 'Flowchart generated from custom Mermaid code.' });
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate visualization: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const ActiveTabLabel = TABS.find(tab => tab.value === activeTab)?.label;
  const ActiveTabIcon = TABS.find(tab => tab.value === activeTab)?.icon;


  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Desktop Tabs */}
            <div className="hidden sm:block">
              <TabsList className="grid w-full grid-cols-3">
                {TABS.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    <tab.icon className="mr-2 h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Mobile Dropdown */}
            <div className="sm:hidden mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {ActiveTabIcon && <ActiveTabIcon className="mr-2 h-4 w-4" />}
                    {ActiveTabLabel}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                  {TABS.map(tab => (
                    <DropdownMenuItem key={tab.value} onSelect={() => setActiveTab(tab.value)}>
                      <tab.icon className="mr-2 h-4 w-4" />
                      {tab.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          
          <TabsContent value="scenario">
            <CardHeader>
              <CardTitle>Workflow Scenario</CardTitle>
              <CardDescription>Describe a trading scenario, and let AI generate the message flow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                rows={5}
                placeholder="e.g., A client sends a new order, it gets partially filled, then the rest is cancelled."
              />
               <div className="space-y-2">
                    <Label htmlFor="layout-direction-scenario">Layout Direction</Label>
                    <Select value={layout} onValueChange={(v: 'LR' | 'TD') => setLayout(v)}>
                        <SelectTrigger id="layout-direction-scenario"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LR">Horizontal</SelectItem>
                            <SelectItem value="TD">Vertical</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleVisualize} disabled={isLoading || !scenario}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate Visualization
              </Button>
            </CardFooter>
          </TabsContent>

          <TabsContent value="manual">
            <CardHeader>
                <CardTitle>Manual Flow Designer</CardTitle>
                <CardDescription>Build your workflow by adding nodes and connections.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="layout-direction-manual">Layout Direction</Label>
                    <Select value={layout} onValueChange={(v: 'LR' | 'TD') => setLayout(v)}>
                        <SelectTrigger id="layout-direction-manual"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LR">Horizontal (Left to Right)</SelectItem>
                            <SelectItem value="TD">Vertical (Top to Bottom)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-4">
                    <Label className="text-base font-medium">Nodes</Label>
                    {nodes.map((node, index) => (
                        <div key={node.id} className="grid grid-cols-12 gap-2 items-center">
                            <Input value={node.id} disabled className="col-span-2 font-code" />
                            <Input value={node.label} onChange={(e) => updateNode(index, 'label', e.target.value)} className="col-span-5" />
                            <Select value={node.shape} onValueChange={(v) => updateNode(index, 'shape', v)}>
                                <SelectTrigger className="col-span-4"><SelectValue placeholder="Shape" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rect">Rectangle</SelectItem>
                                    <SelectItem value="round-edge">Round-Edge</SelectItem>
                                    <SelectItem value="stadium">Stadium</SelectItem>
                                    <SelectItem value="circle">Circle</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" onClick={() => removeNode(index)} className="col-span-1"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addNode}><PlusCircle className="mr-2 h-4 w-4"/>Add Node</Button>
                </div>
                 <div className="space-y-4">
                    <Label className="text-base font-medium">Connections</Label>
                    {connections.map((conn, index) => (
                        <div key={conn.id} className="grid grid-cols-[3fr_3fr_4fr_1fr_1fr] gap-2 items-center">
                            <Select value={conn.from} onValueChange={(v) => updateConnection(index, 'from', v)}>
                                <SelectTrigger><SelectValue placeholder="From"/></SelectTrigger>
                                <SelectContent>{nodes.map(n => <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>)}</SelectContent>
                            </Select>
                             <Select value={conn.to} onValueChange={(v) => updateConnection(index, 'to', v)}>
                                <SelectTrigger><SelectValue placeholder="To"/></SelectTrigger>
                                <SelectContent>{nodes.map(n => <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>)}</SelectContent>
                            </Select>
                            <Input value={conn.label} onChange={(e) => updateConnection(index, 'label', e.target.value)} placeholder="Label" />
                            <Select value={conn.type} onValueChange={(v: ConnectionType) => updateConnection(index, 'type', v)}>
                                <SelectTrigger className="p-2 justify-center"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(connectionTypeMap).map(([key, {icon: Icon, syntax}]) => (
                                        <SelectItem key={key} value={key}><Icon className="h-4 w-4"/></SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" onClick={() => removeConnection(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </div>
                    ))}
                     <Button variant="outline" size="sm" onClick={addConnection}><PlusCircle className="mr-2 h-4 w-4"/>Add Connection</Button>
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={() => handleCustomDesign(generateMermaidFromState())} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PencilRuler className="mr-2 h-4 w-4" />}
                    Generate from Designer
                </Button>
            </CardFooter>
          </TabsContent>

          <TabsContent value="mermaid">
            <CardHeader>
              <CardTitle>Custom Mermaid Code</CardTitle>
              <CardDescription>Directly edit the MermaidJS syntax for your flowchart.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={mermaidCode}
                onChange={(e) => setMermaidCode(e.target.value)}
                rows={10}
                className="font-code"
                placeholder={`flowchart LR
    A["Client"] -->|"NewOrderSingle"| B(Broker);
    B -->|"ExecutionReport - New"| C{Exchange};
    C -->|"ExecutionReport - Filled"| B;
    B -->|"ExecutionReport - Filled"| A;`}
              />
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleCustomDesign(mermaidCode)} disabled={isLoading || !mermaidCode}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PencilRuler className="mr-2 h-4 w-4" />}
                Generate from Code
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={visualization.dataUri}
                    alt="FIX Workflow Visualization"
                    className="h-auto max-w-full"
                  />
                </div>
              ) : null}
              <p className="text-sm text-muted-foreground">{visualization.description}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full rounded-md border border-dashed">
                <div className="text-center text-muted-foreground">
                    <BrainCircuit className="mx-auto h-12 w-12" />
                    <p className="mt-4">Generated visualization will appear here.</p>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
