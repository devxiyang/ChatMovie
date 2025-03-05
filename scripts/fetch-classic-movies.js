#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// 引入node-fetch（如果在Node环境中运行需要它）
let fetch;
try {
  // 尝试使用全局fetch（Node.js v18+）
  fetch = global.fetch;
} catch (e) {
  try {
    // 否则尝试使用node-fetch（需要安装：npm install node-fetch）
    // 注意：如果你使用的Node.js版本低于18，请先安装node-fetch
    console.log('使用node-fetch作为后备...');
    fetch = require('node-fetch');
  } catch (e) {
    console.error('无法找到fetch API. 请使用Node.js v18+或安装node-fetch');
    process.exit(1);
  }
}

// 获取API密钥，优先从环境变量获取，也可以直接写入
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// 基本电影类型定义（与项目中保持一致）
/**
 * @typedef {Object} Movie
 * @property {number} id - 电影ID
 * @property {string} title - 电影标题
 * @property {string} overview - 电影简介
 * @property {string} poster_path - 海报路径
 * @property {string} release_date - 发行日期
 * @property {number} vote_average - 平均评分
 * @property {number} vote_count - 投票数
 * @property {Array<number>} genre_ids - 类型ID数组
 * @property {Array<{id: number, name: string}>} [genres] - 类型详情
 * @property {number} [runtime] - 片长（分钟）
 * @property {Object} [videos] - 视频信息
 */

// 检查API密钥是否有效
const validateApiKey = () => {
  if (!TMDB_API_KEY) {
    console.error('错误: TMDb API密钥未设置。请在.env.local文件中添加NEXT_PUBLIC_TMDB_API_KEY=您的密钥');
    process.exit(1);
  }
  return true;
};

