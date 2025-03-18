import { getRecommendedDsByRating } from './ratingUtils';
import { sortChartStatsByPlayCount } from './chartStatsUtils';

/**
 * 根据官方定数推荐歌曲
 * @param {number} rating - 玩家的 rating 值
 * @param {Object} songService - SongService 实例
 * @param {Object} chartStats - 谱面统计数据
 * @param {number} limit - 返回结果数量限制
 * @returns {Array} - 推荐歌曲列表
 */
export function recommendSongsByOfficialDs(rating, songService, chartStats, limit = 200) {
  if (!rating || !songService || !chartStats) {
    return [];
  }
  
  // 获取推荐定数范围
  const recommendation = getRecommendedDsByRating(rating);
  const { min, max } = recommendation.range;
  
  // 获取所有谱面并按游玩次数排序
  const allCharts = sortChartStatsByPlayCount(chartStats);
  
  // 筛选符合定数范围的谱面
  const recommendedCharts = allCharts.filter(chart => {
    // 获取歌曲信息
    const song = songService.getSongById(chart.songId);
    if (!song || !song.difficulties) return false;
    
    // 确保难度索引有效
    if (chart.difficulty < 0 || chart.difficulty >= song.difficulties.length) return false;
    
    // 获取对应难度的定数
    const difficulty = song.difficulties[chart.difficulty];
    if (!difficulty || !difficulty.ds) return false;
    
    // 检查定数是否在推荐范围内
    const ds = parseFloat(difficulty.ds);
    return !isNaN(ds) && ds >= min && ds <= max;
  });
  
  // 添加歌曲信息并限制数量
  return recommendedCharts.slice(0, limit).map(chart => {
    const song = songService.getSongById(chart.songId);
    if (!song || !song.difficulties || chart.difficulty >= song.difficulties.length) {
      return {
        ...chart,
        title: `歌曲 ${chart.songId}`,
        ds: '?',
        level: '?',
        totalNotes: 0
      };
    }
    
    const difficulty = song.difficulties[chart.difficulty];
    if (!difficulty) {
      return {
        ...chart,
        title: song.title || `歌曲 ${chart.songId}`,
        ds: '?',
        level: '?',
        totalNotes: 0
      };
    }
    
    return {
      ...chart,
      title: song.title,
      ds: difficulty.ds,
      level: difficulty.level,
      totalNotes: difficulty.totalNotes || 0
    };
  });
}

/**
 * 根据拟合定数推荐歌曲
 * @param {number} rating - 玩家的 rating 值
 * @param {Object} songService - SongService 实例
 * @param {Object} chartStats - 谱面统计数据
 * @param {number} limit - 返回结果数量限制
 * @returns {Array} - 推荐歌曲列表
 */
export function recommendSongsByFitDs(rating, songService, chartStats, limit = 200) {
  if (!rating || !songService || !chartStats) {
    return [];
  }
  
  // 获取推荐定数范围
  const recommendation = getRecommendedDsByRating(rating);
  const { min, max } = recommendation.range;
  
  // 获取所有谱面
  const allCharts = sortChartStatsByPlayCount(chartStats);
  

  const difficulties = songService.getDifficultiesByDsRange({ min, max });
  console.log("符合定数范围的难度数量", difficulties.length);
  
  // 收集所有符合条件的谱面
 
  
  // 遍历所有符合定数范围的难度
  console.log('所有统计数据',allCharts)
   let recommendedCharts=[];
  difficulties.forEach(difficulty => {
    // 在统计数据中查找对应的记录

        allCharts.forEach(stat => {
			
      if (stat.songId==difficulty.songId&&stat.difficulty==difficulty.difficulty) {
        recommendedCharts.push(stat)
		return;
      }
    });
	})
	
  // recommendedCharts  = allCharts.filter(chart => {
  //   const fitDiff = parseFloat(chart.fit_diff);
  //   return !isNaN(fitDiff) && fitDiff >= min && fitDiff <= max;
  // });
  
  // 计算综合得分并排序
  const sortedCharts = recommendedCharts
    .map(chart => {
      // 标准化各个指标的值到0-1范围
      const avgScore = chart.avg ? Math.min((parseFloat(chart.avg)-95), 5) : 0;  // 平均达成率转换为0-1
      // 删除定数权值
      const cntScore = Math.min(chart.cnt / 10000, 1);  // 游玩次数，最高10000次记为1
      
      // 新的加权计算公式：平均达成率是主要因素，游玩次数作为调节因子
      // 平均达成率高且游玩次数高 = 最高分
      // 平均达成率高但游玩次数低 = 中高分
      // 平均达成率低且游玩次数高 = 中低分
      // 平均达成率低且游玩次数低 = 最低分
      const totalScore = avgScore * (0.7 + 0.3 * cntScore);
      
      return {
        ...chart,
        score: totalScore
      };
    })
    .sort((a, b) => b.score - a.score); // 按总分降序排序
  
  // 添加歌曲信息并限制数量
  return sortedCharts.slice(0, limit).map(chart => {
    const song = songService.getSongById(chart.songId);
    let title = `歌曲 ${chart.songId}`;
    let level = '?';
    let ds = '?';
    let totalNotes = 0;
    
    if (song) {
      title = song.title || title;
      
      if (song.difficulties && 
          chart.difficulty >= 0 && 
          chart.difficulty < song.difficulties.length && 
          song.difficulties[chart.difficulty]) {
        
        level = song.difficulties[chart.difficulty].level || level;
        ds = song.difficulties[chart.difficulty].ds || ds;
        totalNotes = song.difficulties[chart.difficulty].totalNotes || totalNotes;
      }
    }
    
    return {
      ...chart,
      title,
      ds,
      level,
      totalNotes,
      fit_diff: chart.fit_diff ? parseFloat(chart.fit_diff).toFixed(2) : '?',
      avg: chart.avg ? parseFloat(chart.avg).toFixed(2) : '?',
      score: parseFloat(chart.score).toFixed(3) // 保留得分用于调试
    };
  });
}

