'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Star, Clock, Calendar } from 'lucide-react';
import { MovieVideo } from '@/lib/tmdb';
import Image from 'next/image';

interface MovieDetailProps {
  id: number;
  title: string;
  overview: string;
  posterPath: string;
  year: number;
  rating: number;
  genre: string[];
  trailer?: MovieVideo | null | undefined;
}

export function MovieDetail(props: MovieDetailProps) {
  const { title, overview, posterPath, year, rating, genre, trailer } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] group">
          <div className="relative h-96 w-full overflow-hidden">
            <Image
              src={posterPath}
              alt={title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {trailer && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button variant="ghost" size="lg" className="text-white gap-2">
                  <Play size={24} />
                  观看预告片
                </Button>
              </div>
            )}
          </div>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2 line-clamp-1">{title}</h2>
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{typeof rating === 'number' ? rating.toFixed(1) : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{year || '未知'}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {genre && genre.length > 0 ? genre.map((g, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {g}
                </span>
              )) : (
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  未分类
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">{overview || "暂无简介"}</p>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
            <Image
              src={posterPath}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-lg font-semibold">
                  {typeof rating === 'number' ? rating.toFixed(1) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-lg">{year || '未知'}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {genre && genre.length > 0 ? genre.map((g, i) => (
                <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                  {g}
                </span>
              )) : (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                  未分类
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
              {overview || "暂无简介"}
            </p>
            {trailer && (
              <Button 
                onClick={() => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank')}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white w-full justify-center py-6"
              >
                <Play size={24} />
                在 YouTube 中观看预告片
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 