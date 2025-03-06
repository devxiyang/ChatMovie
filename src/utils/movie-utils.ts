import { Movie, MovieCollection } from "@/types/movie";

/**
 * Extracts all unique mood tags from the movie collection
 */
export function extractUniqueMoodTags(movieData: MovieCollection): string[] {
  const moodTagsSet = new Set<string>();
  
  movieData.movies.forEach((movie) => {
    if (movie.mood_tags && Array.isArray(movie.mood_tags)) {
      movie.mood_tags.forEach((tag) => {
        // Normalize tag to lowercase for comparison, but keep original case for display
        moodTagsSet.add(tag.toLowerCase());
      });
    }
  });
  
  // Convert set to array and sort alphabetically
  return Array.from(moodTagsSet).sort();
}

/**
 * Filter movies by mood tags
 */
export function filterMoviesByMood(movies: Movie[], moodTags: string[]): Movie[] {
  if (!moodTags.length) return movies;
  
  const normalizedMoodTags = moodTags.map(tag => tag.toLowerCase());
  
  return movies.filter((movie) => {
    if (!movie.mood_tags || !Array.isArray(movie.mood_tags)) return false;
    
    const movieMoodTags = movie.mood_tags.map(tag => tag.toLowerCase());
    return normalizedMoodTags.some(tag => movieMoodTags.includes(tag));
  });
}

/**
 * Get recommendations based on a mood
 */
export function getRecommendationsByMood(movies: Movie[], mood: string, limit: number = 6): Movie[] {
  const matchingMovies = filterMoviesByMood(movies, [mood]);
  
  // Sort by rating to get the highest rated movies with this mood
  const sortedMovies = [...matchingMovies].sort((a, b) => b.vote_average - a.vote_average);
  
  return sortedMovies.slice(0, limit);
}

/**
 * Group movies by mood tags
 */
export function groupMoviesByMoodTags(movies: Movie[]): Record<string, Movie[]> {
  const result: Record<string, Movie[]> = {};
  
  movies.forEach((movie) => {
    if (!movie.mood_tags || !Array.isArray(movie.mood_tags)) return;
    
    movie.mood_tags.forEach((tag) => {
      const normalizedTag = tag.toLowerCase();
      if (!result[normalizedTag]) {
        result[normalizedTag] = [];
      }
      result[normalizedTag].push(movie);
    });
  });
  
  // Sort each group by rating
  Object.keys(result).forEach((tag) => {
    result[tag] = result[tag].sort((a, b) => b.vote_average - a.vote_average);
  });
  
  return result;
} 