/**
 * 根据官方定数和拟合定数的差值推荐歌曲
 * @param {number} rating - 玩家的 rating 值
 * @param {Object} songService - SongService 实例
 * @param {Object} chartStats - 谱面统计数据
 * @param {number} limit - 返回结果数量限制
 * @returns {Array} - 推荐歌曲列表
 */
export function recommendSongsByDsDifference(rating, songService, chartStats, limit = 200) {
  if (!rating || !songService || !chartStats) {
    console.log("缺少必要参数", { rating, hasSongService: !!songService, hasChartStats: !!chartStats });
    return [];
  }
  
  // 获取推荐定数范围
  const recommendation = getRecommendedDsByRating(rating);
  const { min, max } = recommendation.range;
  console.log("推荐定数范围", { min, max });
  
  // 将 chartStats 转换为数组形式
  const chartStatsArray = Array.isArray(chartStats) ? chartStats : Object.values(chartStats);
  console.log("谱面统计数据数量", chartStatsArray.length);
  
  // 直接使用新方法获取符合定数范围的所有难度
  const difficulties = songService.getDifficultiesByDsRange({ min, max });
  console.log("符合定数范围的难度数量", difficulties.length);
  
  // 收集所有符合条件的谱面
  const candidateCharts = [];
  
  // 遍历所有符合定数范围的难度
  difficulties.forEach(difficulty => {
    // 在统计数据中查找对应的记录
    const chartStat = chartStatsArray.find(stat => {
      if (stat[difficulty.songId] && stat[difficulty.songId][difficulty.difficulty]) {
        return true;
      }
      return false;
    });
    
    // 如果找到了统计数据
    if (chartStat && chartStat[difficulty.songId] && chartStat[difficulty.songId][difficulty.difficulty]) {
      const statData = chartStat[difficulty.songId][difficulty.difficulty];
      
      // 如果有拟合定数
      if (statData.fit_diff) {
        const officialDs = parseFloat(difficulty.ds);
        const fitDs = parseFloat(statData.fit_diff);
        
        // 计算定数差值（只考虑官方定数高于拟合定数的情况）
        const dsDifference = officialDs - fitDs;
        
        if (dsDifference > 0) {
          candidateCharts.push({
            ...statData,
            songId: difficulty.songId,
            difficulty: difficulty.difficulty,  // 确保包含难度索引
            title: difficulty.title,
            ds: officialDs,
            level: difficulty.level,
            fit_diff: fitDs,
            dsDifference: dsDifference,
            genre: difficulty.basic_info?.genre || '',
            from: difficulty.basic_info?.from || ''
          });
        }
      }
    }
  });
  
  console.log("符合条件的谱面数量", candidateCharts.length);
  
  // 按定数差值从大到小排序
  const sortedCharts = candidateCharts.sort((a, b) => b.dsDifference - a.dsDifference);
  
  // 添加额外信息并限制数量
  return sortedCharts.slice(0, limit).map(chart => {
    // 将难度确保为数字
    const difficultyNum = typeof chart.difficulty === 'string' ? 
      parseInt(chart.difficulty, 10) : 
      Number(chart.difficulty);
      
    return {
      ...chart,
      difficulty: isNaN(difficultyNum) ? 0 : difficultyNum, // 确保难度索引是有效数字
      avg: chart.avg ? parseFloat(chart.avg).toFixed(2) : '?',
      fit_diff: parseFloat(chart.fit_diff).toFixed(2),
      dsDifference: parseFloat(chart.dsDifference).toFixed(2)
    };
  });
}

/**
 * 获取综合推荐（包含三种推荐方式）
 * @param {number} rating - 玩家的 rating 值
 * @param {Object} songService - SongService 实例
 * @param {Object} chartStats - 谱面统计数据
 * @param {number} limit - 返回结果数量限制
 * @returns {Object} - 包含三种推荐方式的结果
 */
