import { ref } from 'vue'
import * as fileutil from './fileutil.js'
import { hasCover } from '../util/maiCoverData.js'
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
    
    // 如果是5位数且以10开头，去除前面的10
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
export async function initCoverList() {
    try {
        const files = await fileutil.getDirectoryFiles(config.localroute)
        state.coverlist.value = Array.isArray(files) ? files : []
    } catch (error) {
        console.error('初始化封面列表失败:', error)
        state.coverlist.value = []
    }
}

export const coverState = state 