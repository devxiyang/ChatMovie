import { Play } from "lucide-react"
import Image from "next/image"

export function FeaturedMovies() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="relative h-48 md:h-64 rounded-xl overflow-hidden">
        <Image
          src="/placeholder.svg?height=256&width=512"
          alt="The Adventure of Blue Sword"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent p-6 flex flex-col justify-end">
          <h2 className="text-2xl font-bold text-white leading-tight">
            The
            <br />
            Adventure of
            <br />
            Blue Sword
          </h2>
          <button className="flex items-center gap-2 bg-black/30 text-white rounded-full px-3 py-1 mt-4 w-fit">
            <Play className="h-4 w-4 fill-white" />
            <span className="text-sm">Let Play Moview</span>
          </button>
        </div>
      </div>

      <div className="relative h-48 md:h-64 rounded-xl overflow-hidden">
        <Image
          src="/placeholder.svg?height=256&width=512"
          alt="Recalling the journey of Dol's exciting story"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/80 to-transparent p-6 flex flex-col justify-end">
          <div className="absolute top-4 right-4">
            <Image
              src="/placeholder.svg?height=40&width=100"
              alt="Disney Pixar"
              width={100}
              height={40}
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-white leading-tight">
            Recalling the
            <br />
            journey of Dol's
            <br />
            exciting story
          </h2>
          <button className="flex items-center gap-2 bg-black/30 text-white rounded-full px-3 py-1 mt-4 w-fit">
            <Play className="h-4 w-4 fill-white" />
            <span className="text-sm">Let Play Moview</span>
          </button>
        </div>
      </div>
    </div>
  )
}

