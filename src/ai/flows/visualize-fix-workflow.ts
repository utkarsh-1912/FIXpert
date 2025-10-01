
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

const MermaidOutputSchema = z.object({
  mermaidCode: z.string().describe('The MermaidJS syntax for the flowchart.'),
  description: z.string().describe('A textual description of the flowchart.'),
});

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
  output: {schema: MermaidOutputSchema},
  prompt: `You are an expert in FIX (Financial Information eXchange) protocol.

  Based on the provided trading scenario, generate a flowchart using MermaidJS syntax that illustrates the FIX message flow.
  Also provide a textual description of what the flowchart represents.

  The flowchart should clearly show the sequence of FIX messages exchanged between the involved parties (e.g., Trader, Broker, Exchange).
  Use clear and concise labels for the messages and steps in the flowchart.

  Scenario Description: {{{scenarioDescription}}}

  Example of Mermaid syntax:
  \`\`\`mermaid
  flowchart LR
      A[Trader] -->|NewOrderSingle| B(Broker);
      B -->|ExecutionReport - New| C(Exchange);
      C -->|ExecutionReport - Filled| B;
      B -->|ExecutionReport - Filled| A;
  \`\`\`

  Ensure the output is JUST the Mermaid syntax inside the markdown block and the description.
  `,
});

const convertMermaidToSvgDataUri = async (mermaidCode: string): Promise<string> => {
    try {
        const mermaidJson = JSON.stringify({
            code: mermaidCode,
            mermaid: {
                theme: 'neutral'
            }
        });

        const base64Mermaid = Buffer.from(mermaidJson, 'utf8').toString('base64');
        const url = `https://mermaid.ink/svg/${base64Mermaid}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Mermaid.ink API failed with status: ${response.status}`, errorBody);
            throw new Error(`Mermaid.ink API failed with status: ${response.status}`);
        }
        
        const svgContent = await response.text();

        if (!svgContent || svgContent.includes('Syntax error in text')) {
            console.error("Mermaid.ink returned an SVG with a syntax error.", mermaidCode);
            throw new Error("Mermaid.ink did not return valid SVG content due to a syntax error in the provided code.");
        }

        const svgBase64 = Buffer.from(svgContent).toString('base64');
        return `data:image/svg+xml;base64,${svgBase64}`;

    } catch (error) {
        console.error(`Mermaid processing error: ${error}`);
        throw new Error(`Failed to process Mermaid diagram: ${error instanceof Error ? error.message : String(error)}`);
    }
};


const visualizeFixWorkflowFlow = ai.defineFlow(
  {
    name: 'visualizeFixWorkflowFlow',
    inputSchema: VisualizeFixWorkflowInputSchema,
    outputSchema: VisualizeFixWorkflowOutputSchema,
  },
  async input => {
    const {output} = await visualizeFixWorkflowPrompt(input);
    if (!output) {
      throw new Error('Could not generate Mermaid syntax from the AI model.');
    }

    const { mermaidCode, description } = output;
    
    // The model might return the code wrapped in markdown, so we extract it.
    const cleanedMermaidCode = mermaidCode.replace(/```mermaid\n|```/g, '').trim();

    const flowchartDataUri = await convertMermaidToSvgDataUri(cleanedMermaidCode);
    
    return {
      flowchartDataUri,
      description,
    };
  }
);
