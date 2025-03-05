const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
// Import dotenv for .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// 注意：此脚本使用Google的免费模型 gemini-1.5-flash-latest
// Get API key from environment variable
const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// File paths
const sourcePath = path.join(__dirname, '../src/data/movies.json');
const targetPath = path.join(__dirname, '../src/data/top250-optimized.json');

// Delay function to avoid API rate limits
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 添加重试逻辑，处理配额限制问题
async function retryOperation(operation, retries = 3, initialDelay = 2000) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (error.message.includes('429') || error.message.includes('quota')) {
        const waitTime = initialDelay * Math.pow(2, i); // 指数退避
        console.log(`配额限制错误，等待${waitTime}ms后重试...`);
        await delay(waitTime);
      } else {
        // 如果不是配额限制错误，直接抛出
        throw error;
      }
    }
  }
  throw lastError; // 如果所有重试都失败，抛出最后一个错误
}

/**
 * Generate movie analysis using Gemini
 */
async function generateMovieAnalysis(movie) {
  try {
    // 使用Google免费版的模型 - gemini-1.5-flash-latest
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Create movie info in English
    const movieInfo = `
      Title: ${movie.title} (${movie.release_date ? movie.release_date.split('-')[0] : 'Unknown'})
      Director: ${movie.directors ? movie.directors.map(d => d.name).join(', ') : 'Unknown'}
      Genres: ${movie.genres ? movie.genres.map(g => g.name).join(', ') : 'Unknown'}
      Rating: ${movie.vote_average}/10 (${movie.vote_count} votes)
      Overview: ${movie.overview}
    `;

    // 使用重试逻辑生成评论
    const review = await retryOperation(async () => {
      const reviewPrompt = `As a professional film critic, write a concise yet insightful review (around 100 words) for the following movie. Focus on its artistic merit, cultural impact, and standout elements:\n${movieInfo}`;
      const reviewResult = await model.generateContent(reviewPrompt);
      return reviewResult.response.text().trim();
    });

    // 等待一段时间后再发送下一个请求
    await delay(3000);

    // 使用重试逻辑生成情绪标签
    const moodTags = await retryOperation(async () => {
      const moodPrompt = `Based on the following movie information, list 5 emotional/atmospheric tags that best describe this film, separated by commas. For example: heartwarming, thrilling, suspenseful, romantic, etc.\n${movieInfo}`;
      const moodResult = await model.generateContent(moodPrompt);
      return moodResult.response.text().trim().split(/[,،]/).map(tag => tag.trim()).filter(Boolean);
    });

    // 等待一段时间后再发送下一个请求
    await delay(3000);

    // 使用重试逻辑生成观影建议
    const watchSuggestion = await retryOperation(async () => {
      const suggestionPrompt = `Provide a single sentence recommendation for when and by whom this movie should be watched:\n${movieInfo}`;
      const suggestionResult = await model.generateContent(suggestionPrompt);
      return suggestionResult.response.text().trim();
    });

    return {
      ai_review: review,
      mood_tags: moodTags,
      watch_suggestion: watchSuggestion
    };
  } catch (error) {
    console.error(`Error generating analysis for ${movie.title}:`, error.message);
    return {
      ai_review: null,
      mood_tags: [],
      watch_suggestion: null
    };
  }
}

/**
 * Optimize movie object by removing redundant fields
 */
