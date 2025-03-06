import { MovieCollection } from "@/types/movie";
import { extractUniqueMoodTags, groupMoviesByMoodTags } from "@/utils/movie-utils";
import movieData from "../data/top250-optimized.json";

// Cache variables for performance
let moodTagsCache: string[] | null = null;
let groupedByMoodCache: Record<string, any> | null = null;

/**
 * Get movie data directly imported from JSON
 */
export function getMovieData(): MovieCollection {
  return movieData as MovieCollection;
}

/**
 * Get all unique mood tags
 */
export function getAllMoodTags(): string[] {
  if (moodTagsCache) {
    return moodTagsCache;
  }

  moodTagsCache = extractUniqueMoodTags(movieData as MovieCollection);
  return moodTagsCache;
}

/**
 * Get movies grouped by mood tags
 */
export function getMoviesGroupedByMood(): Record<string, any> {
  if (groupedByMoodCache) {
    return groupedByMoodCache;
  }

  groupedByMoodCache = groupMoviesByMoodTags((movieData as MovieCollection).movies);
  return groupedByMoodCache;
}

/**
 * Get popular mood categories
 * Returns most popular mood tags based on movie count
 */
export function getPopularMoodCategories(limit: number = 10): {tag: string, count: number}[] {
  const groupedMovies = getMoviesGroupedByMood();
  
  const moodCounts = Object.entries(groupedMovies).map(([tag, movies]) => ({
    tag,
    count: movies.length
  }));
  
  // Sort by movie count in descending order
  return moodCounts.sort((a, b) => b.count - a.count).slice(0, limit);
} 