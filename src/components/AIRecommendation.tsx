'use client';

import React, { useState } from 'react';
import { Mood, Movie } from '@/types/movies';
import { getAIRecommendations } from '@/lib/ai-recommender';
import MovieCard from './MovieCard';
import Image from 'next/image';

interface AIRecommendationProps {
  mood: Mood;
  onMovieSelect: (movie: Movie) => void;
}

export default function AIRecommendation({ mood, onMovieSelect }: AIRecommendationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [personalPrompt, setPersonalPrompt] = useState('');
  const [aiResult, setAiResult] = useState<{
    movies: Movie[];
    reasoning: string;
    suggestedPrompt?: string;
  } | null>(null);
  const [preferredGenres, setPreferredGenres] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(70);
  
  // 常见电影流派
  const popularGenres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
    'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
    'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
    'Thriller', 'War', 'Western'
  ];
  
  const handleGenreToggle = (genre: string) => {
    setPreferredGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };
  
  const handleGetRecommendations = async () => {
    setIsLoading(true);
    try {
      const result = await getAIRecommendations({
        mood,
        preferredGenres,
        minRating,
        personalizedPrompt: personalPrompt || undefined
      });
      setAiResult(result);
    } catch (error) {
      console.error('Failed to get AI recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-8 p-6 bg-neutral-900/80 rounded-lg border border-neutral-800 mb-12">
      <div className="flex items-center mb-6">
        <div className="h-10 w-10 relative mr-4 text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8.5 8.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm8.5 9.5H7c-.28 0-.5-.22-.5-.5v-1c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v1c0 .28-.22.5-.5.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white">AI电影顾问</h2>
      </div>
      
      {!aiResult ? (
        <div className="animate-fade-in">
          <p className="text-gray-300 mb-6">
            让AI根据你的心情和偏好为你推荐电影。告诉AI你的具体情况，它会为你找到最适合的电影。
          </p>
          
          {/* 个性化提示输入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              告诉AI更多关于你的心情或需求（可选）
            </label>
            <textarea
              value={personalPrompt}
              onChange={(e) => setPersonalPrompt(e.target.value)}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-md text-white"
              placeholder="例如：想看一部能让我开心起来的电影，最近工作压力很大..."
              rows={3}
            />
          </div>
          
          {/* 流派偏好选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              你喜欢的电影类型（可多选）
            </label>
            <div className="flex flex-wrap gap-2">
              {popularGenres.map(genre => (
                <button
                  key={genre}
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    preferredGenres.includes(genre)
                      ? 'bg-red-600 text-white'
                      : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
          
          {/* 最低评分选择 */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              最低评分要求: {minRating}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={minRating}
              onChange={(e) => setMinRating(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <button
            onClick={handleGetRecommendations}
            disabled={isLoading}
            className="w-full py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                正在思考最佳推荐...
              </>
            ) : (
              '获取AI推荐'
            )}
          </button>
        </div>
      ) : (
        <div className="animate-fade-in">
          {/* AI推荐结果 */}
          <div className="mb-8">
            <div className="p-4 bg-neutral-800 rounded-lg mb-6">
              <p className="text-gray-200">{aiResult.reasoning}</p>
              
              {aiResult.suggestedPrompt && (
                <div className="mt-4 p-3 bg-neutral-700/50 rounded border-l-4 border-red-500">
                  <p className="text-gray-300 text-sm">
                    <strong>小贴士: </strong>
                    {aiResult.suggestedPrompt}
                  </p>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-medium text-white mb-4">AI精选推荐:</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {aiResult.movies.map(movie => (
                <div
                  key={movie.id}
                  onClick={() => onMovieSelect(movie)}
                  className="cursor-pointer"
                >
                  <MovieCard movie={movie} showDetails={false} />
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => setAiResult(null)}
            className="px-4 py-2 bg-neutral-800 text-gray-300 rounded hover:bg-neutral-700 transition-colors"
          >
            重新设置偏好
          </button>
        </div>
      )}
    </div>
  );
} 