function optimizeMovieObject(movie) {
  // Extract only necessary fields
  return {
    id: movie.id,
    title: movie.title,
    original_title: movie.original_title || movie.title,
    overview: movie.overview,
    release_date: movie.release_date,
    release_year: movie.release_date ? movie.release_date.split('-')[0] : null,
    
    // Keep only one poster URL
    poster_url: movie.poster_url,
    
    // Keep only one backdrop URL
    backdrop_url: movie.backdrop_url,
    
    // Keep only one trailer URL (YouTube)
    trailer_url: movie.trailer_url,
    
    // Keep essential metadata
    genres: movie.genres,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    score_percent: movie.score_percent || (movie.vote_average ? movie.vote_average * 10 : 0),
    
    // Simplified cast - keep only essential info
    cast: movie.cast ? movie.cast.slice(0, 5).map(actor => ({
      id: actor.id,
      name: actor.name,
      character: actor.character,
    })) : [],
    
    // Simplified directors - keep only essential info
    directors: movie.directors ? movie.directors.map(director => ({
      id: director.id,
      name: director.name,
    })) : [],
    
    // Keywords for search and recommendation
    keywords: movie.keywords ? movie.keywords.slice(0, 10) : [],
    
    // Era for filtering
    era: movie.era || (movie.release_date ? movie.release_date.split('-')[0] + 's' : 'Unknown')
  };
}

