/**
 * 按照 cnt 对谱面数据进行排序，并返回包含难度ID和子难度的详细信息
 * @param {Object} chartStats - chart_stats.json 的数据对象
 * @returns {Array<{id: string, difficulty: number, cnt: number}>} - 排序后的难度和子难度列表
 */
export function sortChartStatsByPlayCount(chartStats) {
    if (!chartStats || !chartStats.charts) return [];
    
    const allCharts = [];
    
    // 遍历所有难度
    for (const [songId, charts] of Object.entries(chartStats.charts)) {
        // 遍历每个难度下的子难度数组
        charts.forEach((chart, index) => {
            // 确保对象不为空且有 cnt 属性
            if (Object.keys(chart).length > 0 && 'cnt' in chart) {
                allCharts.push({
                    songId: songId,        // 歌曲ID（如 "8", "9" 等）
                    difficulty: index,     // 子难度索引（0-3）
                    cnt: chart.cnt || 0,   // 游玩次数
                    diff: chart.diff,      // 官方难度
                    fit_diff: chart.fit_diff, // 实际难度
                    avg: chart.avg,        // 平均达成率
                    std_dev: chart.std_dev // 标准差
                });
            }
        });
    }
    
    // 按游玩次数降序排序
    return allCharts.sort((a, b) => b.cnt - a.cnt);
}

/**
 * 获取难度名称
 * @param {number} difficulty - 难度索引（0-3）
 * @returns {string} - 难度名称
 */
export function getDifficultyName(difficulty) {
    const diffNames = ['BASIC', 'ADVANCED', 'EXPERT', 'MASTER'];
    return diffNames[difficulty] || 'UNKNOWN';
}

/**
 * 获取排序后的简化列表（仅包含ID和难度信息）
 * @param {Object} chartStats - chart_stats.json 的数据对象
 * @returns {Array<{songId: string, difficulty: number}>} - 排序后的简化列表
 */
export function getSortedChartList(chartStats) {
    const sortedCharts = sortChartStatsByPlayCount(chartStats);
    return sortedCharts.map(chart => ({
        songId: chart.songId,
        difficulty: chart.difficulty
    }));
}

/**
 * 使用示例：
 * 
 * import { sortChartStatsByPlayCount, getSortedChartList, getDifficultyName } from '@/utils/chartStatsUtils';
 * 
 * // 获取完整的排序数据
 * const chartStats = {
 *   charts: {
 *     "8": [
 *       {cnt: 100, avg: 98.5}, // BASIC
 *       {cnt: 200, avg: 97.2}, // ADVANCED
 *       {cnt: 150, avg: 96.8}, // EXPERT
 *       {cnt: 300, avg: 95.5}  // MASTER
 *     ],
 *     "9": [
 *       {cnt: 250, avg: 97.8},
 *       {cnt: 350, avg: 96.5},
 *       {cnt: 400, avg: 95.2},
 *       {cnt: 450, avg: 94.8}
 *     ]
 *   }
 * };
 * 
 * // 获取完整排序列表
 * const sortedCharts = sortChartStatsByPlayCount(chartStats);
 * // 返回：[
 * //   {id: "9", difficulty: 3, cnt: 450, avg: 94.8},
 * //   {id: "9", difficulty: 2, cnt: 400, avg: 95.2},
 * //   ...
 * // ]
 * 
 * // 获取简化的排序列表
 * const simplifiedList = getSortedChartList(chartStats);
 * // 返回：[
 * //   {id: "9", difficulty: 3},
 * //   {id: "9", difficulty: 2},
 * //   ...
 * // ]
 * 
 * // 使用示例：
 * sortedCharts.forEach(chart => {
 *   console.log(`歌曲ID: ${chart.id}, 难度: ${getDifficultyName(chart.difficulty)}, 游玩次数: ${chart.cnt}`);
 * });
 */ 