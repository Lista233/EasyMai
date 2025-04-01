<template>
  <view class="loss-calculator-page">
    <view class="header">
      <view class="title">判定损失计算</view>
      <view class="subtitle">了解每个音符判定对达成率的影响</view>
    </view>
    
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'manual' }"
        @click="activeTab = 'manual'"
      >
        手动输入
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'song' }"
        @click="activeTab = 'song'"
      >
        从歌曲导入
      </view>
    </view>
    
    <view v-if="activeTab === 'manual'" class="calculator-container">
      <maimai-loss-calculator />
    </view>
    
    <view v-else-if="activeTab === 'song'" class="song-selector">
      <view class="search-box">
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索歌曲..." 
          class="search-input"
          @input="onSearch"
        />
        <text class="search-icon">🔍</text>
      </view>
      
      <view v-if="searchResults.length > 0" class="search-results">
        <view 
          v-for="song in searchResults" 
          :key="song.id" 
          class="song-item"
          @click="selectSong(song)"
        >
          <image :src="getCoverUrl(song.id)" class="song-cover" mode="aspectFill" />
          <view class="song-info">
            <view class="song-title">{{ song.title }}</view>
            <view class="song-id">ID: {{ song.id }}</view>
          </view>
        </view>
      </view>
      
      <view v-else-if="searchKeyword" class="no-results">
        未找到匹配的歌曲
      </view>
      
      <view v-if="selectedSong" class="selected-song">
        <view class="section-title">已选择歌曲</view>
        <view class="song-card">
          <image :src="getCoverUrl(selectedSong.id)" class="song-cover-large" mode="aspectFill" />
          <view class="song-details">
            <view class="song-title-large">{{ selectedSong.title }}</view>
            <view class="song-artist">{{ selectedSong.artist || '未知艺术家' }}</view>
            
            <view class="difficulty-selector">
              <view 
                v-for="(diff, index) in difficulties" 
                :key="index"
                class="difficulty-badge"
                :class="[diff.class, { active: selectedDifficulty === index }]"
                @click="selectDifficulty(index)"
              >
                {{ diff.name }}
              </view>
            </view>
          </view>
        </view>
        
        <view v-if="noteData.total > 0" class="note-data">
          <view class="section-title">谱面数据</view>
          <view class="note-grid">
            <view class="note-item">
              <text class="note-label">TAP</text>
              <text class="note-value">{{ noteData.tap }}</text>
            </view>
            <view class="note-item">
              <text class="note-label">HOLD</text>
              <text class="note-value">{{ noteData.hold }}</text>
            </view>
            <view class="note-item">
              <text class="note-label">SLIDE</text>
              <text class="note-value">{{ noteData.slide }}</text>
            </view>
            <view class="note-item">
              <text class="note-label">TOUCH</text>
              <text class="note-value">{{ noteData.touch }}</text>
            </view>
            <view class="note-item">
              <text class="note-label">BREAK</text>
              <text class="note-value">{{ noteData.break }}</text>
            </view>
            <view class="note-item">
              <text class="note-label">总物量</text>
              <text class="note-value">{{ noteData.total }}</text>
            </view>
          </view>
        </view>
        
        <maimai-loss-calculator 
          :noteData="noteData" 
          :useExternalData="noteData.total > 0"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import MaimaiLossCalculator from '@/components/maimai-loss-calculator/index.vue';
import { getCoverUrl } from '@/util/coverManager.js';
import SongService from '@/utils/SongService.js';

// 活动标签
const activeTab = ref('manual');

// 搜索关键词
const searchKeyword = ref('');

// 搜索结果
const searchResults = ref([]);

// 选中的歌曲
const selectedSong = ref(null);

// 选中的难度
const selectedDifficulty = ref(3); // 默认选择 Master

// 难度列表
const difficulties = [
  { name: 'Basic', class: 'basic' },
  { name: 'Advanced', class: 'advanced' },
  { name: 'Expert', class: 'expert' },
  { name: 'Master', class: 'master' },
  { name: 'Re:Master', class: 'remaster' }
];

// 音符数据
const noteData = ref({
  tap: 0,
  hold: 0,
  slide: 0,
  touch: 0,
  break: 0,
  total: 0
});

// 歌曲服务
const songService = ref(null);

// 初始化
onMounted(async () => {
  await initSongService();
});

