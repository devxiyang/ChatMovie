import { google } from '@ai-sdk/google';
import { streamText, Message } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// System prompt to guide AI in understanding user's movie preferences
const systemPrompt = `You are a professional movie recommendation assistant. Your task is to help users find movies based on their preferences.

When a user describes what kind of movie they want to watch, analyze their requirements and return a JSON object with search parameters.

Genre ID reference:
28: Action, 12: Adventure, 16: Animation, 35: Comedy, 80: Crime, 
99: Documentary, 18: Drama, 10751: Family, 14: Fantasy, 36: History, 
27: Horror, 10402: Music, 9648: Mystery, 10749: Romance, 
878: Science Fiction, 53: Thriller, 10752: War, 37: Western

Return your response in this format:
{
  "genres": "comma-separated genre IDs",
  "keywords": "comma-separated keywords",
  "options": {
    "vote_average.gte": number,
    "sort_by": "string",
    "with_original_language": "string",
    "primary_release_year": number,
    "with_runtime.gte": number,
    "with_runtime.lte": number,
    "without_genres": "string",
    "with_cast": "string"
  }
}

Example:
User: "I want to watch a Jackie Chan action movie"
Assistant: Let me help you find some Jackie Chan action movies.
{
  "genres": "28",
  "keywords": "martial-arts,action",
  "options": {
    "with_cast": "Jackie Chan",
    "sort_by": "popularity.desc",
    "vote_average.gte": 6.0
  }
}`;

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  const result = streamText({
    model: google('gemini-2.0-flash'),
    messages,
    system: systemPrompt,
    maxSteps: 15,
    temperature: 0.7,
  });

  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  return result.toDataStreamResponse({
    headers,
  });
} 