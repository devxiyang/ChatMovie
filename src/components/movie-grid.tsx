import { MovieCard } from "./movie-card"
import { Movie } from "@/types/movie"
import { useEffect, useState } from "react"
import { getMovieData } from "@/lib/movie-data"
import { getRecommendationsByMood } from "@/utils/movie-utils"

interface MovieGridProps {
  selectedMood: string | null;
  limit?: number;
  title?: string;
  onSelectMovie?: (movie: Movie) => void;
}

export function MovieGrid({ 
  selectedMood, 
  limit = 12, 
  title,
  onSelectMovie
}: MovieGridProps) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function loadMovies() {
      try {
        const data = getMovieData()
        
        let filtered: Movie[] = []
        
        if (selectedMood) {
          filtered = getRecommendationsByMood(data.movies, selectedMood, limit)
        } else {
          // Sort by rating and get top movies when no mood is selected
          filtered = [...data.movies]
            .sort((a, b) => b.vote_average - a.vote_average)
            .slice(0, limit)
        }
        
        setMovies(filtered)
      } catch (error) {
        console.error("Error loading movies:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadMovies()
  }, [selectedMood, limit])

  if (loading) {
    return (
      <div className="movie-grid">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="movie-card animate-pulse">
            <div className="aspect-[2/3] bg-gray-200 rounded-lg"></div>
            <div className="p-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  if (movies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No movies found for this mood. Try another one!</p>
      </div>
    )
  }

  return (
    <div>
      {title && <h2 className="section-title">{title}</h2>}
      <div className="movie-grid">
        {movies.map((movie) => (
          <MovieCard 
            key={movie.id} 
            movie={movie} 
            onClick={onSelectMovie} 
            showMoodTags={selectedMood === null}
          />
        ))}
      </div>
    </div>
  )
}

