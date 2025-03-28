<template>
	
  <view class="container" :class="difficulties[currentDiffIndex].class">
    <view class="song-card" :class="difficulties[currentDiffIndex].class">
      <view class="song-header">
        <!-- 添加封面图片 -->
        <view class="cover-container">
          <image 
            class="song-cover" 
            :src="getCoverUrl(songData?.id)"
            mode="aspectFill"
            @error="handleImageError"
            lazy-load
          />
          <view class="loading-overlay" v-if="isLoading(songData?.id) || dataLoading">
            <text>加载中...</text>
          </view>
        </view>

        <view class="song-info">
          <view class="title-row">
            <view class="title-decoration"></view>
            <text class="song-title" @click="copyTitle">{{ songData?.title }}</text>
            <text class="song-id" @click="copyId">#{{ songData?.id }}</text>
          </view>
          
          <!-- 在 basic-info 部分添加艺术家信息 -->
          <view class="basic-info">
           
            
            <view class="info-row">
              <view class="label-wrapper">
                <view class="label-decoration"></view>
                <text class="label">类别:</text>
              </view>
              <text class="value" :class="{'skeleton': dataLoading}">{{ dataLoading ? '' : formatGenre(songData?.basic_info?.genre) }}</text>
            </view>
            <view class="info-row">
              <view class="label-wrapper">
                <view class="label-decoration"></view>
                <text class="label">BPM:</text>
              </view>
              <text class="value" :class="{'skeleton': dataLoading}">{{ dataLoading ? '' : (songData?.basic_info?.bpm || '-') }}</text>
            </view>
            <view class="info-row">
              <view class="label-wrapper">
                <view class="label-decoration"></view>
                <text class="label">版本:</text>
              </view>
              <text class="value" :class="{'skeleton': dataLoading}">{{ dataLoading ? '' : formatVersion(songData?.basic_info?.from) }}</text>
            </view>
			<view class="info-row">
			  <view class="label-wrapper">
			    <view class="label-decoration"></view>
			    <text class="label">曲师:</text>
			  </view>
			  <text class="value ellipsis" :class="{'skeleton': dataLoading}" @click="copyArtist">
			    {{ dataLoading ? '' : (songData?.basic_info?.artist || '-') }}
			  </text>
			</view>
          </view>
        </view>
      </view>

      <!-- 难度切换器 -->
      <view class="difficulty-switcher">
        <view 
          v-for="(diff, index) in difficulties" 
          :key="diff.name"
          class="difficulty-tab"
          :class="{ 
            active: currentDiffIndex === index,
            [diff.class]: true,
            'skeleton-tab': dataLoading
          }"
          @click="!dataLoading && switchDifficulty(index)"
          v-show="!dataLoading && (index < songData?.charts?.length && diff.name !== 'Re:Mas' || 
                  (diff.name === 'Re:Mas' && songData?.charts?.length >= 5))"
        >
          <text>{{ diff.name }}</text>
          <text class="level">Lv.{{ songData?.level[index] }}</text>
        </view>
        
        <!-- 加载中的骨架屏 -->
        <view v-if="dataLoading" v-for="i in 5" :key="`skeleton-${i}`" class="difficulty-tab skeleton-tab"></view>
      </view>

      <!-- 难度详情 -->
      <view class="difficulty-details" :class="difficulties[currentDiffIndex].class">
        <!-- 定数和谱师显示 -->
        <view class="info-row">
          <view class="info-pair">
            <text class="label">官方定数:</text>
            <text class="value" :class="{'skeleton': dataLoading || statsLoading}">
              {{ (dataLoading || statsLoading) ? '' : songData.ds[currentDiffIndex] }}
            </text>
          </view>
		  <view class="info-pair" @click="copyCharter(songData.charts[currentDiffIndex]?.charter)">
		    <text class="label">谱面谱师:</text>
		    <text class="value" :class="{'skeleton': dataLoading || statsLoading}">
		      {{ (dataLoading || statsLoading) ? '' : (songData.charts[currentDiffIndex]?.charter || '-') }}
		    </text>
		  </view>
        </view>

        <!-- 谱师和平均达成率 -->
        <view class="chart-info">
			<view class="info-pair">
			  <text class="label">拟合难度:</text>
			  <text class="value" :class="{'skeleton': dataLoading || statsLoading}">
			    {{ (dataLoading || statsLoading) ? '' : (fitDiff ? fitDiff.toFixed(2) : '-') }}
			  </text>
			</view>
          <view class="info-pair">
            <text class="label">平均达成:</text>
            <text class="value" :class="{'skeleton': dataLoading || statsLoading}">
              {{ (dataLoading || statsLoading) ? '' : (avgAchievement ? avgAchievement.toFixed(2) + '%' : '-') }}
            </text>
          </view>
	
        </view>

        <!-- Notes数据 -->
        <view class="notes-info">
      
          <view class="notes-grid">
            <view 
              class="note-item" 
              v-for="(type, index) in noteTypes" 
              :key="type"
              :class="{'skeleton-card': dataLoading || statsLoading}"
            >
              <text class="note-type">{{ type }}</text>
              <text class="note-count" v-if="!dataLoading && !statsLoading">{{ getNoteCount(index) }}</text>
              <text class="note-count skeleton" v-else></text>
            </view>
          </view>
        </view>
      </view>

      <!-- 将玩家记录和工具栏包装在一个容器中 -->
      <view class="record-tools-container">
        <!-- 玩家成绩模块 -->
        <view class="player-record" >
          <view class="record-header">
            <text class="section-title">玩家最佳成绩</text>
            <view class="favorite-btn" @click="showFavoriteDialog">
              <text class="iconfont" :class="{'is-favorite': isFavorite}">★</text>
            </view>
          </view>
          <view class="record-content" v-if="!dataLoading && !recordLoading">
            <view class="achievement-section">
              <text class="achievement-value" :class="getAchievementClass(currentRecord?.achievements)">
                {{currentRecord?.achievements ? Number(currentRecord.achievements).toFixed(4) : '-'}}%
              </text>
            </view>
            
            <view class="record-details">
              <view class="detail-item">
                <text class="label">Rating:</text>
                <text class="value ra" :class="getRatingClass(currentRecord?.ra)">{{currentRecord?.ra || '-'}}</text>
              </view>
              <view class="detail-item">
                <text class="label">连击|同步</text>
                <view class="combo-sync-container">
                  <text class="value combo" :class="getComboClass(currentRecord?.fc)">{{formatCombo(currentRecord?.fc) || '-'}}</text>
                  <text class="separator">|</text>
                  <text class="value sync" :class="getSyncClass(currentRecord?.fs)">{{formatFS(currentRecord?.fs) || '-'}}</text>
                </view>
              </view>
            </view>
          </view>
          <!-- 加载中的骨架屏 -->
          <view class="record-content" v-else>
            <view class="achievement-section">
              <text class="achievement-value skeleton-text">--.--%</text>
            </view>
            <view class="record-details">
              <view class="detail-item">
                <text class="label">Rating:</text>
                <text class="value skeleton-text">----</text>
              </view>
              <view class="detail-item">
                <text class="label">连击|同步</text>
                <view class="combo-sync-container">
                  <text class="value combo skeleton-text">--</text>
                  <text class="separator skeleton-text">|</text>
                  <text class="value sync skeleton-text">--</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 工具栏模块 -->
        <view class="tools-section">
          <view class="tools-container">
			  <button class="tool-btn" :class="difficulties[currentDiffIndex].class" @click="navToBiliBili(songData.title)">
			      <text class="iconfont">   跳转B站<p>查看视频</p></text>
			</button>
            <button class="tool-btn alias-btn" @click="showAliasDialog" :class="difficulties[currentDiffIndex].class">
              <text class="iconfont">查看别名</text>
            </button>
          </view>
        </view>
		
      </view>
    </view>
  </view>

  <!-- 修改别名弹窗组件 -->
  <uni-popup ref="popup" type="center" :mask-click="true">
    <view class="alias-popup">
      <view class="popup-header">
        <text class="title">歌曲别名</text>
        <text class="close-btn" @click="closeAliasDialog">×</text>
      </view>
      <view class="alias-list">
        <view v-if="songAliases.length > 0">
          <view v-for="(alias, index) in songAliases" :key="index" class="alias-item">
            {{ alias }}
          </view>
        </view>
        <view v-else class="no-alias">
          暂无别名
        </view>
      </view>
    </view>
  </uni-popup>

  <!-- 修改收藏弹窗组件 -->
  <uni-popup ref="favoritePopupRef" type="center" :mask-click="true">
    <view class="favorite-popup">
      <view class="popup-header">
        <text class="title">收藏歌曲</text>
        <text class="close-btn" @click="closeFavoriteDialog">×</text>
      </view>
      <view class="folder-list">
        <view v-if="favoriteFolders.length > 0">
          <view 
            v-for="(folder, index) in favoriteFolders" 
            :key="index" 
            class="folder-item"
            :class="{'folder-selected': isSongInFolder(folder.id)}"
            @click="addToFavorite(folder.id)"
          >
            <view class="folder-info">
              <text class="folder-name">{{ folder.name }}</text>
              <text class="folder-count">({{ folder.count || 0 }}首)</text>
            </view>
            <text v-if="isSongInFolder(folder.id)" class="folder-check">✓</text>
          </view>
          <view class="folder-item new-folder" @click="showNewFolderInput">
            <text class="folder-name">+ 新建收藏夹</text>
          </view>
        </view>
        <view v-else class="no-folder">
          <text>暂无收藏夹</text>
          <view class="folder-item new-folder" @click="showNewFolderInput">
            <text class="folder-name">+ 新建收藏夹</text>
          </view>
        </view>
      </view>
      <view class="new-folder-input" v-if="showingNewFolderInput">
        <input 
          type="text" 
          v-model="newFolderName" 
          placeholder="输入收藏夹名称" 
		   @confirm="createNewFolder"
          focus
          @blur="hideNewFolderInput"
        />
        <button class="create-btn" @click="createNewFolder">创建</button>
      </view>
    </view>
  </uni-popup>

