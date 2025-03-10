import { ref } from 'vue'
import * as fileutil from './fileutil.js'

// 创建单例来管理状态
const state = {
    loadingImages: ref(new Set()),
    coverlist: ref([]),
    downloadingFiles: new Set()
}

// 配置项
const config = {
    ossroute: 'https://lista233.oss-cn-beijing.aliyuncs.com/maicover/',
    localroute: 'maicover',
    suffix: '.jpg'
}

/**
 * 获取歌曲封面URL
 * @param {string} songId - 歌曲ID
 * @param {Object} options - 可选配置项
 * @param {string} options.ossroute - OSS路由前缀
 * @param {string} options.localroute - 本地存储路径
 * @param {string} options.suffix - 文件后缀
 * @returns {string} 封面URL或空字符串(正在加载)
 */
export function getCoverUrl(songId, options = {}) {
    // 合并配置
    const currentConfig = { ...config, ...options }
    const fileName = songId + currentConfig.suffix
    
    // 检查本地缓存
    if (Array.isArray(state.coverlist.value) && state.coverlist.value.includes(fileName)) {
        return '_doc/' + currentConfig.localroute + '/' + fileName
    }
    
    // 如果未在下载队列中，开始下载
    if (!state.downloadingFiles.has(fileName)) {
        state.downloadingFiles.add(fileName)
        state.loadingImages.value.add(songId)
        
        fileutil.downloadFileToDoc(currentConfig.ossroute + fileName, currentConfig.localroute)
            .then(async () => {
                const files = await fileutil.getDirectoryFiles(currentConfig.localroute)
                state.coverlist.value = Array.isArray(files) ? files : []
                state.downloadingFiles.delete(fileName)
                state.loadingImages.value.delete(songId)
            })
            .catch(error => {
                console.error('下载封面图片失败:', error)
                state.downloadingFiles.delete(fileName)
                state.loadingImages.value.delete(songId)
            })
    }
    
    return ''
}

/**
 * 初始化封面列表
 * @returns {Promise<void>}
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

/**
 * 获取加载状态
 * @param {string} songId - 歌曲ID
 * @returns {boolean} 是否正在加载
 */
export function isLoading(songId) {
    return state.loadingImages.value.has(songId)
}

// 导出状态供需要的组件使用
export const coverState = state 