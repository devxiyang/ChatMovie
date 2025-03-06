import Image from "next/image"

interface Movie {
  id: number
  title: string
  rating: number
  year: number
  image: string
}

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="flex flex-col">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
        <Image src={movie.image || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
      </div>
      <h3 className="text-white text-sm font-medium line-clamp-1">{movie.title}</h3>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex items-center gap-1">
          <span className="bg-amber-500 h-3 w-3 rounded-sm"></span>
          <span className="text-white text-xs">{movie.rating}</span>
        </div>
        <span className="text-slate-400 text-xs">{movie.year}</span>
      </div>
    </div>
  )
}

