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

// 添加重试逻辑，处理配额限制问题 - 使用模拟退火算法无限重试
async function retryOperation(operation, initialDelay = 5000, maxDelay = 120000) {
  let delay = initialDelay;
  let attempts = 0;
  
  while (true) {
    try {
      attempts++;
      return await operation();
    } catch (error) {
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('rate limit')) {
        // 计算等待时间 - 模拟退火算法
        // 基础等待时间随尝试次数增加，但增加了随机因素，避免同时重试
        const randomFactor = 0.5 + Math.random(); // 0.5-1.5之间的随机数
        delay = Math.min(delay * 1.5 * randomFactor, maxDelay);
        
        // 添加更详细的日志
        console.log(`🔄 API速率限制 (尝试 #${attempts})`);
        console.log(`   错误信息: ${error.message}`);
        console.log(`   等待时间: ${Math.round(delay/1000)}秒后重试...`);
        
        // 等待计算出的延迟时间
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`   恢复处理...`);
      } else {
        // 如果不是配额限制错误，记录错误，然后继续重试
        console.error(`⚠️ 非速率限制错误 (尝试 #${attempts}): ${error.message}`);
        console.log(`   5秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
}

/**
 * Generate movie analysis using Gemini
 */
async function generateMovieAnalysis(movie) {
  try {
    // 使用Google免费版的模型 - gemini-1.5-flash-latest
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Create comprehensive movie info in English
    const movieInfo = `
Title: ${movie.title}
Original Title: ${movie.original_title || movie.title}
Release Year: ${movie.release_date ? movie.release_date.split('-')[0] : 'Unknown'}
Director(s): ${movie.directors ? movie.directors.map(d => d.name).join(', ') : 'Unknown'}

Genres: ${movie.genres ? movie.genres.map(g => g.name).join(', ') : 'Unknown'}
Keywords: ${movie.keywords ? movie.keywords.map(k => k.name).join(', ') : 'N/A'}

Rating: ${movie.vote_average}/10 (based on ${movie.vote_count} votes)
Score Percent: ${movie.score_percent || 'N/A'}%

Cast: ${movie.cast ? movie.cast.slice(0, 8).map(a => `${a.name} as ${a.character}`).join('; ') : 'Unknown'}

Era: ${movie.era || (movie.release_date ? movie.release_date.split('-')[0].slice(0, 3) + '0s' : 'Unknown')}
Runtime: ${movie.runtime ? `${movie.runtime} minutes` : 'Unknown'}

Overview:
${movie.overview}
    `;

    console.log(`🎬 Generating review for "${movie.title}"...`);
    
    // 使用重试逻辑生成评论
    const review = await retryOperation(async () => {
      const reviewPrompt = `As a professional film critic, write a concise yet insightful review (around 100 words) for the following movie. Focus on its artistic merit, cultural impact, and standout elements. Include your perspective on the directing, performances, and overall significance of the film:

${movieInfo}`;
      const reviewResult = await model.generateContent(reviewPrompt);
      return reviewResult.response.text().trim();
    });

    console.log(`🏷️ Generating mood tags for "${movie.title}"...`);
    
    // 等待一段时间后再发送下一个请求
    await delay(3000);

    // 使用重试逻辑生成情绪标签
    const moodTags = await retryOperation(async () => {
      const moodPrompt = `Based on the following detailed movie information, list exactly 5 emotional/atmospheric tags that best describe this film's mood and feeling, separated by commas only. Choose words that capture the emotional experience, atmosphere, and tone of watching this movie:

${movieInfo}

Example tags might include: heartwarming, thrilling, suspenseful, melancholic, uplifting, tense, nostalgic, romantic, inspirational, disturbing, thought-provoking, etc.

Your response should be ONLY the 5 tags, nothing else, separated by commas.`;
      const moodResult = await model.generateContent(moodPrompt);
      return moodResult.response.text().trim().split(/[,،]/).map(tag => tag.trim()).filter(Boolean);
    });

    console.log(`💡 Generating viewing suggestion for "${movie.title}"...`);
    
    // 等待一段时间后再发送下一个请求
    await delay(3000);

    // 使用重试逻辑生成观影建议
    const watchSuggestion = await retryOperation(async () => {
      const suggestionPrompt = `Create a single compelling sentence recommendation for when and with whom this movie should be watched, based on its mood, content, and themes. Consider the ideal viewing context (alone, with friends, family movie night, date night, etc.) and occasion:

${movieInfo}

Keep your response to one clear, insightful sentence that captures the ideal viewing experience.`;
      const suggestionResult = await model.generateContent(suggestionPrompt);
      return suggestionResult.response.text().trim();
    });

    console.log(`✅ AI content successfully generated for "${movie.title}"`);

    return {
      ai_review: review,
      mood_tags: moodTags,
      watch_suggestion: watchSuggestion
    };
  } catch (error) {
    console.error(`❌ Error generating analysis for ${movie.title}:`, error.message);
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
  // 提取首选海报URL
  const posterUrl = movie.poster_url || (
    movie.poster_path ? 
    `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 
    null
  );
  
  // 提取首选背景URL
  const backdropUrl = movie.backdrop_url || (
    movie.backdrop_path ? 
    `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : 
    null
  );
  
  // 提取首选预告片URL（优先选择YouTube）
  const trailerUrl = movie.trailer_url || null;
  
  // 提取或计算上映年份
  const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : null;
  
  // 计算分数百分比（如果需要）
  const scorePercent = movie.score_percent || (movie.vote_average ? Math.round(movie.vote_average * 10) : 0);
  
  // 提取或生成电影时代
  let era = movie.era;
  if (!era && releaseYear) {
    const year = parseInt(releaseYear);
    if (year < 1950) {
      era = 'classic';
    } else if (year < 1980) {
      era = 'vintage';
    } else if (year < 2000) {
      era = 'modern';
    } else {
      era = 'contemporary';
    }
  }
  
  // Extract only necessary fields
  return {
    id: movie.id,
    title: movie.title,
    original_title: movie.original_title || movie.title,
    overview: movie.overview,
    release_date: movie.release_date,
    release_year: releaseYear,
    
    // 使用处理后的URLs
    poster_url: posterUrl,
    backdrop_url: backdropUrl,
    trailer_url: trailerUrl,
    
    // Keep essential metadata
    genres: movie.genres || [],
    vote_average: movie.vote_average || 0,
    vote_count: movie.vote_count || 0,
    score_percent: scorePercent,
    
    // Simplified cast - keep only essential info
    cast: Array.isArray(movie.cast) ? movie.cast.slice(0, 5).map(actor => ({
      id: actor.id,
      name: actor.name,
      character: actor.character || 'Unknown',
    })) : [],
    
    // Simplified directors - keep only essential info
    directors: Array.isArray(movie.directors) ? movie.directors.map(director => ({
      id: director.id,
      name: director.name,
    })) : [],
    
    // Keywords for search and recommendation
    keywords: Array.isArray(movie.keywords) ? movie.keywords.slice(0, 10) : [],
    
    // Add processed era
    era: era || 'unknown',
    
    // Add runtime if available
    runtime: movie.runtime || null,
  };
}

async function main() {
  try {
    console.log('📚 读取电影数据...');
    const rawData = fs.readFileSync(sourcePath, 'utf8');
    let movieData;
    
    try {
      movieData = JSON.parse(rawData);
    } catch (error) {
      console.error('❌ 无法解析JSON数据:', error.message);
      process.exit(1);
    }

    // Ensure data format is valid
    if (!movieData.movies || !Array.isArray(movieData.movies)) {
      console.error('❌ 无效的电影数据格式:', typeof movieData, 'movies字段:', movieData.movies ? typeof movieData.movies : '不存在');
      process.exit(1);
    }

    console.log(`📊 原始数据包含 ${movieData.movies.length} 部电影`);

    // Sort movies by rating
    console.log('🔢 按评分排序电影...');
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
    console.log(`🏆 已选择 ${top250Movies.length} 部评分最高的电影`);

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
          console.log(`🔄 发现进度数据: 已处理 ${startIndex} 部电影，从第 ${startIndex + 1} 部继续...`);
        }
      } catch (error) {
        console.error('⚠️ 读取进度数据错误:', error.message);
        console.log('🔄 从头开始处理...');
      }
    }

    // 定义小批次处理大小
    const BATCH_SIZE = 5; // 减小批次大小，避免过多API调用

    // Enhance movies with AI and optimize structure
    console.log('🎬 开始AI增强和结构优化...');
    console.log('〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️');
    
    // 添加进度条显示
    const startTime = Date.now();
    let totalProcessed = enhancedMovies.length;
    
    // 按批次处理电影
    for (let i = startIndex; i < top250Movies.length; i++) {
      const movie = top250Movies[i];
      
      // 显示带百分比的进度
      const progressPercent = Math.round((i / top250Movies.length) * 100);
      const progressBar = '█'.repeat(Math.floor(progressPercent / 5)) + '░'.repeat(20 - Math.floor(progressPercent / 5));
      const elapsedTime = (Date.now() - startTime) / 1000;
      const moviesPerSecond = totalProcessed > 0 ? (totalProcessed / elapsedTime).toFixed(4) : 0;
      
      console.log(`\n[${progressBar}] ${progressPercent}% | 处理 #${i+1}/${top250Movies.length}: "${movie.title}"`);
      console.log(`⏱️  已用时间: ${Math.floor(elapsedTime / 60)}分${Math.floor(elapsedTime % 60)}秒 | 处理速度: ${moviesPerSecond} 部/秒`);
      
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
            totalProcessed++;
          } catch (error) {
            console.error(`❌ AI处理"${movie.title}"时出错:`, error.message);
            // Even if AI fails, add the optimized movie
            enhancedMovies.push(optimizedMovie);
            totalProcessed++;
          }
        } else {
          // If no API key, just use the optimized structure
          enhancedMovies.push(optimizedMovie);
          totalProcessed++;
        }
        
        // 每处理完一批电影，保存进度
        if ((i + 1) % BATCH_SIZE === 0 || i === top250Movies.length - 1) {
          // 保存临时结果
          const tempData = {
            count: enhancedMovies.length,
            last_processed: i,
            processed_at: new Date().toISOString(),
            elapsed_seconds: Math.floor((Date.now() - startTime) / 1000),
            movies: enhancedMovies
          };
          
          console.log(`💾 保存进度...`);
          fs.writeFileSync(tempFilePath, JSON.stringify(tempData, null, 2), 'utf8');
          console.log(`✅ 进度已保存: ${enhancedMovies.length}/${top250Movies.length} 部电影已处理`);
          
          // 批次之间的延迟，避免API限制
          if (i < top250Movies.length - 1) {
            const batchDelay = 15000; // 增加到15秒
            console.log(`⏳ 等待 ${batchDelay/1000} 秒后处理下一批...`);
            await delay(batchDelay);
          }
        }
      } catch (error) {
        console.error(`❌ 处理"${movie.title}"时出错:`, error);
        // 保存当前进度，以便之后可以恢复
        const tempData = {
          count: enhancedMovies.length,
          last_processed: i - 1,
          error: error.message,
          processed_at: new Date().toISOString(),
          elapsed_seconds: Math.floor((Date.now() - startTime) / 1000),
          movies: enhancedMovies
        };
        
        console.log(`💾 出错前保存进度...`);
        fs.writeFileSync(tempFilePath, JSON.stringify(tempData, null, 2), 'utf8');
        console.error('⚠️ 进度已保存。可以重新运行脚本继续处理。');
      }
    }

    console.log('〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️');
    console.log(`🎉 所有电影处理完成!`);

    // Create the final data object
    const enhancedData = {
      count: enhancedMovies.length,
      generated_at: new Date().toISOString(),
      processing_time_seconds: Math.floor((Date.now() - startTime) / 1000),
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
    console.log('💾 保存优化后的Top 250电影数据...');
    fs.writeFileSync(targetPath, JSON.stringify(enhancedData, null, 2), 'utf8');
    
    // 处理完成后删除临时文件
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log('🗑️ 已移除临时进度文件。');
    }

    console.log(`✅ 成功保存优化后的Top 250电影数据到: ${targetPath}`);
    console.log(`📊 数据统计:`);
    console.log(`   平均评分: ${enhancedData.avg_rating.toFixed(2)}%`);
    console.log(`   最早电影: ${enhancedData.oldest_movie}`);
    console.log(`   最新电影: ${enhancedData.newest_movie}`);
    console.log(`   处理时间: ${Math.floor(enhancedData.processing_time_seconds / 60)}分${enhancedData.processing_time_seconds % 60}秒`);
    
    // Calculate file size reduction
    const originalSize = Buffer.byteLength(JSON.stringify(top250Movies));
    const optimizedSize = Buffer.byteLength(JSON.stringify(enhancedMovies));
    const reductionPercent = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
    
    console.log(`\n📦 数据优化结果:`);
    console.log(`   原始大小: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   优化大小: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   大小减少: ${reductionPercent}%`);
    
    // AI enhancement stats
    if (API_KEY) {
      const moviesWithReviews = enhancedMovies.filter(movie => movie.ai_review).length;
      console.log(`\n🤖 AI增强统计:`);
      console.log(`   带有AI评论的电影: ${moviesWithReviews}/${enhancedMovies.length} (${(moviesWithReviews/enhancedMovies.length*100).toFixed(2)}%)`);
    }
  } catch (error) {
    console.error('❌ 执行过程中遇到致命错误:', error);
    process.exit(1);
  }
}

// Execute main function
if (!API_KEY) {
  console.warn('⚠️ 未找到Gemini API密钥! 将只进行数据优化（不生成AI内容）。');
  console.log('要启用AI功能，请在.env.local文件中添加GOOGLE_GENERATIVE_AI_API_KEY。');
  console.log('此脚本配置为使用Google免费模型: gemini-1.5-flash-latest');
} else {
  console.log('🔑 已检测到API密钥，将使用Google Gemini模型生成AI内容');
}

main().catch(error => {
  console.error('❌ 执行过程中遇到错误:', error);
}); 