import { Mood, Movie } from '@/types/movies';
import { getAllMovies } from './movies';

// AI推荐所需的参数接口
export interface AIRecommendationParams {
  mood: Mood;
  preferredGenres?: string[];
  minRating?: number;
  era?: 'classic' | 'modern' | 'all';
  personalizedPrompt?: string;
}

// AI推荐结果接口
export interface AIRecommendationResult {
  movies: Movie[];
  reasoning: string;
  suggestedPrompt?: string;
}

/**
 * 获取AI电影推荐
 * 基于用户的心情和偏好，返回推荐的电影列表及原因
 */
export async function getAIRecommendations(params: AIRecommendationParams): Promise<AIRecommendationResult> {
  const { mood, preferredGenres = [], minRating = 0, era = 'all', personalizedPrompt } = params;
  
  // 从数据库获取所有电影
  let movies = getAllMovies();
  
  // 根据心情过滤电影
  // 在实际应用中，此处可能会调用OpenAI API或其他AI服务
  // 这里使用模拟的逻辑来演示功能
  
  // 根据评分过滤
  if (minRating > 0) {
    movies = movies.filter(movie => {
      const scorePercent = movie.score_percent || (movie.vote_average ? movie.vote_average * 10 : 0);
      return scorePercent >= minRating;
    });
  }
  
  // 根据心情匹配适合的电影
  const moodKeywords: Record<Mood, string[]> = {
    happy: ['comedy', 'adventure', 'fun', 'uplifting', 'heartwarming', 'joy', 'happiness', 'light-hearted'],
    sad: ['drama', 'emotional', 'touching', 'melancholy', 'tragic', 'tear-jerker', 'moving'],
    excited: ['action', 'thriller', 'adventure', 'suspense', 'high-energy', 'exhilarating', 'intense'],
    relaxed: ['relax', 'calm', 'peaceful', 'soothing', 'gentle', 'comfort', 'tranquil', 'serene'],
    romantic: ['romance', 'love', 'relationship', 'romantic comedy', 'passion', 'dramatic', 'emotional'],
    thoughtful: ['documentary', 'drama', 'thought-provoking', 'philosophical', 'intellectual', 'complex', 'meaningful'],
    nostalgic: ['classic', 'retro', 'past', 'childhood', 'memory', 'reminiscent', 'vintage', 'timeless'],
    adventurous: ['adventure', 'action', 'exploration', 'journey', 'quest', 'expedition', 'discovery', 'travel'],
    inspired: ['inspiring', 'motivational', 'uplifting', 'empowering', 'visionary', 'achievement', 'triumph', 'success']
  };
  
  // 获取与心情相关的关键词
  const relevantKeywords = moodKeywords[mood];
  
  // 计算每部电影与心情和偏好的匹配度
  const moviesWithScore = movies.map(movie => {
    let matchCount = 0;
    const movieText = `${movie.title} ${movie.overview} ${movie.genres?.map(g => g.name).join(' ')} ${movie.keywords?.map(k => k.name).join(' ')}`.toLowerCase();
    
    // 匹配心情关键词
    relevantKeywords.forEach(keyword => {
      if (movieText.includes(keyword.toLowerCase())) {
        matchCount += 2; // 心情关键词权重较高
      }
    });
    
    // 匹配用户偏好的流派
    if (preferredGenres.length > 0 && movie.genres) {
      movie.genres.forEach(genre => {
        if (preferredGenres.includes(genre.name)) {
          matchCount += 3; // 用户偏好流派权重最高
        }
      });
    }
    
    // 如果用户提供了个性化提示，尝试匹配其中的关键词
    if (personalizedPrompt) {
      const promptKeywords = personalizedPrompt.toLowerCase().split(/\s+/);
      promptKeywords.forEach(word => {
        if (word.length > 3 && movieText.includes(word)) { // 忽略短词
          matchCount += 1;
        }
      });
    }
    
    return { movie, matchCount };
  });
  
  // 按匹配度和评分排序
  moviesWithScore.sort((a, b) => {
    if (b.matchCount !== a.matchCount) {
      return b.matchCount - a.matchCount; // 首先按匹配度排序
    }
    
    // 如果匹配度相同，按评分排序
    const scoreA = a.movie.score_percent || (a.movie.vote_average ? a.movie.vote_average * 10 : 0);
    const scoreB = b.movie.score_percent || (b.movie.vote_average ? b.movie.vote_average * 10 : 0);
    return scoreB - scoreA;
  });
  
  // 选取前5部匹配度最高的电影
  const recommendedMovies = moviesWithScore
    .slice(0, 5)
    .map(item => item.movie);
  
  // 生成推荐理由
  const reasoning = generateRecommendationReasoning(
    mood,
    recommendedMovies,
    preferredGenres,
    personalizedPrompt
  );
  
  // 生成观影建议
  const suggestedPrompt = generateViewingPrompt(mood);
  
  return {
    movies: recommendedMovies,
    reasoning,
    suggestedPrompt
  };
}

