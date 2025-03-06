import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { Movie } from "@/types/movie"
import Image from "next/image"
import { Star, Clock, Calendar, X } from "lucide-react"

interface MovieDetailsModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovieDetailsModal({ movie, isOpen, onOpenChange }: MovieDetailsModalProps) {
  if (!movie) return null

  // Calculate runtime in hours and minutes
  const hours = Math.floor((movie.runtime || 0) / 60)
  const minutes = (movie.runtime || 0) % 60

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white rounded-lg">
        <div className="relative">
          {movie.backdrop_url && (
            <div className="relative w-full h-72 sm:h-80 overflow-hidden">
              <Image
                src={movie.backdrop_url}
                alt={movie.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            </div>
          )}
          
          <DialogClose className="absolute top-4 right-4 bg-black/40 rounded-full p-1 text-white hover:bg-black/60 transition">
            <X className="h-6 w-6" />
          </DialogClose>
        </div>
        
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={movie.poster_url || "/placeholder.svg"}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
              
              <div className="flex items-center flex-wrap gap-3 mb-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                  <span>{movie.vote_average.toFixed(1)}</span>
                </div>
                
                {movie.release_year && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{movie.release_year}</span>
                  </div>
                )}
                
                {movie.runtime && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      {hours > 0 ? `${hours}h ` : ""}{minutes > 0 ? `${minutes}m` : ""}
                    </span>
                  </div>
                )}
              </div>
              
              {movie.mood_tags && movie.mood_tags.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Moods:</p>
                  <div className="flex flex-wrap gap-2">
                    {movie.mood_tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {movie.overview && (
                <div className="mb-6">
                  <p className="text-sm font-medium mb-2">Overview:</p>
                  <p className="text-gray-700">{movie.overview}</p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3 mt-6">
                {movie.trailer_url && (
                  <a 
                    href={movie.trailer_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="button-primary"
                  >
                    Watch Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 