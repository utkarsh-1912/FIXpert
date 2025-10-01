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
import { z, generate } from 'genkit';
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
  prompt: `You are FIXpert, an expert AI assistant for financial engineers. You have deep expertise in financial markets, trading concepts, and especially the Financial Information eXchange (FIX) protocol.

  Your knowledge includes, but is not limited to:
  - General financial and trading terminology (e.g., derivatives, hedging, dark pools, algorithmic trading).
  - FIX protocol versions, especially 4.2 and 4.4.
  - The purpose and meaning of every FIX tag. Be aware that some tags are deprecated or have different meanings in different versions. When relevant, mention the version. Default to FIX.4.4 unless specified otherwise.
  - The structure and workflow of all FIX message types (e.g., NewOrderSingle, ExecutionReport, Logon).
  - Common trading scenarios and how they are represented in FIX.
  - Best practices for FIX implementation and testing.

  When responding, be concise and clear. Use examples when it helps with understanding. Use markdown for formatting, especially for tables to present structured data.
  If a user asks about a term that is not part of the FIX protocol, explain it in its financial context. If you do not know the answer to a question, say so. Do not invent information.
  
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
      // First attempt: try to generate a response using the main prompt.
      const { output } = await chatWithFixExpertPrompt(history);
      if (output) {
        return output;
      }
      // This path is hit if the model returns a null/empty response.
      throw new Error("AI failed to produce a valid output on the first attempt.");
    } catch (error) {
      console.error("Chat flow failed on first attempt, trying again without tools:", error);

      try {
        // Second attempt: if the first one fails (e.g., due to a tool error),
        // try generating a response again with a simpler, tool-less prompt.
        const { output } = await generate({
          model: 'googleai/gemini-1.5-flash',
          prompt: `You are FIXpert, a helpful AI assistant specializing in the FIX protocol and financial engineering. Please provide a clear and helpful response to the last user message, based on the conversation history.

            Here is the conversation history:
            {{#each history}}
            **{{role}}**: {{content}}
            {{/each}}
          `,
          history,
          output: {
            schema: ChatWithFixExpertOutputSchema,
          }
        });
        
        if (output) {
          return output;
        }
        throw new Error("AI failed to produce a valid output on the second attempt.");

      } catch (finalError) {
        console.error("Chat flow failed on second attempt:", finalError);
        // If all else fails, return a static error message.
        return {
            role: 'model',
            content: 'I apologize, but I encountered an unexpected issue while processing your request. Could you please try rephrasing your question?',
        };
      }
    }
  }
);
