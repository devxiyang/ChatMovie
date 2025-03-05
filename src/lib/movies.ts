import { Movie, Mood, MoodPlaylist } from '@/types/movies';
import movieData from '@/data/movies.json';

// 定义关键词和情绪的映射关系
const moodKeywords: Record<Mood, string[]> = {
  happy: ['comedy', 'fun', 'light-hearted', 'uplifting', 'heartwarming'],
  sad: ['drama', 'emotional', 'tearjerker', 'melancholy', 'tragedy'],
  excited: ['action', 'thriller', 'adventure', 'suspense', 'intense'],
  relaxed: ['animation', 'family', 'gentle', 'peaceful', 'calm'],
  romantic: ['romance', 'love', 'relationship', 'passion', 'dating'],
  thoughtful: ['documentary', 'biography', 'philosophical', 'thought-provoking'],
  nostalgic: ['classic', 'retro', 'vintage', 'childhood', 'memory'],
  adventurous: ['adventure', 'exploration', 'journey', 'quest', 'discovery'],
  inspired: ['biography', 'success', 'achievement', 'overcoming', 'motivational']
};

// 定义情绪对应的流派
const moodGenres: Record<Mood, string[]> = {
  happy: ['Comedy', 'Family', 'Animation'],
  sad: ['Drama', 'War', 'History'],
  excited: ['Action', 'Adventure', 'Science Fiction', 'Thriller'],
  relaxed: ['Animation', 'Family', 'Fantasy', 'Music'],
  romantic: ['Romance', 'Drama'],
  thoughtful: ['Documentary', 'History', 'War', 'Drama'],
  nostalgic: ['Family', 'Fantasy', 'Music'],
  adventurous: ['Adventure', 'Action', 'Fantasy', 'Science Fiction'],
  inspired: ['Drama', 'Biography', 'History', 'Sport']
};

// 自定义类型定义，避免TypeScript错误
interface MovieDataObject {
  movies: any[]; // 使用any类型以适应原始数据格式
  [key: string]: any;
}

// TMDB图片基础URL
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
const POSTER_SIZE = 'w500';
const BACKDROP_SIZE = 'original';
const PROFILE_SIZE = 'w185';  // 添加演员图片尺寸

