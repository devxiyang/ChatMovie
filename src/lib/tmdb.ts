// TMDb API 交互函数
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || ''; // 在实际部署时需要添加您的TMDb API密钥
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// TMDb 电影类型常量
export const TMDB_GENRES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
};

// 电影类型中文映射（为中文用户提供更友好的界面）
export const TMDB_GENRES_ZH: Record<number, string> = {
  28: "动作",
  12: "冒险",
  16: "动画",
  35: "喜剧",
  80: "犯罪",
  99: "纪录片",
  18: "剧情",
  10751: "家庭",
  14: "奇幻",
  36: "历史",
  27: "恐怖",
  10402: "音乐",
  9648: "悬疑",
  10749: "爱情",
  878: "科幻",
  10770: "电视电影",
  53: "惊悚",
  10752: "战争",
  37: "西部"
};

// 电影类型接口
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  genres?: {
    id: number;
    name: string;
  }[];
}

// 类型映射接口
export interface GenreMap {
  [key: number]: string;
}

// 按情绪搜索的关键词映射
const moodKeywords: Record<string, string[]> = {
  cheerful: ['comedy', 'family', 'feel-good', 'fun', 'heartwarming'],
  reflective: ['philosophical', 'thought-provoking', 'slow-paced', 'indie', 'character-study'],
  gloomy: ['melancholy', 'sad', 'depressing', 'dramatic', 'grief'],
  humorous: ['comedy', 'parody', 'satire', 'slapstick', 'witty'],
  melancholy: ['nostalgic', 'bittersweet', 'sentimental', 'wistful', 'atmospheric'],
  idyllic: ['fantasy', 'magical', 'dreamlike', 'beautiful', 'whimsical'],
  chill: ['relaxing', 'laid-back', 'easy-going', 'calm', 'cozy'],
  romantic: ['romance', 'love', 'relationship', 'date', 'wedding'],
  weird: ['surreal', 'bizarre', 'quirky', 'strange', 'eccentric'],
  passionate: ['sensual', 'love', 'romance', 'intimate', 'emotional'],
  sleepy: ['slow-paced', 'relaxing', 'atmospheric', 'meditation', 'soothing'],
  angry: ['revenge', 'justice', 'fighting', 'action', 'protest'],
  fearful: ['horror', 'thriller', 'suspense', 'scary', 'tension'],
  lonely: ['isolation', 'solitude', 'alienation', 'outcast', 'journey'],
  tense: ['thriller', 'suspense', 'mystery', 'crime', 'psychological'],
  thoughtful: ['documentary', 'biography', 'educational', 'historical', 'intellectual'],
  thrill: ['action', 'adventure', 'heist', 'thriller', 'exciting'],
  playful: ['comedy', 'adventure', 'animation', 'fun', 'family'],
};

// 获取电影类型列表
export async function fetchGenres(): Promise<GenreMap> {
  try {
    // 优先使用本地定义的中文类型映射
    if (Object.keys(TMDB_GENRES_ZH).length > 0) {
      return TMDB_GENRES_ZH;
    }
    
    // 如果本地映射为空，则从API获取
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json'
        }
      }
    );
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.status_message || '获取电影类型失败');
    }
    
    const genreMap: GenreMap = {};
    data.genres.forEach((genre: { id: number; name: string }) => {
      genreMap[genre.id] = genre.name;
    });
    
    return genreMap;
  } catch (error) {
    console.error('获取电影类型错误:', error);
    // 出错时使用本地定义的英文类型映射作为后备
    return TMDB_GENRES;
  }
}

