
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
  summary: z.string().optional().describe('A summary of the company\'s business.'),
});
export type FinancialInsightInput = z.infer<typeof FinancialInsightInputSchema>;

const FinancialInsightOutputSchema = z.object({
  insight: z.string().describe('A concise analysis of the company\'s financial health, market position, and potential trends. Should be 2-3 short paragraphs.'),
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
  prompt: `You are a savvy financial analyst. Based on the following information for the company "{{companyName}}" ({{symbol}}), provide a concise but insightful analysis (2-3 short paragraphs).

  Focus on its market position, potential trends, and overall financial sentiment. If the country or sector is provided, incorporate that into your analysis of regional or industry-specific trends.

  Company Details:
  - Sector: {{{sector}}}
  - Country: {{{country}}}
  - Business Summary: {{{summary}}}

  Generate the insight for the "insight" field.
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
