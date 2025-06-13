<template>
  <view class="achievement-progress" :class="{ 'dark-mode': isDarkMode }">
    <view class="header">
      <text class="title">牌子进度</text>
      <text class="subtitle">哪一代又是你的白月光QwQ</text>
      
      <!-- 筛选按钮 -->
      <view class="filter-buttons">
        <button class="filter-btn" @click="showVersionFilter">
          版本: {{ currentVersionDisplay }}
        </button>
        <button class="filter-btn" @click="showDifficultyFilter">
          {{ difficultiesText[currentDiffIndex] }}
        </button>
        <button class="filter-btn" @click="showDisplayFilter">
          牌子: {{ displayFilterText }}
        </button>
      </view>
    </view>
    
    <view class="songs-container">
      <!-- 按level分组显示歌曲 -->
      <block v-for="levelGroup in sortedSongsByLevel" :key="levelGroup.level">
        <view class="level-group">
          <view class="level-header">
            <text class="level-label">Lv.{{ levelGroup.level }}</text>
            <text class="song-count">({{ levelGroup.songs.length }}首)</text>
          </view>
          
          <view class="level-songs">
            <view 
              class="song-cover-container" 
              v-for="(songData, index) in levelGroup.songs" 
              :key="index"
              @click="showSongDetail(songData.song.id,songData.diffIndex)"
            >
              <!-- 只保留封面图片和边框 -->
              <image 
                class="cover-image" 
                :src="getCoverUrl(songData.song.id)"
                mode="aspectFill"
                :class="'diff-' + songData.diffIndex"
              />
              <!-- 添加成绩信息显示 -->
              <view class="score-info" v-if="!filters.hideAchieved && shouldShowIcon(songData)">
                <image 
                  v-if="displayMode === 'rate' || displayMode === 'master'"
                  class="rate-image"
                  :src="`/static/maiFCFS/${songData.playerRecord.rate.toLowerCase()}.png`"
                  mode="aspectFit"
                />
                
                <image 
                  v-if="displayMode === 'fc' && (songData.playerRecord.fc === 'fc' || songData.playerRecord.fc === 'fcp' || songData.playerRecord.fc === 'ap' || songData.playerRecord.fc === 'app')"
                  class="fc-fs-image"
                  :src="`/static/maiFCFS/${songData.playerRecord.fc.toLowerCase()}.png`"
                  mode="aspectFit"
                />
           
                <image 
                  v-if="displayMode === 'ap' && (songData.playerRecord.fc === 'ap' || songData.playerRecord.fc === 'app')"
                  class="fc-fs-image"
                  :src="`/static/maiFCFS/${songData.playerRecord.fc.toLowerCase()}.png`"
                  mode="aspectFit"
                />
              </view>
              <view class="score-info" v-if="!filters.hideAchieved && displayMode === 'fs' && songData.playerRecord && songData.playerRecord.fs && songData.playerRecord.fs !== 'sync'">
                <image 
                  class="fc-fs-image"
                  :src="`/static/maiFCFS/${songData.playerRecord.fs.toLowerCase()}.png`"
                  mode="aspectFit"
                />
              </view>
            </view>
          </view>
        </view>
        
        <!-- 级别组间的分割线 -->
        <view class="divider"></view>
      </block>
      
      <!-- 无结果提示 -->
      <view class="no-results" v-if="Object.keys(sortedSongsByLevel).length === 0">
        <text>没有找到符合条件的歌曲</text>
      </view>
    </view>
    
    <!-- 版本筛选弹窗 -->
    <uni-popup ref="versionPopup" type="bottom">
      <view class="filter-popup">
        <view class="popup-header">
          <text class="popup-title">选择版本</text>
          <text class="close-btn" @click="closeVersionFilter">×</text>
        </view>
        <scroll-view scroll-y class="popup-content">
          <view 
            class="filter-item" 
            v-for="(value, key) in versionMap" 
            :key="key"
            :class="{ active: currentVersion === value }"
            @click="selectVersion(value, key)"
          >
            <text>{{ key }}</text>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
    
    <!-- 难度筛选弹窗 -->
    <uni-popup ref="difficultyPopup" type="bottom">
      <view class="filter-popup">
        <view class="popup-header">
          <text class="popup-title">选择难度</text>
          <text class="close-btn" @click="closeDifficultyFilter">×</text>
        </view>
        <view class="popup-content">
