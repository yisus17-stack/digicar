'use server';
/**
 * @fileOverview A virtual assistant that provides personalized car recommendations based on user needs and preferences.
 *
 * - virtualAssistantCarRecommendations - A function that handles the car recommendation process.
 * - VirtualAssistantCarRecommendationsInput - The input type for the virtualAssistantCarRecommendations function.
 * - VirtualAssistantCarRecommendationsOutput - The return type for the virtualAssistantCarRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VirtualAssistantCarRecommendationsInputSchema = z.object({
  userInput: z.string().describe('The user input query for car recommendations.'),
});
export type VirtualAssistantCarRecommendationsInput = z.infer<typeof VirtualAssistantCarRecommendationsInputSchema>;

const VirtualAssistantCarRecommendationsOutputSchema = z.object({
  recommendation: z.string().describe('The car recommendation based on the user input.'),
});
export type VirtualAssistantCarRecommendationsOutput = z.infer<typeof VirtualAssistantCarRecommendationsOutputSchema>;

export async function virtualAssistantCarRecommendations(
  input: VirtualAssistantCarRecommendationsInput
): Promise<VirtualAssistantCarRecommendationsOutput> {
  return virtualAssistantCarRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'virtualAssistantCarRecommendationsPrompt',
  input: {schema: VirtualAssistantCarRecommendationsInputSchema},
  output: {schema: VirtualAssistantCarRecommendationsOutputSchema},
  prompt: `You are a virtual assistant that provides personalized car recommendations based on user needs and preferences.

  Based on the user input: {{{userInput}}},
  recommend a car model.
  Keep the recommendation concise and informative.
  `,
});

const virtualAssistantCarRecommendationsFlow = ai.defineFlow(
  {
    name: 'virtualAssistantCarRecommendationsFlow',
    inputSchema: VirtualAssistantCarRecommendationsInputSchema,
    outputSchema: VirtualAssistantCarRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
