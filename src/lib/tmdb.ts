// TMDb API 交互函数
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || ''; // 在实际部署时需要添加您的TMDb API密钥
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// 检查API密钥是否有效，提供友好的错误提示
const validateApiKey = () => {
  if (!TMDB_API_KEY) {
    console.error('警告: TMDb API密钥未设置。请在.env.local文件中添加NEXT_PUBLIC_TMDB_API_KEY=您的密钥');
    return false;
  }
  return true;
};

// 通用API请求函数，增加重试和错误处理
const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 2): Promise<any> => {
  try {
    if (!validateApiKey()) {
      throw new Error('TMDb API密钥未设置或无效');
    }
    
    // 设置超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // 检查特定错误代码
      if (response.status === 401) {
        throw new Error('TMDb API密钥无效或已过期');
      } else if (response.status === 429) {
        // 达到速率限制，等待后重试
        if (retries > 0) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '2', 10);
          console.log(`达到API速率限制，将在${retryAfter}秒后重试...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          return fetchWithRetry(url, options, retries - 1);
        }
      }
      throw new Error(`API请求失败: ${response.status} - ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('API请求超时');
      }
      if (retries > 0) {
        console.log(`API请求失败，将重试: ${error.message}`);
        // 指数退避重试
        await new Promise(resolve => setTimeout(resolve, (3 - retries) * 1000));
        return fetchWithRetry(url, options, retries - 1);
      }
    }
    throw error;
  }
};

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
  runtime?: number;
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
      official?: boolean;
      published_at?: string;
      size?: number;
    }[];
  };
}

