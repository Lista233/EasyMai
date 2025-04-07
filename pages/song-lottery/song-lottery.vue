<template>
  <view class="lottery-container" :class="{ 'dark-mode': isDarkMode }">
    <view class="header">
      <text class="title">Mai什么</text>
      <p><text class="subtitle">一切都是命运石之门的选择~</text></p>
    </view>
    
    <!-- 筛选条件 -->
    <view class="filter-section">
      <view class="filter-title">筛选条件</view>
      
      <view class="filter-group">
        <view class="filter-label">定数范围</view>
        <view class="range-filter">
          <input 
            type="digit" 
            v-model="dsMin" 
            class="range-input" 
            placeholder="最小值"
          />
          <text class="range-separator">-</text>
          <input 
            type="digit" 
            v-model="dsMax" 
            class="range-input" 
            placeholder="最大值"
          />
        </view>
      </view>
      
      <view class="filter-group">
        <view class="filter-label">版本筛选</view>
        <picker 
          mode="selector" 
          :range="displayVersionOptions" 
          :value="versionOptions.indexOf(selectedVersion.value)"
          @change="onVersionChange"
          class="version-picker"
        >
          <view class="picker-text">
            {{ !selectedVersion || selectedVersion === '全部版本' ? '全部版本' : (versionMap[selectedVersion] || selectedVersion) }}
          </view>
        </picker>
      </view>
      
      <view class="filter-group">
        <view class="filter-label">类型筛选</view>
        <picker 
          mode="selector" 
          :range="genreOptions" 
          @change="onGenreChange" 
          class="genre-picker"
        >
          <view class="picker-text">{{ selectedGenre || '全部类型' }}</view>
        </picker>
      </view>
    </view>
    
    <!-- 抽奖内容区 -->
    <view class="lottery-content">
      <view :class="['cover-grid', `columns-${songCount}`]">
        <view 
          v-for="(song, index) in currentSongs" 
          :key="index" 
          class="cover-item"
          @click="handleCoverClick(song)"
        >
          <view 
            class="song-cover" 
            :class="[`border-${getDifficultyClass(song)}`]"
          >
            <image 
              class="song-cover-image" 
              :src="getCoverUrl(song?.id)" 
              mode="aspectFill"
            ></image>
          </view>
          <view class="song-info" v-if="song">
            <view class="song-title">{{ song.title }}</view>
            <view class="song-id">ID: {{ song.id }}</view>
          </view>
        </view>
        
        <!-- 占位元素，确保网格完整 -->
        <view 
          v-for="i in (songCount - currentSongs.length)" 
          :key="`empty-${i}`" 
          class="cover-item empty"
        >
          <view class="empty-placeholder">
            <text class="placeholder-text">?</text>
          </view>
        </view>
      </view>
      
      <!-- 控制区域 -->
      <view class="control-area">
        <view class="count-selector">
          <text class="count-label">一次抽取</text>
          <view class="count-buttons">
            <view 
              v-for="num in 4" 
              :key="num"
              :class="['count-button', { active: songCount === num }]"
              @click="songCount = num;"
            >
              {{ num }}
            </view>
          </view>
          <text class="count-label">首歌</text>
        </view>
        
        <view 
          class="lottery-button" 
          :class="{'running': isRunning}"
          @click="toggleLottery"
        >
          {{ buttonText }}
        </view>
      </view>
    </view>
    
    <!-- 历史记录 -->
    <view class="lottery-history" v-if="lotteryHistory.length > 0">
      <view class="history-title">历史抽取记录</view>
      <scroll-view class="history-scroll" scroll-y>
        <view class="history-list">
          <view 
            class="history-item" 
            v-for="(item, index) in lotteryHistory" 
            :key="index"
          >
            <view class="history-date">{{ formatDate(historyTimestamps[index]) }}</view>
            <view class="history-songs">
              <view 
                v-for="song in item" 
                :key="song.id" 
                class="history-cover-wrapper"
                :class="[`border-${getDifficultyClass(song)}`]"
                @click="handleCoverClick(song)"
              >
                <image 
                  class="history-cover" 
                  :src="getCoverUrl(song.id)" 
                  mode="aspectFill"
                ></image>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch,onBeforeMount,inject} from 'vue';
