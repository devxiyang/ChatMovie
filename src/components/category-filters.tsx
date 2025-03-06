import { Flame, Swords, Heart, Film, Skull, Star, Tv } from "lucide-react"

export function CategoryFilters() {
  const categories = [
    { name: "Trending", icon: <Flame className="h-5 w-5" /> },
    { name: "Action", icon: <Swords className="h-5 w-5" /> },
    { name: "Romance", icon: <Heart className="h-5 w-5" /> },
    { name: "Animation", icon: <Film className="h-5 w-5" /> },
    { name: "Horror", icon: <Skull className="h-5 w-5" /> },
    { name: "Special", icon: <Star className="h-5 w-5" /> },
    { name: "Drakor", icon: <Tv className="h-5 w-5" /> },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.name}
          className={`flex items-center gap-2 px-4 py-2 rounded-full bg-slate-700/50 text-white text-sm whitespace-nowrap ${
            category.name === "Animation" ? "bg-slate-600" : ""
          }`}
        >
          {category.icon}
          {category.name}
        </button>
      ))}
    </div>
  )
}

