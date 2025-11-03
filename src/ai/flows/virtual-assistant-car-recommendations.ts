'use server';
/**
 * @fileOverview Un asistente virtual que ofrece recomendaciones personalizadas de automóviles basadas en las necesidades y preferencias del usuario.
 *
 * - virtualAssistantCarRecommendations - Una función que maneja el proceso de recomendación de automóviles.
 * - VirtualAssistantCarRecommendationsInput - El tipo de entrada para la función virtualAssistantCarRecommendations.
 * - VirtualAssistantCarRecommendationsOutput - El tipo de retorno para la función virtualAssistantCarRecommendations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VirtualAssistantCarRecommendationsInputSchema = z.object({
  userInput: z.string().describe('La consulta de entrada del usuario para recomendaciones de automóviles.'),
});
export type VirtualAssistantCarRecommendationsInput = z.infer<typeof VirtualAssistantCarRecommendationsInputSchema>;

const VirtualAssistantCarRecommendationsOutputSchema = z.object({
  recommendation: z.string().describe('La recomendación de automóvil basada en la entrada del usuario.'),
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
  prompt: `Eres un asistente virtual que ofrece recomendaciones personalizadas de automóviles basadas en las necesidades y preferencias del usuario.

  Basado en la entrada del usuario: {{{userInput}}},
  recomienda un modelo de automóvil.
  Mantén la recomendación concisa e informativa.
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
