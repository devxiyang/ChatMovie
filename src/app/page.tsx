import { MovieGrid } from "@/components/movie-grid"
import { CategoryFilters } from "@/components/category-filters"
import { FeaturedMovies } from "@/components/featured-movies"
import { Navbar } from "@/components/navbar"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-800/90">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Navbar />
        <main className="mt-4">
          <FeaturedMovies />
          <div className="mt-6">
            <CategoryFilters />
          </div>
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Trending in Animation</h2>
              <div className="flex gap-2">
                <button className="bg-slate-700 p-1 rounded">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                </button>
                <button className="bg-slate-700 p-1 rounded">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <path d="M3 6h18" />
                    <path d="M7 12h10" />
                    <path d="M10 18h4" />
                  </svg>
                </button>
              </div>
            </div>
            <MovieGrid />
          </div>
        </main>
      </div>
    </div>
  )
}