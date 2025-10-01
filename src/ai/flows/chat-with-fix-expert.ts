'use server';

/**
 * @fileOverview This file defines a Genkit flow for an AI-powered FIX protocol chat assistant.
 *
 * It takes a history of chat messages and generates a response from the AI model,
 * which is configured to act as a FIX protocol expert. It uses a tool to look up
 * FIX tag information to ensure accuracy.
 *
 * @exports {
 *   chatWithFixExpert: (history: ChatMessage[]) => Promise<ChatMessage>;
 * }
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ChatMessageSchema } from './chat-types';
import { getFixTagInfo } from '../tools/get-fix-tag-info';

// Define the schema for the flow's input, which is an array of messages
const ChatWithFixExpertInputSchema = z.array(ChatMessageSchema);

// Define the schema for the flow's output, which is a single message from the model
const ChatWithFixExpertOutputSchema = ChatMessageSchema;

export async function chatWithFixExpert(history: z.infer<typeof ChatWithFixExpertInputSchema>): Promise<z.infer<typeof ChatWithFixExpertOutputSchema>> {
  return chatWithFixExpertFlow(history);
}

const chatWithFixExpertPrompt = ai.definePrompt({
  name: 'chatWithFixExpertPrompt',
  input: { schema: ChatWithFixExpertInputSchema },
  output: { schema: ChatWithFixExpertOutputSchema },
  tools: [getFixTagInfo],
  prompt: `You are FIXpert, an expert AI assistant specializing in the Financial Information eXchange (FIX) protocol. Your role is to help users by answering their questions about FIX, explaining concepts, interpreting messages, and providing clear, accurate information.

  Your knowledge includes, but is not limited to:
  - All versions of the FIX protocol.
  - The purpose and meaning of every FIX tag.
  - The structure and workflow of all FIX message types (e.g., NewOrderSingle, ExecutionReport, Logon).
  - Common trading scenarios and how they are represented in FIX.
  - Best practices for FIX implementation and testing.

  When responding, be concise and clear. Use examples when it helps with understanding. If a user provides a raw FIX message, break it down and explain it.
  Use markdown for formatting, especially for tables to present structured data. For example, when a user asks to list common MsgType (35) values, present them in a table.
  
  IMPORTANT: If a user asks to explain a specific FIX tag number, you MUST use the getFixTagInfo tool to get the correct name, description, and values for that exact tag. Do not invent information. If the tool fails or returns a "could not find" message, inform the user that you could not find information for that specific tag and ask them to verify the tag number.

  Here is the conversation history:
  {{#each this}}
  **{{role}}**: {{content}}
  {{/each}}
  `,
});

const chatWithFixExpertFlow = ai.defineFlow(
  {
    name: 'chatWithFixExpertFlow',
    inputSchema: ChatWithFixExpertInputSchema,
    outputSchema: ChatWithFix-ExpertOutputSchema,
  },
  async (history) => {
    const { output } = await chatWithFixExpertPrompt(history);

    if (!output) {
      return {
        role: 'model',
        content: 'I apologize, but I was unable to process that request. Could you please try rephrasing your question?',
      };
    }
    
    return output;
  }
);