</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import SongService from '@/utils/songService.js'
import playerRecordService from '@/utils/playerRecordService.js'
import * as maiApi from '../../api/maiapi.js'
import { onLoad, onHide, onShow } from '@dcloudio/uni-app'
import { getCoverUrl, isLoading } from '@/util/coverManager.js'
import SongSearcher from '../../utils/SongSearcher'
import {openBiliSearch} from '@/utils/biliUtils.js'

// 加载状态控制
const pageLoaded = ref(false)  // 页面基础结构是否加载完成
const dataLoading = ref(true)  // 数据是否正在加载
const statsLoading = ref(true)  // 详细数据是否正在加载
const recordLoading = ref(true) // 玩家成绩是否正在加载

// 初始化所有需要的 ref
const song = ref('')
const songService = ref(null)
const songSearcher = ref(null)
const popup = ref(null)
const playerRecord = ref(null)
const fitDiff = ref(null)
const avgAchievement = ref(null)

// 默认歌曲数据
const defaultSongData = {
  "id": "0",
  "title": "Untitle",
  "type": "-",
  "ds": [0, 0, 0, 0, 0], // 为所有难度提供默认值
  "level": ["-", "-", "-", "-", "-"], // 为所有难度提供默认值
  "cids": [0, 0, 0, 0, 0],
  "basic_info": { 
    "genre": "-", 
    "bpm": "-", 
    "from": "-" 
  },
  "charts": [
    {
      "notes": [0, 0, 0, 0, 0],
      "charter": "-"
    },
    {
      "notes": [0, 0, 0, 0, 0],
      "charter": "-"
    },
    {
      "notes": [0, 0, 0, 0, 0],
      "charter": "-"
    },
    {
      "notes": [0, 0, 0, 0, 0],
      "charter": "-"
    },
    {
      "notes": [0, 0, 0, 0, 0],
      "charter": "-"
    }
  ]
}

// 初始化歌曲数据
const songData = ref({...defaultSongData})

// 更改歌曲方法 - 优化为异步
const changeSongValue = async (e) => {
  if(!e.detail.value) return
  
  // 先标记为加载中状态
  dataLoading.value = true
  statsLoading.value = true
  recordLoading.value = true
  
  try {
    if (songService.value) {
      // 使用setTimeout将获取歌曲数据操作放入宏任务队列
      setTimeout(async () => {
        const newSongData = songService.value.getSongById(e.detail.value)
        if (newSongData) {
          songData.value = newSongData
          dataLoading.value = false
          
          // 在下一帧更新后再加载详细数据
          await nextTick()
          updateChartStats()
        } else {
          songData.value = {...defaultSongData}
          dataLoading.value = false
        }
      }, 50)
    }
  } catch (error) {
    console.error('加载歌曲数据失败:', error)
    songData.value = {...defaultSongData}
    dataLoading.value = false
  }
}

// 当前选中的难度索引 - 修改默认值为 3 (Master)
const currentDiffIndex = ref(3)

// 难度配置
const difficulties = [
  { name: 'Basic', class: 'basic', level_index: 0 },
  { name: 'Advan', class: 'advanced', level_index: 1 },
  { name: 'Expert', class: 'expert', level_index: 2 },
  { name: 'Master', class: 'master', level_index: 3 },
  { name: 'Re:Mas', class: 'remaster', level_index: 4 }
]



// 初始化 SongService
const initSongService = async () => {
  if (songService.value) return
  
  try {
    const musicData = uni.getStorageSync('musicData')
    if (musicData) {
      songService.value = new SongService(musicData)
      songSearcher.value = new SongSearcher(musicData)
      return true
    }
  } catch (error) {
    console.error('初始化 SongService 失败:', error)
  }
  return false
}

// Note类型
const noteTypes = ['TAP', 'HOLD', 'SLIDE', 'BREAK', 'TOUCH']

// 切换难度
const switchDifficulty = (index) => {
  if (index < songData.value.ds.length) {
    statsLoading.value = true
    recordLoading.value = true
    currentDiffIndex.value = index
    
    // 异步更新数据
    setTimeout(() => {
      updateChartStats()
    }, 50)
  }
}

// 版本映射配置
const versionMap = {
  'maimai': 'maimai',
  'maimai PLUS': 'maimai+',
  'maimai GreeN': 'Green',
  'maimai GreeN PLUS': 'Green+',
  'maimai ORANGE': 'Orange',
  'maimai ORANGE PLUS': 'Orange+',
  'maimai PiNK': 'Pink',
  'maimai PiNK PLUS': 'Pink+',
  'maimai MURASAKi': 'Murasaki',
  'maimai MURASAKi PLUS': 'Murasaki+',
  'maimai MiLK': 'Milk',
  'MiLK PLUS': 'Milk+',
  'maimai FiNALE': 'Finale',
  'maimai でらっくす': '舞萌DX2020',
  'maimai でらっくす Splash': '舞萌DX2021',
  'maimai でらっくす UNiVERSE': '舞萌DX2022',
  'maimai でらっくす FESTiVAL': '舞萌DX2023',
  'maimai でらっくす BUDDiES': '舞萌DX2024'
}

// 添加格式化版本名称的方法
const formatVersion = (version) => {
  return versionMap[version] || version || '未知版本'
}

// 获取note数量的方法
const getNoteCount = (index) => {
  const chart = songData.value?.charts[currentDiffIndex.value]
  // 如果没有chart数据，返回0
  if (!chart) return 0
  // 对于TOUCH类型（index === 4），如果没有数据则返回0
  if (index === 4) {
    return chart?.notes[index] || 0
  }
  // 其他类型正常返回，如果没有数据返回0
  return chart?.notes[index] ?? 0
}

// 如果需要获取当前难度的谱面信息
const currentChart = computed(() => {
  if (dataLoading.value) return { notes: [0, 0, 0, 0, 0], charter: '-' }
  
  const chart = songData.value?.charts[currentDiffIndex.value]
  if (!chart) {
    return {
      notes: [0, 0, 0, 0, 0], // 确保始终有5个值
      charter: '-'
    }
  }
  // 如果notes数组长度不足5，补充到5个元素
  const notes = [...(chart.notes || []), 0, 0, 0, 0, 0].slice(0, 5)
  return {
    notes,
    charter: chart.charter || '-'
  }
})

// 处理图片加载错误
const handleImageError = () => {
  console.error('封面图片加载失败')
}

// 获取当前歌曲的游玩记录 - 优化为函数而非计算属性
const loadPlayerRecord = () => {
  if (!songData.value?.id) {
    recordLoading.value = false
    return null
  }
  
  setTimeout(() => {
    try {
      const record = playerRecordService.getRecordBySongIdAndLevel(
        songData.value.id,
        currentDiffIndex.value
      )
      playerRecord.value = record
      recordLoading.value = false
    } catch (err) {
      console.error('获取玩家记录出错:', err)
      recordLoading.value = false
    }
  }, 100)
}

