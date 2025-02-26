'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getMoviesByMood, discoverMoviesByMood, getMovieVideos, MovieVideo } from '@/lib/tmdb';
import { MovieTrailer } from '@/components/movie-trailer';

// 定义电影类型
interface Movie {
  id: number;
  title: string;
  overview: string;
  posterPath: string;
  year: number;
  rating: number;
  genre: string[];
  trailer?: MovieVideo | null;
}

// 所有的情绪名称映射
const moodNames: Record<string, { name: string, emoji: string }> = {
  cheerful: { name: '开心', emoji: '😄' },
  reflective: { name: '沉思', emoji: '🤔' },
  gloomy: { name: '忧郁', emoji: '😢' },
  humorous: { name: '幽默', emoji: '😂' },
  melancholy: { name: '感伤', emoji: '😌' },
  idyllic: { name: '梦幻', emoji: '🌠' },
  chill: { name: '放松', emoji: '😎' },
  romantic: { name: '浪漫', emoji: '💕' },
  weird: { name: '奇怪', emoji: '🤪' },
  passionate: { name: '热情', emoji: '🔥' },
  sleepy: { name: '困倦', emoji: '😴' },
  angry: { name: '愤怒', emoji: '😡' },
  fearful: { name: '恐惧', emoji: '😱' },
  lonely: { name: '孤独', emoji: '🥺' },
  tense: { name: '紧张', emoji: '😰' },
  thoughtful: { name: '求知', emoji: '🧐' },
  thrill: { name: '刺激', emoji: '🤩' },
  playful: { name: '搞笑', emoji: '🙃' },
};

export default function MoviesPage() {
  const params = useParams();
  const router = useRouter();
  const mood = params.mood as string;
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useDiscover, setUseDiscover] = useState(true); // 默认使用discover接口
  
  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        let moviesData;
        
        // 根据选择使用不同的API函数
        if (useDiscover) {
          moviesData = await discoverMoviesByMood(mood);
        } else {
          moviesData = await getMoviesByMood(mood);
        }
        
        // 将API返回的数据转换为我们的Movie类型
        const formattedMovies: Movie[] = moviesData.map(movie => ({
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          posterPath: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
            : 'https://via.placeholder.com/500x750/E5E7EB/1F2937?text=无海报',
          year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
          rating: movie.vote_average ?? 0, // 确保rating至少有默认值0
          genre: movie.genres ? movie.genres.map(g => g.name) : [],
          trailer: null // 初始化预告片为null
        }));

        // 获取每部电影的预告片
        const moviesWithTrailers = await Promise.all(
          formattedMovies.map(async (movie) => {
            try {
              const videos = await getMovieVideos(movie.id);
              return {
                ...movie,
                trailer: videos.length > 0 ? videos[0] : null
              };
            } catch (err) {
              console.error(`获取电影 ${movie.id} 预告片失败:`, err);
              return movie;
            }
          })
        );

        setMovies(moviesWithTrailers);
        setError(null);
      } catch (err) {
        console.error("获取电影失败:", err);
        setError("抱歉，获取电影数据时出错，请稍后再试。");
      } finally {
        setLoading(false);
      }
    }
    
    if (mood) {
      fetchMovies();
    }
  }, [mood, useDiscover]);
  
  // 当情绪不存在时的处理
  if (mood && !moodNames[mood]) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">未知的心情</h1>
          <p className="mb-8">无法找到与此心情匹配的电影。</p>
          <Link 
            href="/"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            返回主页
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <Link 
            href="/"
            className="mr-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            ← 返回
          </Link>
          
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <span className="mr-3 text-3xl">{moodNames[mood]?.emoji}</span>
            <span>当你感到{moodNames[mood]?.name}时的电影推荐</span>
          </h1>
        </div>
        
        <div className="mb-6 flex justify-center space-x-2">
          <button
            onClick={() => setUseDiscover(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              useDiscover 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            精准推荐
          </button>
          <button
            onClick={() => setUseDiscover(false)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !useDiscover 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            关键词推荐
          </button>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900 dark:border-white mb-4"></div>
            <p className="text-lg">正在为您寻找最佳电影...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-xl text-red-500 mb-4">{error}</p>
            <button
              onClick={() => router.refresh()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              重试
            </button>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl mb-4">
              抱歉，我们找不到与"{moodNames[mood]?.name}"心情匹配的电影。
            </p>
            <Link 
              href="/"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              尝试其他心情
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-8">
            {movies.map((movie) => (
              <div 
                key={movie.id} 
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-96 w-full">
                  <Image
                    src={movie.posterPath}
                    alt={movie.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">{movie.title}</h2>
                  <div className="flex items-center mb-3">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="mr-3">{typeof movie.rating === 'number' ? movie.rating.toFixed(1) : 'N/A'}</span>
                    <span className="text-gray-500 mr-3">{movie.year || '未知'}</span>
                    <div className="flex flex-wrap">
                      {movie.genre && movie.genre.length > 0 ? movie.genre.map((g, i) => (
                        <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mr-1 mb-1">
                          {g}
                        </span>
                      )) : (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mr-1 mb-1">
                          未分类
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-4 mb-4">{movie.overview || "暂无简介"}</p>
                  
                  {/* 添加预告片按钮 */}
                  <div className="mt-2">
                    <MovieTrailer video={movie.trailer} movieTitle={movie.title} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 