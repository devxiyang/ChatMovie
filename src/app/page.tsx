"use client"

import { Navbar } from "@/components/navbar"
import { useState, useEffect } from "react"
import { Movie } from "@/types/movie"
import { MovieDetailsModal } from "@/components/movie-details-modal"
import { MoodList } from "@/components/mood-list"
import { getMovieData } from "@/lib/movie-data"
import { groupMoviesByMoodTags } from "@/utils/movie-utils"

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [moodGroups, setMoodGroups] = useState<Record<string, Movie[]>>({})
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    function loadMoodGroups() {
      try {
        const data = getMovieData()
        // 根据mood_tags将电影分组
        const groups = groupMoviesByMoodTags(data.movies)
        setMoodGroups(groups)
      } catch (error) {
        console.error("Error loading movies by moods:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadMoodGroups()
  }, [])

  const handleMoodSelection = (mood: string | null) => {
    setSelectedMood(mood)
  }

  const handleMovieSelection = (movie: Movie) => {
    setSelectedMovie(movie)
    setIsModalOpen(true)
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <Navbar />
        
        <main>
          <MoodList 
            moodGroups={moodGroups}
            selectedMood={selectedMood}
            onSelectMood={handleMoodSelection}
            onSelectMovie={handleMovieSelection}
            loading={loading}
          />
        </main>

        <footer className="footer">
          <p>© 2023 心情电影 - 根据您的心情发现完美电影</p>
        </footer>
      </div>

      <MovieDetailsModal 
        movie={selectedMovie}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  )
}