export function getComprehensiveRecommendations(rating, songService, chartStats, limit = 200) {
  return {
    averageDs: getRecommendedDsByRating(rating).averageDs,
    range: getRecommendedDsByRating(rating).range,
    officialRecommendations: recommendSongsByOfficialDs(rating, songService, chartStats, limit),
    fitRecommendations: recommendSongsByFitDs(rating, songService, chartStats, limit),
    diffRecommendations: recommendSongsByDsDifference(rating, songService, chartStats, limit)
  };
}

/**
 * 计算目标定数范围
 * @param {number} userRating - 用户的 Rating
 * @returns {object} - 包含最小和最大目标定数的对象
 */
function calculateTargetDs(userRating) {
  // 根据用户 Rating 计算目标定数范围
  // 这里使用一个简单的公式，可以根据需要调整
  const baseDs = userRating / 100;
  
  return {
    min: baseDs - 1.0, // 保持原有范围不变
    max: baseDs + 1.0, // 保持原有范围不变
    optimal: baseDs
  };
}

/**
 * 获取基于拟合定数的推荐
 * @param {object} targetDs - 目标定数范围
 * @param {object} songService - 歌曲服务实例
 * @param {object} chartStats - 谱面统计数据
 * @param {number} limit - 限制返回的记录数量
 * @returns {array} - 推荐的谱面列表
 */
function getFitDifficultyRecommendations(targetDs, songService, chartStats, limit = 200) {
  const recommendations = [];
  
  // 遍历所有谱面统计数据
  Object.entries(chartStats).forEach(([chartId, stats]) => {
    // 跳过游玩次数过少的谱面
    if (stats.cnt < 50) return; // 保持原有筛选条件不变
    
    // 解析谱面ID
    const [songId, difficultyStr] = chartId.split(':');
    const difficulty = parseInt(difficultyStr);
    
    // 获取歌曲信息
    const song = songService.getSongById(songId);
    if (!song) return;
    
    // 计算拟合定数
    const fitDiff = calculateFitDifficulty(stats.avg);
    
    // 检查是否在目标定数范围内
    if (fitDiff >= targetDs.min && fitDiff <= targetDs.max) {
      // 计算与最佳定数的接近程度
      const closeness = Math.abs(fitDiff - targetDs.optimal);
      
      // 计算推荐得分（越低越好）
      const score = closeness * 10;
      
      recommendations.push({
        songId,
        difficulty,
        title: song.title,
        ds: song.ds[difficulty],
        fit_diff: fitDiff.toFixed(2),
        avg: stats.avg.toFixed(2),
        cnt: stats.cnt,
        score: score.toFixed(2)
      });
    }
  });
  
  // 按推荐得分排序（升序）
  recommendations.sort((a, b) => parseFloat(a.score) - parseFloat(b.score));
  
  // 返回前 limit 条记录
  return recommendations.slice(0, limit);
}

/**
 * 获取基于定数差值的推荐
 * @param {object} targetDs - 目标定数范围
 * @param {object} songService - 歌曲服务实例
 * @param {object} chartStats - 谱面统计数据
 * @param {number} limit - 限制返回的记录数量
 * @returns {array} - 推荐的谱面列表
 */
function getDsDifferenceRecommendations(targetDs, songService, chartStats, limit = 200) {
  const recommendations = [];
  
  // 遍历所有谱面统计数据
  Object.entries(chartStats).forEach(([chartId, stats]) => {
    // 跳过游玩次数过少的谱面
    if (stats.cnt < 50) return; // 保持原有筛选条件不变
    
    // 解析谱面ID
    const [songId, difficultyStr] = chartId.split(':');
    const difficulty = parseInt(difficultyStr);
    
    // 获取歌曲信息
    const song = songService.getSongById(songId);
    if (!song) return;
    
    // 计算拟合定数
    const fitDiff = calculateFitDifficulty(stats.avg);
    
    // 计算官方定数与拟合定数的差值
    const officialDs = parseFloat(song.ds[difficulty]);
    const dsDifference = (fitDiff - officialDs).toFixed(2);
    
    // 检查拟合定数是否在目标范围内
    const inTargetRange = fitDiff >= targetDs.min && fitDiff <= targetDs.max;
    
    // 检查差值是否显著
    const hasSigDifference = Math.abs(fitDiff - officialDs) >= -0.2; // 保持原有筛选条件不变
    
    if (inTargetRange && hasSigDifference) {
      recommendations.push({
        songId,
        difficulty,
        title: song.title,
        ds: officialDs.toFixed(2),
        fit_diff: fitDiff.toFixed(2),
        dsDifference,
        avg: stats.avg.toFixed(2),
        cnt: stats.cnt
      });
    }
  });
  
  // 按差值的绝对值排序（降序）
  recommendations.sort((a, b) => Math.abs(parseFloat(b.dsDifference)) - Math.abs(parseFloat(a.dsDifference)));
  
  // 返回前 limit 条记录
  return recommendations.slice(0, limit);
} 