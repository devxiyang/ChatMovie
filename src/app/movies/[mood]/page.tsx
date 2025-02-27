'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { discoverMoviesByMood } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Calendar, Info, ImageOff, MessageSquare, ArrowLeft, Glasses, Code, TabletSmartphone, Pill, Clock3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useChat } from '@ai-sdk/react';
import { motion, AnimatePresence } from 'framer-motion';

// 定义电影类型
interface MovieData {
  id: number;
  title: string;
  overview: string;
  poster_path?: string;
  release_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  genres?: {
    id: number;
    name: string;
  }[];
  runtime?: number;
  videos?: {
    results: {
      key: string;
      site: string;
      type: string;
    }[];
  };
}

interface Movie extends MovieData {
  aiInterpretation?: string;
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
  horny: { name: '性感', emoji: '🤤' },
  sleepy: { name: '困倦', emoji: '😴' },
  angry: { name: '愤怒', emoji: '😡' },
  fearful: { name: '恐惧', emoji: '😱' },
  lonely: { name: '孤独', emoji: '🥺' },
  tense: { name: '紧张', emoji: '😰' },
  thoughtful: { name: '求知', emoji: '🧐' },
  thrill: { name: '刺激', emoji: '🤩' },
  playful: { name: '搞笑', emoji: '🙃' },
};

// Mood emojis mapping
const moodEmojis: { [key: string]: string } = {
  cheerful: '😄',
  reflective: '🤔',
  gloomy: '😢',
  humorous: '😂',
  melancholy: '😌',
  idyllic: '🌠',
  chill: '😎',
  romantic: '💕',
  weird: '🤪',
  horny: '🤤',
  sleepy: '😴',
  angry: '😡',
  fearful: '😱',
  lonely: '🥺',
  tense: '😰',
  thoughtful: '🧐',
  thrill: '🤩',
  playful: '🙃',
};

// 情绪名称转换为黑客帝国术语
const moodToMatrix: Record<string, { name: string, code: string }> = {
  cheerful: { name: 'EUPHORIC', code: '010111' },
  reflective: { name: 'CONSCIOUS', code: '101001' },
  gloomy: { name: 'DETACHED', code: '001100' },
  humorous: { name: 'ANOMALY', code: '110101' },
  melancholy: { name: 'GLITCH', code: '010010' },
  idyllic: { name: 'UTOPIAN', code: '101110' },
  chill: { name: 'DORMANT', code: '000111' },
  romantic: { name: 'CONNECTED', code: '111100' },
  weird: { name: 'CORRUPTED', code: '010001' },
  horny: { name: 'AWAKENED', code: '101010' },
  sleepy: { name: 'HIBERNATING', code: '000011' },
  angry: { name: 'OVERLOADED', code: '111001' },
  fearful: { name: 'HUNTED', code: '010100' },
  lonely: { name: 'ISOLATED', code: '100001' },
  tense: { name: 'FIREWALL', code: '001101' },
  thoughtful: { name: 'COMPUTING', code: '110110' },
  thrill: { name: 'RED-PILL', code: '011011' },
  playful: { name: 'SIMULATED', code: '100100' },
};

// Neo的哲学引用
const neoQuotes = [
  "我不相信命运，因为我不喜欢被告知我无法控制自己的生活。",
  "当真相找到你，你会怎么做？",
  "我知道你在那里。我能感觉到你的存在。",
  "选择，问题的关键在于选择。",
  "每个人都活在幻觉中，但他们不知道这是幻觉。",
  "你会发现，与其相信你所看到的，不如相信你感觉到的。",
  "我选择相信，这一切都是为了某种目的。",
  "有区别吗？如果你分不清虚拟世界和现实世界？",
  "自由，自由是关键，无法言喻的自由。",
  "不要试图弯曲勺子，那是不可能的。相反，只需意识到：没有勺子。",
  "系统是我们的敌人。",
  "意识到真相会带来责任。",
  "幻觉如今已成为现实。",
];