/**
 * 生成推荐理由
 */
function generateRecommendationReasoning(
  mood: Mood,
  movies: Movie[],
  preferredGenres: string[] = [],
  personalPrompt?: string
): string {
  // 基于心情的开场白
  const moodIntros: Record<Mood, string[]> = {
    happy: [
      "看起来你现在心情不错！以下是几部能让你笑得更开心的电影。",
      "既然你感到开心，这些轻松愉快的电影应该会很适合你！",
      "为了延续你的好心情，我精心挑选了这几部欢快的电影。"
    ],
    sad: [
      "在低落的时刻，合适的电影可以成为心灵的慰藉。这些电影也许能引起共鸣，或给你带来一些安慰。",
      "当心情低落时，有时一部感人的电影能让我们释放情绪。试试这些充满情感的电影吧。",
      "看来你现在心情有点低落。这些电影或许能给你提供些许心灵安慰。"
    ],
    excited: [
      "充满活力的心情需要相匹配的电影！这些刺激的电影会让你肾上腺素飙升。",
      "既然你感到兴奋，不妨试试这些充满动作和冒险的电影，它们会让你的兴奋感持续不断！",
      "为了配合你高涨的情绪，这些节奏快、紧张刺激的电影绝对不会让你失望。"
    ],
    relaxed: [
      "放松时刻需要轻松的电影！这些电影会让你更加舒适宁静。",
      "既然你想要放松一下，这些节奏缓慢、氛围舒适的电影正是不错的选择。",
      "为了维持你的放松状态，我选择了几部能让人心情平静的电影。"
    ],
    romantic: [
      "浪漫的心情配上浪漫的电影，完美！这些电影充满了爱情和感动。",
      "如果你现在感觉浪漫，这些爱情故事一定会让你沉浸其中，体验各种爱的形式。",
      "为了配合你的浪漫情怀，我选择了这几部感人至深的爱情电影。"
    ],
    thoughtful: [
      "深度思考的时刻需要有深度的电影。这些电影会让你思考生活的各个方面。",
      "既然你处于沉思状态，这些发人深省的电影应该能与你当前的思绪相呼应。",
      "当我们想要思考时，这些富有哲理性的电影能够提供新的视角和洞见。"
    ],
    nostalgic: [
      "怀旧的心情最适合经典电影了！这些电影会带你回到过去的美好时光。",
      "既然你感到怀旧，这些有历史感的电影能够唤起你的回忆和情感共鸣。",
      "这些经典之作完美契合你的怀旧情绪，它们承载了不同时代的记忆。"
    ],
    adventurous: [
      "冒险的心需要冒险的电影！这些充满探索精神的电影会激发你的勇气。",
      "既然你向往冒险，这些电影将带你踏上奇妙的旅程，探索未知的世界。",
      "为了满足你的冒险心，我挑选了这些充满刺激和探索的精彩电影。"
    ],
    inspired: [
      "寻找灵感的时刻，这些电影会点燃你的创造力和热情！",
      "既然你期待被激励，这些充满正能量的电影一定能为你注入新的活力。",
      "这些激励人心的故事将帮助你找到前进的动力和创新的灵感。"
    ]
  };
  
  // 随机选择一个开场白
  const intros = moodIntros[mood];
  const intro = intros[Math.floor(Math.random() * intros.length)];
  
  // 生成个性化内容
  let personalContent = "";
  if (personalPrompt) {
    personalContent = `\n\n你提到"${personalPrompt}"，我特别考虑了这一点。`;
  }
  
  // 生成流派偏好内容
  let genreContent = "";
  if (preferredGenres.length > 0) {
    genreContent = `\n\n考虑到你喜欢${preferredGenres.join('、')}类型的电影，我的推荐特别侧重于这些元素。`;
  }
  
  // 生成电影亮点内容
  let highlightsContent = "";
  if (movies.length > 0) {
    const firstMovie = movies[0];
    highlightsContent = `\n\n其中，《${firstMovie.title}》特别值得一提，${getMovieHighlight(firstMovie, mood)}`;
    
    if (movies.length > 1) {
      const secondMovie = movies[1];
      highlightsContent += `而《${secondMovie.title}》则${getMovieHighlight(secondMovie, mood)}`;
    }
  }
  
  // 组合完整推荐理由
  return `${intro}${personalContent}${genreContent}${highlightsContent}\n\n希望这些电影能够满足你当前的心情需求！`;
}