// 转换TMDB图片路径为完整URL
function getImageUrl(path: string | null, size: string): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}${size}${path}`;
}

// 处理电影数据，添加完整URL
function processMovieData(movie: any): Movie {
  return {
    ...movie,
    poster_url: getImageUrl(movie.poster_path, POSTER_SIZE),
    backdrop_url: getImageUrl(movie.backdrop_path, BACKDROP_SIZE),
    // 确保其他必要字段
    id: movie.id,
    title: movie.title,
    overview: movie.overview || '',
    release_date: movie.release_date || '',
    genres: movie.genres || [],
    vote_average: movie.vote_average || 0,
    vote_count: movie.vote_count || 0,
    score_percent: movie.score_percent || Math.round((movie.vote_average || 0) * 10),
    // 处理演员数据，为每个演员添加完整的图片URL
    cast: (movie.cast || []).map((person: any) => ({
      ...person,
      profile_url: getImageUrl(person.profile_path, PROFILE_SIZE)
    })),
    // 处理导演数据，为每个导演添加完整的图片URL
    directors: (movie.directors || []).map((director: any) => ({
      ...director,
      profile_url: getImageUrl(director.profile_path, PROFILE_SIZE)
    })),
    era: movie.era || (movie.release_date ? movie.release_date.split('-')[0] + '年代' : '未知'),
    keywords: movie.keywords || [],
    trailer_url: movie.trailer_url || null
  };
}

// 加载所有电影数据
export function getAllMovies(): Movie[] {
  try {
    // 将movieData视为自定义类型
    const data = movieData as MovieDataObject;
    
    // 直接返回movies数组，并处理每个电影对象
    if (data.movies && Array.isArray(data.movies)) {
      return data.movies.map(processMovieData);
    }
    
    // 兜底错误处理
    console.error('movies.json格式不正确，未找到movies数组');
    return [];
  } catch (error) {
    console.error('加载电影数据时出错:', error);
    return [];
  }
}

// 根据情绪推荐电影
export function getMoviesByMood(mood: Mood, limit: number = 10): Movie[] {
  const movies = getAllMovies();
  
  if (movies.length === 0) {
    return [];
  }
  
  // 创建一个电影分数映射表，用于按照情绪相关度排序
  const movieScores: Record<number, number> = {};
  
  movies.forEach(movie => {
    let score = 0;
    
    // 检查关键词匹配
    movie.keywords?.forEach(keyword => {
      if (moodKeywords[mood].some(mk => keyword.name.toLowerCase().includes(mk.toLowerCase()))) {
        score += 3;
      }
    });
    
    // 检查流派匹配
    movie.genres?.forEach(genre => {
      if (moodGenres[mood].includes(genre.name)) {
        score += 5;
      }
    });
    
    // 评分因素
    score += movie.vote_average / 2;
    
    // 储存分数
    movieScores[movie.id] = score;
  });
  
  // 根据分数排序并返回前N个电影
  return movies
    .sort((a, b) => movieScores[b.id] - movieScores[a.id])
    .slice(0, limit);
}

// 心情播放列表数据
export const moodPlaylists: MoodPlaylist[] = [
  {
    id: 'happy',
    name: '阳光灿烂日',
    description: '这些欢快的电影会让你忍不住微笑，治愈你的心情',
    mood: 'happy',
    coverImage: '/images/moods/happy.jpg',
    movies: []
  },
  {
    id: 'sad',
    name: '雨天思绪',
    description: '当你需要释放情感，这些电影会陪你一起感受',
    mood: 'sad',
    coverImage: '/images/moods/sad.jpg',
    movies: []
  },
  {
    id: 'excited',
    name: '肾上腺素飙升',
    description: '刺激、紧张、高能，让你热血沸腾的电影合集',
    mood: 'excited',
    coverImage: '/images/moods/excited.jpg',
    movies: []
  },
  {
    id: 'relaxed',
    name: '宁静时光',
    description: '放松心情，享受平静美好的电影体验',
    mood: 'relaxed',
    coverImage: '/images/moods/relaxed.jpg',
    movies: []
  },
  {
    id: 'romantic',
    name: '浪漫之夜',
    description: '感受爱情的甜蜜与酸楚，适合约会观看',
    mood: 'romantic',
    coverImage: '/images/moods/romantic.jpg',
    movies: []
  },
  {
    id: 'thoughtful',
    name: '深度思考',
    description: '引发你思考人生与社会的深刻电影',
    mood: 'thoughtful',
    coverImage: '/images/moods/thoughtful.jpg',
    movies: []
  },
  {
    id: 'nostalgic',
    name: '怀旧时光机',
    description: '带你回到过去，唤醒美好回忆',
    mood: 'nostalgic',
    coverImage: '/images/moods/nostalgic.jpg',
    movies: []
  },
  {
    id: 'adventurous',
    name: '探险之旅',
    description: '踏上未知旅程，体验冒险的魅力',
    mood: 'adventurous',
    coverImage: '/images/moods/adventurous.jpg',
    movies: []
  },
  {
    id: 'inspired',
    name: '激励人心',
    description: '讲述励志故事，激发你前进的动力',
    mood: 'inspired',
    coverImage: '/images/moods/inspired.jpg',
    movies: []
  }
];

// 获取并填充所有心情推荐列表
export function getPopulatedMoodPlaylists(): MoodPlaylist[] {
  return moodPlaylists.map(playlist => ({
    ...playlist,
    movies: getMoviesByMood(playlist.mood, 12)
  }));
}

// 根据ID获取特定心情的播放列表
export function getMoodPlaylistById(id: string): MoodPlaylist | undefined {
  const playlist = moodPlaylists.find(p => p.id === id);
  if (!playlist) return undefined;
  
  return {
    ...playlist,
    movies: getMoviesByMood(playlist.mood, 20)
  };
}

// 获取随机推荐电影
export function getRandomRecommendedMovies(count: number = 8): Movie[] {
  const movies = getAllMovies();
  // 按评分排序，取前100部
  const topMovies = [...movies]
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 100);
  
  // 随机选取
  return shuffleArray(topMovies).slice(0, count);
}

// 辅助函数：随机打乱数组
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
} 