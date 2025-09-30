
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
import puppeteer from 'puppeteer';

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
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Mermaid Renderer</title>
                <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
            </head>
            <body>
                <div class="mermaid">${mermaidCode}</div>
                <script>
                    mermaid.initialize({ startOnLoad: true, theme: 'dark' });
                </script>
            </body>
            </html>
        `;

        await page.setContent(html);

        const svgContent = await page.evaluate(() => {
            const svgElement = document.querySelector('.mermaid svg');
            return svgElement ? svgElement.outerHTML : null;
        });

        if (!svgContent) {
            throw new Error("Mermaid failed to render SVG.");
        }

        const svgBase64 = Buffer.from(svgContent).toString('base64');
        return `data:image/svg+xml;base64,${svgBase64}`;

    } catch (error) {
        console.error(`Mermaid processing error: ${error}`);
        throw new Error(`Failed to process Mermaid diagram: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        if (browser) {
            await browser.close();
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
