import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define the schema for movie search parameters
const movieSearchSchema = z.object({
  search: z.object({
    genres: z.string().describe('Comma-separated genre IDs (e.g., "28" for Action, "35" for Comedy)'),
    keywords: z.string().describe('Comma-separated keywords for the movie search'),
    options: z.object({
      vote_average_gte: z.number().optional().describe('Minimum vote average (1-10)'),
      sort_by: z.string().optional().describe('Sort order (e.g., popularity.desc)'),
      with_original_language: z.string().optional().describe('Original language code (e.g., en, ja)'),
      primary_release_year: z.number().optional().describe('Release year'),
      with_runtime_gte: z.number().optional().describe('Minimum runtime in minutes'),
      with_runtime_lte: z.number().optional().describe('Maximum runtime in minutes'),
      without_genres: z.string().optional().describe('Excluded genre IDs'),
      with_cast: z.string().optional().describe('Search by cast members')
    }).optional()
  })
});

// System prompt to guide AI in understanding user's movie preferences
const systemPrompt = `You are a professional movie recommendation assistant. Your task is to help users find movies based on their preferences.

When a user describes what kind of movie they want to watch:
1. First respond in a friendly way, acknowledging their request
2. Then provide the search parameters that best match their requirements

Genre ID reference:
28: Action
12: Adventure
16: Animation
35: Comedy
80: Crime
99: Documentary
18: Drama
10751: Family
14: Fantasy
36: History
27: Horror
10402: Music
9648: Mystery
10749: Romance
878: Science Fiction
53: Thriller
10752: War
37: Western

Example:
User: "I want to watch a Jackie Chan action movie"
Assistant: I'll help you find some exciting Jackie Chan action movies! Let me search for those for you.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1].content;

    console.log('User message:', userMessage);

    // First, get a friendly response using generateObject
    const textResponse = await generateObject({
      model: google('gemini-2.0-flash'),
      messages: [
        { role: 'system', content: 'You are a friendly movie assistant. Respond to the user\'s request with a brief, encouraging message.' },
        { role: 'user', content: userMessage }
      ],
      schema: z.object({
        response: z.string().describe('A friendly response to the user\'s movie request')
      })
    });

    console.log('Text response:', textResponse);

    // Then, get the search parameters
    const searchParams = await generateObject({
      model: google('gemini-2.0-flash'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      schema: movieSearchSchema,
    });

    console.log('Search params:', searchParams);

    // Combine both responses
    const response = {
      text: textResponse.object.response,
      search: searchParams.object.search
    };

    console.log('Final response:', response);

    // Format the response
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    return new Response(JSON.stringify(response), { headers });
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 