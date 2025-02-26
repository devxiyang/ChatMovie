import { GoogleGenerativeAI } from '@google/generative-ai';
import { StreamingTextResponse, GoogleGenerativeAIStream } from 'ai';

// 初始化 Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

// System prompt to guide AI in understanding user's movie preferences
const SYSTEM_PROMPT = `You are a professional movie recommendation assistant. You need to understand user's requirements and convert them into key movie search elements:

1. Movie genres
2. Keywords
3. Other filtering conditions (such as rating, year, etc.)

Please respond in JSON format as follows:
{
  "genres": "comma-separated genre IDs, e.g.: 28,12,16",
  "keywords": "comma-separated keywords, e.g.: action,adventure",
  "options": {
    "vote_average.gte": number,
    "sort_by": "sorting method",
    "with_original_language": "language",
    "primary_release_year": year number
  }
}

Genre ID reference:
28: Action, 12: Adventure, 16: Animation, 35: Comedy, 80: Crime, 
99: Documentary, 18: Drama, 10751: Family, 14: Fantasy, 36: History, 
27: Horror, 10402: Music, 9648: Mystery, 10749: Romance, 
878: Science Fiction, 53: Thriller, 10752: War, 37: Western

Please select the most appropriate genres and keywords based on the user's description.`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Get the latest user message
  const userMessage = messages[messages.length - 1].content;

  // Prepare the complete prompt
  const prompt = `${SYSTEM_PROMPT}\n\nUser request: ${userMessage}\n\nPlease analyze the request and return search conditions in JSON format:`;

  // Call Gemini API
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const response = await model.generateContentStream(prompt);
  
  // Convert to streaming response
  const stream = GoogleGenerativeAIStream(response);
  
  // Return streaming response
  return new StreamingTextResponse(stream);
} 