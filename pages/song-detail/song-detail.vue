<template>
	<view>
		<input @blur="(e)=>changeSongValue(e)"> </input>
	</view>
  <view class="container">
    <view class="song-card" :class="difficulties[currentDiffIndex].class">
      <view class="song-header">
        <!-- 添加封面图片 -->
        <view class="cover-container">
          <image 
            class="song-cover" 
            :src="getCoverUrl(songData?.id)"
            mode="aspectFill"
            @error="handleImageError"
          />
          <view class="loading-overlay" v-if="isLoading(songData?.id)">
            <text>加载中...</text>
          </view>
        </view>

        <view class="song-info">
          <view class="title-row">
            <view class="title-decoration"></view>
            <text class="song-title">{{ songData?.title }}</text>
            <text class="song-id">#{{ songData?.id }}</text>
          </view>
          
          <view class="basic-info">
            <view class="info-row">
              <view class="label-wrapper">
                <view class="label-decoration"></view>
                <text class="label">类别:</text>
              </view>
              <text class="value">{{ songData?.basic_info?.genre || '-' }}</text>
            </view>
            <view class="info-row">
              <view class="label-wrapper">
                <view class="label-decoration"></view>
                <text class="label">BPM:</text>
              </view>
              <text class="value">{{ songData?.basic_info?.bpm || '-' }}</text>
            </view>
            <view class="info-row">
              <view class="label-wrapper">
                <view class="label-decoration"></view>
                <text class="label">版本:</text>
              </view>
              <view class="value-container">
                <image 
                  class="from-logo" 
                  :src="`/static/logo/${getLogoName(songData?.basic_info?.from || '')}`"
                  mode="aspectFit"
                />
              </view>
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
            [diff.class]: true
          }"
          @click="switchDifficulty(index)"
          v-show="index < songData?.charts?.length && diff.name !== 'Re:Mas' || 
                  (diff.name === 'Re:Mas' && songData?.charts?.length >= 5)"
        >
          <text>{{ diff.name }}</text>
          <text class="level">Lv.{{ songData?.level[index] }}</text>
        </view>
      </view>

      <!-- 难度详情 -->
      <view class="difficulty-details" :class="difficulties[currentDiffIndex].class">
        <!-- 定数显示 -->
        <view class="detail-row">
          <text class="label">定数：</text>
          <text class="value">{{ songData.ds[currentDiffIndex] }}</text>
        </view>

        <!-- 谱面信息 -->
        <view class="chart-info">
          <text class="label">谱师：</text>
          <text class="value">{{ songData.charts[currentDiffIndex].charter }}</text>
        </view>

        <!-- Note数据 -->
        <view class="notes-info">
          <text class="label">Notes详情：</text>
          <view class="notes-grid">
            <view class="note-item" v-for="(type, index) in noteTypes" :key="type">
              <text class="note-type">{{ type }}</text>
              <text class="note-count">{{ getNoteCount(index) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 修改玩家成绩模块的条件 -->
      <view class="player-record" v-if="playerRecord">
        <view class="record-header">
          <text class="section-title">玩家最佳成绩</text>
        </view>
        <view class="record-content">
          <view class="achievement-section">
            <text class="achievement-value" :class="getAchievementClass(currentRecord?.achievements)">
              {{currentRecord?.achievements ? Number(currentRecord.achievements).toFixed(4) : '-'}}%
            </text>
            <text class="rate-badge" :class="getRateBadgeClass(currentRecord?.rate)">
              {{formatRate(currentRecord?.rate) || '-'}}
            </text>
          </view>
          
          <view class="record-details">
            <view class="detail-item">
              <text class="label">Rating:</text>
              <text class="value ra" :class="getRatingClass(currentRecord?.ra)">{{currentRecord?.ra || '-'}}</text>
            </view>
            <view class="detail-item">
              <text class="label">连击|同步</text>
              <text class="value">{{formatCombo(currentRecord?.fc) || '-'}} | {{formatFS(currentRecord?.fs) || '-'}}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>

	import { ref, computed, onMounted } from 'vue'
	import SongService from '@/utils/songService.js'
	import playerRecordService from '@/utils/playerRecordService.js'
	import * as maiApi from '../../api/maiapi.js'
	import {onLoad} from '@dcloudio/uni-app'
	import { getCoverUrl, isLoading } from '@/util/coverManager.js'

	const song = ref('')
	const songService = ref(null)
	const playerRecord = ref({})
	playerRecord.value =uni.getStorageSync('divingFish_records').data

	playerRecordService.initPlayerData(playerRecord.value)
	
	onMounted(() => {
		console.log(1)
		const musicList = uni.getStorageSync('musicData')
		// 初始化 songService
		songService.value = new SongService(musicList)
		// 获取歌曲信息
		song.value = songService.value.getSongById('8')
	})
	
	// 更改歌曲方法
	const changeSongValue = (e) => {
		console.log(e)
		if (songService.value) {
			songData.value = songService.value.getSongById(e.detail.value)
		}
	}
// 示例数据
const songData = ref({
  "id": "8",
  "title": "True Love Song",
  "type": "SD",
  "ds": [5.0, 7.2, 10.2, 12.4],
  "level": ["5", "7", "10", "12"],
  "cids": [1, 2, 3, 4],
  "charts": [
    {
      "notes": [63, 23, 8, 2],
      "charter": "-"
    },
    {
      "notes": [85, 27, 6, 4],
      "charter": "-"
    },
    {
      "notes": [110, 56, 9, 2],
      "charter": "譜面-100号"
    },
    {
      "notes": [263, 14, 19, 6],
      "charter": "ニャイン"
    }
  ]
})

// 当前选中的难度索引 - 修改默认值为 3 (Master)
const currentDiffIndex = ref(3)

// 难度配置
const difficulties = [
  { name: 'Basic', class: 'basic' },
  { name: 'Advan', class: 'advanced' },
  { name: 'Expert', class: 'expert' },
  { name: 'Master', class: 'master' },
  { name: 'Re:Mas', class: 'remaster' }
]

// Note类型
const noteTypes = ['TAP', 'HOLD', 'SLIDE', 'BREAK', 'TOUCH']

// 切换难度
const switchDifficulty = (index) => {
  if (index < songData.value.ds.length) {
    currentDiffIndex.value = index
  }
}

// 简化的 logo 获取方法
const getLogoName = (from) => {
  return `${from}.png`
}

// 获取note数量的方法
const getNoteCount = (index) => {
  const chart = songData.value?.charts[currentDiffIndex.value]
  // 对于TOUCH类型（index === 4），如果没有数据则返回0
  if (index === 4) {
    return chart?.notes[index] || 0
  }
  // 其他类型正常返回
  return chart?.notes[index] ?? 0
}

// 如果需要获取当前难度的谱面信息
const currentChart = computed(() => {
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

// 获取当前歌曲的游玩记录
const currentRecord = computed(() => {
 
  if (!songData.value?.id) return null
  const a= playerRecordService.getRecordBySongIdAndLevel(
    songData.value.id,
    currentDiffIndex.value
  )
  console.log(a)
  return a;
}

)

// 修改格式化方法，添加空值处理
const formatCombo = (fc) => fc ? fc.replace('p', '+') : ''
const formatFS = (fs) => fs ? fs.replace('p', '+').replace('ap', 'AP').replace('app', 'AP+') : ''
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

const getRateBadgeClass = (rate) => ({
  'rainbow': rate?.includes('sss'),
  'gold': rate?.includes('ss') && !rate?.includes('sss'),
  'silver': rate?.includes('s') && !rate?.includes('ss'),
})
</script>

<style lang="scss">
.container {
  padding: 30rpx;
  background: linear-gradient(to bottom, #ffffff, #f8f8f8);
  min-height: 100vh;
  box-sizing: border-box;
  
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
    border-color: #37a03b;
    background: linear-gradient(135deg, rgba(55, 160, 59, 0.05), transparent);
    .title-decoration { background: #37a03b; }
    .cover-container { border-color: #37a03b; }
    .label-decoration { background: #37a03b; }
  }
  &.advanced {
    border-color: #f3c05f;
    background: linear-gradient(135deg, rgba(243, 192, 95, 0.05), transparent);
    .title-decoration { background: #f3c05f; }
    .cover-container { border-color: #f3c05f; }
  }
  &.expert {
    border-color: #e83c3c;
    background: linear-gradient(135deg, rgba(232, 60, 60, 0.05), transparent);
    .title-decoration { background: #e83c3c; }
    .cover-container { border-color: #e83c3c; }
    .label-decoration { background: #e83c3c; }
  }
  &.master {
    border-color: #9c51b6;
    background: linear-gradient(135deg, rgba(156, 81, 182, 0.05), transparent);
    .title-decoration { background: #9c51b6; }
    .cover-container { border-color: #9c51b6; }
    .label-decoration { background: #9c51b6; }
  }
  &.remaster {
    border-color: #e0a3ff;
    background: linear-gradient(135deg, rgba(224, 163, 255, 0.05), transparent);
    .title-decoration { background: #e0a3ff; }
    .cover-container { border-color: #e0a3ff; }
    .label-decoration { background: #e0a3ff; }
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

// 修改难度标签的颜色，使其继承卡片的主题色
.difficulty-tab {
  &.active {
    &.basic { 
      color: #37a03b;
      .title-decoration, .label-decoration { background: #37a03b; }
    }
    &.advanced { 
      color: #f3c05f;
      .title-decoration, .label-decoration { background: #f3c05f; }
    }
    &.expert { 
      color: #e83c3c;
      .title-decoration, .label-decoration { background: #e83c3c; }
    }
    &.master { 
      color: #9c51b6;
      .title-decoration, .label-decoration { background: #9c51b6; }
    }
    &.remaster { 
      color: #e0a3ff;
      .title-decoration, .label-decoration { background: #e0a3ff; }
    }
  }
}

input {
	width: 80%;
	padding: 10rpx;
	border: 5px solid slateblue;
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
      
      .song-title {
        font-size: 36rpx;
        font-weight: bold;
        margin-right: 16rpx;
      }
      
      .song-id {
        font-size: 28rpx;
        color: #666;
      }
    }
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
    padding: 15rpx 10rpx;
    text-align: center;
    border-radius: 8rpx;
    background: #f5f5f5;
    transition: all 0.3s;
    white-space: nowrap;
    
    &.active {
      color: #fff;
      font-weight: bold;
    }
    
    .level {
      display: block;
      font-size: 24rpx;
      margin-top: 4rpx;
    }
    
    // 修改 basic 的颜色
    &.basic.active { background: #37a03b; }  // 改为绿色
    &.advanced.active { background: #f3c05f; }
    &.expert.active { background: #f36f6f; }
    &.master.active { background: #b264bf; }
    &.remaster.active { background: #ffffff; color: #e0a3ff; }
  }
}

.difficulty-details {
  padding: 30rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
  
  &.basic { 
    background: rgba(55, 160, 59, 0.1);
    .label { color: #37a03b; }
    .value { color: #2f8a33; }
  }
  &.advanced { 
    background: rgba(243, 192, 95, 0.1);
    .label { color: #d4a64a; }
    .value { color: #b38a3d; }
  }
  &.expert { 
    background: rgba(232, 60, 60, 0.1);
    .label { color: #e83c3c; }
    .value { color: #c93535; }
  }
  &.master { 
    background: rgba(156, 81, 182, 0.1);
    .label { color: #9c51b6; }
    .value { color: #854b9b; }
  }
  &.remaster { 
    background: rgba(224, 163, 255, 0.1);
    .label { color: #c58de0; }
    .value { color: #a974c4; }
  }

  .detail-row, .chart-info, .notes-info {
    margin-bottom: 20rpx;
    
    .label {
      font-size: 28rpx;
      font-weight: 600;
      margin-right: 10rpx;
    }
    
    .value {
      font-size: 32rpx;
      font-weight: 700;
    }
  }

  .notes-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6rpx;
    margin-top: 16rpx;
    
    .note-item {
      text-align: center;
      padding: 16rpx 12rpx;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 8rpx;
      backdrop-filter: blur(4px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 8rpx;
      min-height: 100rpx;
      min-width: 0;
      width: 100%;
      box-sizing: border-box;
      transition: all 0.3s ease;
      
      .basic & {
        border: 1px solid rgba(55, 160, 59, 0.2);
        .note-type { color: #37a03b; }
        .note-count { color: #2f8a33; }
      }
      
      .advanced & {
        border: 1px solid rgba(243, 192, 95, 0.2);
        .note-type { color: #d4a64a; }
        .note-count { color: #b38a3d; }
      }
      
      .expert & {
        border: 1px solid rgba(232, 60, 60, 0.2);
        .note-type { color: #e83c3c; }
        .note-count { color: #c93535; }
      }
      
      .master & {
        border: 1px solid rgba(156, 81, 182, 0.2);
        .note-type { color: #9c51b6; }
        .note-count { color: #854b9b; }
      }
      
      .remaster & {
        border: 1px solid rgba(224, 163, 255, 0.2);
        .note-type { color: #c58de0; }
        .note-count { color: #a974c4; }
      }
      
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
  max-width: 280rpx;
  max-height: 150rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  
  .info-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 8rpx;
    
    .label {
      color: #666;
      width: 100rpx;
      font-size: 26rpx;
      padding-top: 4rpx;
    }
    
    .value-container {
      flex: 1;
      display: flex;
      align-items: flex-start;
    }
    
    .from-logo {
      width: 300rpx;
      height: 100rpx;
	  top:-40rpx;
	  left: -90rpx;
      object-fit: contain;
      margin: 10rpx 0;
    }
  }
}

// 修改所有标签装饰的颜色
.song-card {
  &.basic .label-decoration { background: #37a03b; }
  &.advanced .label-decoration { background: #f3c05f; }
  &.expert .label-decoration { background: #e83c3c; }
  &.master .label-decoration { background: #b264bf; }
  &.remaster .label-decoration { background: rgb(170, 81, 196); }
}

.player-record {
  margin-top: 30rpx;
  padding: 30rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  
  .record-header {
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 28rpx;
      color: #666;
      font-weight: 500;
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
      
      .rate-badge {
        font-size: 48rpx;
        font-weight: 700;
        padding: 8rpx 24rpx;
        border-radius: 12rpx;
        color: #666;
        background: rgba(0, 0, 0, 0.05);
        
        &.rainbow {
          background: none;
          background-clip: text;
          -webkit-background-clip: text;
          background-image: linear-gradient(45deg, 
            #ff4757,
            #ff7f50,
            #ffa502,
            #70a1ff,
            #7f50ff,
            #ff6b81
          );
          color: transparent;
          font-weight: 800;
          text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
        }
        
        &.gold {
          background: none;
          background-clip: text;
          -webkit-background-clip: text;
          background-image: linear-gradient(45deg, 
            #ffd700,
            #ffa500,
            #ffd700
          );
          color: transparent;
          font-weight: 800;
          text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
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
</style> 