import { Sparkles, Heart, Smile, Frown, Ghost, Laugh, Star, Flame } from "lucide-react"
import { useEffect, useState } from "react"
import { getAllMoodTags } from "@/lib/movie-data"
import { ReactElement } from "react"

const MOOD_ICONS: Record<string, ReactElement> = {
  "happy": <Smile className="h-5 w-5" />,
  "sad": <Frown className="h-5 w-5" />,
  "inspiring": <Sparkles className="h-5 w-5" />,
  "romantic": <Heart className="h-5 w-5" />, 
  "funny": <Laugh className="h-5 w-5" />,
  "thrilling": <Flame className="h-5 w-5" />,
  "suspenseful": <Ghost className="h-5 w-5" />,
  "emotional": <Heart className="h-5 w-5" />,
  "heartwarming": <Heart className="h-5 w-5" />,
  "uplifting": <Sparkles className="h-5 w-5" />,
}

// Default icon for moods without specific icon
const DEFAULT_ICON = <Star className="h-5 w-5" />

export function CategoryFilters({ 
  selectedMood, 
  onSelectMood 
}: { 
  selectedMood: string | null, 
  onSelectMood: (mood: string | null) => void 
}) {
  const [moodTags, setMoodTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function loadMoodTags() {
      try {
        const tags = getAllMoodTags()
        // Get the top 15 most common moods
        setMoodTags(tags.slice(0, 15))
      } catch (error) {
        console.error("Error loading mood tags:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMoodTags()
  }, [])

  const handleMoodClick = (mood: string) => {
    if (selectedMood === mood) {
      onSelectMood(null) // Deselect if already selected
    } else {
      onSelectMood(mood)
    }
  }

  if (loading) {
    return <div className="flex gap-2 overflow-x-auto pb-2 h-10 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-24 h-9 bg-slate-700/30 rounded-full"></div>
      ))}
    </div>
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {moodTags.map((mood) => {
        const titleCaseMood = mood.charAt(0).toUpperCase() + mood.slice(1)
        return (
          <button
            key={mood}
            onClick={() => handleMoodClick(mood)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm whitespace-nowrap transition-colors
              ${selectedMood === mood 
                ? "bg-indigo-600 hover:bg-indigo-700" 
                : "bg-slate-700/50 hover:bg-slate-600/60"
              }`}
          >
            {MOOD_ICONS[mood.toLowerCase()] || DEFAULT_ICON}
            {titleCaseMood}
          </button>
        )
      })}
    </div>
  )
}

