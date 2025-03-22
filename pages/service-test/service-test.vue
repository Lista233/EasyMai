<template>
  <view class="container">
    <view class="header">
      <text class="title">SongService 功能测试</text>
    </view>
    
    <!-- 测试选项 -->
    <view class="test-options">
      <view class="option-group">
        <text class="group-title">测试功能</text>
        <view class="option-list">
          <view 
            v-for="(option, index) in testOptions" 
            :key="index"
            class="option-item"
            :class="{ active: currentTest === option.value }"
            @click="selectTest(option.value)"
          >
            <text>{{ option.label }}</text>
          </view>
        </view>
      </view>
      
      <!-- 搜索输入 -->
      <view class="search-input">
        <input 
          v-model="searchKeyword" 
          type="text" 
          :placeholder="getPlaceholder()"
          @input="onInputChange"
        />
        <button class="search-btn" @click="runTest">执行测试</button>
      </view>
      
      <!-- 附加选项 -->
      <view class="additional-options">
        <view class="checkbox-option">
          <checkbox :checked="exactMatch" @click="exactMatch = !exactMatch" />
          <text>精确匹配</text>
        </view>
        
        <view class="difficulty-selector" v-if="currentTest === 'charter'">
          <text>难度:</text>
          <picker 
            :value="difficultyIndex" 
            :range="difficultyOptions" 
            @change="onDifficultyChange"
          >
            <view class="picker-value">
              {{ difficultyOptions[difficultyIndex] }}
              <uni-icons type="down" size="14" color="#666"></uni-icons>
            </view>
          </picker>
        </view>
      </view>
    </view>
    
    <!-- 结果显示 -->
    <view class="results-section">
      <view class="results-header">
        <text class="results-title">测试结果 ({{ results.length }})</text>
        <text class="results-time" v-if="executionTime !== null">
          执行时间: {{ executionTime }}ms
        </text>
      </view>
      
      <scroll-view 
        class="results-list" 
        scroll-y 
        :style="{ height: `${scrollHeight}px` }"
      >
        <view 
          v-for="(item, index) in results" 
          :key="index"
          class="result-item"
          @click="navigateToSongDetail(item.id)"
        >
          <view class="result-header">
            <text class="result-title">{{ item.title }}</text>
            <text class="result-id">#{{ item.id }}</text>
          </view>
          
          <!-- 艺术家信息 -->
          <view class="result-artist" v-if="currentTest === 'artist' && item.matchedArtist">
            <text class="label">艺术家:</text>
            <text class="value">{{ item.matchedArtist }}</text>
          </view>
          
          <!-- 谱师信息 -->
          <view class="result-difficulties" v-if="currentTest === 'charter' && item.matchingDifficulties">
            <view 
              v-for="(diff, idx) in item.matchingDifficulties" 
              :key="idx"
              class="difficulty-item"
              :class="getDifficultyClass(diff.difficulty)"
            >
              <text class="diff-name">{{ getDifficultyName(diff.difficulty) }}</text>
              <text class="diff-level">Lv.{{ diff.level }}</text>
              <text class="diff-charter">{{ diff.charter }}</text>
            </view>
          </view>
          
          <!-- 基本信息 -->
          <view class="result-info">
            <text class="info-genre" v-if="item.basic_info?.genre">
              {{ item.basic_info.genre }}
            </text>
            <text class="info-version" v-if="item.basic_info?.from">
              {{ item.basic_info.from }}
            </text>
          </view>
        </view>
        
        <view class="no-results" v-if="results.length === 0 && hasSearched">
          <text>没有找到匹配的结果</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import SongService from '@/utils/SongService.js'


// 测试选项
const testOptions = [
  { label: '按谱师搜索', value: 'charter' },
  { label: '按艺术家搜索', value: 'artist' }
]

// 难度选项
const difficultyOptions = ['全部', 'Basic', 'Advanced', 'Expert', 'Master', 'Re:Master']

