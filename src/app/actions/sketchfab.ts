'use server';

interface SketchfabSearchResponse {
  results: {
    uid: string;
    name: string;
    embed_url: string;
  }[];
}

/**
 * Fetches a 3D model from Sketchfab based on a car's make and model.
 * This is a server action and the API token is kept secure on the server.
 * @param make - The brand of the car (e.g., "Horizon")
 * @param model - The model of the car (e.g., "Explorer")
 * @returns The UID of the best matching model, or null if not found.
 */
export async function fetchSketchfabModel(make: string, model: string): Promise<string | null> {
  const query = `${make} ${model}`;
  const sketchfabApiUrl = `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(query)}&downloadable=true&sort_by=-likeCount`;

  try {
    const response = await fetch(sketchfabApiUrl, {
      headers: {
        Authorization: `Token ${process.env.SKETCHFAB_TOKEN}`,
      },
      next: { revalidate: 3600 } // Cache the response for 1 hour
    });

    if (!response.ok) {
      console.error('Sketchfab API Error:', response.status, await response.text());
      return null;
    }

    const data: SketchfabSearchResponse = await response.json();

    if (data.results && data.results.length > 0) {
      // Return the UID of the first (most liked) result
      return data.results[0].uid;
    }

    return null;
  } catch (error) {
    console.error('Error fetching from Sketchfab API:', error);
    return null;
  }
}
