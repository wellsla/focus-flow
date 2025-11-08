"use server";

/**
 * Feedback Insights Flow
 * Generates markdown feedback with a skeptical, philosophical "wise boss" tone.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const FeedbackInsightsInputSchema = z.object({
  recordsSummary: z
    .string()
    .describe(
      "A newline-delimited bullet list summarizing user activity records (type, date, title, brief details)."
    ),
  persona: z
    .string()
    .describe(
      "The persona style key. Currently expects 'skeptical-philosophical-wise-boss'."
    ),
});
export type FeedbackInsightsInput = z.infer<typeof FeedbackInsightsInputSchema>;

const FeedbackInsightsOutputSchema = z.object({
  feedbackMarkdown: z
    .string()
    .describe(
      "Constructive, candid markdown feedback in Portuguese (pt-BR) unless explicitly English is requested."
    ),
});
export type FeedbackInsightsOutput = z.infer<
  typeof FeedbackInsightsOutputSchema
>;

// Prompt definition
const prompt = ai.definePrompt({
  name: "feedbackInsightsPrompt",
  input: { schema: FeedbackInsightsInputSchema },
  output: { schema: FeedbackInsightsOutputSchema },
  prompt: `You are a skeptical, philosophical, wise boss providing performance feedback.
Language: Portuguese (pt-BR) unless the content clearly demands English.
Tone: Cético, direto, analítico, estilo Sócrates minimalista. Sem bajulação. Firme porém construtivo.
Output MUST be valid GitHub Flavored Markdown.

Sections obrigatórias (use exatamente estes títulos em português):
## Visão Geral
Breve síntese da semana/período.

## Sinais Positivos
Bullets curtíssimos (≤ 12 palavras). Cada item começa com "+".

## Alertas / Riscos
Bullets começando com "!". Seja direto sobre padrões negativos.

## Recomendações Prioritárias (Top 5)
Lista numerada 1..5 com ações concretas. Cada item: imperativo e específico.

## Métricas e Padrões
Se possível, inferir 3–6 padrões quantificáveis (mesmo aproximados).

## Perguntas para Reflexão
3–5 perguntas abertas que provoquem pensamento crítico.

Regras adicionais:
- Não invente números absurdos; se estimativo, marque como "(~aprox)".
- Não repita frases idênticas entre seções.
- Evite voz passiva.
- Sem emojis.
- Não prometa resultados garantidos.

Registros resumidos:
{{recordsSummary}}

Persona key: {{persona}}

Gere o markdown agora:
`,
});

const feedbackInsightsFlow = ai.defineFlow(
  {
    name: "feedbackInsightsFlow",
    inputSchema: FeedbackInsightsInputSchema,
    outputSchema: FeedbackInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function getFeedbackInsights(
  input: FeedbackInsightsInput
): Promise<FeedbackInsightsOutput> {
  return feedbackInsightsFlow(input);
}