// 当前记录的计算属性
const currentRecord = computed(() => {
  return playerRecord.value
})

// 修改格式化方法，添加空值处理
const formatCombo = (fc) => fc ? fc.replace('app', 'ap+').replace('ap', 'ap').replace('fcp', 'fc+').toUpperCase() : ''
const formatFS = (fs) => fs ? fs.replace('p', '+').toUpperCase(): ''
const formatRate = (rate) => rate ? (rate.endsWith('p') ? rate.slice(0, -1) + '+' : rate) : ''

// 修改样式类方法，添加空值处理
const getAchievementClass = (achievement) => {
  if (!achievement) return 'normal'
  if (achievement >= 100.5) return 'sssp'
  if (achievement >= 100.0) return 'sss'
  if (achievement >= 99.5) return 'ssp'
  if (achievement >= 99.0) return 'ss'
  if (achievement >= 98.0) return 'sp'
  if (achievement >= 97.0) return 's'
  return 'normal'
}

const getRatingClass = (ra) => {
  if (!ra) return 'default'
  if (ra >= 15000) return 'rainbow'
  if (ra >= 14500) return 'bright-gold'
  if (ra >= 14000) return 'gold'
  if (ra >= 13000) return 'blue'
  if (ra >= 12000) return 'copper'
  return 'default'
}

// 从本地缓存获取谱面统计数据 - 改为异步
const getLocalChartStats = () => {
  return new Promise((resolve) => {
    try {
      const chartStats = uni.getStorageSync('chartStats')
      if (!chartStats) {
        console.log('本地无谱面统计数据')
        resolve(null)
      } else {
        resolve(chartStats)
      }
    } catch (err) {
      console.error('获取本地谱面统计数据失败:', err)
      resolve(null)
    }
  })
}

// 更新谱面统计数据 - 改为异步延迟加载
const updateChartStats = () => {
  statsLoading.value = true
  
  setTimeout(async () => {
    try {
      if (!songData.value?.id || currentDiffIndex.value === undefined || songData.value.id === "0") {
        fitDiff.value = null
        avgAchievement.value = null
        statsLoading.value = false
        return
      }

      const chartStats = await getLocalChartStats()
      if (chartStats?.charts) {
        const songStats = chartStats.charts[songData.value.id]
        if (songStats) {
          const diffStats = songStats[currentDiffIndex.value]
          if (diffStats) {
            fitDiff.value = diffStats.fit_diff
            avgAchievement.value = diffStats.avg
          } else {
            fitDiff.value = null
            avgAchievement.value = null
          }
        }
      }
      
      // 加载玩家记录
      loadPlayerRecord()
      
    } catch (err) {
      console.error('更新谱面统计数据失败:', err)
      fitDiff.value = null
      avgAchievement.value = null
    } finally {
      statsLoading.value = false
    }
  }, 150)
}

// 计算属性：获取歌曲别名
const songAliases = computed(() => {
  if (!songSearcher.value || !songData.value?.id) {
    return []
  }
  
  try {
    const result = songSearcher.value.getAliasInfo(songData.value.id)
    return result ? result.alias : []
  } catch (err) {
    console.error('获取别名出错:', err)
    return []
  }
})

// 计算属性：是否有别名
const hasAliases = computed(() => {
  return songAliases.value && songAliases.value.length > 0
})

// 别名相关
const showAliasDialog = () => {
  // 确保别名数据已经加载
  if (!songSearcher.value) {
    const aliasData = uni.getStorageSync('aliasData')
    if (aliasData) {
      songSearcher.value = new SongSearcher(aliasData)
    } else {
      uni.showToast({
        title: '别名数据加载失败',
        icon: 'none'
      })
      return
    }
  }
  
  // 优化：延迟打开弹窗，避免UI阻塞
  setTimeout(() => {
    if (popup.value) {
      popup.value.open()
    }
  }, 50)
}

// 关闭别名弹窗
const closeAliasDialog = () => {
  if (popup.value) {
    popup.value.close()
  }
}

// 优化加载过程：分离页面结构加载和数据加载
const initializeBasicData = async () => {
  // 先设置加载状态
  pageLoaded.value = false
  dataLoading.value = true
  statsLoading.value = true
  recordLoading.value = true
  
  // 快速返回以显示页面结构
  pageLoaded.value = true
  
  // 利用 setTimeout 使初始化不阻塞渲染
  setTimeout(async () => {
    try {
      // 分批加载数据
      const musicList = uni.getStorageSync('musicData')
      songService.value = new SongService(musicList)
      
      // 再加载额外数据
      setTimeout(async () => {
        try {
          const aliasData = uni.getStorageSync('aliasData')
          const recordData = uni.getStorageSync('divingFish_records')
          
          if (aliasData) {
            songSearcher.value = new SongSearcher(aliasData)
          }
          
          playerRecordService.initPlayerData(recordData)
          
          // 加载歌曲数据
          if (song.value) {
            changeSongValue({ detail: { value: song.value } })
          } else {
            const initialSong = songService.value.getSongById('8')
            if (initialSong) {
              songData.value = initialSong
              dataLoading.value = false
              await nextTick()
              updateChartStats()
            } else {
              songData.value = {...defaultSongData}
              dataLoading.value = false
            }
          }
        } catch (error) {
          console.error('加载额外数据失败:', error)
          dataLoading.value = false
        }
      }, 200)
    } catch (error) {
      console.error('初始化失败:', error)
      songData.value = {...defaultSongData}
      dataLoading.value = false
    }
  }, 50)
}

// 添加页面参数处理
onLoad(async (options) => {
  song.value = options.songId
  console.log('传入歌曲ID:',song.value)
  // 如果有难度索引参数，更新当前选中的难度
  if (options.difficulty !== undefined) {
    const difficultyIndex = Number(options.difficulty)
    // 确保难度索引在有效范围内
    if (!isNaN(difficultyIndex) && difficultyIndex >= 0 && difficultyIndex <= 4) {
      currentDiffIndex.value = difficultyIndex
      console.log('设置难度索引为:', difficultyIndex)
    }
  }
  // 确保初始化搜索器
  const aliasData = uni.getStorageSync('aliasData')
  if (aliasData) {
    songSearcher.value = new SongSearcher(aliasData)
  }
  
  // 其他初始化逻辑...
  initializeBasicData()
})

// 只在需要时更新数据
watch(
  [currentDiffIndex],
  ([newDiff], [oldDiff]) => {
    if (newDiff !== oldDiff && !dataLoading.value) {
      statsLoading.value = true
      recordLoading.value = true
      setTimeout(() => {
        updateChartStats()
      }, 50)
    }
  },
  { immediate: false }
)

// 轻量化 onMounted
onMounted(() => {
  console.log('组件挂载')
})

// 添加复制标题功能
const copyTitle = () => {
  if (songData.value?.title) {
    uni.setClipboardData({
      data: songData.value.title,
      success: () => {
        uni.showToast({
          title: '歌名已复制到剪贴板',
          icon: 'none',
          position: 'bottom'
        })
      }
    })
  }
}
const copyCharter = (charter) => {
  if (charter) {
    uni.setClipboardData({
      data: charter,
      success: () => {
        uni.showToast({
          title: '谱师名已复制到剪贴板',
          icon: 'none',
          position: 'bottom'
        })
      }
    })
  }
}

// 修改 navToBiliBili 函数
function navToBiliBili(keyword) {
  // 显示加载弹窗
  uni.showLoading({
    title: '正在跳转B站...',
    mask: true
  });
  
  // 设置超时自动关闭
  const timeout = setTimeout(() => {
    uni.hideLoading();
  }, 10000);

  // 使用 uni-app 的页面生命周期来处理隐藏和显示
  const hideCallback = () => {
    // 页面隐藏时不关闭loading
    clearTimeout(timeout);
  };

  const showCallback = () => {
    // 页面再次显示时关闭loading
    uni.hideLoading();
    // 清除事件监听
    uni.$off('page-show', showCallback);
    uni.$off('page-hide', hideCallback);
  };

  // 注册页面隐藏和显示的监听
  uni.$once('page-hide', hideCallback);
  uni.$once('page-show', showCallback);
  
  // 跳转到B站，并处理用户取消的情况
  openBiliSearch(keyword, {
    showError: true,
    useWebFallback: true
  }).then(result => {
    // 如果用户取消了跳转（result为false），关闭加载框
    if (!result) {
      uni.hideLoading();
      clearTimeout(timeout);
      uni.$off('page-show', showCallback);
      uni.$off('page-hide', hideCallback);
    }
  });
}

