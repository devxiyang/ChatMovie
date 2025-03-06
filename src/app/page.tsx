"use client"

import { MovieGrid } from "@/components/movie-grid"
import { CategoryFilters } from "@/components/category-filters"
import { FeaturedMovies } from "@/components/featured-movies"
import { Navbar } from "@/components/navbar"
import { useState, useEffect } from "react"
import { getPopularMoodCategories } from "@/lib/movie-data"
import { Movie } from "@/types/movie"
import { MovieDetailsModal } from "@/components/movie-details-modal"
import { MoodStats } from "@/components/mood-stats"

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [popularMoods, setPopularMoods] = useState<{tag: string, count: number}[]>([])
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  useEffect(() => {
    function loadPopularMoods() {
      try {
        const moods = getPopularMoodCategories(5)
        setPopularMoods(moods)
      } catch (error) {
        console.error("Error loading popular moods:", error)
      }
    }
    
    loadPopularMoods()
  }, [])

  // Listen for custom events to open movie details from recommendations
  useEffect(() => {
    const handleOpenMovieDetails = (e: Event) => {
      const customEvent = e as CustomEvent<Movie>;
      if (customEvent.detail) {
        setSelectedMovie(customEvent.detail);
        setIsModalOpen(true);
      }
    };

    window.addEventListener('openMovieDetails', handleOpenMovieDetails);
    
    return () => {
      window.removeEventListener('openMovieDetails', handleOpenMovieDetails);
    };
  }, []);

  const handleMoodSelection = (mood: string | null) => {
    setSelectedMood(mood)
  }

  const handleMovieSelection = (movie: Movie) => {
    setSelectedMovie(movie)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Navbar />
        <main className="mt-6">
          <section className="mb-8">
            <FeaturedMovies onSelectMovie={handleMovieSelection} />
          </section>
          
          <section className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-2xl font-bold text-white mb-4 sm:mb-0">Find Movies By Mood</h2>
              {selectedMood && (
                <button 
                  onClick={() => setSelectedMood(null)}
                  className="bg-slate-800 text-slate-300 text-sm py-1 px-3 rounded-md hover:bg-slate-700 transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <CategoryFilters selectedMood={selectedMood} onSelectMood={handleMoodSelection} />
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    {selectedMood 
                      ? `Movies with "${selectedMood}" Mood` 
                      : "Top Rated Movies"}
                  </h2>
                  {selectedMood && (
                    <p className="text-slate-400 text-sm mt-1 mb-4">
                      Showing movies that match your selected mood
                    </p>
                  )}
                  <MovieGrid 
                    selectedMood={selectedMood} 
                    limit={18}
                    onSelectMovie={handleMovieSelection}
                  />
                </div>
              </div>
              <div className="lg:col-span-1">
                <MoodStats onSelectMood={handleMoodSelection} />
              </div>
            </div>
          </section>
          
          {!selectedMood && popularMoods.length > 0 && (
            <section className="mt-12 space-y-12">
              <h2 className="text-2xl font-bold text-white mb-6">Popular Mood Collections</h2>
              
              {popularMoods.map(({tag}) => (
                <div key={tag} className="mb-10">
                  <MovieGrid 
                    selectedMood={tag}
                    limit={6}
                    title={`${tag.charAt(0).toUpperCase() + tag.slice(1)} Movies`}
                    onSelectMovie={handleMovieSelection}
                  />
                  <div className="mt-4 text-right">
                    <button 
                      onClick={() => setSelectedMood(tag)}
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                    >
                      See more →
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}
        </main>
      </div>

      <MovieDetailsModal 
        movie={selectedMovie}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  )
}