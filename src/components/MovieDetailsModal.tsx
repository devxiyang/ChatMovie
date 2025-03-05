'use client';

import React from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movies';

interface MovieDetailsModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
}

export default function MovieDetailsModal({ movie, isOpen, onClose }: MovieDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col modal-animation">
        {/* Modal header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">{movie.title}</h2>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted"
          >
            ✕
          </button>
        </div>
        
        {/* Modal content */}
        <div className="overflow-y-auto p-0 flex-grow">
          {/* Banner */}
          <div className="relative h-64 w-full">
            {movie.backdrop_url ? (
              <Image
                src={movie.backdrop_url}
                alt={movie.title}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No backdrop image</span>
              </div>
            )}
          </div>
          
          {/* Movie details */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Poster */}
              <div className="relative h-64 w-44 shrink-0 overflow-hidden rounded-md">
                {movie.poster_url ? (
                  <Image
                    src={movie.poster_url}
                    alt={movie.title}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No poster</span>
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-muted-foreground">{movie.release_date.split('-')[0]} • {movie.era}</span>
                  <span className="bg-primary/90 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold text-sm">
                    {movie.score_percent}%
                  </span>
                </div>
                
                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genres.map(genre => (
                    <span key={genre.id} className="bg-muted px-3 py-1 rounded-full text-sm">
                      {genre.name}
                    </span>
                  ))}
                </div>
                
                {/* Overview */}
                <p className="mb-6 text-muted-foreground">{movie.overview}</p>
                
                {/* Cast */}
                <h3 className="text-lg font-semibold mb-2">主要演员</h3>
                <div className="flex flex-wrap gap-3 mb-6">
                  {movie.cast.slice(0, 6).map(person => (
                    <div key={person.id} className="flex items-center gap-2">
                      {person.profile_path && (
                        <div className="relative h-8 w-8 rounded-full overflow-hidden">
                          <Image
                            src={person.profile_path}
                            alt={person.name}
                            className="object-cover"
                            fill
                            sizes="32px"
                          />
                        </div>
                      )}
                      <span className="text-sm">{person.name}</span>
                    </div>
                  ))}
                </div>
                
                {/* Directors */}
                <h3 className="text-lg font-semibold mb-2">导演</h3>
                <div className="flex flex-wrap gap-3 mb-6">
                  {movie.directors.map(director => (
                    <div key={director.id} className="flex items-center gap-2">
                      {director.profile_path && (
                        <div className="relative h-8 w-8 rounded-full overflow-hidden">
                          <Image
                            src={director.profile_path}
                            alt={director.name}
                            className="object-cover"
                            fill
                            sizes="32px"
                          />
                        </div>
                      )}
                      <span className="text-sm">{director.name}</span>
                    </div>
                  ))}
                </div>
                
                {/* Keywords */}
                <h3 className="text-lg font-semibold mb-2">关键词</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.keywords.map(keyword => (
                    <span key={keyword.id} className="bg-muted px-3 py-1 rounded-full text-sm">
                      {keyword.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Trailer */}
            {movie.trailer_url && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">预告片</h3>
                <iframe
                  src={`https://www.youtube.com/embed/${movie.trailer_url.split('v=')[1]}`}
                  className="w-full aspect-video rounded-lg"
                  title={`${movie.title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 