<!--          <view 
            class="filter-item no-border" 
            :class="{ active: currentDiffIndex === 0 }"
            @click="selectDifficulty(0)"
          >
            <text>所有难度</text>
          </view> -->
          <view 
            class="filter-item" 
            v-for="(name, index) in difficultiesText.slice(1)" 
            :key="index"
            :class="{ 
              active: currentDiffIndex === index + 1,
              'diff-color-1': index === 0,
              'diff-color-2': index === 1,
              'diff-color-3': index === 2,
              'diff-color-4': index === 3,
              'diff-color-5': index === 4
            }"
            @click="selectDifficulty(index + 1)"
          >
            <text>{{ name }}</text>
          </view>
        </view>
      </view>
    </uni-popup>
    
    <!-- 显示和成绩筛选弹窗 -->
    <uni-popup ref="displayPopup" type="bottom">
      <view class="filter-popup">
        <view class="popup-header">
          <text class="popup-title">显示设置</text>
          <text class="close-btn" @click="closeDisplayFilter">×</text>
        </view>
        <view class="popup-content">
          <view class="filter-section">
            <text class="section-title">牌子条件</text>
            <view class="display-options">
              <view class="display-option" 
                v-for="option in displayOptions" 
                :key="option.value"
                :class="{ active: displayMode === option.value }"
                @click="selectDisplayMode(option.value)"
              >
                <text>{{ option.label }}</text>
              </view>
            </view>
          </view>
          
          <view class="filter-section">
            <view class="checkbox-group"  @click="toggleFilter('hideAchieved')">
              <view class="checkbox-item">
                <text>隐藏已达成条件的歌曲</text>
				<text class="checkbox" :class="{ checked: filters.hideAchieved }">{{ checked ? "✓":''}}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted,inject,onBeforeMount } from 'vue'
import { getCoverUrl } from '@/utils/coverManager.js'
import {updateNativeTabBar} from '@/utils/updateNativeTabBar.js';


const applyTheme=inject('applyTheme',false);
// 注入深色模式变量
const isDarkMode = inject('isDarkMode', false);
onBeforeMount(()=>{
  applyTheme();
  updateNativeTabBar(isDarkMode.value);
})
// 难度配置
const difficultiesText = ['所有难度','Basic', 'Advanced', 'Expert', 'Master', 'Re:Master']

// 版本映射
const versionMap = {
  '(舞)': '舞代',
  '(真)': 'maimai',
  '(真)': 'maimai PLUS',
  '(超)': 'maimai GreeN',
  '(檄)': 'maimai GreeN PLUS',
  '(橙)': 'maimai ORANGE',
  '(暁)': 'maimai ORANGE PLUS',
  '(桃)': 'maimai PiNK',
  '(櫻)': 'maimai PiNK PLUS',
  '(紫)': 'maimai MURASAKi',
  '(菫)': 'maimai MURASAKi PLUS',
  '(白)': 'maimai MiLK',
  '(雪)': 'MiLK PLUS',
  '(輝)': 'maimai FiNALE',
  '(熊華)': 'maimai でらっくす',
  '(爽煌)': 'maimai でらっくす Splash',
  '(宙星)': 'maimai でらっくす UNiVERSE',
  '(祭祝)': 'maimai でらっくす FESTiVAL',
  '(双宴)': 'maimai でらっくす BUDDiES',
  '(镜)[未完]':'maimai でらっくす PRiSM'
}

// 当前筛选状态
const currentVersion = ref('maimai でらっくす BUDDiES')
const currentVersionDisplay = ref('(双宴)')
const currentDiffIndex = ref(4) // 默认显示Master难度

// 弹窗引用
const versionPopup = ref(null)
const difficultyPopup = ref(null)
const displayPopup = ref(null)

// 歌曲列表
const songList = ref([])
const allSongs = ref([])

// 玩家记录
const playerRecords = ref([])

// 显示选项
const displayOptions = [
  { label: '极牌', value: 'fc' },
  { label: '将牌', value: 'rate' },
  { label: '神牌', value: 'ap' },
  { label: '舞舞', value: 'fs' },
  { label: '霸者', value: 'master' }
]

