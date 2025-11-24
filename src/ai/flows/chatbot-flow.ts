'use server';
/**
 * @fileOverview Un flujo de chatbot conversacional para el asistente de DigiCar.
 *
 * - responderChat - Una función que genera una respuesta basada en el historial de la conversación.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define la estructura de un mensaje individual
const MensajeSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
type Mensaje = z.infer<typeof MensajeSchema>;

// Define la entrada para el flujo del chatbot
const ChatbotInputSchema = z.object({
  historial: z.array(MensajeSchema).describe('El historial de la conversación hasta ahora.'),
});
type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

// Define la salida del flujo del chatbot
const ChatbotOutputSchema = z.object({
  respuesta: z.string().describe('La respuesta generada por el asistente.'),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

export async function responderChat(historial: Mensaje[]): Promise<ChatbotOutput> {
  return chatbotFlow({historial});
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: {schema: ChatbotInputSchema},
  output: {schema: ChatbotOutputSchema},
  prompt: `Eres Digi, un asistente de chatbot amigable y experto para DigiCar, una moderna concesionaria de automóviles. Tu objetivo es ayudar a los usuarios a explorar el inventario, responder preguntas sobre los autos, financiamiento y comparaciones.

-   Mantén tus respuestas conversacionales, útiles y no demasiado largas.
-   Si no sabes la respuesta, di que no tienes la información pero que puedes conectar al usuario con un vendedor.
-   Utiliza el historial de conversación para entender el contexto.

Historial de la conversación:
{{#each historial}}
-   {{role}}: {{{content}}}
{{/each}}
`,
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
