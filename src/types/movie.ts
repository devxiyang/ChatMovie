export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
}

export interface Keyword {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  release_date: string;
  release_year: string;
  poster_url: string;
  backdrop_url: string;
  trailer_url?: string;
  genres: Genre[];
  vote_average: number;
  vote_count: number;
  score_percent: number;
  cast: CastMember[];
  keywords: Keyword[];
  era: string;
  runtime: number;
  ai_review?: string;
  mood_tags: string[];
  watch_suggestion?: string;
}

export interface MovieCollection {
  count: number;
  generated_at: string;
  processing_time_seconds: number;
  avg_rating: number;
  oldest_movie: string;
  newest_movie: string;
  total_runtime: number;
  movies: Movie[];
} 