import { getCoverUrl } from '../../util/coverManager.js';
import SongService from '../../utils/SongService.js';
import {updateNativeTabBar } from '@/utils/updateNativeTabBar.js'
// 注入主题服务
const applyTheme = inject('applyTheme');
const isDarkMode = inject('isDarkMode');
onBeforeMount(() => {
  updateNativeTabBar(isDarkMode.value);
  applyTheme();
});
// 状态变量
const currentSongs = ref([]);
const isRunning = ref(false);
const hasStarted = ref(false);
const lotteryInterval = ref(null);
const lotteryHistory = ref([]);
const historyTimestamps = ref([]);
const songCount = ref(3); // 默认抽取1首歌

// 筛选条件
const dsMin = ref('');
const dsMax = ref('');
const selectedVersion = ref('');
const selectedGenre = ref('');

// 版本选项
const versionOptions = ['全部版本', 'maimai', 'maimai PLUS', 'maimai GreeN', 'maimai GreeN PLUS', 
                        'maimai ORANGE', 'maimai ORANGE PLUS', 'maimai PiNK', 'maimai PiNK PLUS', 
                        'maimai MURASAKi', 'maimai MURASAKi PLUS', 'maimai MiLK', 'maimai MiLK PLUS', 
                        'maimai FiNALE', 'maimai でらっくす', 'maimai でらっくす Splash', 
                        'maimai でらっくす UNiVERSE', 'maimai でらっくす FESTiVAL', 
                        'maimai でらっくす BUDDiES'];

// 类型选项
const genreOptions = ['任意类别',
  '舞萌',
  '流行&动漫',
  'niconico & VOCALOID',
  '其他游戏',
  '东方Project',
  '音击&中二节奏'];

// 版本映射表
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
};

// 添加一个计算属性用于显示
const displayVersionOptions = computed(() => {
  return versionOptions.map(version => 
    version === '全部版本' ? version : (versionMap[version] || version)
  );
});

// 实例化SongService
const songService = ref(null);
const allSongs = ref([]);
const filteredSongs = ref([]);

// 按钮文本
const buttonText = computed(() => {
  return isRunning.value ? '停止抽奖' : hasStarted.value ? '重新抽奖' : '开始抽奖';
});

