'use server';
/**
 * @fileOverview Summarizes car comparisons based on user needs.
 *
 * - summarizeCarComparison - A function that summarizes the comparison and recommends a car.
 * - SummarizeCarComparisonInput - The input type for the summarizeCarComparison function.
 * - SummarizeCarComparisonOutput - The return type for the summarizeCarComparison function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCarComparisonInputSchema = z.object({
  car1Features: z.string().describe('Features of the first car model.'),
  car2Features: z.string().describe('Features of the second car model.'),
  userNeeds: z.string().describe('The user specified needs and preferences.'),
});
export type SummarizeCarComparisonInput = z.infer<typeof SummarizeCarComparisonInputSchema>;

const SummarizeCarComparisonOutputSchema = z.object({
  summary: z.string().describe('A summary of the car comparison highlighting key differences.'),
  recommendation: z.string().describe('Recommendation of which car best suits the user needs.'),
});
export type SummarizeCarComparisonOutput = z.infer<typeof SummarizeCarComparisonOutputSchema>;

export async function summarizeCarComparison(input: SummarizeCarComparisonInput): Promise<SummarizeCarComparisonOutput> {
  return summarizeCarComparisonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCarComparisonPrompt',
  input: {schema: SummarizeCarComparisonInputSchema},
  output: {schema: SummarizeCarComparisonOutputSchema},
  prompt: `You are an expert car advisor. Consider the following features of two cars and the user's needs to provide a summary and recommendation.

Car 1 Features: {{{car1Features}}}
Car 2 Features: {{{car2Features}}}
User Needs: {{{userNeeds}}}

Provide a concise summary of the key differences between the cars and recommend the car that best suits the user's needs. Clearly state your reasoning for the recommendation.`,
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
