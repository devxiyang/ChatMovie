import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Movie } from "@/types/movie"
import { Clock, Star, Calendar, X, Play } from "lucide-react"
import Image from "next/image"
import { getRecommendationsByMood } from "@/utils/movie-utils"
import { useEffect, useState } from "react"
import { getMovieData } from "@/lib/movie-data"
import { MovieCard } from "./movie-card"

interface MovieDetailsModalProps {
  movie: Movie | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function MovieDetailsModal({ movie, isOpen, onOpenChange }: MovieDetailsModalProps) {
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    function loadSimilarMovies() {
      if (!movie || !movie.mood_tags || movie.mood_tags.length === 0) return
      
      setLoading(true)
      try {
        const data = getMovieData()
        // Get primary mood tag to find similar movies
        const primaryMood = movie.mood_tags[0]
        const recommendations = getRecommendationsByMood(
          // Filter out the current movie
          data.movies.filter(m => m.id !== movie.id),
          primaryMood,
          4
        )
        setSimilarMovies(recommendations)
      } catch (error) {
        console.error("Error loading similar movies:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && movie) {
      loadSimilarMovies()
    }
  }, [isOpen, movie])

  if (!movie) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 text-white border-slate-800">
        <DialogHeader className="relative">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-0 top-0 bg-slate-800/50 p-1 rounded-full hover:bg-slate-700/50"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogTitle className="text-2xl font-bold">{movie.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
            <Image 
              src={movie.poster_url} 
              alt={movie.title} 
              fill 
              className="object-cover" 
            />
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-wrap gap-3 mb-4">
              {movie.mood_tags.map(tag => (
                <span 
                  key={tag} 
                  className="bg-indigo-600/30 text-indigo-200 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span>{movie.vote_average.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{movie.release_year}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-slate-300 font-medium mb-2">Overview</h3>
              <p className="text-slate-400 text-sm">{movie.overview}</p>
            </div>

            <div className="mt-4">
              <h3 className="text-slate-300 font-medium mb-2">Cast</h3>
              <div className="flex flex-wrap gap-2">
                {movie.cast.slice(0, 5).map(person => (
                  <span 
                    key={person.id} 
                    className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs"
                  >
                    {person.name} as {person.character.split('/')[0].trim()}
                  </span>
                ))}
              </div>
            </div>
            
            {movie.ai_review && (
              <div className="mt-4">
                <h3 className="text-slate-300 font-medium mb-2">AI Review</h3>
                <p className="text-slate-400 text-sm italic">{movie.ai_review}</p>
              </div>
            )}
            
            {movie.trailer_url && (
              <div className="mt-6">
                <a 
                  href={movie.trailer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white py-2 px-4 rounded-md text-sm"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Watch Trailer</span>
                </a>
              </div>
            )}
          </div>
        </div>
        
        {similarMovies.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-medium mb-4">More Movies with {movie.mood_tags[0]} Mood</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {similarMovies.map(similarMovie => (
                <div key={similarMovie.id} onClick={() => {
                  // Replace the current movie with the similar one in the modal
                  onOpenChange(false);
                  setTimeout(() => {
                    // We need this timeout because the modal closing animation
                    window.dispatchEvent(new CustomEvent('openMovieDetails', { detail: similarMovie }));
                  }, 300);
                }}>
                  <MovieCard movie={similarMovie} showMoodTags={true} />
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 