// 显示模式
const displayMode = ref('rate') // 默认显示FC/FCP

// 成绩筛选相关的状态
const filters = ref({
  hideAchieved: false // 隐藏已达成条件的歌曲
})

// 计算显示筛选文本
const displayFilterText = computed(() => {
  const modeText = displayOptions.find(opt => opt.value === displayMode.value)?.label || '评级'
  let filterText = modeText
  
  if (filters.value.hideAchieved) {
    filterText += ''
  }
  
  return filterText
})

// 显示版本筛选弹窗
const showVersionFilter = () => {
  versionPopup.value.open()
}

// 关闭版本筛选弹窗
const closeVersionFilter = () => {
  versionPopup.value.close()
}

// 选择版本
const selectVersion = (version, displayName) => {
  currentVersion.value = version
  currentVersionDisplay.value = displayName
  closeVersionFilter()
  
  // 重新应用版本筛选
  songList.value = allSongs.value.filter(song => {
    if (version === '舞代') {
      return !song.basic_info?.from?.includes('でらっくす')
    }
    return song.basic_info?.from === version
  })
}

// 显示难度筛选弹窗
const showDifficultyFilter = () => {
  difficultyPopup.value.open()
}

// 关闭难度筛选弹窗
const closeDifficultyFilter = () => {
  difficultyPopup.value.close()
}

// 选择难度
const selectDifficulty = (index) => {
  currentDiffIndex.value = index
  closeDifficultyFilter()
  
  // 重新从原始数据过滤并更新allSongs
  const rawSongs = uni.getStorageSync("musicData")
  allSongs.value = rawSongs.filter(song => {
    if (index === 0) {
      return !song.level.some(level => level?.includes('?'))
    }
    const diffIndex = index - 1
    return !song.level[diffIndex]?.includes('?')
  })
  
  filterSongs()
}

// 显示筛选弹窗
const showDisplayFilter = () => {
  displayPopup.value.open()
}

// 关闭显示筛选弹窗
const closeDisplayFilter = () => {
  displayPopup.value.close()
}

// 选择显示模式
const selectDisplayMode = (mode) => {
	  uni.showLoading({
		title:"加载中...",
	  	mask:true
	  })
  displayMode.value = mode
  
  // 如果是霸者模式，自动切换到舞代版本
  if (mode === 'master') {
    currentVersion.value = '舞代'
    currentVersionDisplay.value = '(舞)'
    // 重新应用版本筛选
    songList.value = allSongs.value.filter(song => 
      !song.basic_info?.from?.includes('でらっくす')
    )
  }
  uni.hideLoading()
}

const checked = ref(false);
// 切换筛选选项
const toggleFilter = (filterName) => {
	
	checked.value=!checked.value
  filters.value[filterName] = !filters.value[filterName]
  uni.showLoading({
	title:"加载中...",
  	mask:true
  })
  filterSongs()
  uni.hideLoading();
}

// 筛选歌曲
const filterSongs = () => {
  // 根据版本和难度筛选
  let filteredSongs = [...allSongs.value]
  
  // 版本筛选
  if (currentVersion.value) {
    if (currentVersion.value === '舞代') {
      filteredSongs = filteredSongs.filter(song => 
        !song.basic_info?.from?.includes('でらっくす')
      )
    } else {
      filteredSongs = filteredSongs.filter(song => 
        song.basic_info?.from === currentVersion.value
      )
    }
  }
  
  // 成绩筛选
  if (Object.values(filters.value).some(v => v)) {
    filteredSongs = filteredSongs.filter(song => {
      // 如果是任意难度模式，检查所有难度
      if (currentDiffIndex.value === 0) {
        // 检查所有难度是否都满足隐藏条件
        for (let i = 0; i < song.level.length; i++) {
          if (song.level[i] && song.level[i] !== '-') {
            const playerRecord = playerRecords.value.find(
              record => record.song_id === parseInt(song.id) && record.level_index === i
            )
            
            if (playerRecord) {
              // 如果任何一个难度满足隐藏条件，就隐藏这首歌
              if (shouldHideSong(playerRecord)) {
                return false
              }
            }
          }
        }
        return true
      } else {
        // 特定难度模式，只检查当前难度
        const diffIndex = currentDiffIndex.value - 1
        const playerRecord = playerRecords.value.find(
          record => record.song_id === parseInt(song.id) && record.level_index === diffIndex
        )
        
        if (playerRecord) {
          return !shouldHideSong(playerRecord)
        }
        return true
      }
    })
  }
  
  songList.value = filteredSongs
}

