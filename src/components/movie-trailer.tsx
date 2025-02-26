'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { MovieVideo } from '@/lib/tmdb';

interface MovieTrailerProps {
  video: MovieVideo | null | undefined;
  movieTitle: string;
}

export function MovieTrailer({ video, movieTitle }: MovieTrailerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 没有预告片时不渲染任何内容
  if (!video) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white" 
          size="sm"
        >
          <Play size={16} />
          观看预告片
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black">
        <DialogTitle className="sr-only">
          {movieTitle} 预告片
        </DialogTitle>
        <div className="relative pt-[56.25%] w-full">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${video.key}?autoplay=1`}
            title={`${movieTitle} 预告片`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
} 