'use server';
/**
 * @fileOverview A Genkit flow for generating a workflow diagram from a text scenario.
 *
 * This flow takes a natural language description of a financial workflow and
 * converts it into a structured format of nodes and connections suitable for
 * rendering with React Flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NodeSchema = z.object({
  id: z.string().describe('A short, unique identifier for the node (e.g., "N1", "N2").'),
  label: z.string().describe('The display name of the node (e.g., "Client", "Broker").'),
  shape: z.enum(['rect', 'round-edge', 'stadium', 'circle']).describe('The shape of the node.'),
});

const ConnectionSchema = z.object({
  id: z.string().describe('A unique identifier for the connection (e.g., "c1", "c2").'),
  from: z.string().describe('The ID of the source node for the connection.'),
  to: z.string().describe('The ID of the target node for the connection.'),
  label: z.string().describe('The text label describing the connection (e.g., "NewOrderSingle").'),
  type: z.enum(['uni', 'bi', 'none']).describe('The type of arrow: "uni" for one-way, "bi" for two-way, "none" for a plain line.'),
});


const GenerateWorkflowDiagramInputSchema = z.object({
    scenario: z.string().describe('A natural language description of a trading or FIX workflow.'),
});
export type GenerateWorkflowDiagramInput = z.infer<typeof GenerateWorkflowDiagramInputSchema>;

const GenerateWorkflowDiagramOutputSchema = z.object({
  nodes: z.array(NodeSchema).describe('An array of nodes representing the participants or systems in the workflow.'),
  connections: z.array(ConnectionSchema).describe('An array of connections representing the interactions between nodes.'),
});
export type GenerateWorkflowDiagramOutput = z.infer<typeof GenerateWorkflowDiagramOutputSchema>;


export async function generateWorkflowDiagram(
  input: GenerateWorkflowDiagramInput
): Promise<GenerateWorkflowDiagramOutput> {
  return generateWorkflowDiagramFlow(input);
}


const workflowDiagramPrompt = ai.definePrompt({
    name: 'workflowDiagramPrompt',
    input: { schema: GenerateWorkflowDiagramInputSchema },
    output: { schema: GenerateWorkflowDiagramOutputSchema },
    prompt: `You are an expert in financial trading systems and the FIX protocol. Your task is to convert a user's description of a workflow into a structured diagram.

    Based on the scenario provided, identify the key participants/systems and the interactions between them.

    Scenario:
    "{{scenario}}"

    Instructions:
    1.  Identify all unique participants (e.g., Client, Broker, Exchange, OMS, EMS). These will be your nodes.
    2.  Assign a unique ID (N1, N2, etc.) and a clear label to each node. Choose a shape that makes sense (e.g., 'rect' for systems, 'round-edge' for firms).
    3.  Identify the messages or actions that connect these participants. These will be your connections (edges).
    4.  For each connection, specify the source ('from') and target ('to') node IDs, a label (e.g., the FIX message type like 'NewOrderSingle' or 'ExecutionReport'), and the direction of the flow ('uni' for one-way, 'bi' for two-way).
    5.  Ensure all node IDs used in the connections exist in the nodes list.
    6.  Generate a unique ID for each connection (c1, c2, etc.).

    Provide the output in the specified JSON format.
    `,
});


const generateWorkflowDiagramFlow = ai.defineFlow(
  {
    name: 'generateWorkflowDiagramFlow',
    inputSchema: GenerateWorkflowDiagramInputSchema,
    outputSchema: GenerateWorkflowDiagramOutputSchema,
  },
  async (input) => {
    const { output } = await workflowDiagramPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate a workflow diagram.');
    }
    return output;
  }
);
