import { ref } from 'vue'
//import * as fileutil from './fileutil.js'
import { hasCover } from '@/static/data/maiCoverData.js'
import { pathToBase64, urlToBase64 } from '@/uni_modules/sp-html2canvas-render/utils/index.js'
// 创建单例来管理状态
const state = {
    loadingImages: ref(new Set()),
    coverlist: ref([]),
    downloadingFiles: new Set(),
    staticCovers: new Set()
}

// 配置项
const config = {
    localroute: 'maicover',
    suffix: '.jpg'
}

/**
 * 检查static目录下是否存在封面
 */
function checkStaticCover(songId) {
    if (state.staticCovers.has(songId)) {
        return true
    }
    
    return new Promise((resolve) => {
        uni.getFileInfo({
            filePath: `/static/maicover/${songId}.jpg`,
            success: () => {
				
                state.staticCovers.add(songId)
                resolve(true)
            },
            fail: () => resolve(false)
        })
    })
}

/**
 * 处理歌曲ID
 * @param {string|number} songId - 原始歌曲ID
 * @returns {string} - 处理后的ID
 */
function processSongId(songId) {
    if (!songId) return '';
    
    // 转换为字符串并补齐5位
    const paddedId =String(songId);
    
    if (paddedId.length === 4) {
        return '1'+paddedId;
    }
	
    if (paddedId.length === 5 && paddedId.startsWith('10') ) {
        if(paddedId.startsWith('100')){
            return paddedId.slice(3);
        }
        return paddedId.slice(2);
    }
    
    return paddedId;
}

/**
 * 获取歌曲封面URL
 */
export function getCoverUrl(songId, options = {}) {
    if (!songId) return '';
    
    const currentConfig = { ...config, ...options };
    const processedId = processSongId(songId);
    const fileName = processedId + currentConfig.suffix;

    // 如果已经在static目录中找到过
    if (hasCover(fileName)) {
        // console.log('本地加载'+fileName)
        return `../../static/${currentConfig.localroute}/${fileName}`;
    }
    
    // 如果在_doc目录中
    if (state.coverlist.value.includes(fileName)) {
        return '_doc/' + currentConfig.localroute + '/' + fileName;
    }
    
    // 如果都没有找到，返回远程URL
    const fixId=String(processedId).padStart(5, '0');
	
    return `https://www.diving-fish.com/covers/${fixId}.png`;
}

/**
 * 获取加载状态
 */
export function isLoading(songId) {
    return state.loadingImages.value.has(songId)
}

/**
 * 初始化封面列表
 */
// export async function initCoverList() {
//     try {
//         const files = await fileutil.getDirectoryFiles(config.localroute)
//         state.coverlist.value = Array.isArray(files) ? files : []
//     } catch (error) {
//         console.error('初始化封面列表失败:', error)
//         state.coverlist.value = []
//     }
// }

export const coverState = state 

/**
 * 获取歌曲封面的Base64格式（专门为maib50提供用于保存图片）
 * 此方法会将图片转换为base64以避免html2canvas的跨域问题
 */
export async function getCoverBase64(songId, options = {}) {
    if (!songId) return '';
    
    try {
        // 先获取普通的URL
        const coverUrl = getCoverUrl(songId, options);
        
        // 如果已经是base64格式，直接返回
        if (coverUrl.startsWith('data:image')) {
            return coverUrl;
        }
        
        let base64Data = '';
        
        // 处理本地图片路径
        if (coverUrl.startsWith('/') || 
            coverUrl.startsWith('./') || 
            coverUrl.startsWith('../') ||
            coverUrl.startsWith('static/') || 
            coverUrl.startsWith('_doc/')) {
            
            console.log('转换本地图片为base64:', coverUrl);
            
            // 转换相对路径为绝对路径（如果需要）
            let localPath = coverUrl;
            
            // 确保路径格式正确
            if (localPath.startsWith('./')) {
                localPath = localPath.substring(2);
            }
            
            try {
                // 使用pathToBase64转换本地图片
                base64Data = await urlToBase64(localPath);
                console.log('本地图片转换成功:', songId);
            } catch (err) {
                console.warn(`本地图片转换失败:${localPath}，尝试网络请求`, err);
                // 如果本地转换失败，尝试网络请求
                try {
                    const fixId = String(processSongId(songId)).padStart(5, '0');
                    const netUrl = `https://www.diving-fish.com/covers/${fixId}.png`;
                    base64Data = await urlToBase64(netUrl);
                } catch (netErr) {
                    console.error('网络图片转换也失败了:', netErr);
                    return coverUrl; // 返回原始URL作为降级处理
                }
            }
        } 
        // 处理网络图片
        else if (coverUrl.startsWith('http://') || coverUrl.startsWith('https://')) {
            console.log('转换网络图片为base64:', coverUrl);
            try {
                base64Data = await urlToBase64(coverUrl);
            } catch (err) {
                console.error('网络图片转换失败:', err);
                return coverUrl; // 返回原始URL作为降级处理
            }
        } else {
            // 未知格式，返回原始URL
            return coverUrl;
        }
        
        return base64Data || coverUrl;
    } catch (error) {
        console.error('获取base64图片出错:', error);
        // 出错时返回原始URL作为降级处理
        return getCoverUrl(songId, options);
    }
}

/**
 * 批量获取歌曲封面的Base64格式
 * 使用Promise.all并行处理多张图片，提高效率
 */
export async function getBatchCoverBase64(songIds, options = {}) {
    if (!songIds || !songIds.length) return [];
    
    // 使用Promise.all并行处理所有图片
    const promises = songIds.map(songId => {
        return getCoverBase64(songId, options)
            .catch(err => {
                console.error(`获取图片${songId}失败:`, err);
                // 失败时返回null
                return null;
            });
    });
    
    // 等待所有图片处理完成
    const results = await Promise.all(promises);
    
    // 返回结果数组，与传入的songIds顺序一致
    return results;
} 