// 在页面的生命周期钩子中
onHide(() => {
  uni.$emit('page-hide');
});

onShow(() => {
  uni.$emit('page-show');
});

// 添加复制ID功能
const copyId = () => {
  if (songData.value?.id) {
    uni.setClipboardData({
      data: songData.value.id,
      success: () => {
        uni.showToast({
          title: '歌曲ID已复制到剪贴板',
          icon: 'none',
          position: 'bottom'
        })
      }
    })
  }
}

// 获取连击样式类
const getComboClass = (fc) => {
  if (!fc) return '';
  if (fc.includes('ap')) return 'ap-combo';
  if (fc.includes('fc')) return 'fc-combo';
  return '';
};

// 获取同步样式类
const getSyncClass = (fs) => {
  if (!fs) return '';
  if (fs.includes('fsd')) return 'fsd-sync';
  if (fs.includes('fs') || fs === 'sync') return 'fs-sync';
  return '';
};

// 添加复制艺术家名称功能
const copyArtist = () => {
  if (songData.value?.basic_info?.artist) {
    uni.setClipboardData({
      data: songData.value.basic_info.artist,
      success: () => {
        uni.showToast({
          title: '曲师名已复制到剪贴板',
          icon: 'none',
          position: 'bottom'
        })
      }
    })
  }
}

// 收藏相关的状态
const favoritePopupRef = ref(null)
const favoriteFolders = ref([])
const isFavorite = ref(false)
const showingNewFolderInput = ref(false)
const newFolderName = ref('')

// 显示收藏弹窗 - 优化加载逻辑
const showFavoriteDialog = () => {
  // 显示加载提示
  uni.showLoading({
    title: '加载中...',
    mask: true
  })
  
  // 使用setTimeout将耗时操作放入下一个事件循环
  setTimeout(() => {
    try {
      loadFavoriteFolders()
      checkIfFavorite()
      
      // 如果没有收藏夹，创建一个默认收藏夹
      if (favoriteFolders.value.length === 0) {
        createDefaultFolder()
      }
      
      // 隐藏加载提示
      uni.hideLoading()
      
      // 打开弹窗
      nextTick(() => {
        if (favoritePopupRef.value) {
          favoritePopupRef.value.open('center')
        }
      })
    } catch (e) {
      console.error('加载收藏夹失败:', e)
      uni.hideLoading()
      uni.showToast({
        title: '加载收藏夹失败',
        icon: 'none'
      })
    }
  }, 50)
}

// 创建默认收藏夹
const createDefaultFolder = () => {
  try {
    const defaultFolder = {
      id: 'default-' + Date.now().toString(),
      name: '默认收藏夹',
      count: 0
    }
    
    // 保存到本地存储
    const folders = [defaultFolder]
    uni.setStorageSync('favoriteFolders', folders)
    
    // 确保收藏夹对应的歌曲列表存在
    const allFavorites = uni.getStorageSync('favorites') || {}
    if (!allFavorites[defaultFolder.id]) {
      allFavorites[defaultFolder.id] = []
      uni.setStorageSync('favorites', allFavorites)
    }
    
    // 更新当前页面的收藏夹列表
    favoriteFolders.value = folders
    
    console.log('已创建默认收藏夹')
  } catch (e) {
    console.error('创建默认收藏夹失败:', e)
  }
}

// 关闭收藏弹窗
const closeFavoriteDialog = () => {
  if (favoritePopupRef.value) {
    favoritePopupRef.value.close()
  }
  showingNewFolderInput.value = false
}

// 加载收藏夹列表 - 优化性能
const loadFavoriteFolders = () => {
  try {
    let folders = uni.getStorageSync('favoriteFolders') || []
    
    // 优化：限制最大显示数量，避免过多渲染
    if (folders.length > 50) {
      folders = folders.slice(0, 50)
    }
    
    // 更新每个收藏夹中的歌曲数量
    const allFavorites = uni.getStorageSync('favorites') || {}
    
    folders = folders.map(folder => ({
      ...folder,
      count: (allFavorites[folder.id] || []).length
    }))
    
    favoriteFolders.value = folders
  } catch (e) {
    console.error('加载收藏夹失败:', e)
    favoriteFolders.value = []
  }
}

// 检查当前歌曲是否已收藏
const checkIfFavorite = () => {
  if (!songData.value?.id) return;
  
  try {
    const allFavorites = uni.getStorageSync('favorites') || {};
    
    // 检查所有收藏夹中是否包含当前歌曲的当前难度
    for (const folderId in allFavorites) {
      const songList = allFavorites[folderId];
      const found = songList.some(item => 
        item.id === songData.value.id && item.difficulty === currentDiffIndex.value
      );
      
      if (found) {
        isFavorite.value = true;
        return;
      }
    }
    isFavorite.value = false;
  } catch (e) {
    console.error('检查收藏状态失败:', e);
    isFavorite.value = false;
  }
};

// 添加到收藏夹 - 优化性能
const addToFavorite = (folderId) => {
  if (!songData.value?.id) return
  
  // 显示加载提示

  
  // 使用setTimeout将耗时操作放入下一个事件循环
  setTimeout(() => {
    try {
      // 确保收藏夹存在
      let folders = uni.getStorageSync('favoriteFolders') || []
      
      if (folders.length === 0) {
        // 创建默认收藏夹
        const defaultFolder = {
          id: 'default-' + Date.now().toString(),
          name: '默认收藏夹',
          count: 0
        }
        
        folders.push(defaultFolder)
        uni.setStorageSync('favoriteFolders', folders)
        folderId = defaultFolder.id // 使用新创建的默认收藏夹
      }
      
      const allFavorites = uni.getStorageSync('favorites') || {}
      
      // 如果收藏夹不存在，创建一个新的
      if (!allFavorites[folderId]) {
        allFavorites[folderId] = []
      }
      
      // 构建收藏项，包含歌曲ID和难度索引
      const favoriteItem = {
        id: songData.value.id,
        difficulty: currentDiffIndex.value
      }
      
      // 检查是否已经收藏了当前难度
      const existingIndex = allFavorites[folderId].findIndex(item => 
        item.id === songData.value.id && item.difficulty === currentDiffIndex.value
      )
      
      if (existingIndex !== -1) {
        // 已存在当前难度，移除它（取消收藏）
        allFavorites[folderId].splice(existingIndex, 1)
        uni.hideLoading()
        uni.showToast({
          title: '已取消收藏',
          icon: 'none',
		  position:'bottom'
        })
      } else {
        // 添加到收藏夹
        allFavorites[folderId].push(favoriteItem)
        uni.hideLoading()
        uni.showToast({
          title: '收藏成功',
          icon: 'none',
		  position:'bottom'
        })
      }
      
      // 保存更新后的收藏
      uni.setStorageSync('favorites', allFavorites)
      
      // 立即更新收藏状态
      checkIfFavorite()
      
      // 更新收藏夹中的歌曲数量
      updateFolderCount()
      
      // 刷新收藏夹列表以更新选中状态
      nextTick(() => {
        loadFavoriteFolders()
      })
      
    } catch (e) {
      console.error('添加收藏失败:', e)
      uni.hideLoading()
      uni.showToast({
        title: '收藏失败',
        icon: 'none'
      })
    }
  }, 50)
}

// 显示新建收藏夹输入框
const showNewFolderInput = () => {
  showingNewFolderInput.value = true
  newFolderName.value = ''
}

// 隐藏新建收藏夹输入框
const hideNewFolderInput = () => {
  if (!newFolderName.value.trim()) {
    showingNewFolderInput.value = false
  }
}

// 创建新收藏夹
const createNewFolder = () => {
  if (!newFolderName.value.trim()) {
    uni.showToast({
      title: '请输入收藏夹名称',
      icon: 'none'
    })
    return
  }
  
  try {
    const folders = uni.getStorageSync('favoriteFolders') || []
    
    // 生成唯一ID
    const newId = Date.now().toString()
    
    // 添加新收藏夹
    folders.push({
      id: newId,
      name: newFolderName.value.trim(),
      count: 0
    })
    
    // 保存收藏夹列表
    uni.setStorageSync('favoriteFolders', folders)
    
    // 刷新列表
    favoriteFolders.value = folders
    
    // 重置输入框
    newFolderName.value = ''
    showingNewFolderInput.value = false
    
    uni.showToast({
      title: '创建成功',
      icon: 'success'
    })
  } catch (e) {
    console.error('创建收藏夹失败:', e)
    uni.showToast({
      title: '创建失败',
      icon: 'none'
    })
  }
}