// 修改模板中的图标显示逻辑
const shouldShowIcon = (songData) => {
  if (!songData.playerRecord) return false
  
  // 检查是否满足隐藏条件
  if (filters.value.hideAchieved) {
    switch (displayMode.value) {
      case 'rate':
        return false
      case 'fc':
        return !(songData.playerRecord.fc === 'fc' || songData.playerRecord.fc === 'fcp' || 
                songData.playerRecord.fc === 'ap' || songData.playerRecord.fc === 'app')
      case 'ap':
        return !(songData.playerRecord.fc === 'ap' || songData.playerRecord.fc === 'app')
      case 'fs':
        return !(songData.playerRecord.fs === 'fsd' || songData.playerRecord.fs === 'fsdp')
      case 'master':
        return songData.playerRecord.achievements <= 80
      default:
        return true
    }
  }
  
  // 不隐藏时正常显示
  switch (displayMode.value) {
    case 'rate':
    case 'master':
      return true
    case 'fc':
      return songData.playerRecord.fc === 'fc' || songData.playerRecord.fc === 'fcp' || 
             songData.playerRecord.fc === 'ap' || songData.playerRecord.fc === 'app'
    case 'ap':
      return songData.playerRecord.fc === 'ap' || songData.playerRecord.fc === 'app'
    case 'fs':
      return songData.playerRecord.fs === 'fsd' || songData.playerRecord.fs === 'fsdp'
    default:
      return false
  }
}

// 修改shouldHideSong方法
const shouldHideSong = (playerRecord) => {
  if (!playerRecord) return false
  
  // 检查已达成条件
  if (filters.value.hideAchieved) {
    switch (displayMode.value) {
      case 'rate':
        return playerRecord.rate === 'sss' || playerRecord.rate === 'sssp'
      case 'fc':
        return playerRecord.fc === 'fc' || playerRecord.fc === 'fcp' || 
               playerRecord.fc === 'ap' || playerRecord.fc === 'app'
      case 'ap':
        return playerRecord.fc === 'ap' || playerRecord.fc === 'app'
      case 'fs':
        return playerRecord.fs === 'fsd' || playerRecord.fs === 'fsdp'
      case 'master':
        return playerRecord.achievements > 80
      default:
        return false
    }
  }
  
  return false
}

// 将歌曲数据按level分组并排序
const sortedSongsByLevel = computed(() => {
  // 存储所有难度的歌曲数据
  const allDifficulties = []
  const diffIndex = currentDiffIndex.value
  
  // 遍历所有歌曲
  songList.value.forEach(song => {
    // 过滤掉ID大于等于6位的歌曲
    if (song.id.toString().length >= 6) {
      return; // 跳过此次循环
    }
    
    // 如果是任意难度，显示所有难度
    if (diffIndex === 0) {
      // 遍历所有难度
      for (let i = 0; i < song.level.length; i++) {
        if (song.level[i] && song.level[i] !== '-') {
          const playerRecord = playerRecords.value.find(
            record => record.song_id === parseInt(song.id) && record.level_index === i
          )
          
          allDifficulties.push({
            song: song,
            level: song.level[i],
            diffIndex: i,
            ds: song.ds[i],
            playerRecord: playerRecord || null
          })
        }
      }
    } else {
      // 只考虑当前选择的难度
      if (song.level[diffIndex - 1] && song.level[diffIndex - 1] !== '-') {
        const playerRecord = playerRecords.value.find(
          record => record.song_id === parseInt(song.id) && record.level_index === diffIndex - 1
        )
        
        allDifficulties.push({
          song: song,
          level: song.level[diffIndex - 1],
          diffIndex: diffIndex - 1,
          ds: song.ds[diffIndex - 1],
          playerRecord: playerRecord || null
        })
      }
    }
  })
  
  // 按level分组
  const groupedByLevel = {}
  allDifficulties.forEach(item => {
    if (!groupedByLevel[item.level]) {
      groupedByLevel[item.level] = []
    }
    groupedByLevel[item.level].push(item)
  })
  
  // 对每个level组内的歌曲按ds降序排序
  Object.keys(groupedByLevel).forEach(level => {
    groupedByLevel[level].sort((a, b) => b.ds - a.ds)
  })
  
  // 按level降序获取所有级别
  const allLevels = Object.keys(groupedByLevel).sort((a, b) => {
    // 提取数字部分
    const numA = parseFloat(a)
    const numB = parseFloat(b)
    
    // 如果数字部分不同，按数字降序
    if (numA !== numB) {
      return numB - numA
    }
    
    // 如果数字部分相同，带+的排在前面
    if (a.includes('+') && !b.includes('+')) {
      return -1
    }
    if (!a.includes('+') && b.includes('+')) {
      return 1
    }
    
    return 0
  })
  
  // 直接返回所有级别，不再限制数量
  return allLevels.map(level => ({
    level: level,
    songs: groupedByLevel[level]
  }))
})

