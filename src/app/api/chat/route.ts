import { GoogleGenerativeAI } from '@google/generative-ai';
import { StreamingTextResponse, GoogleGenerativeAIStream } from 'ai';

// 初始化 Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

// 这个提示词用于指导 AI 理解用户的电影需求
const SYSTEM_PROMPT = `你是一个专业的电影推荐助手。你需要理解用户的需求，并将其转化为电影搜索的关键要素：

1. 电影类型（genres）
2. 关键词（keywords）
3. 其他筛选条件（如评分、年份等）

请以JSON格式返回，格式如下：
{
  "genres": "用逗号分隔的电影类型ID，例如：28,12,16",
  "keywords": "用逗号分隔的关键词，例如：action,adventure",
  "options": {
    "vote_average.gte": 数字,
    "sort_by": "排序方式",
    "with_original_language": "语言",
    "primary_release_year": 年份数字
  }
}

电影类型ID对照表：
28: 动作, 12: 冒险, 16: 动画, 35: 喜剧, 80: 犯罪, 99: 纪录片, 18: 剧情, 
10751: 家庭, 14: 奇幻, 36: 历史, 27: 恐怖, 10402: 音乐, 9648: 悬疑,
10749: 爱情, 878: 科幻, 53: 惊悚, 10752: 战争, 37: 西部

请根据用户的描述，选择最合适的类型和关键词。`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // 获取用户的最新消息
  const userMessage = messages[messages.length - 1].content;

  // 准备完整的提示，包括系统提示和用户消息
  const prompt = `${SYSTEM_PROMPT}\n\n用户需求：${userMessage}\n\n请分析需求并返回JSON格式的搜索条件：`;

  // 调用 Gemini API
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const response = await model.generateContentStream(prompt);
  
  // 转换为流式响应
  const stream = GoogleGenerativeAIStream(response);
  
  // 返回流式响应
  return new StreamingTextResponse(stream);
} 