async function main() {
  console.log('Reading movie data...');
  const rawData = fs.readFileSync(sourcePath, 'utf8');
  const movieData = JSON.parse(rawData);

  // Ensure data format is valid
  if (!movieData.movies || !Array.isArray(movieData.movies)) {
    console.error('Invalid movie data format:', typeof movieData, 'movies field:', movieData.movies ? typeof movieData.movies : 'does not exist');
    process.exit(1);
  }

  console.log(`Original data contains ${movieData.movies.length} movies`);

  // Sort movies by rating
  console.log('Sorting movies by rating...');
  const sortedMovies = [...movieData.movies].sort((a, b) => {
    // First sort by score_percent
    const scoreA = a.score_percent || (a.vote_average ? a.vote_average * 10 : 0);
    const scoreB = b.score_percent || (b.vote_average ? b.vote_average * 10 : 0);
    
    // If scores are equal, sort by vote_count
    if (scoreB === scoreA) {
      return (b.vote_count || 0) - (a.vote_count || 0);
    }
    
    return scoreB - scoreA;
  });

  // Take the top 250 movies
  const top250Movies = sortedMovies.slice(0, 250);
  console.log(`Selected ${top250Movies.length} highest-rated movies`);

  // 检查是否有部分处理的结果文件
  let enhancedMovies = [];
  let startIndex = 0;
  
  const tempFilePath = path.join(__dirname, '../src/data/top250-in-progress.json');
  if (fs.existsSync(tempFilePath)) {
    try {
      const tempData = JSON.parse(fs.readFileSync(tempFilePath, 'utf8'));
      if (tempData.movies && Array.isArray(tempData.movies)) {
        enhancedMovies = tempData.movies;
        startIndex = enhancedMovies.length;
        console.log(`Found in-progress data with ${startIndex} movies already processed. Resuming from movie #${startIndex + 1}.`);
      }
    } catch (error) {
      console.error('Error reading in-progress data:', error.message);
      console.log('Starting from the beginning...');
    }
  }

  // 定义小批次处理大小
  const BATCH_SIZE = 10;

  // Enhance movies with AI and optimize structure
  console.log('Beginning AI enhancement and structure optimization...');
  
  // 按批次处理电影
  for (let i = startIndex; i < top250Movies.length; i++) {
    const movie = top250Movies[i];
    console.log(`Processing movie ${i+1}/${top250Movies.length}: ${movie.title}`);
    
    try {
      // 1. First optimize the movie object structure
      const optimizedMovie = optimizeMovieObject(movie);
      
      // 2. Generate AI analysis if API key is available
      if (API_KEY) {
        try {
          const aiAnalysis = await generateMovieAnalysis(movie);
          
          // 3. Merge AI-generated content with optimized movie
          const enhancedMovie = {
            ...optimizedMovie,
            ai_review: aiAnalysis.ai_review,
            mood_tags: aiAnalysis.mood_tags,
            watch_suggestion: aiAnalysis.watch_suggestion
          };
          
          enhancedMovies.push(enhancedMovie);
        } catch (error) {
          console.error(`Error with AI processing for ${movie.title}:`, error.message);
          // Even if AI fails, add the optimized movie
          enhancedMovies.push(optimizedMovie);
        }
      } else {
        // If no API key, just use the optimized structure
        enhancedMovies.push(optimizedMovie);
      }
      
      // 每处理完一批电影，保存进度
      if ((i + 1) % BATCH_SIZE === 0 || i === top250Movies.length - 1) {
        // 保存临时结果
        const tempData = {
          count: enhancedMovies.length,
          last_processed: i,
          movies: enhancedMovies
        };
        
        fs.writeFileSync(tempFilePath, JSON.stringify(tempData, null, 2), 'utf8');
        console.log(`Progress saved: ${enhancedMovies.length}/${top250Movies.length} movies processed`);
        
        // 批次之间的延迟，避免API限制
        if (i < top250Movies.length - 1) {
          const batchDelay = 10000; // 10秒
          console.log(`Waiting ${batchDelay/1000} seconds before processing next batch...`);
          await delay(batchDelay);
        }
      }
    } catch (error) {
      console.error(`Error processing movie ${movie.title}:`, error);
      // 保存当前进度，以便之后可以恢复
      const tempData = {
        count: enhancedMovies.length,
        last_processed: i - 1,
        error: error.message,
        movies: enhancedMovies
      };
      
      fs.writeFileSync(tempFilePath, JSON.stringify(tempData, null, 2), 'utf8');
      console.error('Progress saved before error. You can restart the script to continue processing.');
    }
  }

  // Create the final data object
  const enhancedData = {
    count: enhancedMovies.length,
    avg_rating: enhancedMovies.reduce((sum, movie) => {
      return sum + movie.score_percent;
    }, 0) / enhancedMovies.length,
    oldest_movie: enhancedMovies.reduce((oldest, movie) => {
      if (!oldest || (movie.release_date && movie.release_date < oldest.release_date)) {
        return movie;
      }
      return oldest;
    }, null)?.title,
    newest_movie: enhancedMovies.reduce((newest, movie) => {
      if (!newest || (movie.release_date && movie.release_date > newest.release_date)) {
        return movie;
      }
      return newest;
    }, null)?.title,
    total_runtime: enhancedMovies.reduce((total, movie) => total + (movie.runtime || 0), 0),
    movies: enhancedMovies
  };

  // Write results to file
  console.log('Saving optimized Top 250 movie data...');
  fs.writeFileSync(targetPath, JSON.stringify(enhancedData, null, 2), 'utf8');
  
  // 处理完成后删除临时文件
  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
    console.log('Removed temporary progress file.');
  }

  console.log(`Successfully saved optimized Top 250 movies to: ${targetPath}`);
  console.log(`Average rating: ${enhancedData.avg_rating.toFixed(2)}%`);
  console.log(`Oldest movie: ${enhancedData.oldest_movie}`);
  console.log(`Newest movie: ${enhancedData.newest_movie}`);
  
  // Calculate file size reduction
  const originalSize = Buffer.byteLength(JSON.stringify(top250Movies));
  const optimizedSize = Buffer.byteLength(JSON.stringify(enhancedMovies));
  const reductionPercent = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
  
  console.log(`\nData optimization results:`);
  console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Optimized size: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Size reduction: ${reductionPercent}%`);
  
  // AI enhancement stats
  if (API_KEY) {
    const moviesWithReviews = enhancedMovies.filter(movie => movie.ai_review).length;
    console.log(`\nAI enhancement stats:`);
    console.log(`Movies with AI reviews: ${moviesWithReviews}/${enhancedMovies.length} (${(moviesWithReviews/enhancedMovies.length*100).toFixed(2)}%)`);
  }
}

// Execute main function
if (!API_KEY) {
  console.warn('⚠️ No Gemini API key found! Will proceed with data optimization only (no AI-generated content).');
  console.log('To enable AI features, please add GOOGLE_GENERATIVE_AI_API_KEY to your .env.local file.');
  console.log('This script is configured to use the free Google model: gemini-1.5-flash-latest');
}

main().catch(error => {
  console.error('Error during execution:', error);
}); 