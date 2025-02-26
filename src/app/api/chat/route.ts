import { GoogleGenerativeAI } from '@google/generative-ai';
import { StreamingTextResponse } from 'ai';
import { z } from 'zod';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

// Define the schema for movie search parameters
const movieSearchSchema = z.object({
  genres: z.string().describe('Comma-separated genre IDs, e.g.: 28,12,16'),
  keywords: z.string().describe('Comma-separated keywords, e.g.: action,adventure'),
  options: z.object({
    'vote_average.gte': z.number().optional(),
    'sort_by': z.string().optional(),
    'with_original_language': z.string().optional(),
    'primary_release_year': z.number().optional(),
    'with_runtime.gte': z.number().optional(),
    'with_runtime.lte': z.number().optional(),
    'without_genres': z.string().optional(),
  }),
});

// System prompt to guide AI in understanding user's movie preferences
const SYSTEM_PROMPT = `You are a professional movie recommendation assistant. You need to understand user's requirements and convert them into key movie search elements.

Genre ID reference:
28: Action, 12: Adventure, 16: Animation, 35: Comedy, 80: Crime, 
99: Documentary, 18: Drama, 10751: Family, 14: Fantasy, 36: History, 
27: Horror, 10402: Music, 9648: Mystery, 10749: Romance, 
878: Science Fiction, 53: Thriller, 10752: War, 37: Western

Please analyze the user's request and provide appropriate search parameters.`;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const userMessage = messages[messages.length - 1].content;

  // Call Gemini API
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const response = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: userMessage }
  ]);

  const result = response.response.text();
  
  try {
    // Parse the response and validate against our schema
    const parsedResponse = JSON.parse(result);
    const validatedResponse = movieSearchSchema.parse(parsedResponse);
    
    // Return the response as a streaming response
    return new StreamingTextResponse(new ReadableStream({
      async start(controller) {
        controller.enqueue(JSON.stringify(validatedResponse));
        controller.close();
      }
    }));
  } catch (error) {
    console.error('Failed to parse or validate response:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 