export interface Movie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_url: string | null;
  backdrop_url: string | null;
  genres: { id: number; name: string }[];
  vote_average: number;
  vote_count: number;
  score_percent: number;
  trailer_url?: string;
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }[];
  directors: {
    id: number;
    name: string;
    profile_path: string | null;
  }[];
  era: string;
  keywords: { id: number; name: string }[];
}

export type Mood = 
  | 'happy' 
  | 'sad' 
  | 'excited' 
  | 'relaxed' 
  | 'romantic'
  | 'thoughtful'
  | 'nostalgic'
  | 'adventurous'
  | 'inspired';

export interface MoodPlaylist {
  id: string;
  name: string;
  description: string;
  mood: Mood;
  coverImage: string;
  movies: Movie[];
} 