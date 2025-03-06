import Image from "next/image"
import { Movie } from "@/types/movie"
import { Star, Play } from "lucide-react"

interface MovieCardProps {
  movie: Movie;
  showMoodTags?: boolean;
  onClick?: (movie: Movie) => void;
}

export function MovieCard({ movie, showMoodTags = false, onClick }: MovieCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(movie);
    }
  };

  const handleTrailerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the movie details
    if (movie.trailer_url) {
      window.open(movie.trailer_url, '_blank');
    }
  };

  return (
    <div 
      className="flex flex-col group cursor-pointer" 
      onClick={handleClick}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2 group-hover:shadow-lg transition-shadow duration-300">
        <Image 
          src={movie.poster_url || "/placeholder.svg"} 
          alt={movie.title} 
          fill 
          className="object-cover transition-transform duration-300 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <div className="flex flex-col gap-2">
            <button className="bg-white/20 backdrop-blur-sm text-white text-xs py-1 px-2 rounded-full w-fit hover:bg-white/30 transition-colors">
              View Details
            </button>
            {movie.trailer_url && (
              <button 
                onClick={handleTrailerClick}
                className="bg-indigo-600/70 backdrop-blur-sm text-white text-xs py-1 px-2 rounded-full w-fit hover:bg-indigo-600/90 transition-colors flex items-center gap-1"
              >
                <Play className="h-3 w-3 fill-white" />
                <span>Trailer</span>
              </button>
            )}
          </div>
        </div>
      </div>
      <h3 className="text-white text-sm font-medium line-clamp-1">{movie.title}</h3>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
          <span className="text-white text-xs">{movie.vote_average.toFixed(1)}</span>
        </div>
        <span className="text-slate-400 text-xs">{movie.release_year}</span>
      </div>
      
      {showMoodTags && movie.mood_tags && movie.mood_tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {movie.mood_tags.slice(0, 2).map((tag) => (
            <span 
              key={tag} 
              className="text-[10px] bg-slate-700/60 text-slate-300 px-1.5 py-0.5 rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

