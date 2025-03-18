/**
 * 计算平均定数
 * @param {number} rating - 玩家的 rating 值
 * @returns {number} - 平均定数，保留一位小数
 */
export function calculateAverageDs(rating) {
    if (!rating || rating <= 0) return 0;
    return Math.round((rating / (22.4*50)) * 10) / 10;
}

/**
 * 获取推荐定数范围
 * @param {number} averageDs - 平均定数
 * @returns {{min: number, max: number}} - 推荐定数范围
 */
export function getRecommendedDsRange(averageDs) {
    if (!averageDs || averageDs <= 0) return { min: 0, max: 0 };
    
    // 下限：平均定数-0.1，但不小于1
    const min = Math.max(1, Math.round((averageDs) * 10) / 10 );
    // 上限：平均定数+0.5，但不超过15
    const max = Math.min(15, Math.round((averageDs + 0.5) * 10) / 10 );
    
    return { min, max };
}

/**
 * 根据rating直接获取推荐定数范围
 * @param {number} rating - 玩家的 rating 值
 * @returns {{averageDs: number, range: {min: number, max: number}}} - 平均定数和推荐范围
 */
export function getRecommendedDsByRating(rating) {
    if (!rating || rating <= 0) {
        return {
            averageDs: 0,
            range: { min: 0, max: 0 }
        };
    }
    
    const averageDs = calculateAverageDs(rating);
    const range = getRecommendedDsRange(averageDs);
    
    return {
        averageDs,
        range
    };
}

/**
 * 使用示例：
 * 
 * import { calculateAverageDs, getRecommendedDsRange, getRecommendedDsByRating } from '@/utils/ratingUtils';
 * 
 * // 计算平均定数
 * const rating = 12500;
 * const averageDs = calculateAverageDs(rating); // 例如：13.2
 * 
 * // 获取推荐定数范围
 * const range = getRecommendedDsRange(averageDs); // 例如：{ min: 12.2, max: 15 }
 * 
 * // 直接通过rating获取推荐
 * const recommendation = getRecommendedDsByRating(rating);
 * // 返回：{ 
 * //   averageDs: 13.2, 
 * //   range: { min: 12.2, max: 15 } 
 * // }
 */ 