// 更新收藏夹中的歌曲数量
const updateFolderCount = () => {
  try {
    const allFavorites = uni.getStorageSync('favorites') || {};
    const folders = uni.getStorageSync('favoriteFolders') || [];
    
    const updatedFolders = folders.map(folder => ({
      ...folder,
      count: (allFavorites[folder.id] || []).length
    }));
    
    uni.setStorageSync('favoriteFolders', updatedFolders);
  } catch (e) {
    console.error('更新收藏夹数量失败:', e);
  }
};

// 在页面加载时检查收藏状态
onMounted(() => {
  // 其他初始化代码...
  checkIfFavorite()
})

// 在歌曲数据更新时检查收藏状态
watch(() => songData.value?.id, () => {
  checkIfFavorite()
})

// 监听难度变化，更新收藏状态
watch(currentDiffIndex, () => {
  checkIfFavorite();
});

// 检查歌曲是否在特定收藏夹中
const isSongInFolder = (folderId) => {
  if (!songData.value?.id) return false;
  
  try {
    const allFavorites = uni.getStorageSync('favorites') || {};
    const songList = allFavorites[folderId] || [];
    
    return songList.some(item => 
      item.id === songData.value.id && item.difficulty === currentDiffIndex.value
    );
  } catch (e) {
    console.error('检查收藏状态失败:', e);
    return false;
  }
};

// 在 script 部分添加 formatGenre 方法
const formatGenre = (genre) => {
  if (!genre) return '-'
  
  // 处理 niconico & VOCALOID 相关显示
  if (genre === 'niconicoボーカロイド' || genre === 'niconico & VOCALOID') {
    return 'nico & vocal'
  }
  
  // 遍历 genreMapping 查找对应的中文显示
  for (const [zhName, jpNames] of Object.entries(genreMapping)) {
    if (jpNames.includes(genre)) {
      return zhName
    }
  }
  
  return genre
}

// 添加完整的类别映射
const genreMapping = {
  'niconico & VOCALOID': ['niconico & VOCALOID', 'niconicoボーカロイド'],
  '流行&动漫': ['流行&动漫', 'POPSアニメ'],
  '舞萌': ['舞萌', 'maimai'],
  '音击&中二节奏': ['音击&中二节奏', 'オンゲキCHUNITHM'],
  '东方Project': ['东方Project', '東方Project'],
  '其他游戏': ['其他游戏', 'ゲームバラエティ'],
}
</script>

