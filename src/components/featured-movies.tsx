import { Play } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { getMovieData } from "@/lib/movie-data"
import { getRecommendationsByMood } from "@/utils/movie-utils"
import { Movie } from "@/types/movie"

interface FeaturedMoviesProps {
  onSelectMovie?: (movie: Movie) => void;
}

export function FeaturedMovies({ onSelectMovie }: FeaturedMoviesProps) {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function loadFeaturedMovies() {
      try {
        const data = getMovieData()
        
        // Get two featured movies with inspiring/uplifting moods
        const inspiringMovies = getRecommendationsByMood(data.movies, "inspiring", 1)
        const upliftingMovies = getRecommendationsByMood(data.movies, "uplifting", 1)
        
        // Combine them
        const featured = [...inspiringMovies, ...upliftingMovies]
        setFeaturedMovies(featured.slice(0, 2))
      } catch (error) {
        console.error("Error loading featured movies:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedMovies()
  }, [])

  const handleMovieClick = (movie: Movie) => {
    if (onSelectMovie) {
      onSelectMovie(movie);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="relative h-48 md:h-64 rounded-xl bg-slate-700/30 animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (featuredMovies.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {featuredMovies.map((movie) => (
        <div 
          key={movie.id} 
          className="relative h-48 md:h-64 rounded-xl overflow-hidden group cursor-pointer"
          onClick={() => handleMovieClick(movie)}
        >
          <Image
            src={movie.backdrop_url || "/placeholder.svg?height=256&width=512"}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent p-6 flex flex-col justify-end">
            <div className="flex gap-2 mb-2">
              {movie.mood_tags && movie.mood_tags.slice(0, 2).map((tag) => (
                <span key={tag} className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-sm">
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight line-clamp-3">
              {movie.title}
            </h2>
            <button 
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full px-3 py-1 mt-4 w-fit transition-colors"
              onClick={(e) => {
                e.stopPropagation(); // Don't trigger the parent onClick
                if (movie.trailer_url) {
                  window.open(movie.trailer_url, '_blank');
                }
              }}
            >
              <Play className="h-4 w-4 fill-white" />
              <span className="text-sm">Watch Trailer</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

