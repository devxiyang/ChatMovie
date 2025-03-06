import { useEffect, useState } from "react"
import { getPopularMoodCategories, getAllMoodTags } from "@/lib/movie-data"

interface MoodStatsProps {
  onSelectMood: (mood: string) => void;
}

export function MoodStats({ onSelectMood }: MoodStatsProps) {
  const [topMoods, setTopMoods] = useState<{tag: string, count: number}[]>([])
  const [totalMoods, setTotalMoods] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function loadMoodStats() {
      try {
        setLoading(true)
        // Get top moods by popularity
        const popularMoods = getPopularMoodCategories(6) 
        setTopMoods(popularMoods)
        
        // Get total number of mood tags
        const allMoods = getAllMoodTags()
        setTotalMoods(allMoods.length)
      } catch (error) {
        console.error("Error loading mood stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMoodStats()
  }, [])

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-5 animate-pulse">
        <div className="h-6 bg-slate-700/50 w-1/3 rounded mb-4"></div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 bg-slate-700/50 rounded-md"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-5">
      <h3 className="text-lg font-medium text-white mb-4">Mood Insights</h3>
      
      <div className="space-y-3 mb-5">
        {topMoods.slice(0, 3).map((mood) => {
          // Calculate percentage of movies with this mood
          const percentage = Math.round((mood.count / 250) * 100)
          
          return (
            <div key={mood.tag} className="group">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300 group-hover:text-white transition-colors capitalize">
                  {mood.tag}
                </span>
                <span className="text-slate-400 group-hover:text-indigo-400 transition-colors">
                  {mood.count} movies
                </span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 group-hover:bg-indigo-500 transition-all" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="flex justify-between mb-4">
        <div className="text-center">
          <p className="text-xl font-semibold text-white">{totalMoods}</p>
          <p className="text-xs text-slate-400">Unique Moods</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold text-white">250</p>
          <p className="text-xs text-slate-400">Total Movies</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold text-white">{topMoods[0]?.tag || "-"}</p>
          <p className="text-xs text-slate-400">Top Mood</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-4">
        {topMoods.map((mood) => (
          <button
            key={mood.tag}
            onClick={() => onSelectMood(mood.tag)}
            className="text-xs bg-slate-700 hover:bg-indigo-600 text-white px-3 py-1 rounded-full transition-colors"
          >
            {mood.tag}
          </button>
        ))}
      </div>
    </div>
  )
} 