// TMDb API 交互函数
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || ''; // 在实际部署时需要添加您的TMDb API密钥
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=zh-CN`
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
    return {};
  }
}

// 根据关键词搜索电影
async function searchMoviesByKeyword(keyword: string): Promise<Movie[]> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=zh-CN&query=${keyword}&page=1&include_adult=false`
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
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=zh-CN&page=${page}`
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
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
      : 'https://via.placeholder.com/500x750/E5E7EB/1F2937?text=无海报',
    year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
    rating: movie.vote_average,
    genre: movie.genres ? movie.genres.map(g => g.name) : []
  };
} 