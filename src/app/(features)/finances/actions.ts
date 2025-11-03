'use server';

import { getFinancialSuggestions, FinancialSuggestionsInput } from '@/ai/flows/financial-suggestions';
import { getPersonalizedInvestmentTips, PersonalizedInvestmentTipsInput } from '@/ai/flows/personalized-investment-tips';

export async function fetchFinancialSuggestions(input: FinancialSuggestionsInput) {
  try {
    const result = await getFinancialSuggestions(input);
    return { success: true, suggestions: result.suggestions };
  } catch (error) {
    console.error('Error fetching financial suggestions:', error);
    return { success: false, error: 'Failed to get suggestions. The AI might be having a moment.' };
  }
}

export async function fetchInvestmentTips(input: PersonalizedInvestmentTipsInput) {
  try {
    const result = await getPersonalizedInvestmentTips(input);
    return { success: true, tips: result.investmentTips };
  } catch (error) {
    console.error('Error fetching investment tips:', error);
    return { success: false, error: 'Failed to get investment tips. The AI is probably busy.' };
  }
}
