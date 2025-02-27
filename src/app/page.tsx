'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

// 心情列表 - 更改为黑客帝国主题风格
const moods = [
  { id: 'cheerful', name: 'EUPHORIC', emoji: '01' },
  { id: 'reflective', name: 'CONSCIOUS', emoji: '10' },
  { id: 'gloomy', name: 'DETACHED', emoji: '00' },
  { id: 'humorous', name: 'ANOMALY', emoji: '11' },
  { id: 'melancholy', name: 'GLITCH', emoji: '01' },
  { id: 'idyllic', name: 'UTOPIAN', emoji: '10' },
  { id: 'chill', name: 'DORMANT', emoji: '00' },
  { id: 'romantic', name: 'CONNECTED', emoji: '11' },
  { id: 'weird', name: 'CORRUPTED', emoji: '01' },
  { id: 'horny', name: 'AWAKENED', emoji: '10' },
  { id: 'sleepy', name: 'HIBERNATING', emoji: '00' },
  { id: 'angry', name: 'OVERLOADED', emoji: '11' },
  { id: 'fearful', name: 'HUNTED', emoji: '01' },
  { id: 'lonely', name: 'ISOLATED', emoji: '10' },
  { id: 'tense', name: 'FIREWALL', emoji: '00' },
  { id: 'thoughtful', name: 'COMPUTING', emoji: '11' },
  { id: 'thrill', name: 'RED-PILL', emoji: '01' },
  { id: 'playful', name: 'SIMULATED', emoji: '10' },
];