// 状态变量
const currentTest = ref('charter')
const searchKeyword = ref('')
const exactMatch = ref(false)
const difficultyIndex = ref(0)
const results = ref([])
const executionTime = ref(null)
const hasSearched = ref(false)
const scrollHeight = ref(500)
const songService = ref(null)

// 选择测试类型
const selectTest = (test) => {
  currentTest.value = test
  results.value = []
  executionTime.value = null
  hasSearched.value = false
}

// 获取输入框占位符
const getPlaceholder = () => {
  switch (currentTest.value) {
    case 'charter': return '输入谱师名称...'
    case 'artist': return '输入艺术家名称...'
    default: return '输入搜索关键词...'
  }
}

// 输入变化处理
const onInputChange = () => {
  if (searchKeyword.value.trim() === '') {
    results.value = []
    executionTime.value = null
    hasSearched.value = false
  }
}

// 难度选择变化
const onDifficultyChange = (e) => {
  difficultyIndex.value = e.detail.value
}

// 执行测试
const runTest = () => {
  if (!songService.value || searchKeyword.value.trim() === '') return
  
  const keyword = searchKeyword.value.trim()

  // 根据测试类型执行不同的搜索
  switch (currentTest.value) {
    case 'charter':
      searchByCharter(keyword)
      break
    case 'artist':
      searchByArtist(keyword)
      break
  }
  
 
  hasSearched.value = true
}

// 按谱师搜索
const searchByCharter = (keyword) => {
  // 确定难度
  let difficulty = null
  if (difficultyIndex.value > 0) {
    difficulty = difficultyIndex.value - 1
  }
  
  // 执行搜索
  results.value = songService.value.getSongsByCharter(keyword, {
    exact: exactMatch.value,
    difficulty: difficulty
  })
}

// 按艺术家搜索
const searchByArtist = (keyword) => {
  // 执行搜索
  results.value = songService.value.getSongsByArtist(keyword, {
    exact: exactMatch.value
  })
}

// 获取难度名称
const getDifficultyName = (index) => {
  return ['Basic', 'Advanced', 'Expert', 'Master', 'Re:Master'][index] || `难度${index}`
}

// 获取难度样式类
const getDifficultyClass = (index) => {
  const classes = ['basic', 'advanced', 'expert', 'master', 'remaster']
  return classes[index] || ''
}

// 跳转到歌曲详情
const navigateToSongDetail = (songId) => {
  uni.navigateTo({
    url: `/pages/song-detail/song-detail?id=${songId}`
  })
}

// 初始化
onMounted(() => {
  //
   let musicData=uni.getStorageSync('musicData')
  try {
    // 直接使用本地musicData初始化SongService
    songService.value = new SongService(musicData)
    console.log(`成功加载歌曲数据，共${musicData.length}首歌曲`)
    uni.hideLoading()
  } catch (error) {
    console.error('初始化SongService失败:', error)
    uni.showToast({
      title: '数据加载失败',
      icon: 'none'
    })
    uni.hideLoading()
  }
  
  // 计算滚动区域高度
  const systemInfo = uni.getSystemInfoSync()
  scrollHeight.value = systemInfo.windowHeight - 320 // 减去其他UI元素的高度
})

onUnmounted(() => {
  songService.value = null
})

// 添加调试函数
const debugSongService = () => {
  if (!songService.value) {
    console.error('SongService未初始化')
    return
  }
  
  console.log('SongService实例:', songService.value)
  console.log('歌曲数量:', songService.value.songList.length)
  
  // 测试一个简单的搜索
  const testResult = songService.value.getSongsByCharter('东星', { exact: false })
  console.log('测试搜索结果:', testResult)
}

// 在初始化完成后调用调试函数
onMounted(() => {
  // ... 现有代码 ...
  
  // 添加延时调试，确保数据已加载
  setTimeout(() => {
    debugSongService()
  }, 1000)
})
</script>

<style lang="scss">
.container {
  padding: 30rpx;
  background-color: #f8fafc;
  min-height: 100vh;
}

