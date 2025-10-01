
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, PlusCircle, ArrowRight, ArrowLeftRight, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, MarkerType, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { cn } from '@/lib/utils';

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
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
};

const HorizontalNode = ({ data, selected }: { data: { label: string, shape: Node['shape'] }, selected: boolean }) => {
    const shapeStyle: React.CSSProperties = {
        borderRadius: data.shape === 'circle' ? '50%' : 
                      data.shape === 'stadium' ? '9999px' : 
                      data.shape === 'round-edge' ? '1rem' : '0.25rem',
        height: data.shape === 'circle' ? 100 : 60,
        width: data.shape === 'circle' ? 100 : 150,
    };

    return (
        <div className={cn("react-flow__node-default", selected && "selected")} style={{ ...nodeBaseStyle, ...shapeStyle }}>
            {data.label}
            <Handle type="source" position={Position.Right} id="right" />
            <Handle type="target" position={Position.Left} id="left" />
        </div>
    );
};

const VerticalNode = ({ data, selected }: { data: { label: string, shape: Node['shape'] }, selected: boolean }) => {
    const shapeStyle: React.CSSProperties = {
        borderRadius: data.shape === 'circle' ? '50%' : 
                      data.shape === 'stadium' ? '9999px' : 
                      data.shape === 'round-edge' ? '1rem' : '0.25rem',
        height: data.shape === 'circle' ? 100 : 60,
        width: data.shape === 'circle' ? 100 : 150,
    };
    
    return (
        <div className={cn("react-flow__node-default", selected && "selected")} style={{ ...nodeBaseStyle, ...shapeStyle }}>
            {data.label}
            <Handle type="source" position={Position.Bottom} id="bottom" />
            <Handle type="target" position={Position.Top} id="top" />
        </div>
    );
};

const nodeTypes = {
    horizontal: HorizontalNode,
    vertical: VerticalNode,
};

export default function WorkflowVisualizerPage() {
  const [layout, setLayout] = useState<'LR' | 'TD'>('LR');
  const nodeIdCounter = useRef(2);

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
            type: layout === 'LR' ? 'horizontal' : 'vertical',
        };
    });

    const newFlowEdges = manualConnections.map(conn => ({
      id: conn.id,
      source: conn.from,
      target: conn.to,
      label: conn.label,
      type: 'straight',
      markerEnd: conn.type === 'uni' || conn.type === 'bi' ? { type: MarkerType.ArrowClosed } : undefined,
      markerStart: conn.type === 'bi' ? { type: MarkerType.ArrowClosed } : undefined,
      labelBgPadding: [8, 4] as [number, number],
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.9 },
      sourceHandle: layout === 'LR' ? 'right' : 'left',
      targetHandle: layout === 'LR' ? 'left' : 'right',
    }));

    setFlowNodes(newFlowNodes);
    setFlowEdges(newFlowEdges);

  }, [manualNodes, manualConnections, layout, setFlowNodes, setFlowEdges]);

  const addNode = () => {
    nodeIdCounter.current += 1;
    const newNodeId = `N${nodeIdCounter.current}`;
    setManualNodes([...manualNodes, { id: newNodeId, label: `Node ${nodeIdCounter.current}`, shape: 'rect' }]);
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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
            <CardTitle>Workflow Designer</CardTitle>
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
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Workflow Visualization</CardTitle>
          <CardDescription>Live preview from the designer.</CardDescription>
        </CardHeader>
        <CardContent className="relative flex-grow w-full h-full min-h-[60vh]">
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
        </CardContent>
      </Card>
    </div>
  );
}
