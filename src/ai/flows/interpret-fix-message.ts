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

const FieldInterpretationSchema = z.object({
  tag: z.string().describe('The FIX tag number (e.g., "35").'),
  name: z.string().describe('The name of the FIX field (e.g., "MsgType").'),
  value: z.string().describe('The value of the field (e.g., "D").'),
  meaning: z
    .string()
    .describe('The human-readable meaning of the value (e.g., "New Order - Single").'),
});

const InterpretFixMessageOutputSchema = z.object({
  summary: z.object({
    messageType: z
      .string()
      .describe('The type of the FIX message (e.g., "New Order - Single").'),
    purpose: z
      .string()
      .describe('A brief description of the message\'s purpose.'),
  }),
  fields: z
    .array(FieldInterpretationSchema)
    .describe('An array of all the interpreted fields in the message.'),
});
export type InterpretFixMessageOutput = z.infer<typeof InterpretFixMessageOutputSchema>;

export async function interpretFixMessage(
  input: InterpretFixMessageInput
): Promise<InterpretFixMessageOutput> {
  return interpretFixMessageFlow(input);
}

const interpretFixMessagePrompt = ai.definePrompt({
  name: 'interpretFixMessagePrompt',
  input: {schema: InterpretFixMessageInputSchema},
  output: {schema: InterpretFixMessageOutputSchema},
  prompt: `You are a FIX (Financial Information eXchange) protocol expert. Your task is to interpret a raw FIX message and provide a structured, human-readable explanation.

  Here is the raw FIX message:
  \`\`\`
  {{{rawFixMessage}}}
  \`\`\`

  Break down the message into the following structure:
  1.  **Summary**: Provide the message type (e.g., "New Order - Single", "Execution Report") and a brief, one-sentence purpose of the message.
  2.  **Fields**: Provide a detailed breakdown of every single tag in the message. For each tag, provide:
      - The tag number.
      - The field name (e.g., "MsgType", "ClOrdID").
      - The raw value of the field.
      - The human-readable meaning or enumeration of that value. If the value is not an enumeration (e.g., an order ID string), just state what the value represents.

  Ensure the output strictly adheres to the JSON schema provided.
`,
});

const interpretFixMessageFlow = ai.defineFlow(
  {
    name: 'interpretFixMessageFlow',
    inputSchema: InterpretFixMessageInputSchema,
    outputSchema: InterpretFixMessageOutputSchema,
  },
  async (input) => {
    const {output} = await interpretFixMessagePrompt(input);
    return output!;
  }
);
