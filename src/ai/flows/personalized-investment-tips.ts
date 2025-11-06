"use server";

/**
 * @fileOverview A personalized investment tips AI agent.
 *
 * - getPersonalizedInvestmentTips - A function that returns personalized investment tips.
 * - PersonalizedInvestmentTipsInput - The input type for the getPersonalizedInvestmentTips function.
 * - PersonalizedInvestmentTipsOutput - The return type for the getPersonalizedInvestmentTips function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const PersonalizedInvestmentTipsInputSchema = z.object({
  income: z.number().describe("Monthly income of the user."),
  debts: z
    .string()
    .describe(
      "Description of the user debts, including amounts and interest rates."
    ),
  savings: z.number().describe("Total savings amount of the user."),
});
export type PersonalizedInvestmentTipsInput = z.infer<
  typeof PersonalizedInvestmentTipsInputSchema
>;

const PersonalizedInvestmentTipsOutputSchema = z.object({
  investmentTips: z
    .string()
    .describe(
      "Personalized investment tips based on the user financial situation, including concrete suggestions on how to invest with limited resources."
    ),
});
export type PersonalizedInvestmentTipsOutput = z.infer<
  typeof PersonalizedInvestmentTipsOutputSchema
>;

export async function getPersonalizedInvestmentTips(
  input: PersonalizedInvestmentTipsInput
): Promise<PersonalizedInvestmentTipsOutput> {
  return personalizedInvestmentTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: "personalizedInvestmentTipsPrompt",
  input: { schema: PersonalizedInvestmentTipsInputSchema },
  output: { schema: PersonalizedInvestmentTipsOutputSchema },
  prompt: `You are a financial advisor providing concise, actionable investment tips.

  Provide 5-7 SHORT, DIRECT micro-items for investment strategy. Each item should be ONE sentence max.
  Focus on SPECIFIC, REALISTIC actions considering their current financial constraints.
  Use bullet points. Be honest about risks. No lengthy explanations.

  Income: {{income}}
  Debts: {{debts}}
  Savings: {{savings}}

  Investment tips (remember: consult accountant before taking action):
  `,
});

const personalizedInvestmentTipsFlow = ai.defineFlow(
  {
    name: "personalizedInvestmentTipsFlow",
    inputSchema: PersonalizedInvestmentTipsInputSchema,
    outputSchema: PersonalizedInvestmentTipsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
