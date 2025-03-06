import { Flame, Zap, Heart, Film, Ghost, Sparkles, Moon } from "lucide-react"
import { useEffect, useState } from "react"

interface CategoryFiltersProps {
  selectedMood: string | null;
  onSelectMood: (mood: string | null) => void;
}

export function CategoryFilters({ selectedMood, onSelectMood }: CategoryFiltersProps) {
  const categories = [
    { name: "Trending", icon: <Flame className="h-5 w-5" /> },
    { name: "Action", icon: <Zap className="h-5 w-5" /> },
    { name: "Romance", icon: <Heart className="h-5 w-5" /> },
    { name: "Animation", icon: <Film className="h-5 w-5" /> },
    { name: "Horror", icon: <Ghost className="h-5 w-5" /> },
    { name: "Special", icon: <Sparkles className="h-5 w-5" /> },
    { name: "Drakor", icon: <Moon className="h-5 w-5" /> },
  ]

  const handleCategoryClick = (category: string) => {
    // Convert category name to lowercase for mood filtering
    const mood = category.toLowerCase();
    onSelectMood(selectedMood === mood ? null : mood);
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex space-x-2 min-w-max">
        {categories.map((category) => {
          const isActive = selectedMood === category.name.toLowerCase();
          return (
            <button
              key={category.name}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full transition-colors ${
                isActive 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700'
              }`}
              onClick={() => handleCategoryClick(category.name)}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  )
}