// 电影预告片接口
export interface MovieVideo {
  id: string;
  key: string;      // YouTube视频ID
  name: string;     // 视频标题
  site: string;     // 视频网站 (例如 "YouTube")
  size: number;     // 视频质量 (如 360, 480, 720, 1080)
  type: string;     // 视频类型 (如 "Trailer", "Teaser", "Clip")
  official: boolean; // 是否为官方视频
  published_at: string; // 发布日期
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
      `${TMDB_BASE_URL}/search/movie?language=en-US&query=${keyword}&page=1&include_adult=false`, {
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
      `${TMDB_BASE_URL}/movie/popular?language=en-US&page=${page}`, {
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

// 获取电影详情和预告片
export async function getMovieDetails(movieId: number): Promise<any> {
  try {
    // 添加强化的重试逻辑
    let attempts = 0;
    const maxAttempts = 3; // 增加最大重试次数
    let lastError: Error | null = null;
    
    while (attempts < maxAttempts) {
      attempts++;
      try {
        console.log(`获取电影ID ${movieId} 的详情 (尝试 ${attempts}/${maxAttempts})`);
        
        // 使用随机延迟避免API限流
        if (attempts > 1) {
          const delay = 1000 + Math.random() * 2000;
          console.log(`等待 ${Math.round(delay)}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // 使用增强的fetchWithRetry替代原生fetch
        const data = await fetchWithRetry(
          `${TMDB_BASE_URL}/movie/${movieId}?append_to_response=videos&language=en-US`,
          {
            headers: {
              'Authorization': `Bearer ${TMDB_API_KEY}`,
              'accept': 'application/json'
            }
          }
        );
        
        // 增强的视频验证逻辑
        let videosFetched = false;
        
        if (!data.videos || !data.videos.results || data.videos.results.length === 0) {
          console.log(`电影ID ${movieId} 没有视频，尝试单独获取`);
          
          // 如果没有videos字段或结果为空，尝试单独获取视频
          try {
            const videos = await getMovieVideos(movieId);
            if (videos && videos.length > 0) {
              data.videos = { results: videos };
              videosFetched = true;
              console.log(`为电影ID ${movieId} 单独获取到 ${videos.length} 个视频`);
            } else {
              console.log(`无法为电影ID ${movieId} 获取视频`);
            }
          } catch (videoErr) {
            console.error(`为电影ID ${movieId} 单独获取视频失败:`, videoErr);
          }
        } else {
          videosFetched = true;
          console.log(`电影ID ${movieId} 已获取到 ${data.videos.results.length} 个视频`);
        }
        
        // 如果成功获取到视频或已达到最大重试次数，返回数据
        if (videosFetched || attempts >= maxAttempts) {
          return data;
        }
        
        // 否则继续重试
        console.log(`电影ID ${movieId} 没有视频，将重试...`);
      } catch (err) {
        lastError = err as Error;
        if (attempts >= maxAttempts) {
          console.error(`获取电影ID ${movieId} 详情失败，已达最大重试次数:`, err);
          throw err;
        }
        console.log(`获取电影ID ${movieId} 详情失败 (尝试 ${attempts}/${maxAttempts}):`, err);
      }
    }
    
    // 如果所有重试都失败，抛出最后的错误
    if (lastError) throw lastError;
    throw new Error(`无法获取电影ID ${movieId} 的详情，已达最大重试次数`);
  } catch (error) {
    console.error(`获取电影ID ${movieId} 的详情失败:`, error);
    return null;
  }
}

// 获取电影预告片
export async function getMovieVideos(movieId: number): Promise<MovieVideo[]> {
  try {
    // 添加重试逻辑
    let attempts = 0;
    const maxAttempts = 2;
    let lastError: Error | null = null;
    
    while (attempts < maxAttempts) {
      attempts++;
      try {
        console.log(`获取电影ID ${movieId} 的视频 (尝试 ${attempts}/${maxAttempts})`);
        
        // 使用随机延迟避免API限流
        if (attempts > 1) {
          const delay = 800 + Math.random() * 1200;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const response = await fetch(
          `${TMDB_BASE_URL}/movie/${movieId}/videos?language=en-US`, {
            headers: {
              'Authorization': `Bearer ${TMDB_API_KEY}`,
              'accept': 'application/json'
            },
            // 增加超时时间
            signal: AbortSignal.timeout(8000)
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 增强的视频筛选逻辑
        // 首先尝试找英文预告片，如果没有，尝试任何语言的预告片
        let trailers = data.results
          .filter((video: MovieVideo) => 
            (video.type === 'Trailer' || video.type === 'Teaser') && 
            video.site === 'YouTube'
          )
          // 按发布日期排序，最新的排在前面
          .sort((a: MovieVideo, b: MovieVideo) => 
            new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
          );
        
        // 如果没有找到预告片，尝试再次请求其他语言的视频
        if (trailers.length === 0 && attempts === 1) {
          console.log(`未找到电影ID ${movieId} 的英文预告片，尝试其他语言`);
          continue;
        }
        
        // 如果仍然没有找到预告片，接受任何YouTube视频
        if (trailers.length === 0) {
          console.log(`未找到电影ID ${movieId} 的预告片，尝试任何YouTube视频`);
          trailers = data.results
            .filter((video: MovieVideo) => video.site === 'YouTube')
            .sort((a: MovieVideo, b: MovieVideo) => 
              new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
            );
        }
        
        console.log(`电影ID ${movieId} 视频搜索结果: 找到 ${trailers.length} 个视频`);
        return trailers;
      } catch (err) {
        lastError = err as Error;
        if (attempts >= maxAttempts) {
          console.error(`获取电影ID ${movieId} 的视频失败，已达最大重试次数:`, err);
          throw err;
        }
        console.log(`获取电影ID ${movieId} 的视频失败 (尝试 ${attempts}/${maxAttempts}):`, err);
      }
    }
    
    // 如果所有重试都失败，抛出最后的错误
    if (lastError) throw lastError;
    throw new Error(`无法获取电影ID ${movieId} 的视频，已达最大重试次数`);
  } catch (error) {
    console.error(`获取电影ID ${movieId} 的预告片失败:`, error);
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
export interface DiscoverMovieOptions {
  certification?: string;
  'certification.gte'?: string;
  'certification.lte'?: string;
  certification_country?: string;
  include_adult?: boolean;
  include_video?: boolean;
  language?: string;
  page?: number;
  primary_release_year?: number;
  'primary_release_date.gte'?: string;
  'primary_release_date.lte'?: string;
  region?: string;
  'release_date.gte'?: string;
  'release_date.lte'?: string;
  sort_by?: string;
  'vote_average.gte'?: number;
  'vote_average.lte'?: number;
  'vote_count.gte'?: number;
  'vote_count.lte'?: number;
  watch_region?: string;
  with_cast?: string;
  with_companies?: string;
  with_crew?: string;
  with_genres?: string;
  with_keywords?: string;
  with_origin_country?: string;
  with_original_language?: string;
  with_people?: string;
  with_release_type?: number[];
  'with_runtime.gte'?: number;
  'with_runtime.lte'?: number;
  with_watch_monetization_types?: ('flatrate' | 'free' | 'ads' | 'rent' | 'buy')[];
  with_watch_providers?: string;
  without_companies?: string;
  without_genres?: string;
  without_keywords?: string;
  without_watch_providers?: string;
  year?: number;
}

export async function discoverMovies(options: DiscoverMovieOptions): Promise<any[]> {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    
    // 添加语言参数，默认使用中文
    queryParams.append('language', options.language || 'zh-CN');
    
    // 添加其他查询参数
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // 处理数组类型的参数
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','));
        } else {
          queryParams.append(key, value.toString());
        }
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
    const options: DiscoverMovieOptions = {
      language: 'en-US',
      with_genres: filters.genres,
      with_keywords: filters.keywords,
      sort_by: 'popularity.desc', // 改为按流行度排序，提高返回率
      'vote_average.gte': 6.0, // 降低默认评分阈值至6分，以获取更多电影
      'vote_count.gte': 50, // 降低投票数阈值
      include_adult: false,
      with_original_language: 'en', // 默认英语电影
      'with_runtime.gte': 60, // 至少60分钟的电影
    };
    
    // 为特定情绪添加额外的筛选条件，但降低限制
    switch(mood) {
      case 'cheerful':
      case 'humorous':
      case 'playful':
        // 快乐类情绪优先选择流行的喜剧片
        options.sort_by = 'popularity.desc';
        break;
      case 'reflective':
      case 'thoughtful':
        // 思考类情绪优先质量而非流行度，但降低门槛
        options['vote_average.gte'] = 6.5; // 降低评分要求
        options['vote_count.gte'] = 70; // 降低投票要求
        options.with_original_language = 'en|fr|de|es|it'; // 更多欧美电影
        break;
      case 'romantic':
      case 'passionate':
        // 感情类情绪排除恐怖和暴力类型
        options.without_genres = '27,53';
        options.sort_by = 'popularity.desc'; // 优先流行度
        break;
      case 'fearful':
      case 'tense':
        // 恐惧类情绪关注类型本身
        options.sort_by = 'popularity.desc';
        break;
      case 'gloomy':
      case 'melancholy':
        // 忧郁和感伤类情绪
        options.without_genres = '35,16';
        break;
      case 'idyllic':
        // 梦幻情绪适合奇幻类电影
        options.with_genres = '14,10751,16';
        options.sort_by = 'popularity.desc';
        break;
      case 'weird':
        // 奇怪情绪需要怪诞、非主流的电影
        options.sort_by = 'popularity.desc'; // 改为流行度优先
        options.with_original_language = 'en|fr|ja|kr'; // 增加韩国电影
        break;
      case 'angry':
        // 愤怒情绪需要动作和复仇类电影
        options.with_keywords = 'revenge,justice,fight,vendetta';
        options.with_genres = '28,80,10752';
        break;
      case 'lonely':
        // 孤独情绪适合成长、独处、自我发现的电影
        options.with_keywords = 'solitude,isolation,loneliness,journey,self-discovery';
        options.sort_by = 'popularity.desc'; // 改为流行度优先
        break;
      default:
        // 默认情况，以流行度为主
        options.sort_by = 'popularity.desc';
        break;
    }
    
    // 获取前40部电影（每页20部，获取前2页）
    const moviePromises = [1, 2].map(page => {
      return discoverMovies({ ...options, page });
    });
    
    // 等待所有请求完成
    const movieResults = await Promise.all(moviePromises);
    
    // 合并所有页面的结果
    let movies = movieResults.flat();
    
    // 如果结果少于5部电影，尝试放宽条件后再次搜索
    if (movies.length < 5) {
      console.log(`首次搜索只找到${movies.length}部电影，放宽条件再搜索`);
      // 降低评分要求，降到5.0
      options['vote_average.gte'] = 5.0;
      options['vote_count.gte'] = 20;
      
      // 如果指定了电影类型，可以尝试只保留主要类型
      if (options.with_genres && options.with_genres.includes(',')) {
        const genres = options.with_genres.split(',');
        options.with_genres = genres[0];
      }
      
      // 移除一些可能限制太严格的条件
      delete options['with_runtime.gte'];
      delete options['with_runtime.lte'];
      delete options.with_keywords;
      delete options.without_genres;
      
      // 再次获取2页数据
      const fallbackPromises = [1, 2].map(page => {
        return discoverMovies({ ...options, page });
      });
      
      const fallbackResults = await Promise.all(fallbackPromises);
      movies = [...movies, ...fallbackResults.flat()];
      console.log(`放宽条件后找到${movies.length}部电影`);
    }
    
    // 如果还是没有找到电影，尝试获取流行电影而不考虑评分
    if (movies.length === 0) {
      console.log(`无法找到匹配心情 "${mood}" 的电影，返回流行电影`);
      // 获取3页热门电影
      const popularPromises = [1, 2, 3].map(page => getPopularMovies(page));
      const popularResults = await Promise.all(popularPromises);
      movies = popularResults.flat();
      console.log(`获取到${movies.length}部流行电影作为后备`);
    }
    
    // 去重
    const uniqueMovies = Array.from(new Map(movies.map(movie => [movie.id, movie])).values());
    
    // 为所有电影获取详细信息和视频 - 改进这部分逻辑
    console.log(`为${uniqueMovies.length}部电影获取详细信息和视频`);
    
    // 更小的批次和更好的间隔处理
    const batchSize = 5; // 增加批次大小以提高效率
    const batches = [];
    const maxMovies = Math.min(uniqueMovies.length, 30); // 增加电影最大数量
    
    for (let i = 0; i < maxMovies; i += batchSize) {
      batches.push(uniqueMovies.slice(i, i + batchSize));
    }
    
    console.log(`将${maxMovies}部电影分成${batches.length}批处理，每批${batchSize}部电影`);
    
    let moviesWithDetails: Movie[] = [];
    
    // 使用顺序处理每个批次，避免过多并发请求
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`处理第${batchIndex + 1}/${batches.length}批电影 (${batch.length}部)`);
      
      // 在批次之间添加随机延迟，避免API限流
      if (batchIndex > 0) {
        const batchDelay = 1000 + Math.random() * 1000; // 减少等待时间
        console.log(`批次间等待${Math.round(batchDelay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, batchDelay));
      }
      
      try {
        // 处理每个批次中的电影
        const batchPromises = batch.map(async (movie) => {
          try {
            const details = await getMovieDetails(movie.id);
            if (!details) {
              console.log(`未能获取电影 "${movie.title}" (ID:${movie.id}) 的详情，跳过`);
              return null;
            }
            
            // 不再强制要求有视频数据，允许无视频的电影通过
            const hasVideos = details.videos && 
                              details.videos.results && 
                              details.videos.results.length > 0;
            
            if (!hasVideos) {
              console.log(`电影 "${details.title}" (ID:${details.id}) 没有视频数据，但仍保留`);
            }
            
            return {
              ...movie,
              genres: details.genres || [],
              runtime: details.runtime || 0,
              videos: details.videos || { results: [] }, // 确保视频对象存在
            };
          } catch (err) {
            console.error(`获取电影 ${movie.id} 的详细信息失败:`, err);
            return null;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        // 过滤掉null结果并添加到总结果中
        const validResults = batchResults.filter(movie => movie !== null) as Movie[];
        moviesWithDetails = [...moviesWithDetails, ...validResults];
        
        console.log(`第${batchIndex + 1}批处理完成: ${validResults.length}/${batch.length}部电影成功获取详情`);
        
        // 如果已经获取到足够的电影，提前结束循环
        if (moviesWithDetails.length >= 10) {
          console.log(`已获取${moviesWithDetails.length}部电影，数量足够，停止处理剩余批次`);
          break;
        }
      } catch (batchError) {
        console.error(`处理第${batchIndex + 1}批电影时出错:`, batchError);
        // 继续处理下一批，而不是完全失败
      }
    }
    
    console.log(`成功获取${moviesWithDetails.length}/${maxMovies}部电影的详细信息`);
    
    if (moviesWithDetails.length === 0) {
      console.error('没有成功获取任何电影的详细信息，尝试放宽条件再次搜索');
      // 直接返回至少有基本信息的电影，而不是空数组
      return uniqueMovies.slice(0, 10).map(movie => ({
        ...movie,
        videos: { results: [] }
      }));
    }
    
    // 优先返回有视频的电影，但允许无视频的电影作为后备
    const moviesWithVideos = moviesWithDetails.filter(movie => 
      movie.videos && movie.videos.results && movie.videos.results.length > 0 &&
      movie.videos.results.some(video => video.site === 'YouTube')
    );
    
    console.log(`筛选后有${moviesWithVideos.length}部电影包含视频`);
    
    // 如果有视频的电影足够多，就只返回这些
    if (moviesWithVideos.length >= 5) {
      console.log(`返回${Math.min(moviesWithVideos.length, 20)}部有视频的电影`);
      return moviesWithVideos.slice(0, 20);
    }
    
    // 否则，混合返回一些有视频的电影和没有视频的电影
    const result = [
      ...moviesWithVideos,
      ...moviesWithDetails.filter(movie => 
        !movie.videos || !movie.videos.results || movie.videos.results.length === 0 ||
        !movie.videos.results.some(video => video.site === 'YouTube')
      )
    ].slice(0, 20);
    
    console.log(`混合返回${result.length}部电影，其中${moviesWithVideos.length}部有视频`);
    return result;
  } catch (error) {
    console.error(`根据心情"${mood}"发现电影失败:`, error);
    // 出错时返回热门电影作为后备
    try {
      const popularPromises = [1, 2, 3].map(page => getPopularMovies(page));
      const popularResults = await Promise.all(popularPromises);
      const movies = popularResults.flat();
      
      // 不强制要求有视频，返回热门电影
      console.log(`通过热门电影后备获取到${movies.length}部电影`);
      return movies.slice(0, 20);
    } catch (backupError) {
      console.error('获取后备电影失败:', backupError);
      return [];
    }
  }
} 