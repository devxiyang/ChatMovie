import { Bell, ChevronDown, Search } from "lucide-react"
import Image from "next/image"

export function Navbar() {
  return (
    <nav className="flex items-center justify-between">
      <div className="text-2xl font-bold text-white">Flix.id</div>

      <div className="flex items-center bg-slate-900 rounded-full px-1 py-1">
        <button className="px-4 py-1 rounded-full bg-slate-800 text-white text-sm">Movie</button>
        <button className="px-4 py-1 rounded-full text-slate-400 text-sm">Series</button>
        <button className="px-4 py-1 rounded-full text-slate-400 text-sm">Originals</button>
        <button className="ml-1 p-1">
          <Search className="h-5 w-5 text-white" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell className="h-5 w-5 text-white" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            1
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 rounded-full overflow-hidden">
            <Image
              src="/placeholder.svg?height=32&width=32"
              alt="Profile"
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
          <div className="hidden md:block">
            <div className="flex items-center gap-1">
              <span className="text-white text-sm">Sarah J</span>
              <ChevronDown className="h-4 w-4 text-white" />
            </div>
            <span className="text-slate-400 text-xs">Premium</span>
          </div>
        </div>
      </div>
    </nav>
  )
}

