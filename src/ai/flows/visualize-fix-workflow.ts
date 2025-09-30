
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
import { exec } from 'child_process';
import { writeFile, readFile, unlink } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

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
    const uniqueId = uuidv4();
    const isVercel = process.env.VERCEL;
    
    // Define temporary file paths, accommodating Vercel's writable /tmp directory
    const tempDir = isVercel ? '/tmp' : '.';
    const inputFile = path.join(tempDir, `mermaid-input-${uniqueId}.mmd`);
    const outputFile = path.join(tempDir, `mermaid-output-${uniqueId}.svg`);
    
    try {
        await writeFile(inputFile, mermaidCode, 'utf-8');

        // Path to the mmdc executable within node_modules
        const mmdcPath = path.resolve('./node_modules/.bin/mmdc');

        // Execute the mermaid-cli command
        await new Promise<void>((resolve, reject) => {
            exec(`${mmdcPath} -i ${inputFile} -o ${outputFile} --backgroundColor transparent`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Mermaid-CLI exec error: ${stderr}`);
                    return reject(new Error(`Failed to convert Mermaid to SVG: ${stderr}`));
                }
                resolve();
            });
        });

        const svgContent = await readFile(outputFile, 'utf-8');
        const svgBase64 = Buffer.from(svgContent).toString('base64');
        return `data:image/svg+xml;base64,${svgBase64}`;
    } catch (error) {
        console.error(`Mermaid processing error: ${error}`);
        throw new Error(`Failed to process Mermaid diagram: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        // Clean up temporary files
        try {
            await unlink(inputFile);
            await unlink(outputFile);
        } catch (cleanupError) {
            // Log cleanup errors but don't throw, as the main operation might have succeeded
            console.warn(`Failed to clean up temporary Mermaid files: ${cleanupError}`);
        }
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
