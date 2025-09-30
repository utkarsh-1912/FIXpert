// src/ai/flows/visualize-fix-workflow.ts
'use server';

/**
 * @fileOverview Generates interactive flowcharts that illustrate FIX message flows for specific scenarios.
 *
 * - visualizeFixWorkflow - A function that handles the generation of FIX workflow visualizations.
 * - VisualizeFixWorkflowInput - The input type for the visualizeFixWorkflow function.
 * - VisualizeFixWorkflowOutput - The return type for the visualizeFixWorkflow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualizeFixWorkflowInputSchema = z.object({
  scenarioDescription: z
    .string()
    .describe('A description of the trading scenario to visualize.'),
});
export type VisualizeFixWorkflowInput = z.infer<typeof VisualizeFixWorkflowInputSchema>;

const VisualizeFixWorkflowOutputSchema = z.object({
  flowchartDataUri: z
    .string()
    .describe(
      'A data URI containing the flowchart as an image in SVG format. The format must be data:<mimetype>;base64,<encoded_data>.'
    ),
  description: z.string().describe('Description of the generated flowchart.'),
});
export type VisualizeFixWorkflowOutput = z.infer<typeof VisualizeFixWorkflowOutputSchema>;

export async function visualizeFixWorkflow(
  input: VisualizeFixWorkflowInput
): Promise<VisualizeFixWorkflowOutput> {
  return visualizeFixWorkflowFlow(input);
}

const visualizeFixWorkflowPrompt = ai.definePrompt({
  name: 'visualizeFixWorkflowPrompt',
  input: {schema: VisualizeFixWorkflowInputSchema},
  output: {schema: VisualizeFixWorkflowOutputSchema},
  prompt: `You are an expert in FIX (Financial Information eXchange) protocol and a skilled visualizer.

  Based on the provided trading scenario description, generate an interactive flowchart in SVG format that illustrates the FIX message flow.
  In addition to the flowchart, provide a textual description of what the flowchart represents.

  Scenario Description: {{{scenarioDescription}}}

  The flowchart should clearly show the sequence of FIX messages exchanged between the involved parties (e.g., trader, broker, exchange).
  Use clear and concise labels for the messages and steps in the flowchart. Use Mermaid syntax.

  Example of a Mermaid flowchart:
  flowchart LR
      A[Trader] --> B(Broker: NewOrderSingle)
      B --> C(Exchange: ExecutionReport - Accepted)
      C --> B(Broker: ExecutionReport - Accepted)
      B --> A(Trader: ExecutionReport - Accepted)

  Ensure that the generated SVG is properly formatted and can be rendered correctly in a browser.
  Make sure to include the "data:image/svg+xml;base64," prefix before the base64 encoded SVG content in the flowchartDataUri.

  The description should include the parties involved and the purpose of each message.
  `,
});

const visualizeFixWorkflowFlow = ai.defineFlow(
  {
    name: 'visualizeFixWorkflowFlow',
    inputSchema: VisualizeFixWorkflowInputSchema,
    outputSchema: VisualizeFixWorkflowOutputSchema,
  },
  async input => {
    const {output} = await visualizeFixWorkflowPrompt(input);
    return output!;
  }
);
