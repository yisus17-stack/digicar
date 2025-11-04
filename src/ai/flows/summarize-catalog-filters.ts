'use server';
/**
 * @fileOverview Summarizes car catalog filters and user input to provide a recommendation.
 *
 * - summarizeCatalogFilters - A function that handles the car recommendation process based on filters.
 * - SummarizeCatalogFiltersInput - The input type for the summarizeCatalogFilters function.
 * - SummarizeCatalogFiltersOutput - The return type for the summarizeCatalogFilters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCatalogFiltersInputSchema = z.object({
  filters: z.string().describe('The JSON stringified filters selected by the user.'),
  userDescription: z.string().describe('The user\'s description of what they are looking for in a car.'),
  carList: z.string().describe('A JSON stringified list of available cars to choose from.')
});
export type SummarizeCatalogFiltersInput = z.infer<typeof SummarizeCatalogFiltersInputSchema>;

const SummarizeCatalogFiltersOutputSchema = z.object({
  recommendation: z.string().describe('The car recommendation based on the user\'s input and filters. Includes a brief justification.'),
  recommendedCarId: z.string().describe('The ID of the recommended car from the provided list.')
});
export type SummarizeCatalogFiltersOutput = z.infer<typeof SummarizeCatalogFiltersOutputSchema>;

export async function summarizeCatalogFilters(input: SummarizeCatalogFiltersInput): Promise<SummarizeCatalogFiltersOutput> {
  return summarizeCatalogFiltersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCatalogFiltersPrompt',
  input: {schema: SummarizeCatalogFiltersInputSchema},
  output: {schema: SummarizeCatalogFiltersOutputSchema},
  prompt: `Eres un asesor de autos experto. Tu tarea es recomendar el mejor auto para un usuario basándote en sus preferencias.

Analiza la siguiente información:
1.  **Filtros del usuario**: {{{filters}}}
2.  **Descripción del usuario**: {{{userDescription}}}
3.  **Autos disponibles**: {{{carList}}}

Basado en toda esta información, selecciona el mejor auto de la lista que coincida con las necesidades del usuario.

Proporciona una recomendación concisa explicando por qué elegiste ese auto e incluye su ID en el campo \`recommendedCarId\`.
Ejemplo de respuesta: "Basado en tu necesidad de un auto de bajo consumo para traslados diarios, te recomiendo el Stratus Elegance. Su motor híbrido es perfecto para ahorrar en gasolina."
Si ningún auto específico destaca, haz una recomendación general basada en los filtros.
`,
});

const summarizeCatalogFiltersFlow = ai.defineFlow(
  {
    name: 'summarizeCatalogFiltersFlow',
    inputSchema: SummarizeCatalogFiltersInputSchema,
    outputSchema: SummarizeCatalogFiltersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
