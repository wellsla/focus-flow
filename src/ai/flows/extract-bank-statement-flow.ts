"use server";
/**
 * @fileOverview An AI agent for extracting structured data from bank statements.
 *
 * - extractBankStatement - A function that analyzes an image of a bank statement
 *   and extracts billing information and a list of transactions.
 * - BankStatementInput - The input type for the extractBankStatement function.
 * - BankStatementOutput - The return type for the extractBankStatement function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

// Define the schema for a single transaction
const TransactionSchema = z.object({
  name: z
    .string()
    .describe("The name or description of the transaction/expense."),
  amount: z.number().describe("The value of the transaction."),
  currency: z
    .enum(["R$", "$", "€"])
    .describe("The currency of the transaction."),
});

// Define the input schema for the flow
const BankStatementInputSchema = z.object({
  statementImage: z
    .string()
    .describe(
      "An image of the bank statement, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type BankStatementInput = z.infer<typeof BankStatementInputSchema>;

// Define the output schema for the flow
const BankStatementOutputSchema = z.object({
  billTotal: z.number().optional().describe("The total amount of the bill."),
  dueDate: z
    .string()
    .optional()
    .describe("The due date of the bill in YYYY-MM-DD format."),
  transactions: z
    .array(TransactionSchema)
    .describe("A list of all expenses found in the statement."),
});
export type BankStatementOutput = z.infer<typeof BankStatementOutputSchema>;

export async function extractBankStatement(
  input: BankStatementInput
): Promise<BankStatementOutput> {
  return extractBankStatementFlow(input);
}

// Define the AI prompt
const prompt = ai.definePrompt({
  name: "extractBankStatementPrompt",
  input: { schema: BankStatementInputSchema },
  output: { schema: BankStatementOutputSchema },
  prompt: `You are a financial data extraction specialist. Analyze the provided bank statement image and extract the following information: the total bill amount, the due date, and a list of all individual transactions with their names and amounts.

The currency should be identified as 'R$', '$', or '€'. The due date should be converted to YYYY-MM-DD format.

Image of the statement is attached.
{{media url=statementImage}}`,
});

// Define the Genkit flow
const extractBankStatementFlow = ai.defineFlow(
  {
    name: "extractBankStatementFlow",
    inputSchema: BankStatementInputSchema,
    outputSchema: BankStatementOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("The AI model failed to return a structured output.");
    }
    return output;
  }
);
