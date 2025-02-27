import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

// Mood to genre/keyword mapping
const moodMappings = {
  cheerful: { genres: [35, 10751], keywords: ['uplifting', 'feel-good'] },
  reflective: { genres: [18], keywords: ['thought-provoking', 'philosophical'] },
  gloomy: { genres: [18], keywords: ['melancholic', 'dark'] },
  humorous: { genres: [35], keywords: ['comedy', 'funny'] },
  melancholy: { genres: [18], keywords: ['emotional', 'touching'] },
  idyllic: { genres: [14, 12], keywords: ['fantasy', 'magical'] },
  chill: { genres: [35, 10751], keywords: ['relaxing', 'light-hearted'] },
  romantic: { genres: [10749], keywords: ['romance', 'love'] },
  weird: { genres: [878, 14], keywords: ['surreal', 'bizarre'] },
  horny: { genres: [10749], keywords: ['sensual', 'romantic'] },
  sleepy: { genres: [18, 10751], keywords: ['calm', 'soothing'] },
  angry: { genres: [28, 80], keywords: ['intense', 'action-packed'] },
  fearful: { genres: [27, 53], keywords: ['suspense', 'thriller'] },
  lonely: { genres: [18], keywords: ['connection', 'friendship'] },
  tense: { genres: [53, 9648], keywords: ['suspense', 'mystery'] },
  thoughtful: { genres: [99, 18], keywords: ['documentary', 'inspiring'] },
  thrill: { genres: [28, 12], keywords: ['adventure', 'exciting'] },
  playful: { genres: [16, 35], keywords: ['animation', 'fun'] },
} as const;

export async function GET(
  request: Request,
  context: { params: { mood: string } }
) {
  try {
    const mood = context.params.mood;
    
    if (!mood || !(mood in moodMappings)) {
      return NextResponse.json(
        { error: 'Invalid mood parameter' },
        { status: 400 }
      );
    }

    if (!TMDB_API_KEY) {
      return NextResponse.json(
        { error: 'TMDB API key not configured' },
        { status: 500 }
      );
    }

    const { genres, keywords } = moodMappings[mood as keyof typeof moodMappings];
    
    // Get movies by genre
    const genreResponse = await fetch(
      `${TMDB_API_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genres.join(',')}&sort_by=vote_average.desc&vote_count.gte=1000&page=1&language=en-US`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!genreResponse.ok) {
      throw new Error('Failed to fetch movies from TMDB');
    }

    const genreData = await genreResponse.json();
    
    // Get additional movie details for each movie
    const moviesWithDetails = await Promise.all(
      genreData.results.slice(0, 12).map(async (movie: any) => {
        const detailsResponse = await fetch(
          `${TMDB_API_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=videos`,
          { next: { revalidate: 3600 } } // Cache for 1 hour
        );
        
        if (!detailsResponse.ok) {
          return null;
        }
        
        const details = await detailsResponse.json();
        return {
          id: details.id,
          title: details.title,
          overview: details.overview,
          poster_path: details.poster_path,
          release_date: details.release_date,
          vote_average: details.vote_average,
          runtime: details.runtime,
          genres: details.genres,
          videos: details.videos,
        };
      })
    );

    // Filter out any null results from failed requests
    const validMovies = moviesWithDetails.filter(movie => movie !== null);

    return NextResponse.json(validMovies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
} 