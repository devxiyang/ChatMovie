import { useState } from "react"
import { Movie } from "@/types/movie"
import { MovieCard } from "./movie-card"

interface MoodListProps {
  moodGroups: Record<string, Movie[]>;
  selectedMood: string | null;
  onSelectMood: (mood: string | null) => void;
  onSelectMovie: (movie: Movie) => void;
  loading: boolean;
}

export function MoodList({ 
  moodGroups, 
  selectedMood, 
  onSelectMood, 
  onSelectMovie,
  loading 
}: MoodListProps) {
  // 心情标签中英文映射
  const moodTranslations: Record<string, string> = {
    "cheerful": "开心",
    "reflective": "深思",
    "sad": "忧郁",
    "surprising": "惊讶",
    "romantic": "浪漫",
    "funny": "搞笑",
    "thrilling": "惊悚",
    "scary": "恐怖",
    "inspiring": "励志",
    "thought-provoking": "深刻",
    "emotional": "感人",
    "exciting": "刺激",
    "uplifting": "振奋",
    "adventurous": "冒险",
    "mysterious": "悬疑",
    "dramatic": "戏剧",
    "classic": "经典",
    "absurd": "荒诞"
  };

  // 获取所有心情标签
  const allMoods = Object.keys(moodGroups).sort();

  // 获取心情的中文名称
  const getMoodTranslation = (mood: string): string => {
    return moodTranslations[mood.toLowerCase()] || mood;
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-200 h-10 w-24 rounded-full animate-pulse flex-shrink-0"></div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[2/3] rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 如果没有数据
  if (Object.keys(moodGroups).length === 0) {
    return <div className="text-center py-12">没有找到电影数据</div>;
  }

  // 心情选择器
  const MoodSelector = () => (
    <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
      {allMoods.map((mood) => (
        <button
          key={mood}
          className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap flex-shrink-0 
            ${selectedMood === mood ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
          onClick={() => onSelectMood(selectedMood === mood ? null : mood)}
        >
          {getMoodTranslation(mood)}
        </button>
      ))}
    </div>
  );

  // 显示选定心情的电影或所有心情的电影列表
  if (selectedMood) {
    const moviesForMood = moodGroups[selectedMood] || [];

    return (
      <div>
        <MoodSelector />
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {getMoodTranslation(selectedMood)} ({moviesForMood.length}部电影)
          </h2>
          <button 
            onClick={() => onSelectMood(null)}
            className="text-sm text-blue-500 hover:underline"
          >
            查看所有心情
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {moviesForMood.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onClick={onSelectMovie} 
            />
          ))}
        </div>
      </div>
    );
  }

  // 显示所有心情的电影列表
  return (
    <div>
      <MoodSelector />
      
      {allMoods.map((mood) => {
        const moviesForMood = moodGroups[mood] || [];
        if (moviesForMood.length === 0) return null;
        
        return (
          <div key={mood} className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {getMoodTranslation(mood)} ({moviesForMood.length}部电影)
              </h2>
              <button 
                onClick={() => onSelectMood(mood)}
                className="text-sm text-blue-500 hover:underline"
              >
                查看全部
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {moviesForMood.slice(0, 6).map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onClick={onSelectMovie} 
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
} 