// 带重试功能的通用API请求函数
const fetchWithRetry = async (url, options = {}, retries = 2) => {
  try {
    validateApiKey();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('TMDb API密钥无效或已过期');
      } else if (response.status === 429) {
        // 达到速率限制，等待后重试
        if (retries > 0) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '2', 10);
          console.log(`达到API速率限制，将在${retryAfter}秒后重试...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          return fetchWithRetry(url, options, retries - 1);
        }
      }
      throw new Error(`API请求失败: ${response.status} - ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('API请求超时');
    }
    if (retries > 0) {
      console.log(`API请求失败，将重试: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, (3 - retries) * 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

// 获取电影详情
const getMovieDetails = async (movieId) => {
  try {
    console.log(`获取电影ID ${movieId} 的详情...`);
    
    // 扩展append_to_response参数，获取更多详细信息
    const data = await fetchWithRetry(
      `${TMDB_BASE_URL}/movie/${movieId}?append_to_response=videos,keywords,credits,images,reviews,similar,recommendations,release_dates,watch/providers&language=en-US`,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json'
        }
      }
    );
    
    return data;
  } catch (error) {
    console.error(`获取电影ID ${movieId} 的详情失败:`, error);
    return null;
  }
};

// 发现经典高分电影
const discoverClassicMovies = async (options = {}) => {
  try {
    const defaultOptions = {
      language: 'en-US',
      sort_by: 'vote_average.desc',
      'vote_average.gte': 7.5, // 降低默认评分阈值以获取更多电影
      'vote_count.gte': 500, // 降低投票数要求以覆盖早期电影
      include_adult: false,
      include_video: true, // 确保包含视频信息
      page: 1
    };
    
    // 添加发行日期条件（如果提供）
    if (options['primary_release_date.gte']) {
      defaultOptions['primary_release_date.gte'] = options['primary_release_date.gte'];
    }
    
    if (options['primary_release_date.lte']) {
      defaultOptions['primary_release_date.lte'] = options['primary_release_date.lte'];
    }
    
    const queryParams = new URLSearchParams({
      ...defaultOptions,
      ...options
    });
    
    const url = `${TMDB_BASE_URL}/discover/movie?${queryParams.toString()}`;
    console.log(`发现经典电影: ${url}`);
    
    const data = await fetchWithRetry(
      url,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json'
        }
      }
    );
    
    return data.results || [];
  } catch (error) {
    console.error('发现经典电影失败:', error);
    return [];
  }
};

// 获取特定类别的热门电影
const getTopMoviesByCategory = async (category, page = 1) => {
  try {
    let url;
    
    switch(category) {
      case 'top_rated':
        url = `${TMDB_BASE_URL}/movie/top_rated?language=en-US&page=${page}`;
        break;
      case 'popular':
        url = `${TMDB_BASE_URL}/movie/popular?language=en-US&page=${page}`;
        break;
      default:
        url = `${TMDB_BASE_URL}/movie/top_rated?language=en-US&page=${page}`;
    }
    
    const data = await fetchWithRetry(
      url,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json'
        }
      }
    );
    
    return data.results || [];
  } catch (error) {
    console.error(`获取${category}电影失败:`, error);
    return [];
  }
};

// 获取电影类型映射
const fetchGenres = async () => {
  try {
    const data = await fetchWithRetry(
      `${TMDB_BASE_URL}/genre/movie/list?language=en-US`,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json'
        }
      }
    );
    
    const genreMap = {};
    data.genres.forEach(genre => {
      genreMap[genre.id] = genre.name;
    });
    
    return genreMap;
  } catch (error) {
    console.error('获取电影类型失败:', error);
    return {};
  }
};

// 获取IMDb Top 250电影列表
const getImdbTop250 = async () => {
  try {
    console.log('尝试获取完整的IMDb Top 250电影列表...');
    
    // IMDb Top 250电影ID列表（完整版）
    const imdbTop250Ids = [
      'tt0111161', 'tt0068646', 'tt0071562', 'tt0468569', 'tt0050083', 'tt0108052', 'tt0167260', 'tt0110912', 
      'tt0060196', 'tt0120737', 'tt0137523', 'tt0109830', 'tt1375666', 'tt0167261', 'tt0080684', 'tt0133093', 
      'tt0099685', 'tt0073486', 'tt0047478', 'tt0114369', 'tt0317248', 'tt0076759', 'tt0102926', 'tt0038650', 
      'tt0118799', 'tt0120815', 'tt0245429', 'tt0120689', 'tt0816692', 'tt0110413', 'tt0114814', 'tt0056058', 
      'tt0110357', 'tt0120586', 'tt0088763', 'tt0103064', 'tt0054215', 'tt0027977', 'tt0021749', 'tt0253474', 
      'tt0172495', 'tt0407887', 'tt0078788', 'tt0209144', 'tt0482571', 'tt0095765', 'tt0032553', 'tt0095327', 
      'tt0043014', 'tt0057012', 'tt0078748', 'tt1853728', 'tt0405094', 'tt0361748', 'tt0180093', 'tt0993846', 
      'tt0095016', 'tt0090605', 'tt4154756', 'tt0082971', 'tt0180699', 'tt0086190', 'tt0051201', 'tt1345836', 
      'tt0364569', 'tt1675434', 'tt0034583', 'tt7286456', 'tt0027592', 'tt0086250', 'tt0120689', 'tt0119698', 
      'tt6751668', 'tt0062622', 'tt1130884', 'tt0052357', 'tt0477348', 'tt0091251', 'tt0066921', 'tt0105236', 
      'tt0091763', 'tt0075148', 'tt0017136', 'tt0119217', 'tt0036775', 'tt0066763', 'tt0033467', 'tt0056172', 
      'tt0208092', 'tt0036868', 'tt0113277', 'tt0056592', 'tt0071853', 'tt0097576', 'tt0435761', 'tt0338013', 
      'tt0040522', 'tt3011894', 'tt0266697', 'tt0211915', 'tt0060827', 'tt0059578', 'tt0044079', 'tt0053125', 
      'tt0093058', 'tt0086879', 'tt0116231', 'tt0052311', 'tt0012349', 'tt0053604', 'tt0022100', 'tt5311514', 
      'tt0114709', 'tt0986264', 'tt0110413', 'tt0325980', 'tt2096673', 'tt0087843', 'tt0114369', 'tt0169547', 
      'tt0112471', 'tt0057115', 'tt0047296', 'tt0050825', 'tt1745960', 'tt0084787', 'tt2106476', 'tt0080678', 
      'tt0093779', 'tt0098635', 'tt4633694', 'tt0112573', 'tt0268978', 'tt0079470', 'tt0082096', 'tt0096283', 
      'tt0120735', 'tt0395169', 'tt0117951', 'tt0374887', 'tt0055630', 'tt0469494', 'tt0080455', 'tt0107207', 
      'tt1877830', 'tt0381681', 'tt0253474', 'tt0407887', 'tt0372784', 'tt0088247', 'tt0118715', 'tt0054331', 
      'tt4154796', 'tt0057565', 'tt0118694', 'tt0073195', 'tt0113247', 'tt0198781', 'tt0120382', 'tt0072890', 
      'tt0107290', 'tt0114746', 'tt1187043', 'tt0083922', 'tt2278388', 'tt0050986', 'tt0087544', 'tt0079944', 
      'tt0434409', 'tt0086879', 'tt0046438', 'tt0015864', 'tt1392214', 'tt0112641', 'tt0075686', 'tt0074958', 
      'tt0052618', 'tt0089881', 'tt1832382', 'tt0017925', 'tt0046268', 'tt0476735', 'tt0401792', 'tt0167404', 
      'tt0061512', 'tt0031679', 'tt1049413', 'tt0347149', 'tt0058946', 'tt0266543', 'tt0084805', 'tt0050976', 
      'tt0084503', 'tt0044706', 'tt2267998', 'tt0031381', 'tt1954470', 'tt0119488', 'tt0095016', 'tt2119532', 
      'tt0268380', 'tt0361748', 'tt3170832', 'tt0083658', 'tt1211837', 'tt0040897', 'tt2024544', 'tt0338564', 
      'tt1431045', 'tt0041959', 'tt0361748', 'tt1305806', 'tt0107048', 'tt0467406', 'tt0096251', 'tt1205489', 
      'tt0110357', 'tt0015324', 'tt0050212', 'tt0032187', 'tt0077711', 'tt3315342', 'tt0025316', 'tt1255953', 
      'tt0116282', 'tt8579674', 'tt0048424', 'tt0050613', 'tt0978762', 'tt1025100', 'tt0367110', 'tt0032551', 
      'tt0401383', 'tt2758880', 'tt3783958', 'tt0116231', 'tt0071411', 'tt0043265', 'tt0266697', 'tt0440963', 
      'tt0266543', 'tt0065214', 'tt0117666', 'tt0046911', 'tt0111495', 'tt0053198', 'tt0097123', 'tt0042041'
    ];
    
    // 使用完整列表，不再限制数量
    const selectedIds = imdbTop250Ids;
    
    const imdbMovies = [];
    
    for (let i = 0; i < selectedIds.length; i++) {
      const imdbId = selectedIds[i];
      
      console.log(`获取IMDb Top 250电影 ${i+1}/${selectedIds.length}: ${imdbId}`);
      
      try {
        // 通过TMDB的外部ID搜索功能查找对应的TMDB电影
        const searchUrl = `${TMDB_BASE_URL}/find/${imdbId}?external_source=imdb_id`;
        
        const searchData = await fetchWithRetry(
          searchUrl,
          {
            headers: {
              'Authorization': `Bearer ${TMDB_API_KEY}`,
              'accept': 'application/json'
            }
          }
        );
        
        if (searchData && searchData.movie_results && searchData.movie_results.length > 0) {
          const movie = searchData.movie_results[0];
          
          // 添加IMDb排名信息
          movie.imdb_rank = i + 1;
          movie.imdb_id = imdbId;
          movie.era = 'IMDb Top 250';
          
          imdbMovies.push(movie);
        } else {
          console.log(`未找到IMDb ID为 ${imdbId} 的电影`);
        }
      } catch (err) {
        console.error(`获取IMDb ID ${imdbId} 的电影失败:`, err);
      }
      
      // 避免API速率限制
      if (i < selectedIds.length - 1) {
        console.log('等待500ms以避免API速率限制...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`成功获取 ${imdbMovies.length} 部IMDb Top 250电影`);
    return imdbMovies;
    
  } catch (error) {
    console.error('获取IMDb Top 250失败:', error);
    return [];
  }
};

// 按特定类型获取高评分电影
const getMoviesByGenre = async (genreId, options = {}) => {
  try {
    const defaultOptions = {
      language: 'en-US',
      sort_by: 'vote_average.desc',
      'vote_average.gte': 7.0,
      'vote_count.gte': 300,
      with_genres: genreId,
      include_adult: false,
      page: 1
    };
    
    const queryParams = new URLSearchParams({
      ...defaultOptions,
      ...options
    });
    
    const url = `${TMDB_BASE_URL}/discover/movie?${queryParams.toString()}`;
    console.log(`获取类型ID ${genreId} 的高评分电影: ${url}`);
    
    const data = await fetchWithRetry(
      url,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json'
        }
      }
    );
    
    return data.results || [];
  } catch (error) {
    console.error(`获取类型 ${genreId} 的电影失败:`, error);
    return [];
  }
};

// 按时代收集经典电影
const collectMoviesByEra = async (options = {}) => {
  // 扩展时代范围，增加早期默片时代和全部时间段
  const eras = [
    { name: 'Silent Era', dateRange: { gte: '1920-01-01', lte: '1929-12-31' } },
    { name: 'Pre-Golden Age', dateRange: { gte: '1930-01-01', lte: '1939-12-31' } },
    { name: 'Classic Golden Age', dateRange: { gte: '1940-01-01', lte: '1959-12-31' } },
    { name: 'New Hollywood', dateRange: { gte: '1960-01-01', lte: '1979-12-31' } },
    { name: 'Modern Classics', dateRange: { gte: '1980-01-01', lte: '2000-12-31' } },
    { name: 'Recent Classics', dateRange: { gte: '2001-01-01', lte: '2015-12-31' } },
    { name: 'Contemporary Masterpieces', dateRange: { gte: '2016-01-01', lte: '2023-12-31' } }
  ];
  
  // 从命令行选项解析要获取的最大年份
  const maxYear = options.maxYear || 2023;
  
  const genreMap = await fetchGenres();
  let allMovies = [];
  
  // 1. 首先获取分时代的电影
  for (const era of eras) {
    // 如果该时代的结束日期晚于设置的最大年份，则跳过
    if (parseInt(era.dateRange.lte.split('-')[0]) > maxYear) {
      console.log(`跳过 ${era.name} 时期，因为它超出了设置的最大年份 ${maxYear}`);
      continue;
    }
    
    console.log(`\n正在获取 ${era.name} 时期的经典电影...`);
    
    // 对每个时代增加页数，最多获取10页
    const maxPages = 8;
    for (let page = 1; page <= maxPages; page++) {
      const options = {
        'primary_release_date.gte': era.dateRange.gte,
        'primary_release_date.lte': era.dateRange.lte,
        page
      };
      
      const movies = await discoverClassicMovies(options);
      
      if (movies.length === 0) {
        console.log(`${era.name} 时期第${page}页没有找到电影，停止分页`);
        break;
      }
      
      console.log(`获取到第${page}页 ${movies.length} 部 ${era.name} 时期电影`);
      
      // 添加时代标签到电影对象
      const moviesWithEra = movies.map(movie => ({
        ...movie,
        era: era.name
      }));
      
      allMovies = [...allMovies, ...moviesWithEra];
      
      // 如果返回结果数量少于20（通常每页20个结果），说明已经获取完所有结果
      if (movies.length < 20) {
        console.log(`${era.name} 时期搜索完成，最后一页只有${movies.length}部电影`);
        break;
      }
      
      // 避免API速率限制
      if (page < maxPages) {
        console.log('等待1秒以避免API速率限制...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  // 2. 获取评分最高的电影（不限时代）
  console.log('\n获取TMDB评分最高的电影（不限时代）...');
  // 获取更多页面（前10页）的高评分电影
  for (let page = 1; page <= 10; page++) {
    const topRatedMovies = await getTopMoviesByCategory('top_rated', page);
    
    if (topRatedMovies.length === 0) {
      console.log(`没有更多评分最高的电影，停止在第${page}页`);
      break;
    }
    
    console.log(`获取到第${page}页 ${topRatedMovies.length} 部评分最高的电影`);
    
    // 标记为"All Time Greats"
    const moviesWithEra = topRatedMovies.map(movie => ({
      ...movie,
      era: 'All Time Greats'
    }));
    
    allMovies = [...allMovies, ...moviesWithEra];
    
    // 避免API速率限制
    if (page < 10) {
      console.log('等待1秒以避免API速率限制...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // 3. 获取IMDb Top 250电影
  if (!options.skipImdb) {
    console.log('\n尝试获取IMDb Top 250电影...');
    const imdbMovies = await getImdbTop250();
    allMovies = [...allMovies, ...imdbMovies];
    console.log(`添加了 ${imdbMovies.length} 部IMDb Top 250电影`);
  }
  
  // 4. 按指定类型获取电影（如果在选项中提供）
  if (options.includeGenres) {
    console.log(`\n按指定类型获取电影: ${options.includeGenres}`);
    const genreIds = options.includeGenres.split(',');
    
    for (const genreId of genreIds) {
      if (!genreId.trim()) continue;
      
      console.log(`获取类型ID为 ${genreId} 的高评分电影...`);
      
      // 对每个类型获取多页
      for (let page = 1; page <= 3; page++) {
        const genreMovies = await getMoviesByGenre(genreId.trim(), { page });
        
        if (genreMovies.length === 0) {
          console.log(`类型ID ${genreId} 没有更多电影，停止分页`);
          break;
        }
        
        console.log(`获取到第${page}页 ${genreMovies.length} 部类型ID ${genreId} 的电影`);
        
        // 使用类型名称作为时代标记
        const genreName = genreMap[parseInt(genreId)] || `Genre ${genreId}`;
        const moviesWithGenre = genreMovies.map(movie => ({
          ...movie,
          era: `Top ${genreName} Movies`
        }));
        
        allMovies = [...allMovies, ...moviesWithGenre];
        
        // 避免API速率限制
        if (page < 3) {
          console.log('等待1秒以避免API速率限制...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }
  
  console.log(`\n总共获取到 ${allMovies.length} 部经典高分电影`);
  
  // 去重
  const uniqueMovies = Array.from(
    new Map(allMovies.map(movie => [movie.id, movie])).values()
  );
  
  console.log(`去重后剩余 ${uniqueMovies.length} 部经典高分电影`);
  
  // 丰富电影详情，增加数量至最多200部
  console.log('\n正在获取电影详情...');
  const MAX_DETAILS = options.limit || 200; // 增加详情获取的电影数量
  
  // 先按评分排序
  const sortedMovies = uniqueMovies.sort((a, b) => {
    // 首先按评分降序排序
    if (b.vote_average !== a.vote_average) {
      return b.vote_average - a.vote_average;
    }
    // 如果评分相同，按投票数降序排序
    return b.vote_count - a.vote_count;
  });
  
  const selectedMovies = sortedMovies.slice(0, MAX_DETAILS);
  console.log(`选取排名前 ${selectedMovies.length} 部电影获取详情`);
  
  const enrichedMovies = [];
  
  for (let i = 0; i < selectedMovies.length; i++) {
    const movie = selectedMovies[i];
    
    console.log(`处理电影 ${i+1}/${selectedMovies.length}: ${movie.title} (评分: ${movie.vote_average})`);
    
    try {
      // 获取电影详情
      const details = await getMovieDetails(movie.id);
      
      if (!details) {
        console.log(`跳过电影 ${movie.title}，无法获取详情`);
        continue;
      }
      
      // 转换类型ID为类型名称
      let genres = [];
      if (details.genres) {
        genres = details.genres;
      } else if (movie.genre_ids) {
        genres = movie.genre_ids.map(id => ({
          id,
          name: genreMap[id] || 'Unknown'
        }));
      }
      
      // 获取演员信息
      let cast = [];
      if (details.credits && details.credits.cast) {
        cast = details.credits.cast.slice(0, 10).map(actor => ({
          id: actor.id,
          name: actor.name,
          character: actor.character,
          profile_path: actor.profile_path
        }));
      }
      
      // 获取导演信息
      let directors = [];
      if (details.credits && details.credits.crew) {
        directors = details.credits.crew
          .filter(crew => crew.job === 'Director')
          .map(director => ({
            id: director.id,
            name: director.name
          }));
      }
      
      // 获取制片人信息
      let producers = [];
      if (details.credits && details.credits.crew) {
        producers = details.credits.crew
          .filter(crew => crew.job === 'Producer')
          .slice(0, 5)
          .map(producer => ({
            id: producer.id,
            name: producer.name
          }));
      }
      
      // 处理视频信息，分类整理
      let videos = {
        trailers: [],
        teasers: [],
        clips: [],
        behindTheScenes: [],
        featurettes: [],
        others: []
      };
      
      if (details.videos && details.videos.results) {
        details.videos.results.forEach(video => {
          if (video.site === 'YouTube') {
            // 根据视频类型分类
            switch(video.type) {
              case 'Trailer':
                videos.trailers.push(video);
                break;
              case 'Teaser':
                videos.teasers.push(video);
                break;
              case 'Clip':
                videos.clips.push(video);
                break;
              case 'Behind the Scenes':
                videos.behindTheScenes.push(video);
                break;
              case 'Featurette':
                videos.featurettes.push(video);
                break;
              default:
                videos.others.push(video);
            }
          }
        });
      }
      
      // 获取评级信息（适合年龄的观众等）
      let certifications = [];
      if (details.release_dates && details.release_dates.results) {
        details.release_dates.results.forEach(country => {
          if (country.release_dates && country.release_dates.length > 0) {
            country.release_dates.forEach(release => {
              if (release.certification) {
                certifications.push({
                  country: country.iso_3166_1,
                  certification: release.certification,
                  release_date: release.release_date
                });
              }
            });
          }
        });
      }
      
      // 获取可观看平台信息
      let watchProviders = [];
      if (details["watch/providers"] && details["watch/providers"].results) {
        const providers = details["watch/providers"].results;
        // 添加美国和用户所在国家的观看平台
        if (providers.US) {
          watchProviders.push({
            country: 'US',
            ...providers.US
          });
        }
      }
      
      // 构建丰富的电影对象
      const enrichedMovie = {
        id: details.id,
        imdb_id: details.imdb_id,
        title: details.title,
        original_title: details.original_title,
        overview: details.overview,
        tagline: details.tagline || '',
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
        release_date: details.release_date,
        release_year: details.release_date ? details.release_date.split('-')[0] : '',
        vote_average: details.vote_average,
        vote_count: details.vote_count,
        popularity: details.popularity,
        runtime: details.runtime,
        budget: details.budget,
        revenue: details.revenue,
        original_language: details.original_language,
        genres: genres,
        production_companies: details.production_companies || [],
        production_countries: details.production_countries || [],
        spoken_languages: details.spoken_languages || [],
        era: movie.era,
        cast: cast,
        directors: directors,
        producers: producers,
        videos: videos,
        keywords: details.keywords ? details.keywords.keywords : [],
        certifications: certifications,
        watch_providers: watchProviders,
        status: details.status,
        homepage: details.homepage
      };
      
      // 添加评分百分比和格式化预算/票房
      enrichedMovie.score_percent = Math.round(details.vote_average * 10);
      enrichedMovie.budget_formatted = formatCurrency(details.budget);
      enrichedMovie.revenue_formatted = formatCurrency(details.revenue);
      enrichedMovie.profit = details.revenue - details.budget;
      enrichedMovie.profit_formatted = formatCurrency(enrichedMovie.profit);
      
      // 添加一些分析性字段
      if (details.revenue > 0 && details.budget > 0) {
        enrichedMovie.roi = details.revenue / details.budget;
        enrichedMovie.roi_formatted = `${(enrichedMovie.roi * 100).toFixed(2)}%`;
      }
      
      // 添加预告片链接
      if (videos.trailers.length > 0) {
        enrichedMovie.trailer_key = videos.trailers[0].key;
        enrichedMovie.trailer_url = `https://www.youtube.com/watch?v=${videos.trailers[0].key}`;
      } else if (videos.teasers.length > 0) {
        enrichedMovie.trailer_key = videos.teasers[0].key;
        enrichedMovie.trailer_url = `https://www.youtube.com/watch?v=${videos.teasers[0].key}`;
      }
      
      // 添加海报和背景完整URL
      enrichedMovie.poster_url = details.poster_path 
        ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
        : null;
      enrichedMovie.backdrop_url = details.backdrop_path 
        ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
        : null;
      
      enrichedMovies.push(enrichedMovie);
      
      // 防止API速率限制
      if (i < selectedMovies.length - 1) {
        console.log('等待1秒以避免API速率限制...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`处理电影 ${movie.title} 时出错:`, error);
    }
  }
  
  console.log(`\n成功丰富了 ${enrichedMovies.length} 部电影的详细信息`);
  
  return enrichedMovies;
};

// 格式化货币显示
function formatCurrency(amount) {
  if (!amount || amount === 0) return "$0";
  
  // 判断金额大小，决定使用百万还是亿作为单位
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(2)}B`;
  } else if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(2)}K`;
  }
  
  return `$${amount}`;
}