<style lang="scss">
.container {
  padding: 30rpx;
  min-height: 100vh;
  box-sizing: border-box;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
 
  &.basic {
    background: linear-gradient(135deg, rgba(46, 213, 115, 0.15) 0%, #f8f8f8 100%);
  }
  &.advanced {
    background: linear-gradient(135deg, rgba(255, 159, 26, 0.15) 0%, #f8f8f8 100%);
  }
  &.expert {
    background: linear-gradient(135deg, rgba(255, 71, 87, 0.15) 0%, #f8f8f8 100%);
  }
  &.master {
    background: linear-gradient(135deg, rgba(156, 136, 255, 0.15) 0%, #f8f8f8 100%);
  }
  &.remaster {
    background: linear-gradient(135deg, rgba(224, 163, 255, 0.15) 0%, #f8f8f8 100%);
  }
}

// 添加骨架屏样式
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  color: transparent !important;
  border-radius: 4rpx;
  min-width: 100rpx;
  min-height: 1.2em;
}

.skeleton-text {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  color: transparent !important;
  border-radius: 4rpx;
}

.skeleton-tab {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%) !important;
  background-size: 200% 100% !important;
  animation: skeleton-loading 1.5s infinite !important;
  color: transparent !important;
  min-height: 80rpx !important;
}

.skeleton-card {
  background: linear-gradient(90deg, rgba(240, 240, 240, 0.5) 25%, rgba(224, 224, 224, 0.5) 50%, rgba(240, 240, 240, 0.5) 75%) !important;
  background-size: 200% 100% !important;
  animation: skeleton-loading 1.5s infinite !important;
  
  .note-type, .note-count {
    color: transparent !important;
  }
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.song-card {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  padding: 30rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  border: 6rpx solid transparent;
  transition: all 0.3s ease;
  
  // 不同难度的边框和背景色
  &.basic {
    border-color: #2ed573;
    background: linear-gradient(135deg, rgba(46, 213, 115, 0.35), rgba(46, 213, 115, 0.1));
    .title-decoration { background: linear-gradient(90deg, #2ed573, #7bed9f); }
    .cover-container { border-color: #2ed573; }
    .label-decoration { background: linear-gradient(90deg, #2ed573, #7bed9f); }
  }
  &.advanced {
    border-color: #ff9f1a;
    background: linear-gradient(135deg, rgba(255, 159, 26, 0.35), rgba(255, 159, 26, 0.1));
    .title-decoration { background: linear-gradient(90deg, #ff9f1a, #feca57); }
    .cover-container { border-color: #ff9f1a; }
    .label-decoration { background: linear-gradient(90deg, #ff9f1a, #feca57); }
  }
  &.expert {
    border-color: #ff4757;
    background: linear-gradient(135deg, rgba(255, 71, 87, 0.35), rgba(255, 71, 87, 0.1));
    .title-decoration { background: linear-gradient(90deg, #ff4757, #ff6b81); }
    .cover-container { border-color: #ff4757; }
    .label-decoration { background: linear-gradient(90deg, #ff4757, #ff6b81); }
  }
  &.master {
    border-color: #9c88ff;
    background: linear-gradient(135deg, rgba(156, 136, 255, 0.35), rgba(156, 136, 255, 0.1));
    .title-decoration { background: linear-gradient(90deg, #9c88ff, #c4b5fd); }
    .cover-container { border-color: #9c88ff; }
    .label-decoration { background: linear-gradient(90deg, #9c88ff, #c4b5fd); }
  }
  &.remaster {
    border-color: #e0a3ff;
    background: linear-gradient(135deg, rgba(224, 163, 255, 0.35), rgba(224, 163, 255, 0.1));
    .title-decoration { background: linear-gradient(90deg, #e0a3ff, #f0d0ff); }
    .cover-container { border-color: #e0a3ff; }
    .label-decoration { background: linear-gradient(90deg, #e0a3ff, #f0d0ff); }
  }

  .song-id {
    position: absolute;
    top: -24rpx;
    left: -290rpx;
    font-size: 28rpx;
    // color: #94a3b8;
    font-weight: 500;
    z-index: 2;
    padding: 4rpx 12rpx;
    border-radius: 6rpx;
    // background: rgba(255, 255, 255, 0.9);
    // box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  }
}

.difficulty-switcher {
  display: flex;
  margin-bottom: 30rpx;
  gap: 10rpx;
  justify-content: space-around;
  flex-wrap: nowrap;
  
  .difficulty-tab {
    flex: 1;
    min-width: 0;
    padding: 20rpx 8rpx;
    text-align: center;
    border-radius: 8rpx;
    background: rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
    white-space: nowrap;
    border: 2rpx solid #94a3b8;
    color: #64748b;
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    text {
      font-size: 24rpx;
      line-height: 1.2;
      display: block;
      width: 100%;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .level {
      font-size: 22rpx;
      margin-top: 2rpx;
    }
    
    &:not(.active) {
      opacity: 0.8;
      &:hover {
        opacity: 1;
        transform: translateY(-2rpx);
      }
    }
    
    &.active {
      font-weight: bold;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
      transform: translateY(-2rpx);
      
      &.basic {
        background: linear-gradient(135deg, #2ed573, #7bed9f);
        border-color: #2ed573;
        color: white;
      }
      
      &.advanced {
        background: linear-gradient(135deg, #ff9f1a, #feca57);
        border-color: #ff9f1a;
        color: white;
      }
      
      &.expert {
        background: linear-gradient(135deg, #ff4757, #ff6b81);
        border-color: #ff4757;
        color: white;
      }
      
      &.master {
        background: linear-gradient(135deg, #9c88ff, #c4b5fd);
        border-color: #9c88ff;
        color: white;
      }
      
      &.remaster {
        background: linear-gradient(135deg, #e0a3ff, #f0d0ff);
        border-color: #e0a3ff;
        color: white;
      }
    }
  }
}



// 修改所有标签装饰的颜色
.song-card {
  &.basic .label-decoration { background: #37a03b; }
  &.advanced .label-decoration { background: #e6a23c; }
  &.expert .label-decoration { background: #e83c3c; }
  &.master .label-decoration { background: #b264bf; }
  &.remaster .label-decoration { background: rgb(170, 81, 196); }
   &.basic {
      .basic-info {
        .label { color: rgba(55, 160, 59, 0.8); }
        .value { color: #37a03b; }
      }
    }
    
    &.advanced {
      .basic-info {
        .label { color: rgba(230, 162, 60, 0.8); }
        .value { color: #e6a23c; }
      }
    }
    
    &.expert {
      .basic-info {
        .label { color: rgba(232, 60, 60, 0.8); }
        .value { color: #e83c3c; }
      }
    }
    
    &.master {
      .basic-info {
        .label { color: rgba(156, 81, 182, 0.8); }
        .value { color: #9c51b6; }
      }
    }
    
    &.remaster {
      .basic-info {
        .label { color: rgba(224, 163, 255, 0.8); }
        .value { color: #e0a3ff; }
      }
    }
}





.alias-popup {
  width: 600rpx;
  max-width: 90vw;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  will-change: transform; /* 提示浏览器这个元素会有变换 */
  transform: translateZ(0); /* 启用GPU加速 */
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 26rpx 30rpx;
    border-bottom: 2rpx solid #f0f0f0;
    background-color: #f9f9f9;
    
    .title {
      font-size: 34rpx;
      font-weight: bold;
      color: #333;
    }
    
    .close-btn {
      font-size: 40rpx;
      color: #999;
      padding: 10rpx;
    }
  }

  .alias-list {
    max-height: 60vh;
    overflow-y: auto;
    padding: 20rpx 30rpx;
    
    .alias-item {
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      font-size: 28rpx;
      color: #333;
    }
    
    .no-alias {
      padding: 40rpx 0;
      text-align: center;
      color: #999;
      font-size: 28rpx;
    }
  }
}

.info-row {
  .info-pair {
    .alias-link {
      margin-left: 10rpx;
      color: #3b82f6;
      font-size: 24rpx;
      cursor: pointer;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.record-tools-container {
  display: flex;
  align-items: center;
  gap: 10rpx;
  
  .player-record {
    flex: 1;
    margin-top: 30rpx;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12rpx;
    padding: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(10px);
    border: 1rpx solid rgba(255, 255, 255, 0.2);
  }
  
  .tools-section {
    margin-top: 30rpx;

    max-width: 180rpx;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.0);
    .tools-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10rpx;
      padding: 10rpx;
      
      border-radius: 12rpx;
      background: rgba(255, 255, 255, 0.0);
      backdrop-filter: blur(10px);
     
      
      .tool-btn {
        min-height: 80rpx;
        min-width: 120rpx;
        width: 100%;
        line-height: 36rpx;
        text-align: center;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 6rpx;
        font-size: 28rpx;
        border-radius: 16rpx;
        font-weight: bold;
        padding-top: 40rpx;
        padding-bottom: 40rpx;       
        padding-left: 12rpx;
        padding-right: 12rpx;
        box-shadow: 4rpx 4rpx 12rpx rgba(0, 0, 0, 0.09);

        box-sizing: border-box;
        &:active {
          transform: translateY(2rpx);
          box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.05);
        }
        
        &.basic { 
          color: white;
          border: 2rpx solid #2ed573;
          border-color: #2ed573;
          background: linear-gradient(135deg, #2ed573, #7bed9f);
        }
        &.advanced { 
          color: white;
          border: 2rpx solid #ff9f1a;
          border-color: #ff9f1a;
          background: linear-gradient(135deg, #ff9f1a, #feca57);
        }
        &.expert { 
          color: white;
          border: 2rpx solid #ff4757;
          border-color: #ff4757;
          background: linear-gradient(135deg, #ff4757, #ff6b81);
        }
        &.master { 
          color: white;
          border: 2rpx solid #9c88ff;
          border-color: #9c88ff;
          background: linear-gradient(135deg, #9c88ff, #a99ae7);
        }
        &.remaster { 
          color: white;
          border: 2rpx solid #e0a3ff; 
          border-color: #e0a3ff;
          background: linear-gradient(135deg, #e0a3ff, #f0d0ff);
        }
        
        .iconfont {
          margin-right: 4rpx;
        }
      }
    }
  }
}

.title-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
  position: relative;
  
  .title-decoration {
    width: 8rpx;
    height: 36rpx;
    margin-right: 16rpx;
    border-radius: 4rpx;
    transition: background 0.3s ease;
  }
}

.label-wrapper {
  display: flex;
  align-items: center;
  
  .label-decoration {
    width: 6rpx;
    height: 24rpx;
    margin-right: 12rpx;
    border-radius: 3rpx;
    background: currentColor;
    opacity: 0.6;
    transition: background 0.3s ease;
  }
}



.song-header {
  display: flex;
  margin-bottom: 40rpx;
  padding-top: 20rpx;
  
  .cover-container {
    position: relative;
    width: 240rpx;
    height: 240rpx;
    margin-right: 30rpx;
    margin-top: 20rpx;
    border-radius: 16rpx;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
    border: 6rpx solid transparent;
    transition: all 0.3s ease;
    
    .song-cover {
      width: 100%;
      height: 100%;
      background-color: #f0f0f0;
      object-fit: cover;
      transition: transform 0.3s ease;
      
      &:hover {
        transform: scale(1.05);
      }
    }
    
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      
      text {
        color: #fff;
        font-size: 24rpx;
      }
    }
  }
  
  .song-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .title-row {
      display: flex;
      align-items: center;
      margin-bottom: 10rpx;
      max-width: 370rpx;
      .song-title {
        font-size: 36rpx;
        font-weight: bold;
        margin-right: 16rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%; /* 限制最大宽度 */
		display: inline-block; /* 确保省略号生效 */
	
      }
      
      .song-id {
        font-size: 28rpx;
        color: #666;
      }
    }
  }
}

.song-card {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  padding: 30rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  border: 6rpx solid transparent;
  transition: all 0.3s ease;
  
  // 不同难度的边框和背景色
  &.basic {
    border-color: #2ed573;
    background: linear-gradient(135deg, rgba(46, 213, 115, 0.35), rgba(46, 213, 115, 0.1));
    .title-decoration { background: linear-gradient(90deg, #2ed573, #7bed9f); }
    .cover-container { border-color: #2ed573; }
    .label-decoration { background: linear-gradient(90deg, #2ed573, #7bed9f); }
  }
  &.advanced {
    border-color: #ff9f1a;
    background: linear-gradient(135deg, rgba(255, 159, 26, 0.35), rgba(255, 159, 26, 0.1));
    .title-decoration { background: linear-gradient(90deg, #ff9f1a, #feca57); }
    .cover-container { border-color: #ff9f1a; }
    .label-decoration { background: linear-gradient(90deg, #ff9f1a, #feca57); }
  }
  &.expert {
    border-color: #ff4757;
    background: linear-gradient(135deg, rgba(255, 71, 87, 0.35), rgba(255, 71, 87, 0.1));
    .title-decoration { background: linear-gradient(90deg, #ff4757, #ff6b81); }
    .cover-container { border-color: #ff4757; }
    .label-decoration { background: linear-gradient(90deg, #ff4757, #ff6b81); }
  }
  &.master {
    border-color: #9c88ff;
    background: linear-gradient(135deg, rgba(156, 136, 255, 0.35), rgba(156, 136, 255, 0.1));
    .title-decoration { background: linear-gradient(90deg, #9c88ff, #c4b5fd); }
    .cover-container { border-color: #9c88ff; }
    .label-decoration { background: linear-gradient(90deg, #9c88ff, #c4b5fd); }
  }
  &.remaster {
    border-color: #e0a3ff;
    background: linear-gradient(135deg, rgba(224, 163, 255, 0.35), rgba(224, 163, 255, 0.1));
    .title-decoration { background: linear-gradient(90deg, #e0a3ff, #f0d0ff); }
    .cover-container { border-color: #e0a3ff; }
    .label-decoration { background: linear-gradient(90deg, #e0a3ff, #f0d0ff); }
  }

  .song-id {
    position: absolute;
    top: -24rpx;
    left: -290rpx;
    font-size: 28rpx;
    // color: #94a3b8;
    font-weight: 500;
    z-index: 2;
    padding: 4rpx 12rpx;
    border-radius: 6rpx;
    // background: rgba(255, 255, 255, 0.9);
    // box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  }
}

.difficulty-switcher {
  display: flex;
  margin-bottom: 30rpx;
  gap: 10rpx;
  justify-content: space-around;
  flex-wrap: nowrap;
  
  .difficulty-tab {
    flex: 1;
    min-width: 0;
    padding: 20rpx 8rpx;
    text-align: center;
    border-radius: 8rpx;
    background: rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
    white-space: nowrap;
    border: 2rpx solid #94a3b8;
    color: #64748b;
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    text {
      font-size: 24rpx;
      line-height: 1.2;
      display: block;
      width: 100%;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .level {
      font-size: 22rpx;
      margin-top: 2rpx;
    }
    
    &:not(.active) {
      opacity: 0.8;
      &:hover {
        opacity: 1;
        transform: translateY(-2rpx);
      }
    }
    
    &.active {
      font-weight: bold;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
      transform: translateY(-2rpx);
      
      &.basic {
        background: linear-gradient(135deg, #2ed573, #7bed9f);
        border-color: #2ed573;
        color: white;
      }
      
      &.advanced {
        background: linear-gradient(135deg, #ff9f1a, #feca57);
        border-color: #ff9f1a;
        color: white;
      }
      
      &.expert {
        background: linear-gradient(135deg, #ff4757, #ff6b81);
        border-color: #ff4757;
        color: white;
      }
      
      &.master {
        background: linear-gradient(135deg, #9c88ff, #c4b5fd);
        border-color: #9c88ff;
        color: white;
      }
      
      &.remaster {
        background: linear-gradient(135deg, #e0a3ff, #f0d0ff);
        border-color: #e0a3ff;
        color: white;
      }
    }
  }
}

.difficulty-details {
  padding: 30rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
  
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap:30rpx;
  font-size: 28rpx;
  grid-template-areas: 
    "info-row chart-info"
    "notes-info notes-info";
  
  &.basic {
    border-color: #2ed573;
    background: linear-gradient(to bottom, rgba(46, 213, 115, 0.2), rgba(46, 213, 115, 0.35));
    
    .info-pair {
      .label { color: rgba(46, 213, 115, 0.9); }
      .value { color: #2ed573; }
    }
    
    .note-item {
      border: 1px solid rgba(46, 213, 115, 0.2);
      .note-type { color: rgba(46, 213, 115, 0.8); }
      .note-count { color: #2ed573; }
    }
  }
  
  &.advanced {
    border-color: #ff9f1a;
    background: linear-gradient(to bottom, rgba(255, 159, 26, 0.2), rgba(255, 159, 26, 0.35));
    
    .info-pair {
      .label { color: rgba(255, 159, 26, 0.9); }
      .value { color: #ff9f1a; }
    }
    
    .note-item {
      border: 1px solid rgba(255, 159, 26, 0.2);
      .note-type { color: rgba(255, 159, 26, 0.8); }
      .note-count { color: #ff9f1a; }
    }
  }
  
  &.expert {
    border-color: #ff4757;
    background: linear-gradient(to bottom, rgba(255, 71, 87, 0.2), rgba(255, 71, 87, 0.35));
    
    .info-pair {
      .label { color: rgba(255, 71, 87, 0.9); }
      .value { color: #ff4757; }
    }
    
    .note-item {
      border: 1px solid rgba(255, 71, 87, 0.2);
      .note-type { color: rgba(255, 71, 87, 0.8); }
      .note-count { color: #ff4757; }
    }
  }
  
  &.master {
    border-color: #9c88ff;
    background: linear-gradient(to bottom, rgba(156, 136, 255, 0.2), rgba(156, 136, 255, 0.35));
    
    .info-pair {
      .label { color: rgba(156, 136, 255, 0.9); }
      .value { color: #9c88ff; }
    }
    
    .note-item {
      border: 1px solid rgba(156, 136, 255, 0.2);
      .note-type { color: rgba(156, 136, 255, 0.8); }
      .note-count { color: #9c88ff; }
    }
  }
  
  &.remaster {
    border-color: #e0a3ff;
    background: linear-gradient(to bottom, rgba(224, 163, 255, 0.2), rgba(224, 163, 255, 0.35));
    
    .info-pair {
      .label { color: rgba(224, 163, 255, 0.9); }
      .value { color: #e0a3ff; }
    }
    
    .note-item {
      border: 1px solid rgba(224, 163, 255, 0.2);
      .note-type { color: rgba(224, 163, 255, 0.8); }
      .note-count { color: #e0a3ff; }
    }
  }

  .info-row {
    grid-area: info-row;
    display: flex;
    flex-direction: column;
    margin-bottom: 20rpx;
    
    .info-pair {
     // display: flex;
     // align-items: flex-start;
      
 

      .label {
        font-size: 28rpx;
        font-weight: 600;
        margin-right: 10rpx;
        white-space: nowrap;
      }
      
      .value {
        font-size: 32rpx;
        font-weight: 700;
      }
    }
  }

  .chart-info {
    grid-area: chart-info;
    display: flex;
    flex-direction: column;
    margin-bottom: 20rpx;
    
    .info-pair {
     // display: flex;
     // align-items: flex-start;
      
 

      .label {
        font-size: 28rpx;
        font-weight: 1000;
        margin-right: 10rpx;
        white-space: nowrap;
      }
      
      .value {
        font-size: 32rpx;
        font-weight: 700;
      }
    }
  }

  .notes-info {
    grid-area: notes-info;
    width: 100%;
  }

  .notes-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6rpx;

    margin-top: -45rpx;
    
    .note-item {
      text-align: center;
      padding: 16rpx 0rpx;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 8rpx;
      backdrop-filter: blur(4px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 6rpx;
      min-height: 100rpx;
      min-width: 0;
      width: 100%;
      box-sizing: border-box;
      transition: all 0.3s ease;
      
      .note-type {
        font-size: 24rpx;
        font-weight: 500;
        line-height: 1.4;
      }
      
      .note-count {
        font-size: 32rpx;
        font-weight: 700;
        line-height: 1.4;
      }
    }
  }
}

.basic-info {
  margin-top: 0rpx;
  padding: 28rpx;
  max-height: 150rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12rpx;
  max-width: 300rpx;
  .info-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 8rpx;
    
    .label-wrapper {
      display: flex;
      align-items: center;
      min-width: 100rpx;
      
      .label {
        font-size: 26rpx;
        white-space: nowrap;
      }
    }
    
    .value {
      flex: 1;
      font-size: 26rpx;
      padding-left: 8rpx;
      word-break: break-all;
      overflow-wrap: break-word;
      
      &.ellipsis {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 70%;
      }
      
      &.artist-name {
		
        white-space: wrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 70%; /* 限制最大宽度 */
        display: inline-block; /* 确保省略号生效 */
      }
    }
  }
}

// 修改所有标签装饰的颜色
.song-card {
  &.basic .label-decoration { background: #37a03b; }
  &.advanced .label-decoration { background: #e6a23c; }
  &.expert .label-decoration { background: #e83c3c; }
  &.master .label-decoration { background:#7a66d9; }
  &.remaster .label-decoration { background:#b06cd9; }
   &.basic {
      .basic-info {
        .label { color: rgba(55, 160, 59, 0.8); }
        .value { color: #37a03b; }
      }
    }
    
    &.advanced {
      .basic-info {
        .label { color: #d17800; }  // 加深颜色
      .value { color: #d17800; }  //
      }
    }
    
    &.expert {
      .basic-info {
        .label { color: rgba(232, 60, 60, 0.8); }
        .value { color: #e83c3c; }
      }
    }
    
    &.master {
      .basic-info {
        .label { color: #7a66d9; }  // 加深颜色
        .value { color: #7a66d9; }  
      }
    }
    
    &.remaster {
      .basic-info {
        .label { color: #b06cd9; }  // 加深颜色
        .value { color: #b06cd9; }  //
      }
    }
}

.player-record {
  margin-top: 30rpx;
  padding: 30rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  
  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
    
    .favorite-btn {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      
      .iconfont {
        font-size: 54rpx;
        color: #d6c9c9;
        background-color: white;
        border-radius: 50%;
        border: 1px solid #fae8e8;
        box-shadow: 0 0 5rpx rgba(0, 0, 0, 0.1);
        width: 48rpx;
        height: 48rpx;
        line-height: 48rpx;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        &.is-favorite {
          color: #ffcc00;
        }
      }
    }
  }
  
  .record-content {
    .achievement-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .achievement-value {
        font-size: 48rpx;
        font-weight: bold;
        
        &.sssp, &.sss {
          background: linear-gradient(45deg, 
            #ff4757,
            #ff7f50,
            #ffa502,
            #70a1ff,
            #7f50ff,
            #ff6b81
          );
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }
        
        &.ssp, &.ss, &.sp, &.s {
          background: linear-gradient(45deg, 
            #ffd700,
            #ffa500,
            #ffd700
          );
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }
      }
    }
    
    .record-details {
      display: flex;
      flex-direction: column;
      gap: 12rpx;
      
      .detail-item {
        display: flex;
        align-items: center;
        gap: 16rpx;
        
        .label {
          font-size: 26rpx;
          color: #666;
		  font-weight: 500;
        }
        
        .value {
          font-size: 28rpx;
          font-weight: 500;
          &.ra {
            &.rainbow { color: #ff4757; }
            &.bright-gold { color: #ffa502; }
            &.gold { color: #ffd700; }
            &.blue { color: #70a1ff; }
            &.copper { color: #cd7f32; }
          }
        }
      }
    }
  }
}

.combo-sync-container {
  display: flex;
  align-items: center;
  gap: 8rpx;
  
  .separator {
    color: #94a3b8;
    font-size: 24rpx;
  }
  
  .combo, .sync {
    padding: 4rpx 12rpx;
    border-radius: 6rpx;
    font-weight: 600;
  }
  
  .fc-combo {
    color: #10b981;
    background-color: rgba(16, 185, 129, 0.1);
  }
  
  .ap-combo {
    color: #f59e0b;
    background-color: rgba(245, 158, 11, 0.1);
  }
  
  .fs-sync {
    color: #3b82f6;
    background-color: rgba(59, 130, 246, 0.1);
  }
  
  .fsd-sync {
    color: #f59e0b;
    background-color: rgba(245, 158, 11, 0.1);
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
  
  .action-button {
    background: #f8f8f8;
    padding: 16rpx 30rpx;
    border-radius: 10rpx;
    font-size: 28rpx;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.95);
      opacity: 0.9;
    }
    
    .icon {
      font-size: 32rpx;
    }
    
    &.bilibili {
      background: linear-gradient(135deg, rgba(251, 114, 153, 0.1), rgba(255, 140, 170, 0.1));
      color: #fb7299;
      border: 1rpx solid rgba(251, 114, 153, 0.2);
      
      &:active {
        background: linear-gradient(135deg, rgba(251, 114, 153, 0.2), rgba(255, 140, 170, 0.2));
      }
    }
    
    &.alias {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(129, 140, 248, 0.1));
      color: #6366f1;
      border: 1rpx solid rgba(99, 102, 241, 0.2);
      
      &:active {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(129, 140, 248, 0.2));
      }
    }
  }
}

.info-row, .chart-info {
  .info-pair {
    display: flex;
    flex-direction: column;
    margin-bottom: 16rpx;
    
    .label {
      font-size: 28rpx;
      font-weight: 700;
      margin-bottom: 8rpx;
      color: rgba(0, 0, 0, 0.6);
      position: relative;
      padding-left: 16rpx;
      
      &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 8rpx;
        height: 24rpx;
        border-radius: 4rpx;
        background: currentColor;
        opacity: 0.8;
      }
    }
    
    .value {
      font-size: 32rpx;
      font-weight: 700;
      line-height: 1.4;
    }
  }
}

.difficulty-details {
  // ... 现有代码 ...
  
  .info-row, .chart-info {
    .info-pair {
      display: flex;
      flex-direction: column;
      margin-bottom: 16rpx;
      
      .label {
        font-size: 28rpx;
        font-weight: 700;
        margin-bottom: 8rpx;
        position: relative;
        padding-left: 16rpx;
        
        &:before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 8rpx;
          height: 24rpx;
          border-radius: 4rpx;
          background: currentColor;
          opacity: 0.9;
        }
      }
      
      .value {
        font-size: 32rpx;
        font-weight: 700;
        line-height: 1.4;
      }
    }
  }
  
  &.basic {
    // ... 现有代码 ...
    
    .info-pair {
      .label { color: #1a8c4b; }  // 加深颜色
      .value { color: #1a8c4b; }  // 加深颜色
    }
    
    .note-item {
      // ... 现有代码 ...
      .note-type { color: #1a8c4b; }  // 加深颜色
      .note-count { color: #1a8c4b; }  // 加深颜色
    }
  }
  
  &.advanced {
    // ... 现有代码 ...
    
    .info-pair {
      .label { color: #d17800; }  // 加深颜色
      .value { color: #d17800; }  // 加深颜色
    }
    
    .note-item {
      // ... 现有代码 ...
      .note-type { color: #d17800; }  // 加深颜色
      .note-count { color: #d17800; }  // 加深颜色
    }
  }
  
  &.expert {
    // ... 现有代码 ...
    
    .info-pair {
      .label { color: #d01c2d; }  // 加深颜色
      .value { color: #d01c2d; }  // 加深颜色
    }
    
    .note-item {
      // ... 现有代码 ...
      .note-type { color: #d01c2d; }  // 加深颜色
      .note-count { color: #d01c2d; }  // 加深颜色
    }
  }
  
  &.master {
    // ... 现有代码 ...
    
    .info-pair {
      .label { color: #7a66d9; }  // 加深颜色
      .value { color: #7a66d9; }  // 加深颜色
    }
    
    .note-item {
      // ... 现有代码 ...
      .note-type { color: #7a66d9; }  // 加深颜色
      .note-count { color: #7a66d9; }  // 加深颜色
    }
  }
  
  &.remaster {
    // ... 现有代码 ...
    
    .info-pair {
      .label { color: #b06cd9; }  // 加深颜色
      .value { color: #b06cd9; }  // 加深颜色
    }
    
    .note-item {
      // ... 现有代码 ...
      .note-type { color: #b06cd9; }  // 加深颜色
      .note-count { color: #b06cd9; }  // 加深颜色
    }
  }
  
  // ... 现有代码 ...
}

.favorite-popup {
  width: 600rpx;
  max-width: 90vw;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  will-change: transform; /* 提示浏览器这个元素会有变换 */
  transform: translateZ(0); /* 启用GPU加速 */
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 26rpx 30rpx;
    border-bottom: 2rpx solid #f0f0f0;
    background-color: #f9f9f9;
    
    .title {
      font-size: 34rpx;
      font-weight: bold;
      color: #333;
    }
    
    .close-btn {
      font-size: 40rpx;
      color: #999;
      padding: 10rpx;
    }
  }
  
  .folder-list {
    max-height: 60vh;
    overflow-y: auto;
    padding: 20rpx 30rpx;
    
    .folder-item {
      padding: 20rpx 24rpx;
      border-bottom: 1rpx solid #f0f0f0;
      font-size: 28rpx;
      color: #333;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 8rpx;
      margin-bottom: 16rpx;
      
      &.folder-selected {
        background-color: rgba(124, 77, 255, 0.1);
      }
      
      .folder-info {
        display: flex;
        align-items: center;
        gap: 8rpx;
        
        .folder-name {
          font-weight: 500;
        }
        
        .folder-count {
          color: #999;
          font-size: 24rpx;
        }
      }
      
      .folder-check {
        width: 40rpx;
        height: 40rpx;
        border-radius: 50%;
        background-color: #7c4dff;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 24rpx;
        font-weight: bold;
      }
    }
    
    .new-folder {
      color: #7c4dff;
      border: 1rpx dashed #7c4dff;
      background-color: rgba(124, 77, 255, 0.05);
      justify-content: center;
      margin-top: 30rpx;
      
      &:active {
        background-color: rgba(124, 77, 255, 0.1);
      }
    }
    
    .no-folder {
      padding: 40rpx 0;
      text-align: center;
      color: #999;
      font-size: 28rpx;
      display: flex;
      flex-direction: column;
      gap: 30rpx;
    }
  }
  
  .new-folder-input {
    display: flex;
    padding: 20rpx 30rpx;
    border-top: 1rpx solid #f0f0f0;
    
    input {
      flex: 1;
      height: 70rpx;
      border: 1rpx solid #ddd;
      border-radius: 8rpx;
      padding: 0 20rpx;
      font-size: 28rpx;
    }
    
    .create-btn {
      margin-left: 20rpx;
      height: 70rpx;
      line-height: 70rpx;
      padding: 0 30rpx;
      background-color: #6366f1;
      color: #fff;
      border-radius: 8rpx;
      font-size: 28rpx;
    }
  }
}
</style> 