/**
 * 根据电影和心情生成电影亮点描述
 */
function getMovieHighlight(movie: Movie, mood: Mood): string {
  const highlights: Record<Mood, string[]> = {
    happy: [
      "它轻松幽默的情节会让你开怀大笑。",
      "这部电影充满欢乐元素，绝对能提升你的好心情。",
      "它的喜剧效果一流，看完后你会感到更加愉快。"
    ],
    sad: [
      "它深刻的情感表达可能会引起你的共鸣。",
      "这部电影探讨了人生的无常，但最终传递出希望的信息。",
      "它真实地描绘了人物的情感挣扎，会让你感到被理解。"
    ],
    excited: [
      "它紧张刺激的情节会让你一直处于兴奋状态。",
      "这部电影充满惊险和冒险，完美配合你高涨的情绪。",
      "它的动作场景设计精彩，绝对能满足你对刺激的渴望。"
    ],
    relaxed: [
      "它舒缓安静的节奏会让你的心情更加平静。",
      "这部电影温和的叙事方式非常适合放松的时刻。",
      "它的唯美画面和舒适氛围能让你彻底放松下来。"
    ],
    romantic: [
      "它温馨感人的爱情故事会触动你的心弦。",
      "这部电影展现了爱情的美好与复杂，非常适合你现在的心情。",
      "它对情感的细腻描绘会让你沉浸在浪漫的氛围中。"
    ],
    thoughtful: [
      "它提出的哲学问题会引发你更深层次的思考。",
      "这部电影以独特的视角探讨了人性，会给你带来新的启发。",
      "它对社会议题的深入探讨非常符合你当前的思考状态。"
    ],
    nostalgic: [
      "它完美捕捉了那个时代的精髓，会唤起你美好的回忆。",
      "这部经典之作充满了时代特色，让人沉浸在怀旧的情感中。",
      "它所展现的历史场景和情感会让你重新连接过去的美好。"
    ],
    adventurous: [
      "它扣人心弦的冒险情节会满足你对探索的渴望。",
      "这部电影充满未知和挑战，正如你所期待的那样刺激。",
      "它的探险旅程和视觉奇观会让你体验前所未有的冒险感。"
    ],
    inspired: [
      "它的励志故事会给你带来前进的动力和创新的灵感。",
      "这部电影展现了人物如何克服挑战，非常适合寻找激励的你。",
      "它传递的积极信息和成功经验会帮助你找到自己的方向。"
    ]
  };
  
  const options = highlights[mood];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * 生成观影建议
 */
function generateViewingPrompt(mood: Mood): string {
  const prompts: Record<Mood, string[]> = {
    happy: [
      "准备一些你最喜欢的零食，和朋友一起观看会让欢乐加倍！",
      "这些电影非常适合与家人朋友共享，笑声总是在分享时更加美好。",
      "试着在白天观看这些电影，阳光和欢笑更配哦！"
    ],
    sad: [
      "为自己准备一个舒适的环境，也许一杯热茶和一条温暖的毯子会很合适。",
      "给自己一些空间去感受电影中的情感，有时候释放情绪是很健康的方式。",
      "观影后可以听一些轻松的音乐或与朋友聊天，帮助平复情绪。"
    ],
    excited: [
      "确保你的音响系统调到最佳状态，这些电影的音效是体验的重要部分！",
      "准备好你的爆米花和饮料，这将是一场视听盛宴！",
      "如果可能，选择大屏幕观看会让体验更加震撼！"
    ],
    relaxed: [
      "选择一个安静舒适的环境，准备一杯温热的饮品，完全放松地观看。",
      "可以在傍晚或夜晚观看，柔和的灯光会增强放松的氛围。",
      "观影前做几次深呼吸，让身心都准备好享受这段平静的时光。"
    ],
    romantic: [
      "创造一个温馨的氛围，也许一些蜡烛和柔和的灯光会很适合。",
      "这些电影非常适合与伴侣共享，或者在思念某人的时候独自观看。",
      "准备一些温暖的饮品和甜点，让整个体验更加美好。"
    ],
    thoughtful: [
      "选择一个安静无打扰的环境，这样你可以完全沉浸在电影的思想中。",
      "准备一个笔记本，记录下电影中触动你的想法或对白。",
      "观影后给自己一些时间思考，或许与志同道合的朋友讨论电影会带来更多启发。"
    ],
    nostalgic: [
      "准备一些与你童年或过去有关的物品，增强怀旧的感觉。",
      "考虑邀请那些与你分享过这些记忆的朋友或家人一起观看。",
      "观影后翻看一些旧照片，让回忆更加丰富完整。"
    ],
    adventurous: [
      "尝试在不同的环境中观看，比如户外投影或者创建一个特别的观影空间。",
      "准备一些你从未尝试过的小吃或饮料，增加新鲜感。",
      "观影后考虑计划一次小冒险，将电影中的探索精神带入现实生活。"
    ],
    inspired: [
      "准备一个笔记本，记录下电影中激励你的台词或场景。",
      "选择一个能让你集中注意力的环境，充分吸收电影中的正能量。",
      "观影后给自己设定一个小目标，将受到的启发转化为行动。"
    ]
  };
  
  const options = prompts[mood];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * 获取AI电影分析
 * 分析电影的各方面信息
 */
export function getAIMovieAnalysis(movie: Movie): string {
  // 在实际应用中，这里可能会调用OpenAI API生成分析
  // 这里提供一个模拟版本
  
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "未知";
  const genres = movie.genres ? movie.genres.map(g => g.name).join(", ") : "未分类";
  const directors = movie.directors ? movie.directors.map(d => d.name).join(", ") : "未知导演";
  
  const analysis = `
《${movie.title}》(${releaseYear}) 是一部${genres}电影，由${directors}执导。

电影概述: ${movie.overview || "暂无概述"}

这部电影在全球观众中获得了 ${movie.score_percent || (movie.vote_average ? movie.vote_average * 10 : "未知")}% 的好评，有 ${movie.vote_count || "未知数量"} 名观众参与了评分。

${getRandomAnalysisElement(movie, releaseYear)}

如果您喜欢这类电影，可能也会对类似的${movie.genres && movie.genres.length > 0 ? movie.genres[0].name : ""}片感兴趣。
  `;
  
  return analysis;
}

/**
 * 生成随机分析元素
 */
function getRandomAnalysisElement(movie: Movie, releaseYear: string | number): string {
  const elements = [
    `从电影的视觉效果来看，《${movie.title}》在当时(${releaseYear})可以说是相当具有冲击力的，其${Math.random() > 0.5 ? "色彩运用" : "摄影技术"}让人印象深刻。`,
    
    `《${movie.title}》的${Math.random() > 0.5 ? "配乐" : "剪辑"}是其成功的关键因素之一，${Math.random() > 0.5 ? "节奏感极强" : "给观众留下了深刻印象"}。`,
    
    `这部电影在${Math.random() > 0.5 ? "表演" : "剧本"}方面有着出色的表现，${movie.cast && movie.cast.length > 0 ? movie.cast[0].name : "主演"}的表演尤其令人印象深刻。`,
    
    `从文化影响力来看，《${movie.title}》对${Math.random() > 0.5 ? "电影工业" : "流行文化"}产生了深远的影响，至今仍被许多人讨论和引用。`
  ];
  
  return elements[Math.floor(Math.random() * elements.length)];
} 