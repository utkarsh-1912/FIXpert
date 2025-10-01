
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, PlusCircle, ArrowRight, ArrowLeftRight, Minus, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, MarkerType, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { cn } from '@/lib/utils';
import { generateWorkflowDiagram } from '@/ai/flows/generate-workflow-diagram';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotificationStore } from '@/stores/notification-store';


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

const nodeBaseStyle: React.CSSProperties = {
    padding: '10px 15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minWidth: 120,
    minHeight: 60,
};

const NodeComponent = ({ data, selected }: { data: { label: string, shape: Node['shape'] }, selected: boolean }) => {
    const shapeStyle: React.CSSProperties = {};
    if (data.shape === 'circle') {
        shapeStyle.borderRadius = '50%';
        shapeStyle.height = 100;
        shapeStyle.width = 100;
    } else if (data.shape === 'stadium') {
        shapeStyle.borderRadius = '9999px';
    } else if (data.shape === 'round-edge') {
        shapeStyle.borderRadius = '1rem';
    } else {
        shapeStyle.borderRadius = '0.25rem';
    }

    return (
        <div className={cn("react-flow__node-default", selected && "selected")} style={{ ...nodeBaseStyle, ...shapeStyle }}>
            {data.label}
            <Handle type="source" position={Position.Right} id="right" />
            <Handle type="target" position={Position.Left} id="left" />
            <Handle type="source" position={Position.Bottom} id="bottom" />
            <Handle type="target" position={Position.Top} id="top" />
        </div>
    );
};

const nodeTypes = {
    custom: NodeComponent,
};

