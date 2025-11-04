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
  prompt: `You are an expert car advisor. Your task is to recommend the best car for a user based on their preferences.

Analyze the following information:
1.  **User's Filters**: {{{filters}}}
2.  **User's Description**: {{{userDescription}}}
3.  **Available Cars**: {{{carList}}}

Based on all this information, select the single best car from the list that matches the user's needs.

Provide a concise recommendation explaining why you chose that car and include its ID in the \`recommendedCarId\` field.
Example response: "Based on your need for a fuel-efficient car for daily commutes, I recommend the Stratus Elegance. Its hybrid engine is perfect for saving on gas."
If no specific car stands out, make a general recommendation based on the filters.
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
