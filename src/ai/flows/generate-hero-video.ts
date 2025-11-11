'use server';
/**
 * @fileOverview A flow to generate a cinematic hero video using Veo.
 *
 * - generateHeroVideo - A function that generates the video.
 */
import { ai } from '@/ai/genkit';
import { googleAI }from '@genkit-ai/google-genai';
import { z } from 'zod';

export async function generateHeroVideo(): Promise<string | null> {
  let { operation } = await ai.generate({
    model: googleAI.model('veo-2.0-generate-001'),
    prompt: 'A cinematic, slow-motion shot of a sleek, futuristic concept car driving on a coastal highway at sunset. The lighting is golden and warm. High-quality, photorealistic, 8k.',
    config: {
      durationSeconds: 5,
      aspectRatio: '16:9',
    },
  });

  if (!operation) {
    console.error('Video generation operation failed to start.');
    return null;
  }

  // Poll for completion
  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    try {
      operation = await ai.checkOperation(operation);
    } catch (e: any) {
       console.error("Error checking video generation operation:", e);
       return null;
    }
  }

  if (operation.error) {
    console.error('Failed to generate video:', operation.error.message);
    return null;
  }
  
  const video = operation.output?.message?.content.find((p) => !!p.media);
  
  if (!video || !video.media?.url) {
    console.error('Failed to find the generated video in the operation output.');
    return null;
  }

  // The URL needs to be converted to a base64 data URI to be embedded.
  // This requires fetching the content from the signed URL.
  try {
    const fetch = (await import('node-fetch')).default;
    const videoDownloadResponse = await fetch(
      `${video.media.url}&key=${process.env.GEMINI_API_KEY}`
    );
    
    if (!videoDownloadResponse.ok) {
        throw new Error(`Failed to download video: ${videoDownloadResponse.statusText}`);
    }

    const buffer = await videoDownloadResponse.buffer();
    const base64Video = buffer.toString('base64');
    const contentType = video.media.contentType || 'video/mp4';

    return `data:${contentType};base64,${base64Video}`;

  } catch (error) {
    console.error("Error converting video URL to data URI:", error);
    return null;
  }
}