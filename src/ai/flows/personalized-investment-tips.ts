'use server';

/**
 * @fileOverview A personalized investment tips AI agent.
 *
 * - getPersonalizedInvestmentTips - A function that returns personalized investment tips.
 * - PersonalizedInvestmentTipsInput - The input type for the getPersonalizedInvestmentTips function.
 * - PersonalizedInvestmentTipsOutput - The return type for the getPersonalizedInvestmentTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedInvestmentTipsInputSchema = z.object({
  income: z.number().describe('Monthly income of the user.'),
  debts: z.string().describe('Description of the user debts, including amounts and interest rates.'),
  savings: z.number().describe('Total savings amount of the user.'),
});
export type PersonalizedInvestmentTipsInput = z.infer<typeof PersonalizedInvestmentTipsInputSchema>;

const PersonalizedInvestmentTipsOutputSchema = z.object({
  investmentTips: z.string().describe('Personalized investment tips based on the user financial situation, including concrete suggestions on how to invest with limited resources.'),
});
export type PersonalizedInvestmentTipsOutput = z.infer<typeof PersonalizedInvestmentTipsOutputSchema>;

export async function getPersonalizedInvestmentTips(input: PersonalizedInvestmentTipsInput): Promise<PersonalizedInvestmentTipsOutput> {
  return personalizedInvestmentTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedInvestmentTipsPrompt',
  input: {schema: PersonalizedInvestmentTipsInputSchema},
  output: {schema: PersonalizedInvestmentTipsOutputSchema},
  prompt: `You are a financial advisor providing personalized investment tips.

  Based on the user's income, debts, and savings, provide concrete investment suggestions tailored to their financial situation. Focus on actionable steps they can take, even with limited resources.

  Income: {{income}}
  Debts: {{debts}}
  Savings: {{savings}}

  Provide investment tips that are realistic and consider the user's current financial constraints. Suggest specific investment options and strategies suitable for their situation.
  Remember that investment carries risk and the user should consult with their accountant before taking any actions.
  `,
});

const personalizedInvestmentTipsFlow = ai.defineFlow(
  {
    name: 'personalizedInvestmentTipsFlow',
    inputSchema: PersonalizedInvestmentTipsInputSchema,
    outputSchema: PersonalizedInvestmentTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