export default function MoviePage() {
  const params = useParams();
  const router = useRouter();
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(true);
  const [decoding, setDecoding] = useState(true);
  const [viewMode, setViewMode] = useState<'real' | 'matrix'>('matrix'); // 红蓝药丸效果
  const [showQuote, setShowQuote] = useState(true);
  const [currentQuote, setCurrentQuote] = useState('');
  const [bulletTimeEffect, setBulletTimeEffect] = useState(false);

  const mood = params.mood as string;

  // 选择随机引用
  useEffect(() => {
    setCurrentQuote(neoQuotes[Math.floor(Math.random() * neoQuotes.length)]);
  }, [currentIndex]);

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        // 使用优化后的tmdb.ts中的方法获取电影（仅返回评分7+且有视频的电影）
        const data = await discoverMoviesByMood(mood);
        console.log('获取到的电影数据:', data); // 调试日志
        
        // 处理电影数据，确保所有必要的字段都存在
        const processedMovies = data.map(movie => {
          // 处理海报路径，确保它是完整的URL
          const poster_path = movie.poster_path?.startsWith('http') 
            ? movie.poster_path 
            : movie.poster_path 
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : '/placeholder.png';
              
          return {
            ...movie,
            poster_path
          };
        });
        
        setMovies(processedMovies);
        setError(null);
        setLoading(false);
        
        // 模拟解码过程
        setTimeout(() => {
          setDecoding(false);
        }, 2000);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies');
        setLoading(false);
      }
    }

    if (mood) {
      fetchMovies();
    }
  }, [mood]);

  const currentMovie = movies[currentIndex];

  const handleNext = () => {
    if (currentIndex < movies.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowVideo(true);
      // 随机子弹时间效果
      if (Math.random() > 0.7) {
        triggerBulletTime();
      }
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowVideo(true);
      // 随机子弹时间效果
      if (Math.random() > 0.7) {
        triggerBulletTime();
      }
    }
  };

  // 子弹时间效果
  const triggerBulletTime = () => {
    setBulletTimeEffect(true);
    setTimeout(() => {
      setBulletTimeEffect(false);
    }, 1500);
  };

  // 切换观看模式（红蓝药丸）
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'matrix' ? 'real' : 'matrix');
  };

  const moodInfo = moodToMatrix[mood] || { name: 'UNKNOWN', code: '000000' };

  // 修复获取预告片逻辑
  const getTrailer = () => {
    if (!currentMovie?.videos?.results) {
      return null;
    }
    
    // 首先尝试寻找类型为'Trailer'的YouTube视频
    let trailer = currentMovie.videos.results.find(
      video => video.site === 'YouTube' && video.type === 'Trailer'
    );
    
    // 如果没有找到，尝试任何YouTube视频
    if (!trailer) {
      trailer = currentMovie.videos.results.find(
        video => video.site === 'YouTube'
      );
    }
    
    return trailer;
  };

  const trailer = getTrailer();

  if (loading) {
    return (
      <div className="h-screen bg-black text-green-500 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm">LOADING SIMULATIONS...</p>
          <p className="text-xs mt-2">搜索高评分（7+）且有视频预告的电影中...</p>
        </div>
      </div>
    );
  }

  if (error || !currentMovie) {
    return (
      <div className="h-screen bg-black text-green-500 flex items-center justify-center">
        <div className="max-w-md text-center border border-green-500/30 p-4">
          <p className="text-red-500 mb-2">SYSTEM ERROR</p>
          <p className="text-sm mb-4">{error || 'No movies found with rating 7+ and video trailers'}</p>
          <button 
            onClick={() => router.push('/')}
            className="text-xs border border-green-500 px-3 py-1 hover:bg-green-900/20"
          >
            RETURN TO MAIN SYSTEM
          </button>
        </div>
      </div>
    );
  }

  if (decoding) {
    return (
      <div className="h-screen bg-black text-green-500 flex flex-col items-center justify-center">
        <div className="max-w-md w-full px-4">
          <div className="mb-6">
            <p className="text-xs mb-2">&gt; DECRYPTING EMOTIONAL PATTERN: {moodInfo.name}</p>
            <p className="text-xs mb-2">&gt; RUNNING ALGORITHM: <span className="text-green-300">CINEMA_MATCH.exe</span></p>
            <p className="text-xs mb-2">&gt; FILTERING: <span className="text-green-300">RATING ≥ 7.0</span></p>
            <p className="text-xs mb-2">&gt; REQUIRING: <span className="text-green-300">VIDEO TRAILERS</span></p>
            <p className="text-xs">&gt; RENDERING SIMULATION OUTPUT...</p>
          </div>
          
          <div className="grid grid-cols-8 gap-1 mb-8">
            {Array.from({ length: 64 }).map((_, i) => (
              <div 
                key={i} 
                className="aspect-square bg-green-900/30 binary-cell"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <span className="text-[8px]">{Math.random() > 0.5 ? '1' : '0'}</span>
              </div>
            ))}
          </div>
          
          <div className="w-full h-2 bg-green-900/30">
            <div className="h-full bg-green-500 decoding-bar"></div>
          </div>
        </div>
        
        <style jsx>{`
          .binary-cell {
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeInOut 0.8s ease-in-out infinite;
          }
          
          @keyframes fadeInOut {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          
          .decoding-bar {
            animation: decode 2s linear forwards;
            width: 0%;
          }
          
          @keyframes decode {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${viewMode === 'matrix' ? 'bg-black text-green-500' : 'bg-slate-900 text-white'}`}>
      {/* 数字雨背景效果 - 只在Matrix模式显示，透明度降低以减少干扰 */}
      {viewMode === 'matrix' && (
        <div className="fixed inset-0 pointer-events-none opacity-10 z-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute top-0 text-green-500 matrix-column"
              style={{ 
                left: `${i * 10}%`, 
                animationDuration: `${10 + Math.random() * 10}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              {Array.from({ length: 20 }).map((_, j) => (
                <div key={j} className="text-center text-xs">
                  {Math.random() > 0.5 ? '1' : '0'}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 导航栏 - 固定高度 */}
      <header className={`sticky top-0 z-50 backdrop-blur-md ${viewMode === 'matrix' ? 'bg-black/80 border-b border-green-500/30' : 'bg-slate-800/80 border-b border-blue-500/30'}`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => router.push('/')} 
            className={`flex items-center gap-2 transition ${viewMode === 'matrix' ? 'text-green-500 hover:text-green-400' : 'text-blue-400 hover:text-blue-300'}`}
          >
            <ArrowLeft size={18} />
            <span className="text-sm tracking-wider">RETURN</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span className={`text-sm mr-2 ${viewMode === 'matrix' ? 'text-green-700' : 'text-blue-700'}`}>MODE:</span>
              <span className={`text-base font-mono flex items-center gap-1 ${viewMode === 'matrix' ? 'text-green-400' : 'text-blue-400'}`}>
                {moodInfo.name} 
                <span className={`text-xs ml-1 ${viewMode === 'matrix' ? 'text-green-700' : 'text-blue-700'}`}>{moodInfo.code}</span>
              </span>
            </div>
            
            <div className={`text-xs px-2 py-1 ${viewMode === 'matrix' ? 'bg-green-900/20 border border-green-500/30' : 'bg-blue-900/20 border border-blue-500/30'}`}>
              ⭐ 7.0+
            </div>
            
            {/* 红/蓝药丸切换按钮 */}
            <button 
              onClick={toggleViewMode}
              className="flex items-center gap-1.5 group relative"
            >
              <Pill size={22} className={viewMode === 'matrix' ? 'text-red-500' : 'text-blue-500'} />
              <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {viewMode === 'matrix' ? 'Take the blue pill' : 'Take the red pill'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 子弹时间效果覆盖层 */}
      <AnimatePresence>
        {bulletTimeEffect && (
          <motion.div 
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bullet-time-effect"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, rotateY: 360 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 bg-black/70 rounded-full animate-ping" style={{ animationDuration: '1s' }}></div>
                <div className="text-xl font-bold tracking-widest">
                  {viewMode === 'matrix' ? (
                    <span className="text-green-400">BULLET TIME</span>
                  ) : (
                    <span className="text-blue-400">BULLET TIME</span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主内容区域 - 可滚动区域 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-green-900/20">
        <div className="container mx-auto px-4 py-4">
          {/* 控制面板 - Neo风格界面 */}
          <div className={`${viewMode === 'matrix' ? 'border border-green-500/30 bg-black/50' : 'border border-blue-500/30 bg-slate-800/50'} p-3 mb-4 flex flex-wrap gap-4 justify-end sticky top-0 z-10`}>
            <button 
              onClick={() => setShowQuote(!showQuote)}
              className={`flex items-center gap-2 text-sm ${viewMode === 'matrix' 
                ? 'text-green-500 hover:text-green-400' 
                : 'text-blue-400 hover:text-blue-300'} transition-colors`}
            >
              <Code size={16} />
              <span>{showQuote ? 'HIDE THOUGHTS' : 'SHOW THOUGHTS'}</span>
            </button>
            
            <button 
              onClick={() => setShowVideo(!showVideo)}
              className={`flex items-center gap-2 text-sm ${viewMode === 'matrix' 
                ? 'text-green-500 hover:text-green-400' 
                : 'text-blue-400 hover:text-blue-300'} transition-colors`}
            >
              <TabletSmartphone size={16} />
              <span>{showVideo ? 'HIDE TRANSMISSION' : 'SHOW TRANSMISSION'}</span>
            </button>
            
            <button 
              onClick={triggerBulletTime}
              className={`flex items-center gap-2 text-sm ${viewMode === 'matrix' 
                ? 'text-green-500 hover:text-green-400' 
                : 'text-blue-400 hover:text-blue-300'} transition-colors`}
            >
              <Clock3 size={16} />
              <span>SLOW DOWN TIME</span>
            </button>
          </div>
          
          {/* Neo风格哲学引用 */}
          <AnimatePresence mode="wait">
            {showQuote && (
              <motion.div 
                className={`mb-4 ${viewMode === 'matrix' ? 'border-l-2 border-green-500/50' : 'border-l-2 border-blue-500/50'} pl-6`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <p className={`text-lg italic ${viewMode === 'matrix' ? 'text-green-400' : 'text-blue-300'}`}>
                  &quot;{currentQuote}&quot;
                </p>
                <p className={`text-base mt-2 ${viewMode === 'matrix' ? 'text-green-600' : 'text-blue-500'}`}>- Neo</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 电影内容 - 两列布局适应不同屏幕大小 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：视频/海报 */}
            <div>
              <div className={`aspect-video mb-4 ${
                viewMode === 'matrix' 
                  ? 'border border-green-500/30 bg-black' 
                  : 'border border-blue-500/30 bg-slate-800'
              } overflow-hidden relative`}>
                {showVideo && trailer ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&mute=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative">
                    <img
                      src={currentMovie.poster_path}
                      alt={currentMovie.title}
                      className={`max-h-full max-w-full object-contain ${viewMode === 'matrix' ? 'matrix-filter' : ''}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.png';
                      }}
                    />
                    
                    {/* 墨镜反射效果 */}
                    <div className={`absolute top-1/2 left-0 right-0 h-[1px] ${
                      viewMode === 'matrix' ? 'bg-green-500/40' : 'bg-blue-500/40'
                    } reflection-scan`}></div>
                  </div>
                )}
              </div>
              
              {/* 导航按钮 */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handleBack}
                  disabled={currentIndex === 0}
                  className={`px-4 py-2 text-sm disabled:opacity-50 transition-transform duration-300 hover:scale-105 ${
                    viewMode === 'matrix'
                      ? 'border border-green-500/50 bg-black hover:bg-green-900/20 text-green-400'
                      : 'border border-blue-500/50 bg-slate-800 hover:bg-blue-900/20 text-blue-400'
                  }`}
                >
                  PREVIOUS
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={currentIndex === movies.length - 1}
                  className={`px-4 py-2 text-sm disabled:opacity-50 transition-transform duration-300 hover:scale-105 ${
                    viewMode === 'matrix'
                      ? 'border border-green-500/50 bg-black hover:bg-green-900/20 text-green-400'
                      : 'border border-blue-500/50 bg-slate-800 hover:bg-blue-900/20 text-blue-400'
                  }`}
                >
                  NEXT
                </button>
              </div>
            </div>
            
            {/* 右侧：电影信息 */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={currentMovie.id}
                className={`${viewMode === 'matrix' ? 'neo-matrix-style' : 'neo-real-style'}`}
              >
                <h1 className={`text-3xl sm:text-4xl font-bold mb-3 ${viewMode === 'matrix' ? 'text-green-400' : 'text-white'} glitch-text`} data-text={currentMovie.title}>
                  {currentMovie.title}
                </h1>
                
                <div className={`flex items-center flex-wrap gap-4 mb-4 ${viewMode === 'matrix' ? 'text-green-600' : 'text-gray-300'}`}>
                  <span>{currentMovie.release_date ? new Date(currentMovie.release_date).getFullYear() : 'N/A'}</span>
                  <span className={`font-bold ${(currentMovie.vote_average && currentMovie.vote_average >= 8) ? (viewMode === 'matrix' ? 'text-green-400' : 'text-blue-300') : ''}`}>
                    ⭐ {currentMovie.vote_average?.toFixed(1) || 'N/A'}/10
                  </span>
                  {currentMovie.runtime && <span>{currentMovie.runtime} min</span>}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {currentMovie.genres?.map(genre => (
                    <span
                      key={genre.id}
                      className={`px-3 py-1 text-sm ${
                        viewMode === 'matrix' 
                          ? 'bg-green-900/20 border border-green-500/40 text-green-400' 
                          : 'bg-blue-900/20 border border-blue-500/40 text-blue-400'
                      }`}
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>

                <div className={`mb-6 border-l-2 pl-4 ${
                  viewMode === 'matrix' 
                    ? 'border-green-500/50 text-green-300' 
                    : 'border-blue-500/50 text-gray-300'
                }`}>
                  <h2 className={`text-base font-mono mb-2 ${
                    viewMode === 'matrix' ? 'text-green-600' : 'text-blue-400'
                  }`}>
                    &gt; SYNOPSIS ANALYSIS:
                  </h2>
                  <motion.p 
                    className="text-sm sm:text-base leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
                    {currentMovie.overview || "No synopsis data available in the Matrix."}
                  </motion.p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* 模拟Neo的墨镜反射效果 */}
      <div className="fixed top-0 left-0 w-full h-12 bg-gradient-to-b from-green-500/5 to-transparent z-10 pointer-events-none"></div>
      
      {/* CSS 样式 */}
      <style jsx global>{`
        /* 滚动条样式 */
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(0, 128, 0, 0.1);
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 0, 0.3);
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 0, 0.5);
        }
        
        /* 数字雨效果 */
        .matrix-filter {
          filter: brightness(0.9) hue-rotate(80deg) saturate(1.5);
        }
        
        .matrix-column {
          animation: matrixFall linear infinite;
        }
        
        @keyframes matrixFall {
          from { transform: translateY(-100%); }
          to { transform: translateY(100%); }
        }
        
        /* 故障文字效果 */
        .glitch-text {
          position: relative;
        }
        
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .glitch-text::before {
          animation: glitch-animation 3s infinite linear alternate-reverse;
          clip: rect(0, 900px, 0, 0);
          text-shadow: -1px 0 #ff00ff;
        }
        
        .glitch-text::after {
          animation: glitch-animation 2s infinite linear alternate-reverse;
          clip: rect(0, 900px, 0, 0);
          text-shadow: 1px 0 #00ffff;
        }
        
        @keyframes glitch-animation {
          0% { clip: rect(24px, 9999px, 36px, 0); }
          10% { clip: rect(54px, 9999px, 30px, 0); }
          20% { clip: rect(9px, 9999px, 65px, 0); }
          30% { clip: rect(47px, 9999px, 33px, 0); }
          40% { clip: rect(16px, 9999px, 15px, 0); }
          50% { clip: rect(33px, 9999px, 15px, 0); }
          60% { clip: rect(16px, 9999px, 47px, 0); }
          70% { clip: rect(62px, 9999px, 13px, 0); }
          80% { clip: rect(32px, 9999px, 15px, 0); }
          90% { clip: rect(40px, 9999px, 40px, 0); }
          100% { clip: rect(60px, 9999px, 50px, 0); }
        }
        
        /* 子弹时间效果 */
        .bullet-time-effect {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 70%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* 反射扫描效果 */
        .reflection-scan {
          animation: reflection-scan 2s linear infinite;
        }
        
        @keyframes reflection-scan {
          0% { transform: translateY(-15px); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(15px); opacity: 0; }
        }
        
        /* Neo风格标题 */
        .neo-matrix-style h1 {
          text-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
          letter-spacing: 1px;
        }
        
        .neo-real-style h1 {
          text-shadow: 0 0 8px rgba(100, 149, 237, 0.5);
          letter-spacing: 1px;
        }
      `}</style>
    </div>
  );
} 