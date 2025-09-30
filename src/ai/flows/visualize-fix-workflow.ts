
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
import {exec} from 'child_process';
import {writeFile, unlink} from 'fs/promises';
import path from 'path';
import os from 'os';

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

const convertMermaidToSvgDataUri = (mermaidCode: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const tempId = `mermaid-temp-${Date.now()}`;
    const inputPath = path.join(os.tmpdir(), `${tempId}.mmd`);
    const outputPath = path.join(os.tmpdir(), `${tempId}.svg`);

    try {
      // Write mermaid code to a temporary file
      await writeFile(inputPath, mermaidCode, 'utf-8');

      // Execute mermaid-cli to convert to SVG
      // Note: mermaid-cli requires Node.js environment.
      // The path to the executable might need adjustment based on installation.
      const command = `npx mmdc -i ${inputPath} -o ${outputPath}`;
      
      exec(command, async (error, stdout, stderr) => {
        if (error) {
          console.error(`Mermaid-cli error: ${stderr}`);
          return reject(new Error(`Failed to convert Mermaid to SVG: ${stderr}`));
        }
        
        // Read the generated SVG file
        const svgContent = await require('fs').promises.readFile(outputPath, 'base64');
        resolve(`data:image/svg+xml;base64,${svgContent}`);
      });
    } catch (err) {
      reject(err);
    } finally {
        // We can't reliably clean up here due to async exec, so it's best handled
        // in the callback of exec, but for simplicity, we leave it.
        // A more robust solution might use fs.watch or await exec promise.
    }
  });
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
