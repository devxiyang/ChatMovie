'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { discoverMoviesByMood } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Calendar, Info, ImageOff, MessageSquare, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useChat } from '@ai-sdk/react';
import { motion } from 'framer-motion';

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

export default function MoviePage() {
  const params = useParams();
  const router = useRouter();
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(true);
  const [decoding, setDecoding] = useState(true);

  const mood = params.mood as string;

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
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowVideo(true);
    }
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
    <div className="min-h-screen bg-black text-green-500 relative">
      {/* 数字雨背景效果 */}
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

      {/* 导航栏 */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/80 border-b border-green-500/30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => router.push('/')} 
            className="text-green-500 flex items-center gap-1 hover:text-green-400 transition"
          >
            <ArrowLeft size={16} />
            <span className="text-xs tracking-wider">RETURN</span>
          </button>
          <div className="flex items-center">
            <span className="text-xs mr-2 text-green-700">MODE:</span>
            <span className="text-sm font-mono text-green-400 flex items-center gap-1">
              {moodInfo.name} 
              <span className="text-[10px] text-green-700 ml-1">{moodInfo.code}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Video/Poster Section */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-8">
          {showVideo && trailer ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <Image
              src={`https://image.tmdb.org/t/p/original${currentMovie.poster_path}`}
              alt={currentMovie.title}
              fill
              className="object-cover matrix-filter"
              style={{mixBlendMode: 'screen'}}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.png';
              }}
            />
          )}
        </div>

        {/* Movie Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentMovie.id}
        >
          <h1 className="text-4xl font-bold mb-4">{currentMovie.title}</h1>
          
          <div className="flex items-center gap-4 mb-4 text-gray-300">
            <span>{currentMovie.release_date ? new Date(currentMovie.release_date).getFullYear() : 'N/A'}</span>
            <span>⭐ {currentMovie.vote_average?.toFixed(1) || 'N/A'}/10</span>
            {currentMovie.runtime && <span>{currentMovie.runtime} min</span>}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {currentMovie.genres?.map(genre => (
              <span
                key={genre.id}
                className="px-3 py-1 bg-red-500/20 rounded-full text-sm"
              >
                {genre.name}
              </span>
            ))}
          </div>

          <p className="text-gray-300 mb-8 leading-relaxed">
            {currentMovie.overview}
          </p>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="px-6 py-2 bg-[#2A2B31] rounded-lg disabled:opacity-50"
          >
            ⬅️ BACK
          </button>
          
          <button
            onClick={() => setShowVideo(!showVideo)}
            className="px-6 py-2 bg-[#2A2B31] rounded-lg"
          >
            {showVideo ? '🎬 HIDE' : '🎬 SHOW'}
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentIndex === movies.length - 1}
            className="px-6 py-2 bg-[#2A2B31] rounded-lg disabled:opacity-50"
          >
            NEXT ➡️
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
          0% {
            clip: rect(44px, 9999px, 56px, 0);
          }
          5% {
            clip: rect(74px, 9999px, 70px, 0);
          }
          10% {
            clip: rect(9px, 9999px, 85px, 0);
          }
          15% {
            clip: rect(67px, 9999px, 93px, 0);
          }
          20% {
            clip: rect(36px, 9999px, 35px, 0);
          }
          25% {
            clip: rect(23px, 9999px, 35px, 0);
          }
          30% {
            clip: rect(26px, 9999px, 67px, 0);
          }
          35% {
            clip: rect(82px, 9999px, 33px, 0);
          }
          40% {
            clip: rect(42px, 9999px, 15px, 0);
          }
          45% {
            clip: rect(70px, 9999px, 60px, 0);
          }
          50% {
            clip: rect(91px, 9999px, 97px, 0);
          }
          55% {
            clip: rect(8px, 9999px, 14px, 0);
          }
          60% {
            clip: rect(51px, 9999px, 17px, 0);
          }
          65% {
            clip: rect(40px, 9999px, 64px, 0);
          }
          70% {
            clip: rect(72px, 9999px, 15px, 0);
          }
          75% {
            clip: rect(10px, 9999px, 2px, 0);
          }
          80% {
            clip: rect(33px, 9999px, 48px, 0);
          }
          85% {
            clip: rect(68px, 9999px, 16px, 0);
          }
          90% {
            clip: rect(25px, 9999px, 56px, 0);
          }
          95% {
            clip: rect(42px, 9999px, 95px, 0);
          }
          100% {
            clip: rect(79px, 9999px, 70px, 0);
          }
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
      `}</style>
    </div>
  );
} 