// 根据关键词搜索电影
async function searchMoviesByKeyword(keyword: string): Promise<Movie[]> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?language=zh-CN&query=${keyword}&page=1&include_adult=false`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json'
        }
      }
    );
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.status_message || '搜索电影失败');
    }
    
    return data.results;
  } catch (error) {
    console.error(`搜索关键词"${keyword}"时出错:`, error);
    return [];
  }
}

// 获取流行电影
export async function getPopularMovies(page: number = 1): Promise<any[]> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 获取所有电影的详细信息和格式化数据
    return data.results.map((movie: Movie) => formatMovie(movie));
  } catch (error) {
    console.error('获取热门电影失败:', error);
    return [];
  }
}

// 根据情绪获取电影
export async function getMoviesByMood(mood: string): Promise<Movie[]> {
  try {
    const keywords = moodKeywords[mood] || moodKeywords.reflective; // 默认使用反思类
    const genreMap = await fetchGenres();

    // 为每个关键词获取电影
    const keywordPromises = keywords.map(keyword => searchMoviesByKeyword(keyword));
    const keywordResults = await Promise.all(keywordPromises);
    
    // 合并结果并去重
    let allMovies: Movie[] = [];
    keywordResults.forEach(movies => {
      allMovies = [...allMovies, ...movies];
    });
    
    // 如果没有找到电影，则返回流行电影
    if (allMovies.length === 0) {
      const popularMovies = await getPopularMovies();
      allMovies = popularMovies;
    }
    
    // 去重
    const uniqueMovies = Array.from(new Map(allMovies.map(movie => [movie.id, movie])).values());
    
    // 限制返回数量并添加类型名称
    return uniqueMovies
      .filter(movie => movie.poster_path) // 只返回有海报的电影
      .slice(0, 9) // 最多返回9部电影
      .map(movie => ({
        ...movie,
        genres: movie.genre_ids.map(id => ({
          id,
          name: genreMap[id] || '未知类型'
        }))
      }));
  } catch (error) {
    console.error(`根据心情"${mood}"获取电影出错:`, error);
    return [];
  }
}

// 格式化电影数据以适合我们的应用
export function formatMovie(movie: Movie) {
  // 获取类型的中文名称
  const genreNames = movie.genres 
    ? movie.genres.map(g => g.name) 
    : movie.genre_ids
      ? movie.genre_ids.map(id => TMDB_GENRES_ZH[id] || TMDB_GENRES[id] || '未知类型')
      : [];
  
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
      : 'https://via.placeholder.com/500x750/E5E7EB/1F2937?text=无海报',
    year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
    rating: movie.vote_average,
    genre: genreNames
  };
}

// 使用discover接口根据条件搜索电影
export async function discoverMovies(options: {
  with_genres?: string,       // 按电影类型筛选，如"28,12"代表动作和冒险片
  with_keywords?: string,     // 按关键词筛选，如"love,romance"
  sort_by?: string,           // 排序方式，如"popularity.desc"
  primary_release_year?: number, // 发行年份
  'vote_average.gte'?: number,  // 最低评分，格式为vote_average.gte
  'vote_average.lte'?: number,  // 最高评分
  'vote_count.gte'?: number,    // 最少评价数量
  with_original_language?: string, // 原始语言，如"en"代表英语
  region?: string,             // 地区，如"US"代表美国
  include_adult?: boolean,     // 是否包含成人内容
  year?: number,               // 上映年份（任何形式的发行）
  without_genres?: string,     // 排除的电影类型
  with_watch_providers?: string, // 流媒体服务提供商
  watch_region?: string,       // 可观看的地区
  with_watch_monetization_types?: string, // 观看类型（租赁、购买等）
  page?: number               // 页码
}): Promise<any[]> {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    
    // 添加语言
    queryParams.append('language', 'zh-CN');
    
    // 添加其他查询参数
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 格式化并返回电影数据
    return data.results.map((movie: Movie) => formatMovie(movie));
  } catch (error) {
    console.error('发现电影失败:', error);
    return [];
  }
}

// 心情到电影类型和关键词的映射
const moodToFilters: Record<string, { genres?: string, keywords?: string }> = {
  // 开心 - 喜剧(35),家庭(10751)
  cheerful: { genres: '35,10751', keywords: 'fun,happy,comedy' },
  
  // 沉思 - 剧情(18)
  reflective: { genres: '18', keywords: 'philosophical,thought-provoking' },
  
  // 忧郁 - 剧情(18),悬疑(9648)
  gloomy: { genres: '18,9648', keywords: 'melancholy,sad,depression' },
  
  // 幽默 - 喜剧(35)
  humorous: { genres: '35', keywords: 'comedy,parody,funny' },
  
  // 感伤 - 剧情(18)
  melancholy: { genres: '18', keywords: 'nostalgic,sentimental' },
  
  // 梦幻 - 奇幻(14),家庭(10751)
  idyllic: { genres: '14,10751', keywords: 'fantasy,magical,beautiful' },
  
  // 放松 - 喜剧(35),家庭(10751),音乐(10402)
  chill: { genres: '35,10751,10402', keywords: 'relaxing,calm' },
  
  // 浪漫 - 爱情(10749)
  romantic: { genres: '10749', keywords: 'love,romance,relationship' },
  
  // 奇怪 - 奇幻(14),科幻(878)
  weird: { genres: '14,878', keywords: 'surreal,bizarre,quirky' },
  
  // 热情 - 爱情(10749),剧情(18),音乐(10402)
  passionate: { genres: '10749,18,10402', keywords: 'love,passion,emotion' },
  
  // 困倦 - 剧情(18),历史(36)
  sleepy: { genres: '18,36', keywords: 'slow-paced,calm' },
  
  // 愤怒 - 动作(28),犯罪(80),战争(10752)
  angry: { genres: '28,80,10752', keywords: 'revenge,justice,fight' },
  
  // 恐惧 - 恐怖(27),惊悚(53)
  fearful: { genres: '27,53', keywords: 'horror,scary,fear' },
  
  // 孤独 - 剧情(18)
  lonely: { genres: '18', keywords: 'solitude,isolation,loneliness' },
  
  // 紧张 - 惊悚(53),犯罪(80),悬疑(9648)
  tense: { genres: '53,80,9648', keywords: 'suspense,thriller,tension' },
  
  // 求知 - 纪录片(99),剧情(18),历史(36)
  thoughtful: { genres: '99,18,36', keywords: 'documentary,educational,intellectual' },
  
  // 刺激 - 动作(28),冒险(12),惊悚(53)
  thrill: { genres: '28,12,53', keywords: 'action,adventure,exciting' },
  
  // 搞笑 - 喜剧(35),动画(16),家庭(10751)
  playful: { genres: '35,16,10751', keywords: 'comedy,fun,humor' }
};

// 根据心情使用discover接口搜索电影
export async function discoverMoviesByMood(mood: string): Promise<Movie[]> {
  try {
    // 获取对应的类型和关键词
    const filters = moodToFilters[mood] || {};
    
    // 根据心情配置更具体的筛选条件
    const options: Record<string, any> = {
      with_genres: filters.genres,
      with_keywords: filters.keywords,
      sort_by: 'popularity.desc', // 按流行度排序
      'vote_average.gte': 6.0,    // 评分至少6分
      'vote_count.gte': 100,      // 至少有100个评价（确保电影质量）
      include_adult: false,       // 不包含成人内容
      page: 1
    };
    
    // 为特定情绪添加额外的筛选条件
    switch(mood) {
      case 'cheerful':
      case 'humorous':
      case 'playful':
        // 快乐类情绪优先选择评分更高的
        options['vote_average.gte'] = 6.5;
        break;
      case 'reflective':
      case 'thoughtful':
        // 思考类情绪可以接受较低的流行度，优先质量
        options.sort_by = 'vote_average.desc';
        break;
      case 'romantic':
      case 'passionate':
        // 感情类情绪排除恐怖和暴力类型
        options.without_genres = '27,53';
        break;
      case 'fearful':
      case 'tense':
        // 恐惧类情绪不需要太高评分，更关注类型本身
        options['vote_average.gte'] = 5.0;
        break;
    }
    
    // 调用discover接口
    return discoverMovies(options);
  } catch (error) {
    console.error(`根据心情"${mood}"发现电影失败:`, error);
    return [];
  }
} 