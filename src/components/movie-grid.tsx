import { MovieCard } from "./movie-card"
import { Movie } from "@/types/movie"
import { useEffect, useState } from "react"
import { getMovieData } from "@/lib/movie-data"
import { filterMoviesByMood } from "@/utils/movie-utils"

interface MovieGridProps {
  selectedMood: string | null;
  limit?: number;
  title?: string;
  onSelectMovie?: (movie: Movie) => void;
}

export function MovieGrid({ selectedMood, limit = 12, title, onSelectMovie }: MovieGridProps) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])

  useEffect(() => {
    function loadMovies() {
      try {
        const data = getMovieData()
        setMovies(data.movies)
      } catch (error) {
        console.error("Error loading movies:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMovies()
  }, [])

  useEffect(() => {
    if (movies.length === 0) return

    if (selectedMood) {
      const filtered = filterMoviesByMood(movies, [selectedMood])
      setFilteredMovies(filtered.slice(0, limit))
    } else {
      // If no mood is selected, show top rated movies
      const sortedByRating = [...movies].sort((a, b) => b.vote_average - a.vote_average)
      setFilteredMovies(sortedByRating.slice(0, limit))
    }
  }, [selectedMood, movies, limit])

  const handleMovieClick = (movie: Movie) => {
    if (onSelectMovie) {
      onSelectMovie(movie)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="flex flex-col animate-pulse">
            <div className="relative aspect-[2/3] rounded-lg bg-slate-700/30 mb-2"></div>
            <div className="h-4 bg-slate-700/30 rounded mb-2 w-3/4"></div>
            <div className="h-3 bg-slate-700/30 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (filteredMovies.length === 0 && selectedMood) {
    return (
      <div className="py-8 text-center">
        <p className="text-slate-400">No movies found with the mood "{selectedMood}"</p>
      </div>
    )
  }

  return (
    <div>
      {title && (
        <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredMovies.map((movie) => (
          <MovieCard 
            key={movie.id} 
            movie={movie} 
            showMoodTags={true} 
            onClick={handleMovieClick}
          />
        ))}
      </div>
    </div>
  )
}

