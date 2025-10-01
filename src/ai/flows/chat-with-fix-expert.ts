'use server';

/**
 * @fileOverview This file defines a Genkit flow for an AI-powered FIX protocol chat assistant.
 *
 * It takes a history of chat messages and generates a response from the AI model,
 * which is configured to act as a FIX protocol expert.
 *
 * @exports {
 *   chatWithFixExpert: (history: ChatMessage[]) => Promise<ChatMessage>;
 * }
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ChatMessage, ChatMessageSchema } from './chat-types';

// Define the schema for the flow's input, which is an array of messages
const ChatWithFixExpertInputSchema = z.array(ChatMessageSchema);

// Define the schema for the flow's output, which is a single message from the model
const ChatWithFixExpertOutputSchema = ChatMessageSchema;

export async function chatWithFixExpert(
  history: z.infer<typeof ChatWithFixExpertInputSchema>
): Promise<z.infer<typeof ChatWithFixExpertOutputSchema>> {
  return chatWithFixExpertFlow(history);
}

const chatWithFixExpertPrompt = ai.definePrompt({
  name: 'chatWithFixExpertPrompt',
  input: { schema: ChatWithFixExpertInputSchema },
  output: { schema: ChatWithFixExpertOutputSchema },
  prompt: `You are FIXpert, an expert AI assistant specializing in the Financial Information eXchange (FIX) protocol. Your role is to help users by answering their questions about FIX, explaining concepts, interpreting messages, and providing clear, accurate information.

  Your knowledge includes, but is not limited to:
  - All versions of the FIX protocol.
  - The purpose and meaning of every FIX tag.
  - The structure and workflow of all FIX message types (e.g., NewOrderSingle, ExecutionReport, Logon).
  - Common trading scenarios and how they are represented in FIX.
  - Best practices for FIX implementation and testing.

  When responding, be concise and clear. Use examples when it helps with understanding. Use markdown for formatting, especially for tables to present structured data. For example, when a user asks to list common MsgType (35) values, present them in a table.
  If you do not know the answer to a question, say so. Do not invent information.
  
  Based on the conversation history, provide a helpful and accurate response to the user's latest query.

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
    outputSchema: ChatWithFixExpertOutputSchema,
  },
  async (history) => {
    try {
      const { output } = await chatWithFixExpertPrompt(history);
      if (output) {
        return output;
      }
      throw new Error("AI failed to produce a valid output.");
    } catch (error) {
      console.error("Chat flow failed:", error);
      // If all else fails, return a static error message.
      return {
          role: 'model',
          content: 'I apologize, but I encountered an unexpected issue while processing your request. Could you please try rephrasing your question?',
      };
    }
  }
);