// 数字雨动画组件
const DigitalRain = () => {
  return (
    <div className="digital-rain fixed inset-0 pointer-events-none opacity-30 z-0">
      {Array.from({ length: 30 }).map((_, i) => (
        <div 
          key={i} 
          className="rain-column absolute top-0 opacity-70"
          style={{ 
            left: `${Math.random() * 100}%`, 
            animationDuration: `${10 + Math.random() * 15}s`,
            animationDelay: `${Math.random() * 5}s`
          }}
        >
          {Array.from({ length: 25 }).map((_, j) => (
            <span 
              key={j} 
              className="inline-block" 
              style={{ 
                animationDuration: `${0.5 + Math.random() * 1}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              {["0", "1"][Math.floor(Math.random() * 2)]}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [bootSequence, setBootSequence] = useState<boolean>(true);
  const router = useRouter();

  // 启动序列动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setBootSequence(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // 处理心情选择
  const handleMoodSelect = (mood: {id: string, name: string, emoji: string}) => {
    setLoading(true);
    // 模拟黑客帝国风格的加载延迟
    setTimeout(() => {
      router.push(`/movies/${mood.id}`);
    }, 1500);
  };

  // 启动序列
  if (bootSequence) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-green-500 font-mono">
        <div className="w-full max-w-2xl px-4 text-sm sm:text-base">
          <div className="mb-4 typewriter">
            <span className="text-green-300">&gt; INITIALIZING SYSTEM...</span>
          </div>
          <div className="mb-4 delayed-1">
            <span className="text-green-300">&gt; LOADING NEURAL NETWORK MODULES...</span>
          </div>
          <div className="mb-4 delayed-2">
            <span className="text-green-300">&gt; NEURAL NETWORK MODULES LOADED SUCCESSFULLY.</span>
          </div>
          <div className="mb-4 delayed-3">
            <span className="text-green-300">&gt; ESTABLISHING CONNECTION TO THE MATRIX...</span>
          </div>
          <div className="delayed-4">
            <span className="text-green-300">&gt; CONNECTION ESTABLISHED. WELCOME TO THE MATRIX...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8 bg-black relative overflow-hidden">
      <DigitalRain />
      
      {/* Logo and Title */}
      <div className="flex flex-col items-center justify-center mb-20 z-10">
        <div className="flex items-center justify-center gap-2 mb-16 bg-green-900/20 border border-green-500/30 px-6 py-2.5 rounded-sm">
          <div className="w-5 h-5 bg-green-500/80 animate-pulse"></div>
          <span className="text-base font-medium tracking-widest">MATRIX-CINEMA</span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl font-bold mb-8 max-w-4xl mx-auto text-center leading-tight tracking-wider text-green-400 glitch-text">
          SELECT YOUR <span className="text-green-300">EMOTIONAL PATTERN</span>
        </h1>
        
        <h2 className="text-xl sm:text-2xl text-green-600 text-center terminal-text border-b border-green-500/30 pb-3">
          &gt; HOW DOES YOUR CONSCIOUSNESS FEEL?_
        </h2>
      </div>

      {/* Mood Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl w-full px-8 mb-20 z-10">
        {moods.map((mood) => (
          <motion.button
            key={mood.id}
            whileHover={{ 
              scale: 1.03, 
              boxShadow: "0 0 15px rgba(0,255,0,0.5)" 
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleMoodSelect(mood)}
            disabled={loading}
            className="relative"
          >
            <div className="bg-black border border-green-500/50 hover:border-green-400 rounded-none py-3 px-4 flex items-center gap-3 transition-all hover:bg-green-900/10">
              <span className="text-sm font-mono text-green-300">{mood.emoji}</span>
              <span className="font-medium text-sm text-green-400 tracking-widest">{mood.name}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-green-700 flex items-center justify-center gap-1 z-10">
        <span className="text-green-600 mr-1">{'>'}</span>
        EXECUTEDBY.ZION <a href="https://github.com/mars" className="text-green-500 hover:text-green-400 transition-colors flex items-center gap-1 ml-1">
          <span className="underline underline-offset-2">OPERATOR</span>
        </a>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black border border-green-500/50 p-10 max-w-md w-full">
            <div className="text-left mb-6 text-green-500">
              <p className="text-base mb-3">&gt; SCANNING EMOTIONAL PATTERN...</p>
              <p className="text-base mb-3">&gt; ACCESSING CINEMA DATABASE...</p>
              <p className="text-base">&gt; CALCULATING OPTIMAL MATCHES...</p>
            </div>
            <div className="w-full h-3 bg-green-900/30 mb-8">
              <div className="h-full bg-green-500 loading-bar"></div>
            </div>
            <p className="text-green-400 text-lg font-mono tracking-wider">DECODING REALITY... PLEASE WAIT</p>
          </div>
        </div>
      )}

      {/* CSS for Matrix effects */}
      <style jsx global>{`
        .digital-rain .rain-column {
          animation: rainFall linear infinite;
        }
        
        .digital-rain .rain-column span {
          display: block;
          font-size: 1.5rem;
          line-height: 1;
          opacity: 0;
          animation: fadeIn ease-in-out infinite;
          color: #00ff00;
        }
        
        @keyframes rainFall {
          from { transform: translateY(-100%); }
          to { transform: translateY(100vh); }
        }
        
        @keyframes fadeIn {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.8; }
        }
        
        .loading-bar {
          animation: loading 2s infinite;
          width: 0%;
        }
        
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 0%; }
        }
        
        .typewriter {
          overflow: hidden;
          white-space: nowrap;
          animation: typing 1s steps(40, end);
        }
        
        .delayed-1 { animation: typing 1s steps(40, end); animation-delay: 0.5s; opacity: 0; animation-fill-mode: forwards; }
        .delayed-2 { animation: typing 1s steps(40, end); animation-delay: 1s; opacity: 0; animation-fill-mode: forwards; }
        .delayed-3 { animation: typing 1s steps(40, end); animation-delay: 1.5s; opacity: 0; animation-fill-mode: forwards; }
        .delayed-4 { animation: typing 1s steps(40, end); animation-delay: 2s; opacity: 0; animation-fill-mode: forwards; }
        
        @keyframes typing {
          from { width: 0; opacity: 0; }
          to { width: 100%; opacity: 1; }
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
          clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
          text-shadow: -2px 0 #ff00ff;
        }
        
        .glitch-text::after {
          animation: glitch-animation 2s infinite linear alternate-reverse;
          clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
          text-shadow: 2px 0 #00ffff;
        }
        
        @keyframes glitch-animation {
          0% {
            top: 0;
            left: 0;
          }
          20% {
            top: -1px;
            left: 1px;
          }
          40% {
            top: 0px;
            left: -1px;
          }
          60% {
            top: 1px;
            left: 0;
          }
          80% {
            top: -1px;
            left: -1px;
          }
          100% {
            top: 1px;
            left: 1px;
          }
        }
        
        .terminal-text {
          border-right: 2px solid #4ade80;
          animation: blink 1s infinite;
        }
        
        @keyframes blink {
          0%, 100% { border-color: transparent; }
          50% { border-color: #4ade80; }
        }
      `}</style>
    </div>
  );
}
