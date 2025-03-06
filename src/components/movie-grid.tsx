import { MovieCard } from "./movie-card"

export function MovieGrid() {
  const movies = [
    { id: 1, title: "Loftoeng Kasarung", rating: 7.8, year: 2023, image: "/placeholder.svg?height=300&width=200" },
    { id: 2, title: "Gajah Langka", rating: 6.0, year: 2023, image: "/placeholder.svg?height=300&width=200" },
    { id: 3, title: "Si Kang Satay", rating: 7.1, year: 2023, image: "/placeholder.svg?height=300&width=200" },
    { id: 4, title: "Mommy Cat", rating: 7.8, year: 2023, image: "/placeholder.svg?height=300&width=200" },
    { id: 5, title: "Hijabar Cantiq", rating: 6.1, year: 2023, image: "/placeholder.svg?height=300&width=200" },
    { id: 6, title: "Xatra-X", rating: 6.5, year: 2022, image: "/placeholder.svg?height=300&width=200" },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}

