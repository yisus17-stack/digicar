'use server';
/**
 * @fileOverview Resume comparaciones de automóviles según las necesidades del usuario.
 *
 * - summarizeCarComparison - Una función que resume la comparación y recomienda un automóvil.
 * - SummarizeCarComparisonInput - El tipo de entrada para la función summarizeCarComparison.
 * - SummarizeCarComparisonOutput - El tipo de retorno para la función summarizeCarComparison.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCarComparisonInputSchema = z.object({
  car1Features: z.string().describe('Características del primer modelo de automóvil.'),
  car2Features: z.string().describe('Características del segundo modelo de automóvil.'),
  userNeeds: z.string().describe('Las necesidades y preferencias especificadas por el usuario.'),
});
export type SummarizeCarComparisonInput = z.infer<typeof SummarizeCarComparisonInputSchema>;

const SummarizeCarComparisonOutputSchema = z.object({
  summary: z.string().describe('Un resumen de la comparación de automóviles que destaca las diferencias clave.'),
  recommendation: z.string().describe('Recomendación de qué automóvil se adapta mejor a las necesidades del usuario.'),
});
export type SummarizeCarComparisonOutput = z.infer<typeof SummarizeCarComparisonOutputSchema>;

export async function summarizeCarComparison(input: SummarizeCarComparisonInput): Promise<SummarizeCarComparisonOutput> {
  return summarizeCarComparisonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCarComparisonPrompt',
  input: {schema: SummarizeCarComparisonInputSchema},
  output: {schema: SummarizeCarComparisonOutputSchema},
  prompt: `Eres un asesor de automóviles experto. Considera las siguientes características de dos automóviles y las necesidades del usuario para proporcionar un resumen y una recomendación.

Características del Auto 1: {{{car1Features}}}
Características del Auto 2: {{{car2Features}}}
Necesidades del usuario: {{{userNeeds}}}

Proporciona un resumen conciso de las diferencias clave entre los automóviles y recomienda el que mejor se adapte a las necesidades del usuario. Expón claramente tu razonamiento para la recomendación.`,
});

const summarizeCarComparisonFlow = ai.defineFlow(
  {
    name: 'summarizeCarComparisonFlow',
    inputSchema: SummarizeCarComparisonInputSchema,
    outputSchema: SummarizeCarComparisonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