// 主函数
const main = async () => {
  try {
    console.log('开始从TMDB获取经典高分电影...');
    
    // 处理命令行参数
    const args = process.argv.slice(2);
    const options = {
      limit: 1000,         // 默认获取100部电影
      minRating: 8.0,     // 默认最低评分8.0
      minVotes: 1000,     // 默认最低投票数1000
      includeGenres: '',  // 默认不限制类型
      outputFile: 'movies.json', // 默认输出文件名
      maxYear: 2023,      // 默认最晚年份
      format: 'json',     // 默认输出格式
      skipImdb: false     // 默认不跳过IMDb Top 250
    };
    
    // 解析命令行参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--limit' && i + 1 < args.length) {
        options.limit = parseInt(args[i + 1], 10);
        i++;
      } else if (arg === '--min-rating' && i + 1 < args.length) {
        options.minRating = parseFloat(args[i + 1]);
        i++;
      } else if (arg === '--min-votes' && i + 1 < args.length) {
        options.minVotes = parseInt(args[i + 1], 10);
        i++;
      } else if (arg === '--genres' && i + 1 < args.length) {
        options.includeGenres = args[i + 1];
        i++;
      } else if (arg === '--output' && i + 1 < args.length) {
        options.outputFile = args[i + 1];
        i++;
      } else if (arg === '--max-year' && i + 1 < args.length) {
        options.maxYear = parseInt(args[i + 1], 10);
        i++;
      } else if (arg === '--format' && i + 1 < args.length) {
        options.format = args[i + 1];
        i++;
      } else if (arg === '--skip-imdb') {
        options.skipImdb = true;
      } else if (arg === '--help') {
        console.log(`
使用方法: node scripts/fetch-classic-movies.js [选项]

选项:
  --limit <数量>       获取的电影数量 (默认: 100)
  --min-rating <分数>  最低评分 (默认: 8.0)
  --min-votes <数量>   最低投票数 (默认: 1000)
  --genres <类型>      包含的电影类型ID，以逗号分隔 (默认: 全部)
  --output <文件名>    输出文件名 (默认: movies.json)
  --max-year <年份>    最晚发行年份 (默认: 2023)
  --format <格式>      输出格式: json 或 csv (默认: json)
  --skip-imdb         跳过获取IMDb Top 250电影
  --help               显示此帮助信息
        `);
        process.exit(0);
      }
    }
    
    console.log('配置信息:', options);
    
    // 获取电影类型列表并显示，帮助用户选择类型
    const genreMap = await fetchGenres();
    console.log('\n可用的电影类型ID:');
    Object.entries(genreMap).forEach(([id, name]) => {
      console.log(`  ${id}: ${name}`);
    });
    console.log('');
    
    // 获取经典电影
    const movies = await collectMoviesByEra(options);
    
    if (movies.length === 0) {
      console.error('没有找到经典电影，请检查API密钥和请求参数');
      process.exit(1);
    }
    
    // 根据评分和投票数排序
    movies.sort((a, b) => {
      // 首先按评分降序排序
      if (b.vote_average !== a.vote_average) {
        return b.vote_average - a.vote_average;
      }
      // 如果评分相同，按投票数降序排序
      return b.vote_count - a.vote_count;
    });
    
    // 限制电影数量
    const limitedMovies = options.limit ? movies.slice(0, options.limit) : movies;
    console.log(`保留排名前 ${limitedMovies.length} 部电影`);
    
    // 准备输出数据
    const allGenres = new Set();
    const allDirectors = new Set();
    const allProductionCountries = new Set();
    
    // 收集所有类型、导演和国家
    limitedMovies.forEach(movie => {
      if (movie.genres) {
        movie.genres.forEach(genre => {
          allGenres.add(genre.name);
        });
      }
      
      if (movie.directors) {
        movie.directors.forEach(director => {
          allDirectors.add(director.name);
        });
      }
      
      if (movie.production_countries) {
        movie.production_countries.forEach(country => {
          allProductionCountries.add(country.name);
        });
      }
    });
    
    // 按时代统计电影数量
    const eraStats = {};
    limitedMovies.forEach(movie => {
      eraStats[movie.era] = (eraStats[movie.era] || 0) + 1;
    });
    
    // 按类型统计电影数量
    const genreStats = {};
    limitedMovies.forEach(movie => {
      if (movie.genres) {
        movie.genres.forEach(genre => {
          genreStats[genre.name] = (genreStats[genre.name] || 0) + 1;
        });
      }
    });
    
    // 按国家统计电影数量
    const countryStats = {};
    limitedMovies.forEach(movie => {
      if (movie.production_countries) {
        movie.production_countries.forEach(country => {
          countryStats[country.name] = (countryStats[country.name] || 0) + 1;
        });
      }
    });
    
    // 创建包含统计数据的输出对象
    const data = {
      count: limitedMovies.length,
      averageRating: limitedMovies.reduce((sum, movie) => sum + movie.vote_average, 0) / limitedMovies.length,
      oldestMovie: limitedMovies.reduce((oldest, movie) => 
        movie.release_date && (!oldest.release_date || movie.release_date < oldest.release_date) ? movie : oldest, limitedMovies[0]),
      newestMovie: limitedMovies.reduce((newest, movie) => 
        movie.release_date && (!newest.release_date || movie.release_date > newest.release_date) ? movie : newest, limitedMovies[0]),
      statistics: {
        by_era: eraStats,
        by_genre: genreStats,
        by_country: countryStats
      },
      all_genres: Array.from(allGenres).sort(),
      all_directors: Array.from(allDirectors).sort(),
      all_countries: Array.from(allProductionCountries).sort(),
      generated_at: new Date().toISOString(),
      movies: limitedMovies
    };
    
    // 创建输出文件
    const filePath = path.join(process.cwd(), options.outputFile);
    
    // 根据格式选择输出方式
    if (options.format === 'csv') {
      try {
        // 尝试CSV格式输出
        const { Parser } = require('json2csv');
        
        // 简化电影对象以便于CSV输出
        const simplifiedMovies = limitedMovies.map(movie => ({
          id: movie.id,
          title: movie.title,
          original_title: movie.original_title,
          release_year: movie.release_year,
          vote_average: movie.vote_average,
          vote_count: movie.vote_count,
          runtime: movie.runtime,
          budget: movie.budget,
          revenue: movie.revenue,
          genres: movie.genres ? movie.genres.map(g => g.name).join(', ') : '',
          directors: movie.directors ? movie.directors.map(d => d.name).join(', ') : '',
          cast: movie.cast ? movie.cast.map(c => c.name).join(', ') : '',
          era: movie.era,
          trailer_url: movie.trailer_url || '',
          poster_url: movie.poster_url || '',
          imdb_id: movie.imdb_id || ''
        }));
        
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(simplifiedMovies);
        
        await fs.writeFile(filePath, csv, 'utf8');
        console.log(`成功将${simplifiedMovies.length}部经典高分电影以CSV格式保存到 ${filePath}`);
      } catch (csvError) {
        console.error('CSV转换失败，需要安装json2csv包:', csvError);
        console.log('使用JSON格式保存替代...');
        
        // 如果CSV转换失败，回退到JSON格式
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`成功将${limitedMovies.length}部经典高分电影以JSON格式保存到 ${filePath}`);
      }
    } else {
      // 默认JSON格式输出
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`成功将${limitedMovies.length}部经典高分电影以JSON格式保存到 ${filePath}`);
    }
    
    // 输出一些统计信息
    console.log('\n电影统计信息:');
    console.log(`- 总数: ${limitedMovies.length}部`);
    console.log(`- 平均评分: ${data.averageRating.toFixed(2)}`);
    console.log(`- 最早电影: ${data.oldestMovie.title} (${data.oldestMovie.release_date})`);
    console.log(`- 最新电影: ${data.newestMovie.title} (${data.newestMovie.release_date})`);
    console.log(`- 电影时代分布: ${Object.entries(eraStats).map(([era, count]) => `${era}: ${count}部`).join(', ')}`);
    console.log(`- 排名前三类型: ${Object.entries(genreStats).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([genre, count]) => `${genre}: ${count}部`).join(', ')}`);
    
  } catch (error) {
    console.error('执行脚本出错:', error);
    process.exit(1);
  }
};

// 运行主函数
main(); 