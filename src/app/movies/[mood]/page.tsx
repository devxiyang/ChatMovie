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
        const response = await fetch(`/api/movies/${mood}`);
        if (!response.ok) throw new Error('Failed to fetch movies');
        const data = await response.json();
        setMovies(data);
        setError(null);
        
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm">LOADING SIMULATIONS...</p>
        </div>
      </div>
    );
  }

  if (error || !currentMovie) {
    return (
      <div className="min-h-screen bg-black text-green-500 flex items-center justify-center">
        <div className="max-w-md text-center border border-green-500/30 p-4">
          <p className="text-red-500 mb-2">SYSTEM ERROR</p>
          <p className="text-sm mb-4">{error || 'No movies found'}</p>
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

  const trailer = currentMovie.videos?.results.find(
    video => video.site === 'YouTube' && video.type === 'Trailer'
  );

  if (decoding) {
    return (
      <div className="min-h-screen bg-black text-green-500 flex flex-col items-center justify-center">
        <div className="max-w-md w-full px-4">
          <div className="mb-6">
            <p className="text-xs mb-2">&gt; DECRYPTING EMOTIONAL PATTERN: {moodInfo.name}</p>
            <p className="text-xs mb-2">&gt; RUNNING ALGORITHM: <span className="text-green-300">CINEMA_MATCH.exe</span></p>
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
    <div className={`min-h-screen ${viewMode === 'matrix' ? 'bg-black text-green-500' : 'bg-slate-900 text-white'} relative transition-colors duration-1000`}>
      {/* 数字雨背景效果 - 只在Matrix模式显示 */}
      {viewMode === 'matrix' && (
        <div className="fixed inset-0 pointer-events-none opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute top-0 text-green-500 matrix-column"
              style={{ 
                left: `${i * 5}%`, 
                animationDuration: `${10 + Math.random() * 10}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              {Array.from({ length: 50 }).map((_, j) => (
                <div key={j} className="text-center text-xs">
                  {Math.random() > 0.5 ? '1' : '0'}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Neo风格墨镜反射效果 */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div 
          className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br 
          ${viewMode === 'matrix' 
            ? 'from-transparent via-green-900/10 to-transparent' 
            : 'from-transparent via-blue-900/10 to-transparent'}`}
          style={{
            transform: 'skewY(-5deg)',
            transformOrigin: 'top left'
          }}
        ></div>
      </div>

      {/* 导航栏 */}
      <header className={`sticky top-0 z-50 backdrop-blur-md ${viewMode === 'matrix' ? 'bg-black/80 border-b border-green-500/30' : 'bg-slate-800/80 border-b border-blue-500/30'}`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => router.push('/')} 
            className={`flex items-center gap-1 transition ${viewMode === 'matrix' ? 'text-green-500 hover:text-green-400' : 'text-blue-400 hover:text-blue-300'}`}
          >
            <ArrowLeft size={16} />
            <span className="text-xs tracking-wider">RETURN</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span className={`text-xs mr-2 ${viewMode === 'matrix' ? 'text-green-700' : 'text-blue-700'}`}>MODE:</span>
              <span className={`text-sm font-mono flex items-center gap-1 ${viewMode === 'matrix' ? 'text-green-400' : 'text-blue-400'}`}>
                {moodInfo.name} 
                <span className={`text-[10px] ml-1 ${viewMode === 'matrix' ? 'text-green-700' : 'text-blue-700'}`}>{moodInfo.code}</span>
              </span>
            </div>
            
            {/* 红/蓝药丸切换按钮 */}
            <button 
              onClick={toggleViewMode}
              className="flex items-center gap-1.5 group relative"
            >
              <Pill size={18} className={viewMode === 'matrix' ? 'text-red-500' : 'text-blue-500'} />
              <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
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

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Neo风格哲学引用 */}
        <AnimatePresence mode="wait">
          {showQuote && (
            <motion.div 
              className={`mb-8 ${viewMode === 'matrix' ? 'border-l-2 border-green-500/50' : 'border-l-2 border-blue-500/50'} pl-4`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <p className={`text-sm italic ${viewMode === 'matrix' ? 'text-green-400' : 'text-blue-300'}`}>
                &quot;{currentQuote}&quot;
              </p>
              <p className={`text-xs mt-1 ${viewMode === 'matrix' ? 'text-green-600' : 'text-blue-500'}`}>- Neo</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 控制面板 - Neo风格界面 */}
        <div className={`${viewMode === 'matrix' ? 'border border-green-500/30 bg-black/50' : 'border border-blue-500/30 bg-slate-800/50'} p-3 mb-6 flex flex-wrap gap-4 justify-end`}>
          <button 
            onClick={() => setShowQuote(!showQuote)}
            className={`flex items-center gap-1 text-xs ${viewMode === 'matrix' 
              ? 'text-green-500 hover:text-green-400' 
              : 'text-blue-400 hover:text-blue-300'} transition-colors`}
          >
            <Code size={14} />
            <span>{showQuote ? 'HIDE THOUGHTS' : 'SHOW THOUGHTS'}</span>
          </button>
          
          <button 
            onClick={() => setShowVideo(!showVideo)}
            className={`flex items-center gap-1 text-xs ${viewMode === 'matrix' 
              ? 'text-green-500 hover:text-green-400' 
              : 'text-blue-400 hover:text-blue-300'} transition-colors`}
          >
            <TabletSmartphone size={14} />
            <span>{showVideo ? 'HIDE TRANSMISSION' : 'SHOW TRANSMISSION'}</span>
          </button>
          
          <button 
            onClick={triggerBulletTime}
            className={`flex items-center gap-1 text-xs ${viewMode === 'matrix' 
              ? 'text-green-500 hover:text-green-400' 
              : 'text-blue-400 hover:text-blue-300'} transition-colors`}
          >
            <Clock3 size={14} />
            <span>SLOW DOWN TIME</span>
          </button>
        </div>

        {/* Video/Poster Section */}
        <div className={`relative aspect-video overflow-hidden mb-8 ${
          viewMode === 'matrix' 
            ? 'border border-green-500/30 bg-black' 
            : 'border border-blue-500/30 bg-slate-800'
        }`}>
          {/* Neo风格墨镜反射覆盖层 */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className={`absolute top-0 left-0 w-full h-full ${
              viewMode === 'matrix' 
                ? 'bg-gradient-to-br from-transparent via-green-900/20 to-green-900/5' 
                : 'bg-gradient-to-br from-transparent via-blue-900/20 to-blue-900/5'
            }`}></div>
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent"></div>
          </div>

          {showVideo && trailer ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={`https://image.tmdb.org/t/p/original${currentMovie.poster_path}`}
                alt={currentMovie.title}
                fill
                className={`object-cover ${viewMode === 'matrix' ? 'matrix-filter' : ''}`}
                style={{mixBlendMode: viewMode === 'matrix' ? 'screen' : 'normal'}}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.png';
                }}
              />
              
              {/* 墨镜反射效果 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`absolute top-1/2 left-0 right-0 h-[1px] ${
                  viewMode === 'matrix' ? 'bg-green-500/40' : 'bg-blue-500/40'
                } reflection-scan`}></div>
                
                <div className="text-5xl font-bold tracking-[0.2em] text-white/10 uppercase rotate-6 select-none">
                  {currentMovie.title.split(' ').slice(0, 2).join(' ')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Movie Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentMovie.id}
          className={`${viewMode === 'matrix' ? 'neo-matrix-style' : 'neo-real-style'}`}
        >
          <h1 className={`text-4xl font-bold mb-4 ${viewMode === 'matrix' ? 'text-green-400' : 'text-white'} glitch-text`} data-text={currentMovie.title}>
            {currentMovie.title}
          </h1>
          
          <div className={`flex items-center gap-4 mb-4 ${viewMode === 'matrix' ? 'text-green-600' : 'text-gray-300'}`}>
            <span>{currentMovie.release_date ? new Date(currentMovie.release_date).getFullYear() : 'N/A'}</span>
            <span>⭐ {currentMovie.vote_average?.toFixed(1) || 'N/A'}/10</span>
            {currentMovie.runtime && <span>{currentMovie.runtime} min</span>}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {currentMovie.genres?.map(genre => (
              <span
                key={genre.id}
                className={`px-3 py-1 rounded-none text-sm ${
                  viewMode === 'matrix' 
                    ? 'bg-green-900/20 border border-green-500/40 text-green-400' 
                    : 'bg-blue-900/20 border border-blue-500/40 text-blue-400'
                }`}
              >
                {genre.name}
              </span>
            ))}
          </div>

          <div className={`mb-8 border-l-2 pl-4 ${
            viewMode === 'matrix' 
              ? 'border-green-500/50 text-green-300' 
              : 'border-blue-500/50 text-gray-300'
          }`}>
            <h2 className={`text-sm font-mono mb-2 ${
              viewMode === 'matrix' ? 'text-green-600' : 'text-blue-400'
            }`}>
              &gt; SYNOPSIS ANALYSIS:
            </h2>
            <motion.p 
              className="text-sm leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {currentMovie.overview || "No synopsis data available in the Matrix."}
            </motion.p>
          </div>
          
          {/* Neo风格风衣底部效果 */}
          <div className={`w-full h-[2px] ${
            viewMode === 'matrix' ? 'bg-green-500/20' : 'bg-blue-500/20'
          } mb-6`}></div>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className={`px-6 py-2 disabled:opacity-50 transition-transform duration-300 hover:scale-105 ${
              viewMode === 'matrix'
                ? 'border border-green-500/50 bg-black hover:bg-green-900/20 text-green-400'
                : 'border border-blue-500/50 bg-slate-800 hover:bg-blue-900/20 text-blue-400'
            }`}
          >
            PREVIOUS REALITY
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentIndex === movies.length - 1}
            className={`px-6 py-2 disabled:opacity-50 transition-transform duration-300 hover:scale-105 ${
              viewMode === 'matrix'
                ? 'border border-green-500/50 bg-black hover:bg-green-900/20 text-green-400'
                : 'border border-blue-500/50 bg-slate-800 hover:bg-blue-900/20 text-blue-400'
            }`}
          >
            NEXT REALITY
          </button>
        </div>
      </div>

      {/* 黑客帝国风格 CSS */}
      <style jsx global>{`
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
          text-shadow: -2px 0 #ff00ff;
        }
        
        .glitch-text::after {
          animation: glitch-animation 2s infinite linear alternate-reverse;
          clip: rect(0, 900px, 0, 0);
          text-shadow: 2px 0 #00ffff;
        }
        
        @keyframes glitch-animation {
          0% { clip: rect(44px, 9999px, 56px, 0); }
          5% { clip: rect(74px, 9999px, 70px, 0); }
          10% { clip: rect(9px, 9999px, 85px, 0); }
          15% { clip: rect(67px, 9999px, 93px, 0); }
          20% { clip: rect(36px, 9999px, 35px, 0); }
          25% { clip: rect(23px, 9999px, 35px, 0); }
          30% { clip: rect(26px, 9999px, 67px, 0); }
          35% { clip: rect(82px, 9999px, 33px, 0); }
          40% { clip: rect(42px, 9999px, 15px, 0); }
          45% { clip: rect(70px, 9999px, 60px, 0); }
          50% { clip: rect(91px, 9999px, 97px, 0); }
          55% { clip: rect(8px, 9999px, 14px, 0); }
          60% { clip: rect(51px, 9999px, 17px, 0); }
          65% { clip: rect(40px, 9999px, 64px, 0); }
          70% { clip: rect(72px, 9999px, 15px, 0); }
          75% { clip: rect(10px, 9999px, 2px, 0); }
          80% { clip: rect(33px, 9999px, 48px, 0); }
          85% { clip: rect(68px, 9999px, 16px, 0); }
          90% { clip: rect(25px, 9999px, 56px, 0); }
          95% { clip: rect(42px, 9999px, 95px, 0); }
          100% { clip: rect(79px, 9999px, 70px, 0); }
        }
        
        .glitch-container {
          position: relative;
        }
        
        .glitch-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            transparent 0%,
            rgba(0, 255, 0, 0.2) 50%,
            transparent 100%
          );
          background-size: 100% 4px;
          animation: scan 4s linear infinite;
          pointer-events: none;
          z-index: 10;
        }
        
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        .terminal-text {
          position: relative;
          animation: typing 3s steps(40, end);
        }
        
        @keyframes typing {
          from { max-width: 0; opacity: 0; }
          to { max-width: 100%; opacity: 1; }
        }
        
        .bullet-time-effect {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 70%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .reflection-scan {
          animation: reflection-scan 2s linear infinite;
        }
        
        @keyframes reflection-scan {
          0% { transform: translateY(-20px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(20px); opacity: 0; }
        }
        
        .neo-matrix-style h1 {
          text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
          letter-spacing: 1px;
        }
        
        .neo-real-style h1 {
          text-shadow: 0 0 10px rgba(100, 149, 237, 0.5);
          letter-spacing: 1px;
        }
      `}</style>
    </div>
  );
} 