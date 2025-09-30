'use server';

/**
 * @fileOverview This file defines a Genkit flow for interpreting raw FIX messages.
 *
 * It takes a raw FIX message as input and returns a human-readable interpretation,
 * highlighting key fields and suggesting their meanings.
 *
 * @exports {
 *   interpretFixMessage: (input: InterpretFixMessageInput) => Promise<InterpretFixMessageOutput>;
 *   InterpretFixMessageInput: z.infer<typeof InterpretFixMessageInputSchema>;
 *   InterpretFixMessageOutput: z.infer<typeof InterpretFixMessageOutputSchema>;
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretFixMessageInputSchema = z.object({
  rawFixMessage: z.string().describe('The raw FIX message to interpret.'),
});
export type InterpretFixMessageInput = z.infer<typeof InterpretFixMessageInputSchema>;

const InterpretFixMessageOutputSchema = z.object({
  interpretation: z
    .string()
    .describe('A human-readable interpretation of the FIX message.'),
});
export type InterpretFixMessageOutput = z.infer<typeof InterpretFixMessageOutputSchema>;

export async function interpretFixMessage(input: InterpretFixMessageInput): Promise<InterpretFixMessageOutput> {
  return interpretFixMessageFlow(input);
}

const interpretFixMessagePrompt = ai.definePrompt({
  name: 'interpretFixMessagePrompt',
  input: {schema: InterpretFixMessageInputSchema},
  output: {schema: InterpretFixMessageOutputSchema},
  prompt: `You are a FIX (Financial Information Exchange) protocol expert. Your task is to interpret raw FIX messages and provide a human-readable explanation.

  Here is the raw FIX message:
  ```
  {{{rawFixMessage}}}
  ```

  Provide a clear and concise interpretation of the message, including:
  - The message type and its purpose.
  - Explanations of the key fields and their values.
  - Any relevant context or potential implications.

  Ensure the interpretation is easy to understand for someone familiar with financial markets but not necessarily an expert in the FIX protocol.
`,
});

const interpretFixMessageFlow = ai.defineFlow(
  {
    name: 'interpretFixMessageFlow',
    inputSchema: InterpretFixMessageInputSchema,
    outputSchema: InterpretFixMessageOutputSchema,
  },
  async input => {
    const {output} = await interpretFixMessagePrompt(input);
    return output!;
  }
);