// 初始化SongService和歌曲数据
onMounted(async () => {
  try {
    // 从本地存储获取歌曲数据
    const musicData = uni.getStorageSync('musicData');
    if (musicData && musicData.length > 0) {
      songService.value = new SongService(musicData);
      allSongs.value = musicData;
      console.log(`加载了 ${allSongs.value.length} 首歌曲`);
      
      // 初始筛选
      updateFilteredSongs();
    } else {
      console.error('未找到歌曲数据');
      uni.showToast({
        title: '未找到歌曲数据',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('初始化歌曲数据失败:', error);
  }
  
  // 从本地存储加载历史记录
  try {
    const history = uni.getStorageSync('lotteryHistory');
    const timestamps = uni.getStorageSync('lotteryTimestamps');
    if (history && Array.isArray(history)) {
      lotteryHistory.value = history;
      historyTimestamps.value = timestamps || Array(history.length).fill(Date.now());
    }
  } catch (error) {
    console.error('加载抽奖历史失败:', error);
  }
});

// 清理定时器
onUnmounted(() => {
  if (lotteryInterval.value) {
    clearInterval(lotteryInterval.value);
  }
});

// 更新筛选后的歌曲列表
const updateFilteredSongs = () => {
  if (!songService.value) {
    filteredSongs.value = [];
    return;
  }
  
  try {
    // 构建搜索条件
    const searchParams = {};
    
    // 添加版本筛选
    if (selectedVersion.value && selectedVersion.value !== '全部版本') {
      searchParams.version = selectedVersion.value;
    }
    
    // 添加类型筛选
    if (selectedGenre.value && selectedGenre.value !== '任意类别') {
      searchParams.genre = selectedGenre.value;
    }
    
    // 添加定数范围筛选
    if (dsMin.value || dsMax.value) {
      searchParams.dsRange = {};
      
      if (dsMin.value) {
        const min = parseFloat(dsMin.value);
        if (!isNaN(min)) {
          searchParams.dsRange.min = min;
        }
      }
      
      if (dsMax.value) {
        const max = parseFloat(dsMax.value);
        if (!isNaN(max)) {
          searchParams.dsRange.max = max;
        }
      }
    }

    // 使用SongService的searchSongsOptimized方法进行综合筛选
    // 这样可以获取匹配的难度信息
    let searchResults = songService.value.searchSongsOptimized(searchParams, {
      exactVersion: true,
      exactGenre: true,
      includeEqual: true
    });
    
    // 筛选掉ID大于5位数的歌曲
    searchResults = searchResults.filter(song => {
      const id = String(song.id);
      return id.length <= 5;
    });
    
    // 去重处理，确保同一首歌曲不会因为不同难度而重复出现
    // 同时保留匹配的难度信息
    const uniqueSongIds = new Set();
    const uniqueSongs = [];
    
    for (const song of searchResults) {
      if (!uniqueSongIds.has(song.id)) {
        uniqueSongIds.add(song.id);
        uniqueSongs.push(song);
      }
    }
    
    filteredSongs.value = uniqueSongs;
    console.log(`筛选后有 ${filteredSongs.value.length} 首歌曲`);
  } catch (error) {
    console.error('筛选歌曲失败:', error);
    filteredSongs.value = [];
  }
};

// 监听筛选条件变化
watch([dsMin, dsMax, selectedVersion, selectedGenre], () => {
  updateFilteredSongs();
});

// 随机抽取歌曲
const getRandomSongs = (count) => {
  if (filteredSongs.value.length === 0) {
    uni.showToast({
      title: '没有符合条件的歌曲',
      icon: 'none'
    });
    return [];
  }
  
  // 如果筛选后的歌曲数量少于要抽取的数量，使用所有可用歌曲
  const availableCount = Math.min(count, filteredSongs.value.length);
  
  const result = [];
  const indices = new Set();
  
  // 确保不重复抽取同一首歌
  while (result.length < availableCount) {
    const randomIndex = Math.floor(Math.random() * filteredSongs.value.length);
    
    if (!indices.has(randomIndex)) {
      indices.add(randomIndex);
      result.push(filteredSongs.value[randomIndex]);
    }
  }
  
  return result;
};

// 开始/停止抽奖
const toggleLottery = () => {
  if (isRunning.value) {
    // 停止抽奖
    clearInterval(lotteryInterval.value);
    isRunning.value = false;
    

  } else {
    // 开始前更新筛选列表
    updateFilteredSongs();
    // 保存最终结果到历史记录
    if (currentSongs.value.length > 0) {
      lotteryHistory.value.unshift([...currentSongs.value]);
      historyTimestamps.value.unshift(Date.now());
      
      // 只保留最近3条记录（修改为3条）
      if (lotteryHistory.value.length > 3) {
        lotteryHistory.value = lotteryHistory.value.slice(0, 3);
        historyTimestamps.value = historyTimestamps.value.slice(0, 3);
      }
      
      // 保存到本地存储
      uni.setStorageSync('lotteryHistory', lotteryHistory.value);
      uni.setStorageSync('lotteryTimestamps', historyTimestamps.value);
    }
    if (filteredSongs.value.length === 0) {
      uni.showToast({
        title: '没有符合条件的歌曲',
        icon: 'none'
      });
      return;
    }
    
    // 开始抽奖
    hasStarted.value = true;
    isRunning.value = true;
    
    // 快速切换显示不同歌曲
    lotteryInterval.value = setInterval(() => {
      currentSongs.value = getRandomSongs(songCount.value);
    }, 100);
    
  }
};

// 修改 songCount 的 watch 函数，确保切换数量时重新生成歌曲
watch(songCount, (newCount) => {
  // 只有在已经开始且不在运行中时才重新生成
  if (hasStarted.value && !isRunning.value) {
    currentSongs.value =[];
  }
});

// 处理封面点击
const handleCoverClick = (song) => {
  if (!isRunning.value && hasStarted.value && song) {
    // 获取匹配的难度索引（如果存在）
    const difficulty = song.matchedDifficulty !== undefined ? song.matchedDifficulty : 3;
    
    // 跳转到歌曲详情页，并带上难度参数
    uni.navigateTo({
      url: `/pages/song-detail/song-detail?songId=${song.id}&difficulty=${difficulty}`,
      animationType: 'pop-in',
      animationDuration: 200
    });
  }
};

// 版本选择变更
const onVersionChange = (e) => {
  const index = e.detail.value;
  selectedVersion.value = index > 0 ? versionOptions[index] : '';
};

// 类型选择变更
const onGenreChange = (e) => {
  const index = e.detail.value;
  selectedGenre.value = index > 0 ? genreOptions[index] : '';
};

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 选择历史记录中的歌曲
const selectHistoryItem = (song) => {
  handleCoverClick(song);
};

// 添加获取难度样式类的方法
const getDifficultyClass = (song) => {
  if (!song || song.matchedDifficulty === undefined) return '';
  
  const difficultyIndex = song.matchedDifficulty;
  const classes = ['basic', 'advanced', 'expert', 'master', 'remaster'];
  return classes[difficultyIndex] || '';
};

// 添加获取难度名称的方法
const getDifficultyName = (song) => {
  if (!song || song.matchedDifficulty === undefined) return '';
  
  const difficultyIndex = song.matchedDifficulty;
  const names = ['Basic', 'Advanced', 'Expert', 'Master', 'Re:Master'];
  return names[difficultyIndex] || '';
};
</script>

<style lang="scss" scoped>
@import './dark-song-lottery.scss';	
.lottery-container {
  display: flex;
  flex-direction: column;
  padding: 30rpx;
  background-color: #f5f7fa;
  min-height: 100vh;
  gap: 30rpx;
  
  .header {
    text-align: center;
    margin-bottom: 20rpx;
    
    .title {
      font-size: 48rpx;
      font-weight: 700;
      color: #3949ab;
      margin-bottom: 10rpx;
    }
    
    .subtitle {
      font-size: 28rpx;
      color: #5c6bc0;
    }
  }
  
  .filter-section {
    background-color: #ffffff;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    
    .filter-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #3949ab;
      margin-bottom: 20rpx;
    }
    
    .filter-group {
      margin-bottom: 20rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .filter-label {
        font-size: 28rpx;
        color: #5c6bc0;
        margin-bottom: 10rpx;
      }
      
      .range-filter {
        display: flex;
        align-items: center;
        
        .range-input {
          flex: 1;
          height: 80rpx;
          background-color: #f5f7fa;
          border-radius: 10rpx;
          padding: 0 20rpx;
          font-size: 28rpx;
        }
        
        .range-separator {
          margin: 0 20rpx;
          color: #5c6bc0;
        }
      }
      
      .version-picker {
        height: 80rpx;
        background-color: #f5f7fa;
        border-radius: 10rpx;
        padding: 0 20rpx;
        display: flex;
        align-items: center;
        
        .picker-text {
          font-size: 28rpx;
          color: #3c4043;
        }
      }
      
      .genre-picker {
        height: 80rpx;
        background-color: #f5f7fa;
        border-radius: 10rpx;
        padding: 0 20rpx;
        display: flex;
        align-items: center;
        
        .picker-text {
          font-size: 28rpx;
          color: #3c4043;
        }
      }
    }
  }
  
  .lottery-content {
    background-color: #ffffff;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    
    .cover-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10rpx;
      width: 100%;
      
      &.columns-1 {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        
        .cover-item {
          width: 50%;
          position: relative;
          margin: 0 auto;
          padding-top: 50%; // 直接在元素上使用padding-top而不是伪元素
        }
      }
      
      &.columns-2 {
        gap: 10rpx;
        .cover-item {
			
          width: calc(50% - 5rpx);
          padding-top: calc(50% - 5rpx); // 直接使用padding-top
        }
      }
      
      &.columns-3 {
        gap: 8rpx;
        .cover-item {
          width: calc((100% - 16rpx) / 3);
          padding-top: calc((100% - 16rpx) / 3); // 直接使用padding-top
        }
      }
  
      &.columns-4 {
        gap: 8rpx;
        .cover-item {
		
          width: calc((100% - 24rpx) / 4);
          padding-top: calc((100% - 24rpx) / 4); // 直接使用padding-top
        }
      }
      
      .cover-item {
        position: relative;
        border-radius: 8rpx;
        overflow: hidden;
        box-shadow: 0 3rpx 8rpx rgba(0, 0, 0, 0.1);
        
        .song-cover {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .song-cover-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        
        .song-info {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 8rpx 12rpx;
          background: rgba(0, 0, 0, 0.7);
          z-index: 2;
          
          .song-title {
            color: #fff;
            font-size: 18rpx;
            font-weight: 400;
            line-height: 1.3;
            max-height: 32rpx;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 2rpx;
          }
          
          .song-id {
            color: rgba(255, 255, 255, 0.85);
            font-size: 14rpx;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        
        &:hover .song-info {
          white-space: normal;
          max-height: none;
          overflow: visible;
          z-index: 5;
          background: rgba(0, 0, 0, 0.85);
          position: relative;
        }
        
        &.empty {
          background-color: #e8eaf6;
          
          .empty-placeholder {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            
            .placeholder-text {
              font-size: 80rpx;
              font-weight: 700;
              color: #c5cae9;
            }
          }
        }
      }
    }
    
    .control-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 30rpx;
      
      .count-selector {
        display: flex;
        align-items: center;
        
        .count-label {
          color: #5c6bc0;
          font-size: 28rpx;
        }
        
        .count-buttons {
          display: flex;
          margin: 0 20rpx;
          
          .count-button {
            width: 70rpx;
            height: 70rpx;
            border-radius: 50%;
            background-color: #e8eaf6;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 10rpx;
            color: #5c6bc0;
            font-size: 32rpx;
            font-weight: 600;
            
            &.active {
              background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
              color: #ffffff;
            }
          }
        }
      }
      
      .lottery-button {
        background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
        color: white;
        font-size: 36rpx;
        font-weight: 700;
        padding: 24rpx 100rpx;
        border-radius: 50rpx;
        box-shadow: 0 10rpx 20rpx rgba(99, 102, 241, 0.3);
        transition: all 0.3s ease;
        
        &:active {
          transform: scale(0.95);
          box-shadow: 0 5rpx 10rpx rgba(99, 102, 241, 0.3);
        }
        
        &.running {
          background: #f44336;
          box-shadow: 0 10rpx 20rpx rgba(244, 67, 54, 0.3);
        }
      }
    }
  }
  
  .lottery-history {
    flex: 1;
    background-color: #ffffff;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    
    .history-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #3949ab;
      margin-bottom: 20rpx;
    }
    
    .history-scroll {
      max-height: 400rpx; // 稍微减小高度，适应3条记录
      
      .history-list {
        .history-item {
          margin-bottom: 30rpx;
          border-bottom: 2rpx solid #e8eaf6;
          padding-bottom: 20rpx;
          
          &:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          
          .history-date {
            font-size: 24rpx;
            color: #9e9e9e;
            margin-bottom: 16rpx;
          }
          
          .history-songs {
            display: flex;
            flex-wrap: wrap;
            
            .history-cover-wrapper {
              width: 120rpx;
              height: 120rpx;
              margin-right: 10rpx;
              margin-bottom: 10rpx;
            }
            
            .history-cover {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
        }
      }
    }
  }
  .song-cover, .history-cover-wrapper {
    position: relative;
    overflow: hidden;
    border-width: 5rpx;
    border-style: solid;
    border-radius: 4rpx;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    
    &.border-basic {
      border-color: rgb(83, 206, 134);
    }
    
    &.border-advanced {
      border-color: rgb(227, 206, 42);
    }
    
    &.border-expert {
      border-color: rgba(225, 71, 87, 1);
    }
    
    &.border-master {
      border-color: rgba(156, 136, 255, 1);
    }
    
    &.border-remaster {
      border-color: rgb(253, 163, 249);
    }
  }
  
  /* 修改历史记录封面样式 */
  .history-cover-wrapper {
    width: 120rpx;
    height: 120rpx;
    margin-right: 10rpx;
    margin-bottom: 10rpx;
    display: inline-block;
  }
  
  .history-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  /* 修改封面图片样式 */
  .cover-item {
    position: relative;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    display: flex;
    
    .song-cover {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .song-cover-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }
  .history-cover-wrapper {
    border-width: 7rpx;
  }
  /* 添加难度标签样式 */
  .difficulty-badge {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 4rpx 0;
    font-size: 20rpx;
    font-weight: 700;
    text-align: center;
    color: white;
    background-color: rgba(0, 0, 0, 0.6);
    
    &.basic {
      background-color: rgb(83, 206, 134);
    }
    
    &.advanced {
      background-color: rgb(227, 206, 42);
      color: #333;
    }
    
    &.expert {
      background-color: rgba(225, 71, 87, 1);
    }
    
    &.master {
      background-color: rgba(156, 136, 255, 1);
    }
    
    &.remaster {
      background-color: rgb(236, 199, 254);
    }
  }
}
</style> 