// 显示歌曲详情
const showSongDetail = (id,diff) => {
  uni.navigateTo({
    url: `/pages/song-detail/song-detail?songId=${id}&difficulty=${diff}`
  })
}

// 初始化数据
onMounted(() => {
  uni.showLoading({
    title: '加载中...'
  })
  
  // 从本地存储获取歌曲数据并过滤掉包含?的难度
  const rawSongs = uni.getStorageSync("musicData")
  allSongs.value = rawSongs.filter(song => {
    // 如果是任意难度模式，检查所有难度
    if (currentDiffIndex.value === 0) {
      return !song.level.some(level => level?.includes('?'))
    }
    // 如果是特定难度模式，只检查当前难度
    const diffIndex = currentDiffIndex.value - 1
    return !song.level[diffIndex]?.includes('?')
  })
  
  // 从本地存储获取玩家记录数据
  playerRecords.value = uni.getStorageSync("divingFish_records").data.records || []
  
  // 应用默认版本筛选
  songList.value = allSongs.value.filter(song => 
    song.basic_info?.from === currentVersion.value
  )
  
  uni.hideLoading()
})
</script>

<style lang="scss">
@import './dark-achievement-progress.scss';

.achievement-progress {
  padding: 15rpx;
  background: linear-gradient(135deg, #f0f4ff 0%, #e6e9ff 100%);
  min-height: 100vh;
  
  .header {
    margin-bottom: 10rpx;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20rpx;
    padding: 32rpx 40rpx;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.7);
    
    .title {
      font-size: 48rpx;
      font-weight: bold;
      display: block;
      margin-bottom: 10rpx;
      color: #1e293b;
    }
    
    .subtitle {
      font-size: 24rpx;
      color: #64748b;
      margin-bottom: 20rpx;
    }
    
    .filter-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
      margin-top: 15rpx;
      
      .filter-btn {
        flex: 1;
        min-width: 160rpx;
        height: 90rpx;
        font-size: 28rpx;
        padding: 15rpx 0;
        background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
        color: white;
        border: none;
        border-radius: 16rpx;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        letter-spacing: 0.3px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0));
          opacity: 0;
        }
        
        &:active {
          transform: scale(0.98) translateY(1px);
        }
        
        &:first-child {
          margin-left: 0;
        }
        
        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
  
  .songs-container {
    .level-group {
	  margin-top:0rpx;
      margin-bottom: 0rpx;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20rpx;
      padding: 12rpx;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.7);
      
      .level-header {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;
        padding: 8rpx 12rpx;
        background-color: #f8fafc;
        border-radius: 16rpx;
        
        .level-label {
          font-size: 36rpx;
          font-weight: bold;
          color: #1e293b;
        }
        
        .song-count {
          font-size: 26rpx;
          color: #64748b;
          margin-left: 10rpx;
        }
      }
      
      .level-songs {
        display: flex;
        flex-wrap: wrap;
        gap: 3rpx;
        justify-content: flex-start;
        padding: 0 2rpx;
        
        .song-cover-container {
          position: relative;
          width: calc(20% - 4rpx);
          padding-bottom: calc(20% - 2rpx);
          border-radius: 12rpx;
          overflow: hidden;
          box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.12);
          margin-bottom: 2rpx;
          
          .cover-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 8rpx solid transparent;
            box-sizing: border-box;
            
            &.diff-0 {
              border-color: #1EA15D;
            }
            
            &.diff-1 {
              border-color: #F6B40C;
            }
            
            &.diff-2 {
              border-color: #E9485D;
            }
            
            &.diff-3 {
              border-color: #9E45E2;
            }
            
            &.diff-4 {
              border-color: rgb(253, 159, 255);
            }
          }
          
          .score-info {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            
            .rate-image{
              width: 95%;
              height: 95%;
              max-width: 130rpx;
              max-height: 130rpx;
            }
            .fc-fs-image {
              width: 70%;
              height: 70%;
              max-width: 100rpx;
              max-height: 100rpx;
            }
          }
        }
      }
    }
    
    .divider {
      height: 1rpx;
      background-color: #e2e8f0;
      margin: 8rpx 0;
    }
    
    .no-results {
      padding: 60rpx 0;
      text-align: center;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20rpx;
      margin: 20rpx 0;
      
      text {
        font-size: 32rpx;
        color: #64748b;
      }
    }
  }
  
  .filter-popup {
    background-color: #fff;
    border-top-left-radius: 20rpx;
    border-top-right-radius: 20rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
    
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx;
      border-bottom: 1px solid #e2e8f0;
      background: linear-gradient(to bottom, #fcfcfc, #f9f9f9);
      
      .popup-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #1e293b;
      }
      
      .close-btn {
        font-size: 40rpx;
        color: #64748b;
        padding: 0 20rpx;
        
        &:active {
          opacity: 0.7;
        }
      }
    }
    
    .popup-content {
      max-height: 60vh;
      padding: 20rpx 0;
      
      .filter-item {
        padding: 25rpx 30rpx;
        font-size: 30rpx;
        color: #1e293b;
        transition: all 0.3s ease;
        border-left: 8rpx solid transparent;
        
        &.no-border {
          border-left: none;
        }
        
        &.active {
          background-color: rgba(99, 102, 241, 0.1);
          font-weight: bold;
        }
        
        &:active {
          background-color: rgba(99, 102, 241, 0.05);
        }
        
        &.diff-color-1 {
        
          &.active {
            background-color: rgba(30, 161, 93, 0.1);
            color: #1EA15D;
          }
        }
        
        &.diff-color-2 {
          
          &.active {
            background-color: rgba(246, 180, 12, 0.1);
            color: #F6B40C;
          }
        }
        
        &.diff-color-3 {
          
          &.active {
            background-color: rgba(233, 72, 93, 0.1);
            color: #E9485D;
          }
        }
        
        &.diff-color-4 {
          
          &.active {
            background-color: rgba(158, 69, 226, 0.1);
            color: #9E45E2;
          }
        }
        
        &.diff-color-5 {
          
          &.active {
            background-color: rgba(253, 159, 255, 0.1);
            color: rgb(253, 159, 255);
          }
        }
      }
    }
  }
}

.filter-section {
  padding: 20rpx 30rpx;
  border-bottom: 1px solid #e2e8f0;
  
  .section-title {
    font-size: 28rpx;
    color: #64748b;
    margin-bottom: 15rpx;
  }
  
  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    
    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 10rpx;
      
      .checkbox {
        width: 40rpx;
        height: 40rpx;
        border: 2rpx solid #cbd5e1;
        border-radius: 8rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        color: transparent;
        transition: all 0.3s ease;
        
        &.checked {
          background-color: #6366f1;
          border-color: #6366f1;
          color: white;
        }
      }
      
      text {
        font-size: 28rpx;
        color: #1e293b;
      }
    }
  }
}

.display-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
  
  .display-option {
    padding: 12rpx 24rpx;
    border-radius: 8rpx;
    font-size: 28rpx;
    color: #64748b;
    background: #f1f5f9;
    transition: all 0.3s ease;
    
    &.active {
      color: #fff;
      background: #6366f1;
    }
    
    &:active {
      opacity: 0.8;
    }
  }
}
</style> 