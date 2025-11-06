// Financial suggestions based on user finances.

"use server";

/**
 * @fileOverview A financial suggestion AI agent.
 *
 * - getFinancialSuggestions - A function that provides financial suggestions.
 * - FinancialSuggestionsInput - The input type for the getFinancialSuggestions function.
 * - FinancialSuggestionsOutput - The return type for the getFinancialSuggestions function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const FinancialSuggestionsInputSchema = z.object({
  income: z.number().describe("Monthly income."),
  debts: z
    .string()
    .describe(
      "List of debts, including the debt name and monthly payment amount"
    ),
  expenses: z
    .string()
    .describe(
      "List of expenses, including the expense name and monthly payment amount"
    ),
});
export type FinancialSuggestionsInput = z.infer<
  typeof FinancialSuggestionsInputSchema
>;

const FinancialSuggestionsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe("Financial suggestions based on the user input."),
});
export type FinancialSuggestionsOutput = z.infer<
  typeof FinancialSuggestionsOutputSchema
>;

export async function getFinancialSuggestions(
  input: FinancialSuggestionsInput
): Promise<FinancialSuggestionsOutput> {
  return financialSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: "financialSuggestionsPrompt",
  input: { schema: FinancialSuggestionsInputSchema },
  output: { schema: FinancialSuggestionsOutputSchema },
  prompt: `You are a financial advisor providing concise, actionable suggestions based on the user's finances.

  Provide 5-7 SHORT, DIRECT micro-items to improve the user's financial situation. Each item should be ONE sentence max.
  Focus on SPECIFIC actions (e.g., "Cancel Netflix subscription - saves $15/month").
  Use bullet points. Be brutally honest and realistic. No fluff.

  Income: {{income}}
  Debts: {{debts}}
  Expenses: {{expenses}}

  Suggestions:`,
});

const financialSuggestionsFlow = ai.defineFlow(
  {
    name: "financialSuggestionsFlow",
    inputSchema: FinancialSuggestionsInputSchema,
    outputSchema: FinancialSuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
