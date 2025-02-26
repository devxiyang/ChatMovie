'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getPopularMovies } from '@/lib/tmdb';
import Image from 'next/image';

const moods = [
  { id: 'cheerful', name: '开心', emoji: '😄' },
  { id: 'reflective', name: '沉思', emoji: '🤔' },
  { id: 'gloomy', name: '忧郁', emoji: '😢' },
  { id: 'humorous', name: '幽默', emoji: '😂' },
  { id: 'melancholy', name: '感伤', emoji: '😌' },
  { id: 'idyllic', name: '梦幻', emoji: '🌠' },
  { id: 'chill', name: '放松', emoji: '😎' },
  { id: 'romantic', name: '浪漫', emoji: '💕' },
  { id: 'weird', name: '奇怪', emoji: '🤪' },
  { id: 'passionate', name: '热情', emoji: '🔥' },
  { id: 'sleepy', name: '困倦', emoji: '😴' },
  { id: 'angry', name: '愤怒', emoji: '😡' },
  { id: 'fearful', name: '恐惧', emoji: '😱' },
  { id: 'lonely', name: '孤独', emoji: '🥺' },
  { id: 'tense', name: '紧张', emoji: '😰' },
  { id: 'thoughtful', name: '求知', emoji: '🧐' },
  { id: 'thrill', name: '刺激', emoji: '🤩' },
  { id: 'playful', name: '搞笑', emoji: '🙃' },
];

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState<boolean>(true);
  const router = useRouter();

  // 获取热门电影用于主页展示
  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        setIsLoadingMovies(true);
        const movies = await getPopularMovies();
        setPopularMovies(movies);
      } catch (error) {
        console.error('获取热门电影失败:', error);
      } finally {
        setIsLoadingMovies(false);
      }
    };

    fetchPopularMovies();
  }, []);

  const handleMoodClick = (mood: string) => {
    setSelectedMood(mood);
    setLoading(true);

    const loadingMessages = [
      '🔍 正在搜索适合你心情的电影...',
      '🎬 寻找完美匹配中...',
      '🍿 准备电影推荐...',
      '✨ 分析你的情绪...',
      '🎭 挑选最佳电影...'
    ];

    let index = 0;
    const interval = setInterval(() => {
      setLoadingText(loadingMessages[index]);
      index = (index + 1) % loadingMessages.length;
    }, 1500);

    // 模拟加载时间，然后导航到电影页面
    setTimeout(() => {
      clearInterval(interval);
      router.push(`/movies/${mood}`);
    }, 3000);
  };

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center">
      {loading ? (
        <div className="text-center flex flex-col items-center justify-center space-y-6">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-6xl md:text-8xl"
          >
            {selectedMood && moods.find(m => m.id === selectedMood)?.emoji}
          </motion.div>
          <h2 className="text-xl md:text-2xl font-medium">{loadingText}</h2>
        </div>
      ) : (
        <>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">你现在的心情是?</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodClick(mood.id)}
                className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <span className="text-4xl mb-2">{mood.emoji}</span>
                <span className="text-sm font-medium">{mood.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-12 w-full max-w-6xl">
            <h2 className="text-2xl font-bold mb-6 text-center">热门电影</h2>
            {isLoadingMovies ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {popularMovies.slice(0, 8).map((movie) => (
                  <div key={movie.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-64 w-full">
                      <Image
                        src={movie.posterPath}
                        alt={movie.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold truncate">{movie.title}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{movie.rating.toFixed(1)}</span>
                        <span className="ml-2 text-gray-500">{movie.year}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