export default function WorkflowVisualizerPage() {
  const [layout, setLayout] = useState<'LR' | 'TD'>('LR');
  const [activeTab, setActiveTab] = useState('designer');

  // State for AI scenario
  const [scenario, setScenario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotificationStore();

  // State for manual designer
  const [manualNodes, setManualNodes] = useState<Node[]>([
    { id: 'N1', label: 'Client', shape: 'rect' },
    { id: 'N2', label: 'Broker', shape: 'round-edge' },
  ]);
  const [manualConnections, setManualConnections] = useState<Connection[]>([
      {id: 'c1', from: 'N1', to: 'N2', label: 'NewOrderSingle', type: 'uni'},
  ]);

  // React Flow state
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([]);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState([]);

  // Update React Flow state when manual designer state changes
  useEffect(() => {
    const xSpacing = 250;
    const ySpacing = 180;

    const newFlowNodes = manualNodes.map((node, index) => {
        const position = layout === 'LR'
        ? { x: index * xSpacing, y: Math.floor(index / 4) * ySpacing }
        : { x: Math.floor(index / 3) * xSpacing, y: (index % 3) * ySpacing };

        return {
            id: node.id,
            data: { label: node.label, shape: node.shape },
            position,
            type: 'custom',
        };
    });

    const newFlowEdges = manualConnections.map(conn => ({
      id: conn.id,
      source: conn.from,
      target: conn.to,
      label: conn.label,
      type: 'smoothstep',
      markerEnd: conn.type === 'uni' || conn.type === 'bi' ? { type: MarkerType.ArrowClosed } : undefined,
      markerStart: conn.type === 'bi' ? { type: MarkerType.ArrowClosed } : undefined,
      labelBgPadding: [8, 4] as [number, number],
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.9 },
      sourceHandle: layout === 'LR' ? 'right' : 'bottom',
      targetHandle: layout === 'LR' ? 'left' : 'top',
    }));

    setFlowNodes(newFlowNodes);
    setFlowEdges(newFlowEdges);

  }, [manualNodes, manualConnections, layout, setFlowNodes, setFlowEdges]);

  const addNode = () => {
    const newNodeId = `N${manualNodes.length + 1}`;
    setManualNodes([...manualNodes, { id: newNodeId, label: `Node ${manualNodes.length + 1}`, shape: 'rect' }]);
  };
  
  const updateNode = (index: number, field: keyof Node, value: string) => {
    const newNodes = [...manualNodes];
    (newNodes[index] as any)[field] = value;
    setManualNodes(newNodes);
  };

  const removeNode = (index: number) => {
    const nodeIdToRemove = manualNodes[index].id;
    setManualNodes(manualNodes.filter((_, i) => i !== index));
    setManualConnections(manualConnections.filter(c => c.from !== nodeIdToRemove && c.to !== nodeIdToRemove));
  };

  const addConnection = () => {
    setManualConnections([...manualConnections, {id: `c${Date.now()}`, from: '', to: '', label: '', type: 'uni'}]);
  };

  const updateConnection = (index: number, field: keyof Connection, value: string) => {
    const newConnections = [...manualConnections];
    (newConnections[index] as any)[field] = value;
    setManualConnections(newConnections);
  };
  
  const removeConnection = (index: number) => {
    setManualConnections(manualConnections.filter((_, i) => i !== index));
  };

  const handleGenerateFromScenario = async () => {
      if (!scenario) return;
      setIsLoading(true);
      try {
          const result = await generateWorkflowDiagram({ scenario });
          if (result.nodes && result.connections) {
              setManualNodes(result.nodes);
              setManualConnections(result.connections);
              addNotification({
                icon: Wand2,
                title: 'Diagram Generated',
                description: 'The workflow diagram has been successfully generated from your scenario.',
              });
          }
      } catch (error) {
           console.error("Error generating diagram:", error);
           addNotification({
                icon: Wand2,
                title: 'Generation Failed',
                description: 'Could not generate a diagram from the scenario.',
                variant: 'destructive'
              });
      } finally {
          setIsLoading(false);
      }
  };


  return (
    <div className="grid gap-6 lg:grid-cols-2">
       <Card>
         <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="designer">
            <CardHeader>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="designer">
                        <Sparkles className="mr-2 h-4 w-4"/>
                        Manual Designer
                    </TabsTrigger>
                    <TabsTrigger value="scenario">
                        <Wand2 className="mr-2 h-4 w-4"/>
                        From Scenario (AI)
                    </TabsTrigger>
                </TabsList>
            </CardHeader>
             <TabsContent value="designer">
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
                        {manualNodes.map((node, index) => (
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
                        {manualConnections.map((conn, index) => (
                            <div key={conn.id} className="grid grid-cols-[3fr_3fr_4fr_1fr_1fr] gap-2 items-center">
                                <Select value={conn.from} onValueChange={(v) => updateConnection(index, 'from', v)}>
                                    <SelectTrigger><SelectValue placeholder="From"/></SelectTrigger>
                                    <SelectContent>{manualNodes.map(n => <SelectItem key={n.id} value={n.id}>{n.label} ({n.id})</SelectItem>)}</SelectContent>
                                </Select>
                                <Select value={conn.to} onValueChange={(v) => updateConnection(index, 'to', v)}>
                                    <SelectTrigger><SelectValue placeholder="To"/></SelectTrigger>
                                    <SelectContent>{manualNodes.map(n => <SelectItem key={n.id} value={n.id}>{n.label} ({n.id})</SelectItem>)}</SelectContent>
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
             </TabsContent>
             <TabsContent value="scenario">
                <CardContent className="space-y-4">
                    <Label htmlFor="scenario-input">Workflow Scenario</Label>
                    <Textarea 
                        id="scenario-input"
                        value={scenario}
                        onChange={(e) => setScenario(e.target.value)}
                        placeholder="e.g., A client sends a NewOrderSingle to a broker. The broker routes it to an exchange. The exchange sends back an execution report..."
                        rows={10}
                    />
                </CardContent>
                <CardFooter>
                    <Button onClick={handleGenerateFromScenario} disabled={isLoading || !scenario}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                        Generate Diagram
                    </Button>
                </CardFooter>
             </TabsContent>
        </Tabs>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Workflow Visualization</CardTitle>
          <CardDescription>Live preview of your diagram.</CardDescription>
        </CardHeader>
        <CardContent className="relative flex-grow w-full h-full min-h-[60vh]">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            
            {activeTab === 'designer' || (activeTab === 'scenario' && flowNodes.length > 0) ? (
                <div className="w-full h-full rounded-b-lg overflow-hidden absolute inset-0">
                    <ReactFlow
                        nodes={flowNodes}
                        edges={flowEdges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Controls />
                        <Background />
                    </ReactFlow>
                </div>
            ) : (
                <div className="flex h-full items-center justify-center rounded-md border border-dashed p-8">
                    <div className="text-center text-muted-foreground">
                        <Sparkles className="mx-auto h-12 w-12" />
                        <p className="mt-4">Generated visualization will appear here.</p>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

    