import Image from "next/image"
import { Movie } from "@/types/movie"
import { Star } from "lucide-react"

interface MovieCardProps {
  movie: Movie;
  onClick?: (movie: Movie) => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(movie);
    }
  };

  return (
    <div 
      className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer" 
      onClick={handleClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image 
          src={movie.poster_url || "/placeholder.svg"} 
          alt={movie.title} 
          fill 
          className="object-cover" 
        />
      </div>
      <div className="p-2">
        <h3 className="font-medium text-sm line-clamp-1">{movie.title}</h3>
        <div className="flex items-center text-xs mt-1 text-gray-600">
          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
          <span>{movie.vote_average.toFixed(1)}</span>
          <span className="mx-1">•</span>
          <span>{movie.release_year}</span>
        </div>
      </div>
    </div>
  )
}