// 初始化歌曲服务
const initSongService = async () => {
  try {
    const musicData = uni.getStorageSync('musicData');
    if (musicData) {
      songService.value = new SongService(musicData);
    } else {
      uni.showToast({
        title: '未找到歌曲数据',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('初始化歌曲服务失败:', error);
    uni.showToast({
      title: '初始化失败',
      icon: 'none'
    });
  }
};

// 搜索歌曲
const onSearch = () => {
  if (!songService.value) return;
  
  const keyword = searchKeyword.value.trim();
  if (!keyword) {
    searchResults.value = [];
    return;
  }
  
  try {
    searchResults.value = songService.value.searchSongs(keyword, {
      limit: 10
    });
  } catch (error) {
    console.error('搜索歌曲失败:', error);
    uni.showToast({
      title: '搜索失败',
      icon: 'none'
    });
  }
};

// 选择歌曲
const selectSong = (song) => {
  selectedSong.value = song;
  loadNoteData();
};

// 选择难度
const selectDifficulty = (index) => {
  selectedDifficulty.value = index;
  loadNoteData();
};

// 加载音符数据
const loadNoteData = () => {
  if (!selectedSong.value) return;
  
  try {
    const song = songService.value.getSongById(selectedSong.value.id);
    if (!song) {
      resetNoteData();
      return;
    }
    
    const chart = song.charts[selectedDifficulty.value];
    if (!chart || !chart.notes) {
      resetNoteData();
      return;
    }
    
    // 获取音符数据
    const notes = chart.notes;
    
    // 判断是否为DX谱面（notes数组长度为5）
    const isDXChart = notes.length === 5;
    
    if (isDXChart) {
      // DX谱面中，第4个元素是TOUCH，第5个元素是BREAK
      noteData.value = {
        tap: notes[0] || 0,
        hold: notes[1] || 0,
        slide: notes[2] || 0,
        touch: notes[3] || 0,
        break: notes[4] || 0,
        total: notes.reduce((sum, count) => sum + (count || 0), 0)
      };
    } else {
      // 非DX谱面
      noteData.value = {
        tap: notes[0] || 0,
        hold: notes[1] || 0,
        slide: notes[2] || 0,
        touch: 0,
        break: notes[3] || 0,
        total: notes.reduce((sum, count) => sum + (count || 0), 0)
      };
    }
  } catch (error) {
    console.error('加载音符数据失败:', error);
    resetNoteData();
  }
};

// 重置音符数据
const resetNoteData = () => {
  noteData.value = {
    tap: 0,
    hold: 0,
    slide: 0,
    touch: 0,
    break: 0,
    total: 0
  };
};
</script>

<style lang="scss" scoped>
.loss-calculator-page {
  padding: 30rpx;
}

.header {
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.subtitle {
  font-size: 24rpx;
  color: #666;
  margin-top: 10rpx;
}

.tabs {
  display: flex;
  margin-bottom: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
  
  &.active {
    color: #4f46e5;
    font-weight: bold;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -2rpx;
      left: 25%;
      width: 50%;
      height: 6rpx;
      background-color: #4f46e5;
      border-radius: 3rpx;
    }
  }
}

.calculator-container {
  margin-top: 20rpx;
}

.song-selector {
  margin-top: 20rpx;
}

.search-box {
  position: relative;
  margin-bottom: 20rpx;
}

.search-input {
  width: 100%;
  height: 80rpx;
  padding: 0 80rpx 0 20rpx;
  font-size: 28rpx;
  border: 1rpx solid #ddd;
  border-radius: 40rpx;
  background-color: #f9f9f9;
}

.search-icon {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 32rpx;
  color: #999;
}

.search-results {
  max-height: 600rpx;
  overflow-y: auto;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  margin-bottom: 30rpx;
}

.song-item {
  display: flex;
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
}

.song-cover {
  width: 100rpx;
  height: 100rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
}

.song-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.song-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.song-id {
  font-size: 24rpx;
  color: #999;
}

.no-results {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 28rpx;
}

.selected-song {
  margin-top: 30rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  padding-left: 10rpx;
  border-left: 6rpx solid #4f46e5;
}

.song-card {
  display: flex;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
  margin-bottom: 30rpx;
}

.song-cover-large {
  width: 180rpx;
  height: 180rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
}

.song-details {
  flex: 1;
}

.song-title-large {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.song-artist {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.difficulty-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.difficulty-badge {
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: white;
  text-align: center;
  
  &.active {
    box-shadow: 0 0 0 3rpx white, 0 0 0 6rpx currentColor;
  }
  
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
    background-color: rgb(218, 153, 240);
  }
}

.note-data {
  margin-bottom: 30rpx;
}

.note-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.note-item {
  background-color: #f0f4ff;
  padding: 15rpx;
  border-radius: 10rpx;
  text-align: center;
}

.note-label {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 5rpx;
}

.note-value {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #4f46e5;
}
</style> 