import { Search, Smile, Film, Home, User } from "lucide-react"
import Link from "next/link"

export function Navbar() {
  return (
    <nav className="flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Smile className="h-7 w-7 text-indigo-400" />
        <div className="text-2xl font-bold text-white">MoodFlix</div>
      </Link>

      <div className="hidden md:flex items-center bg-slate-800/50 rounded-full px-1 py-1">
        <button className="px-4 py-1 rounded-full bg-indigo-600 text-white text-sm flex items-center gap-1">
          <Home className="h-4 w-4" />
          <span>Home</span>
        </button>
        <button className="px-4 py-1 rounded-full text-slate-300 text-sm hover:bg-slate-700/50 flex items-center gap-1">
          <Smile className="h-4 w-4" />
          <span>Moods</span>
        </button>
        <button className="px-4 py-1 rounded-full text-slate-300 text-sm hover:bg-slate-700/50 flex items-center gap-1">
          <Film className="h-4 w-4" />
          <span>Genres</span>
        </button>
        <div className="relative mx-2">
          <input
            type="text"
            placeholder="Search movies..."
            className="bg-slate-700/50 rounded-full py-1 pl-3 pr-9 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 w-40"
          />
          <Search className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      <div className="md:hidden">
        <button className="bg-slate-800 p-2 rounded-full">
          <Search className="h-5 w-5 text-white" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <button className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white text-sm px-4 py-1 rounded-full">
            Sign In
          </button>
        </div>
        <button className="bg-slate-800 p-2 rounded-full">
          <User className="h-5 w-5 text-white" />
        </button>
      </div>
    </nav>
  )
}