.header {
  margin-bottom: 30rpx;
  
  .title {
    font-size: 40rpx;
    font-weight: 700;
    color: #1e293b;
  }
}

.test-options {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  
  .group-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #334155;
    margin-bottom: 16rpx;
  }
  
  .option-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 24rpx;
  }
  
  .option-item {
    padding: 12rpx 24rpx;
    background-color: #f1f5f9;
    border-radius: 30rpx;
    font-size: 28rpx;
    color: #64748b;
    
    &.active {
      background-color: #6366f1;
      color: #ffffff;
      font-weight: 500;
    }
  }
  
  .search-input {
    display: flex;
    margin-bottom: 20rpx;
    
    input {
      flex: 1;
      height: 80rpx;
      background-color: #f1f5f9;
      border-radius: 12rpx;
      padding: 0 20rpx;
      font-size: 28rpx;
      color: #334155;
    }
    
    .search-btn {
      width: 160rpx;
      height: 80rpx;
      background: linear-gradient(135deg, #818cf8, #6366f1);
      color: #ffffff;
      border-radius: 12rpx;
      margin-left: 16rpx;
      font-size: 28rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:active {
        opacity: 0.9;
      }
    }
  }
  
  .additional-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .checkbox-option {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #64748b;
    }
    
    .difficulty-selector {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #64748b;
      
      .picker-value {
        display: flex;
        align-items: center;
        margin-left: 10rpx;
        padding: 6rpx 16rpx;
        background-color: #f1f5f9;
        border-radius: 8rpx;
      }
    }
  }
}

.results-section {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  
  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .results-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #334155;
    }
    
    .results-time {
      font-size: 24rpx;
      color: #64748b;
    }
  }
  
  .results-list {
    .result-item {
      padding: 20rpx;
      border-bottom: 1px solid #e2e8f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .result-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12rpx;
        
        .result-title {
          font-size: 32rpx;
          font-weight: 600;
          color: #1e293b;
          flex: 1;
        }
        
        .result-id {
          font-size: 24rpx;
          color: #64748b;
        }
      }
      
      .result-artist {
        display: flex;
        align-items: center;
        margin-bottom: 12rpx;
        
        .label {
          font-size: 26rpx;
          color: #64748b;
          margin-right: 10rpx;
        }
        
        .value {
          font-size: 28rpx;
          color: #6366f1;
          font-weight: 500;
        }
      }
      
      .result-difficulties {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;
        margin-bottom: 12rpx;
        
        .difficulty-item {
          display: flex;
          align-items: center;
          padding: 8rpx 16rpx;
          border-radius: 8rpx;
          font-size: 24rpx;
          
          &.basic {
            background-color: rgba(22, 163, 74, 0.1);
            color: #16a34a;
          }
          
          &.advanced {
            background-color: rgba(202, 138, 4, 0.1);
            color: #ca8a04;
          }
          
          &.expert {
            background-color: rgba(220, 38, 38, 0.1);
            color: #dc2626;
          }
          
          &.master {
            background-color: rgba(124, 58, 237, 0.1);
            color: #7c3aed;
          }
          
          &.remaster {
            background-color: rgba(192, 132, 252, 0.1);
            color: #c084fc;
          }
          
          .diff-name {
            margin-right: 8rpx;
          }
          
          .diff-level {
            margin-right: 8rpx;
            font-weight: 600;
          }
          
          .diff-charter {
            font-weight: 500;
          }
        }
      }
      
      .result-info {
        display: flex;
        gap: 16rpx;
        
        .info-genre, .info-version {
          font-size: 24rpx;
          color: #64748b;
          background-color: #f1f5f9;
          padding: 4rpx 12rpx;
          border-radius: 6rpx;
        }
      }
    }
    
    .no-results {
      padding: 40rpx 0;
      text-align: center;
      color: #64748b;
      font-size: 28rpx;
    }
  }
}
</style> 