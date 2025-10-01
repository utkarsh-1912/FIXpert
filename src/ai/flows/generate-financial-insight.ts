
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating financial insights for a given stock symbol.
 *
 * It takes company data as input and returns an AI-generated analysis of its financial health and market trends.
 *
 * @exports {
 *   generateFinancialInsight: (input: FinancialInsightInput) => Promise<FinancialInsightOutput>;
 *   FinancialInsightInput: The input type for the generateFinancialInsight function.
 *   FinancialInsightOutput: The return type for the generateFinancialInsight function.
 * }
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FinancialInsightInputSchema = z.object({
  symbol: z.string().describe('The stock ticker symbol.'),
  companyName: z.string().describe('The name of the company.'),
  country: z.string().optional().describe('The country where the company is based.'),
  sector: z.string().optional().describe('The industry sector the company operates in.'),
});
export type FinancialInsightInput = z.infer<typeof FinancialInsightInputSchema>;

const FinancialInsightOutputSchema = z.object({
  aiSummary: z.string().describe('A single, concise sentence summarizing the company and its main business.'),
  sentiment: z.enum(['Bullish', 'Bearish', 'Neutral']).describe('The overall market sentiment for the stock.'),
  keyRisk: z.string().describe('A single, concise sentence identifying a key risk for the company.'),
  keyOpportunity: z.string().describe('A single, concise sentence identifying a key opportunity for the company.'),
});
export type FinancialInsightOutput = z.infer<typeof FinancialInsightOutputSchema>;


export async function generateFinancialInsight(
  input: FinancialInsightInput
): Promise<FinancialInsightOutput> {
  return generateFinancialInsightFlow(input);
}

const financialInsightPrompt = ai.definePrompt({
  name: 'financialInsightPrompt',
  input: { schema: FinancialInsightInputSchema },
  output: { schema: FinancialInsightOutputSchema },
  prompt: `You are a savvy financial analyst. Based on the following information for "{{companyName}}" ({{symbol}}), provide a structured financial analysis.

  Company Details:
  - Sector: {{{sector}}}
  - Country: {{{country}}}

  Your response must include:
  1.  A single, concise sentence summarizing the company and its main business.
  2.  The overall market sentiment (Bullish, Bearish, or Neutral).
  3.  One key risk and one key opportunity, each as a single concise sentence.
  `,
});


const generateFinancialInsightFlow = ai.defineFlow(
  {
    name: 'generateFinancialInsightFlow',
    inputSchema: FinancialInsightInputSchema,
    outputSchema: FinancialInsightOutputSchema,
  },
  async (input) => {
    const { output } = await financialInsightPrompt(input);
    return output!;
  }
);
