<template>
  <view class="container">
    <!-- 搜索和筛选模块 -->
    <view class="search-filter-section">
      <view class="search-box">
        <view class="search-input-wrapper">
          <uni-icons type="search" size="20" color="#666"></uni-icons>
          <input 
            v-model="searchKeyword" 
            type="text" 
            placeholder="输入歌曲名称/别名/ID进行搜索"
            @input="onSearch"
          />
          <view class="view-toggle" @click="toggleViewMode">
            <uni-icons :type="viewMode === 'grid' ? 'image' : 'list'" size="20" color="#ffffff"></uni-icons>
          </view>
        </view>
      </view>
      
      <view class="filter-section">
        <view class="filter-buttons">
          <button class="filter-btn" @click="showDsFilter">
            <view class="btn-content">
              <text class="btn-title">定数筛选</text>
              <text v-if="dsFilter.min || dsFilter.max" class="filter-active">
                {{formatDsFilterText}}
              </text>
            </view>
          </button>
          <button class="filter-btn" @click="showVersionFilter">
            <view class="btn-content">
              <text class="btn-title">版本筛选</text>
              <text v-if="selectedVersion" class="filter-active">
                {{formatVersionText}}
              </text>
            </view>
          </button>
          <button class="filter-btn" @click="showGenreFilter">
            <view class="btn-content">
              <text class="btn-title">类别筛选</text>
              <text v-if="selectedGenre" class="filter-active">
                {{formatGenreText}}
              </text>
            </view>
          </button>
        </view>
      </view>
    </view>
    
    <!-- 列表视图 -->
    <view class="result-list" v-if="viewMode === 'list'">
      <view 
        v-for="(result, index) in searchResults" 
        :key="result.songId" 
        class="result-item"
        @click="navigateToDetail(result.songId)"
      >
        <view class="song-cover">
          <image 
            :src="getCoverUrl(result.songId)" 
            mode="aspectFill"
            lazy-load
            :loading-priority="getLoadingPriority(index)"
            @error="handleImageError"
          ></image>
        </view>
        <view class="song-info">
          <view class="title-row">
            <text class="song-name" selectable>{{result.name}}</text>
            <text class="song-id">#{{result.songId}}</text>
          </view>
          <view class="song-details">
            <text class="version">{{versionMap[result.basic_info?.from] || result.basic_info?.from || '未知版本'}}</text>
            <text class="genre" v-if="result.basic_info?.genre">{{formatGenre(result.basic_info?.genre)}}</text>
            <text class="difficulty">{{formatLevels(result.level)}}</text>
          </view>
          <view class="matched-aliases" v-if="result.matchedAliases?.length">
            <text>{{formatAliases(result.matchedAliases)}}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 网格视图 -->
    <view class="grid-view" v-else>
      <view class="grid-group" v-for="(group, groupIndex) in groupedResults" :key="groupIndex">
        <view 
          class="grid-item" 
          v-for="(result, index) in group" 
          :key="result ? result.songId : index"
          @click="result && navigateToDetail(result.songId)"
        >
          <view class="grid-cover" v-if="result">
            <image 
              :src="getCoverUrl(result.songId)" 
              mode="aspectFill"
              lazy-load
              :loading-priority="getLoadingPriority(groupIndex * 9 + index)"
              @error="handleImageError"
            ></image>
          </view>
        </view>
      </view>
    </view>

    <!-- 定数筛选弹窗 -->
    <uni-popup ref="dsPopup" type="center">
      <view class="filter-popup">
        <view class="popup-header">
          <text class="title">定数范围筛选</text>
          <text class="close-btn" @click="closeDsFilter">×</text>
        </view>
        <view class="popup-content">
          <view class="form-item ds-range">
            <input 
              type="digit" 
              v-model="dsFilter.min" 
              placeholder="最小值"
              @input="onDsInput('min')"
              @focus="onInputFocus"
              @blur="onInputBlur"
              maxlength="3"
            />
            <text class="range-separator">至</text>
            <input 
              type="digit" 
              v-model="dsFilter.max" 
              placeholder="最大值"
              @input="onDsInput('max')"
              @focus="onInputFocus"
              @blur="onInputBlur"
              maxlength="3"
            />
          </view>
          <view class="range-tips">
            <text>* 定数范围: 1.0-15.0</text>
          </view>
          <view class="difficulty-select">
            <text>难度：</text>
            <picker 
              :range="difficulties" 
              range-key="name"
              @change="onDifficultyChange"
            >
              <view class="picker-value">
                <text class="picker-text">{{selectedDifficulty.name || '选择难度'}}</text>
                <!-- <text class="picker-arrow">▼</text> -->
              </view>
            </picker>
          </view>
        </view>
        <view class="popup-footer">
          <button class="cancel-btn" @click="closeDsFilter">取消</button>
          <button class="confirm-btn" @click="applyDsFilter">确定</button>
        </view>
      </view>
    </uni-popup>

    <!-- 版本筛选弹窗 -->
    <uni-popup ref="versionPopup" type="center">
      <view class="filter-popup">
        <view class="popup-header">
          <text class="title">版本筛选</text>
          <text class="close-btn" @click="closeVersionFilter">×</text>
        </view>
        <view class="popup-content version-list">
          <scroll-view scroll-y class="version-scroll">
            <view 
              v-for="version in versions" 
              :key="version"
              class="version-item"
              :class="{ active: selectedVersion === version }"
              @click="selectVersion(version)"
            >
              <text>{{version}}</text>
            </view>
          </scroll-view>
        </view>
        <view class="popup-footer">
          <button class="cancel-btn" @click="closeVersionFilter">取消</button>
          <button class="confirm-btn" @click="applyVersionFilter">确定</button>
        </view>
      </view>
    </uni-popup>

    <!-- 类别筛选弹窗 -->
    <uni-popup ref="genrePopup" type="center">
      <view class="filter-popup">
        <view class="popup-header">
          <text class="title">类别筛选</text>
          <text class="close-btn" @click="closeGenreFilter">×</text>
        </view>
        <view class="popup-content version-list">
          <scroll-view scroll-y class="version-scroll">
            <view 
              v-for="genre in genres" 
              :key="genre"
              class="version-item"
              :class="{ active: selectedGenre === genre }"
              @click="selectGenre(genre)"
            >
              <text>{{genre}}</text>
            </view>
          </scroll-view>
        </view>
        <view class="popup-footer">
          <button class="cancel-btn" @click="closeGenreFilter">取消</button>
          <button class="confirm-btn" @click="applyGenreFilter">确定</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import SongSearcher from '@/utils/songSearcher.js'
import SongService from '@/utils/songService.js'
import {getCoverUrl,initCoverList} from '../../util/coverManager.js'

// 原有的响应式状态
const searcher = ref(null)
const songService = ref(null)
const searchKeyword = ref('')
const searchResults = ref([])

// 新增的响应式状态
const dsPopup = ref(null)
const versionPopup = ref(null)
const genrePopup = ref(null)
const dsFilter = ref({
  min: '',
  max: ''
})
const selectedVersion = ref('')
const selectedDifficulty = ref({})
const selectedType = ref('')
const selectedGenre = ref('')

// 视图模式状态
const viewMode = ref('list') // 'list' 或 'grid'

// 难度选项
const difficulties = [
  { name: '任意难度', value: -1 },
  { name: 'Basic', value: 0 },
  { name: 'Advanced', value: 1 },
  { name: 'Expert', value: 2 },
  { name: 'Master', value: 3 },
  { name: 'Re:Master', value: 4 }
]

// 添加简化的版本映射
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

// 修改反向映射关系，从显示名称映射到原始值
const reverseVersionMap = {
  'maimai': 'maimai',
  'maimai+': 'maimai PLUS',
  'Green': 'maimai GreeN',
  'Green+': 'maimai GreeN PLUS',
  'Orange': 'maimai ORANGE',
  'Orange+': 'maimai ORANGE PLUS',
  'Pink': 'maimai PiNK',
  'Pink+': 'maimai PiNK PLUS',
  'Murasaki': 'maimai MURASAKi',
  'Murasaki+': 'maimai MURASAKi PLUS',
  'Milk': 'maimai MiLK',
  'Milk+': 'MiLK PLUS',
  'Finale': 'maimai FiNALE',
  '舞萌DX2020': 'maimai でらっくす',
  '舞萌DX2021': 'maimai でらっくす Splash',
  '舞萌DX2022': 'maimai でらっくす UNiVERSE',
  '舞萌DX2023': 'maimai でらっくす FESTiVAL',
  '舞萌DX2024': 'maimai でらっくす BUDDiES'
}

// 版本列表（使用显示名称）
const versions = [
  '任意版本',
  'maimai',
  'maimai+',
  'Green',
  'Green+',
  'Orange',
  'Orange+',
  'Pink',
  'Pink+',
  'Murasaki',
  'Murasaki+',
  'Milk',
  'Milk+',
  'Finale',
  '舞萌DX2020',
  '舞萌DX2021',
  '舞萌DX2022',
  '舞萌DX2023',
  '舞萌DX2024'
]

// 歌曲类别列表
const genres = [
  '任意类别',
  '舞萌',
  '流行&动漫',
  'niconico & VOCALOID',
  '其他游戏',
  '东方Project',
  '音击&中二节奏'
]

// 切换视图模式
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'list' ? 'grid' : 'list'
}

// 将搜索结果分组（每组9个，用于网格视图）
const groupedResults = computed(() => {
  const groups = []
  const itemsPerGroup = 9
  
  for (let i = 0; i < searchResults.value.length; i += itemsPerGroup) {
    // 获取当前组的元素，可能不足9个
    const group = searchResults.value.slice(i, i + itemsPerGroup)
    
    // 如果不足9个，填充空元素保持布局
    while (group.length < itemsPerGroup) {
      group.push(null)
    }
    
    groups.push(group)
  }
  
  return groups
})

// 显示定数筛选弹窗
const showDsFilter = () => {
  dsPopup.value.open()
}

// 关闭定数筛选弹窗
const closeDsFilter = () => {
  dsPopup.value.close()
}

// 显示版本筛选弹窗
const showVersionFilter = () => {
  versionPopup.value.open()
}

// 关闭版本筛选弹窗
const closeVersionFilter = () => {
  versionPopup.value.close()
}

// 显示类别筛选弹窗
const showGenreFilter = () => {
  genrePopup.value.open()
}

// 关闭类别筛选弹窗
const closeGenreFilter = () => {
  genrePopup.value.close()
}

// 选择难度
const onDifficultyChange = (e) => {
  selectedDifficulty.value = difficulties[e.detail.value]
}

// 选择版本
const selectVersion = (version) => {
  if (version === '任意版本') {
    selectedVersion.value = ''
  } else {
    // 保存显示值而非原始值
    selectedVersion.value = version
  }
}

// 选择类别
const selectGenre = (genre) => {
  if (genre === '任意类别') {
    selectedGenre.value = ''
  } else {
    selectedGenre.value = genre
  }
}

// 简化定数输入处理方法
const onDsInput = (type) => {
  // 简单清除非数字和小数点字符
  let value = dsFilter.value[type];
  value = value.replace(/[^\d.]/g, '');
  dsFilter.value[type] = value;
};

// 修改应用定数筛选方法，在提交时校验
const applyDsFilter = () => {
  // 校验并修正定数范围
  let min = dsFilter.value.min ? parseFloat(dsFilter.value.min) : null;
  let max = dsFilter.value.max ? parseFloat(dsFilter.value.max) : null;
  
  // 确保值在1.0-15.0范围内
  if (min !== null) {
    min = Math.max(1.0, Math.min(15.0, min));
    dsFilter.value.min = min.toFixed(1);
  }
  
  if (max !== null) {
    max = Math.max(1.0, Math.min(15.0, max));
    dsFilter.value.max = max.toFixed(1);
  }
  
  // 确保最小值不大于最大值
  if (min !== null && max !== null && min > max) {
    // 交换值
    [dsFilter.value.min, dsFilter.value.max] = [dsFilter.value.max, dsFilter.value.min];
  }
  
  closeDsFilter();
  onSearch();
};

// 修改搜索方法
const onSearch = async () => {
  if (!searchKeyword.value.trim() && !dsFilter.value.min && !dsFilter.value.max && !selectedVersion.value && !selectedGenre.value) {
    searchResults.value = []
    return
  }
  
  let matchedIds = new Set()
  
  // 1. 检查是否为纯数字ID搜索
  const keyword = searchKeyword.value.trim()
  if (keyword && /^\d+$/.test(keyword)) {
    // 纯数字搜索，直接通过ID查找
    const song = songService.value.getSongById(keyword)
    if (song) {
      matchedIds.add(song.id.toString())
    }
  } else if (keyword) {
    // 关键词搜索
    const searchResults = searcher.value.search({
      keyword: keyword,
      exactMatch: false
    })
    searchResults.forEach(result => matchedIds.add(result.id))
  } else {
    // 如果没有关键词，获取所有歌曲ID
    searcher.value.getAllIds().forEach(id => matchedIds.add(id))
  }

  // 2. 获取匹配ID的歌曲数据并应用组合筛选
  let results = songService.value.searchSongs({
    version: reverseVersionMap[selectedVersion.value] || selectedVersion.value || undefined,
    genre: selectedGenre.value || undefined,
    dsRange: (dsFilter.value.min || dsFilter.value.max) ? {
      min: dsFilter.value.min ? Number(dsFilter.value.min) : undefined,
      max: dsFilter.value.max ? Number(dsFilter.value.max) : undefined
    } : undefined
  }, {
    difficulty: selectedDifficulty.value.value >= 0 ? selectedDifficulty.value.value : undefined,
    exactVersion: true,
    exactGenre: true
  })

  // 3. 只保留匹配ID的结果
  results = results.filter(song => matchedIds.has(song.id.toString()))

  // 4. 获取匹配的别名信息并格式化结果
  const formattedResults = results.map(song => {
    const aliasInfo = searcher.value.getAliasInfo(song.id)
    let matchInfo = null
    
    if (keyword && !/^\d+$/.test(keyword)) {
      matchInfo = searcher.value.search({
        keyword: keyword,
        exactMatch: false
      }).find(r => r.id === song.id)
    }
    
    return {
      songId: song.id,
      name: song.title || aliasInfo?.name || '',
      matchedAliases: matchInfo?.matchedAliases || [],
      matchFields: matchInfo?.matchFields || [],
      ds: song.ds,
      level: song.level,
      basic_info: song.basic_info
    }
  })
  
  searchResults.value = formattedResults
}

// 获取数据方法
const initData = () => {
  const aliasData = uni.getStorageSync('aliasData')
  const musicData = uni.getStorageSync('musicData')
  searcher.value = new SongSearcher(aliasData)
  songService.value = new SongService(musicData)
}

// 格式化别名显示
const formatAliases = (aliases) => {
  if (!aliases || aliases.length === 0) return ''
  
  // 最多显示3个别名
  const maxAliases = aliases.slice(0, 3)
  const displayText = maxAliases.join(', ')
  
  // 如果还有更多别名，添加省略号
  return aliases.length > 3 ? `${displayText} 等` : displayText
}

// 生命周期钩子
onMounted(() => {
  initCoverList()
  initData()
})

// 添加跳转方法
const navigateToDetail = (songId) => {
  uni.navigateTo({
    url: `/pages/song-detail/song-detail?songId=${songId}`,
		animationType: 'pop-in',
		animationDuration: 0
  })
}

// 修改格式化定数筛选文本计算属性
const formatDsFilterText = computed(() => {
  if (!dsFilter.value.min && !dsFilter.value.max) return ''
  
  // 提取难度部分
  const difficulty = selectedDifficulty.value.name 
    ? selectedDifficulty.value.name 
    : '任意'
  
  // 构建范围文本
  let rangeText = ''
  if (dsFilter.value.min && dsFilter.value.max) {
    rangeText = `${dsFilter.value.min}-${dsFilter.value.max}`
  } else if (dsFilter.value.min) {
    rangeText = `≥${dsFilter.value.min}`
  } else if (dsFilter.value.max) {
    rangeText = `≤${dsFilter.value.max}`
  }
  
  // 将难度与范围组合，允许换行显示
  return `${difficulty}\n${rangeText}`
})

// 格式化版本文本（用于筛选按钮显示）
const formatVersionText = computed(() => {
  if (!selectedVersion.value) return '';
  // 允许显示换行
  return selectedVersion.value;
})

// 修复输入框获取焦点的处理函数
const onInputFocus = (e) => {
  try {
    const input = e.target;
    if(input && input.style) {
      input.style.backgroundColor = '#fff';
      input.style.borderColor = '#6366f1';
      input.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.2)';
    }
  } catch (error) {
    console.error('Input focus error:', error);
  }
};

// 修复输入框失去焦点的处理函数
const onInputBlur = (e) => {
  try {
    const input = e.target;
    if(input && input.style) {
      input.style.backgroundColor = '#f5f5f5';
      input.style.borderColor = '#ddd';
      input.style.boxShadow = 'none';
    }
  } catch (error) {
    console.error('Input blur error:', error);
  }
};

// 添加格式化难度等级的方法
const formatLevels = (levels) => {
  if (!levels || !Array.isArray(levels)) return '';
  
  const validLevels = levels.filter(level => level !== "-");
  if (validLevels.length === 0) return '';
  
  return 'Lv.' + validLevels.join('/');
}

// 添加格式化歌曲类别的方法
const formatGenre = (genre) => {
  const genreMap = {
    'niconico & VOCALOID': 'nico&vocal',
    '音击&中二节奏': '音击&中二',
    '流行&动漫': '流行&动漫',
    '东方Project': '东方',
    '其他游戏': '其他',
    '舞萌': '舞萌'
  };
  
  return genreMap[genre] || genre;
};

// 格式化类别文本
const formatGenreText = computed(() => {
  if (!selectedGenre.value) return '';
  
  // 类别映射对象
  const genreMap = {
    'niconico & VOCALOID': 'nico&vocal',
    '音击&中二节奏': '音击&中二',
    '流行&动漫': '流行&动漫',
    '东方Project': '东方',
    '其他游戏': '其他',
    '舞萌': '舞萌'
  };
  
  return genreMap[selectedGenre.value] || selectedGenre.value;
});

// 修改应用版本筛选方法
const applyVersionFilter = () => {
  closeVersionFilter()
  // 确保搜索时能正确使用选择的版本值
  onSearch()
}

// 应用类别筛选
const applyGenreFilter = () => {
  closeGenreFilter()
  onSearch()
}

// 添加处理图片加载优先级的函数
const getLoadingPriority = (index) => {
  // 前20张图片设置为高优先级
  if (index < 20) {
    return 'high';
  } else if (index < 40) {
    return 'normal';
  } else {
    return 'low';
  }
};

// 处理图片加载错误
const handleImageError = (e) => {
  console.log('图片加载失败:', e);
};
</script>

<style lang="scss">
.container {
  padding: 20rpx;
  background: linear-gradient(to bottom, #e0f7fa, #ffffff);
  min-height: 100vh;
}

.search-filter-section {
  margin-bottom: 20rpx;
  background-color: rgba(255, 255, 255, 0.98);
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  
  .search-box {
    padding: 20rpx;
    border-bottom: 2rpx solid rgba(0, 0, 0, 0.05);
    
    .search-input-wrapper {
      display: flex;
      align-items: center;
      background-color: #f5f5f5;
      border-radius: 40rpx;
      padding: 0 30rpx;
      transition: all 0.3s ease;
      border: 2rpx solid transparent;
      
      &:focus-within {
        background-color: #fff;
        box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
        border-color: rgba(99, 102, 241, 0.3);
      }
      
      uni-icons {
        margin-right: 20rpx;
      }
      
      input {
        flex: 1;
        height: 80rpx;
        font-size: 28rpx;
        color: #333;
        
        &::placeholder {
          color: #999;
        }
      }
      
      .view-toggle {
        margin-left: 20rpx;
        padding: 10rpx;
        border-radius: 50%;
        background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        box-shadow: 0 4rpx 10rpx rgba(99, 102, 241, 0.25);
        height: 36rpx;
        width: 36rpx;
        
        &:active {
          transform: scale(0.9);
          box-shadow: 0 2rpx 6rpx rgba(99, 102, 241, 0.2);
        }
      }
    }
  }
  
  .filter-section {
    padding: 20rpx;
    
    .filter-buttons {
      display: flex;
      gap: 16rpx;
      
      .filter-btn {
        flex: 1;
        padding: 12rpx 10rpx;
        background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
        border: none;
        border-radius: 16rpx;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.15);
        min-width: 0;
        height: 116rpx;
        display: flex;
        
        &:active {
          transform: scale(0.98) translateY(1px);
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          box-shadow: 0 2rpx 8rpx rgba(99, 102, 241, 0.15);
        }
        
        .btn-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          padding: 4rpx;
          
          .btn-title {
            font-size: 28rpx;
            color: rgba(255, 255, 255, 0.98);
            font-weight: 500;
            width: 100%;
            text-align: center;
            line-height: 1.2;
            padding: 0 8rpx;
            box-sizing: border-box;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .filter-active {
            color: rgba(255, 255, 255, 0.96);
            font-size: 22rpx;
            background-color: rgba(255, 255, 255, 0.22);
            padding: 6rpx 12rpx;
            border-radius: 10rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 92%;
            width: auto;
            text-align: center;
            line-height: 1.2;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            white-space: normal;
            margin-top: 4rpx;
            
            & + .btn-title {
              flex: 0;
              margin-bottom: auto;
              padding-top: 6rpx;
            }
          }
        }
      }
    }
  }
}

.result-list {
  padding: 10rpx;
  
  .result-item {
    display: flex;
    align-items: flex-start;
    margin: 20rpx 10rpx;
    padding: 24rpx;
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 20rpx;
    box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-4rpx);
      box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.12);
    }
    
    .song-cover {
      width: 140rpx;
      height: 140rpx;
      margin-right: 24rpx;
      flex-shrink: 0;
      border-radius: 16rpx;
      overflow: hidden;
      box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.15);
      
      image {
        width: 100%;
        height: 100%;
        transition: transform 0.3s ease;
        
        &:hover {
          transform: scale(1.08);
        }
      }
    }
    
    .song-info {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      
      .title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12rpx;
        
        .song-name {
          font-size: 34rpx;
          font-weight: bold;
          color: #333;
          flex: 1;
          margin-right: 20rpx;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .song-id {
          font-size: 24rpx;
          color: #666;
          background-color: #f2f2f2;
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
          box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
          flex-shrink: 0;
        }
      }
      
      .song-details {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;
        margin-bottom: 10rpx;
        
        text {
          font-size: 24rpx;
          padding: 6rpx 14rpx;
          border-radius: 10rpx;
          box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .version {
          background-color: rgba(126, 87, 194, 0.1);
          color: #7e57c2;
        }
        
        .genre {
          background-color: rgba(76, 175, 80, 0.1);
          color: #4caf50;
        }
        
        .difficulty {
          background-color: rgba(255, 152, 0, 0.1);
          color: #ff9800;
        }
      }
      
      .matched-aliases {
        font-size: 24rpx;
        color: #888;
        background-color: rgba(0, 0, 0, 0.03);
        padding: 6rpx 14rpx;
        border-radius: 8rpx;
        max-height: 80rpx;
        overflow: hidden;
        
        text {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          white-space: normal;
        }
      }
    }
  }
}

.filter-popup {
  width: 600rpx;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  max-height: 80vh;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 26rpx 30rpx;
    border-bottom: 2rpx solid #f0f0f0;
    background: linear-gradient(to bottom, #fcfcfc, #f9f9f9);
    
    .title {
      font-size: 34rpx;
      font-weight: bold;
      color: #333;
      text-shadow: 0 1rpx 0 rgba(255, 255, 255, 0.8);
    }
    
    .close-btn {
      font-size: 40rpx;
      color: #999;
      padding: 10rpx;
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
      
      &:active {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
  }
  
  .popup-content {
    padding: 30rpx;
    
    .form-item {
      margin-bottom: 30rpx;
      
      &.ds-range {
        display: flex;
        align-items: center;
        
        input {
          flex: 1;
          height: 70rpx;
          border: 2rpx solid #ddd;
          border-radius: 8rpx;
          padding: 0 20rpx;
          font-size: 28rpx;
          background-color: #f5f5f5;
          margin: 0 10rpx;
          width: 120rpx; // 足够容纳三位数字
          transition: all 0.3s ease;
        }
        
        .range-separator {
          margin: 0 10rpx;
          color: #999;
        }
      }
    }
    
    .range-tips {
      font-size: 22rpx;
      color: #888;
      margin: 0 10rpx 20rpx 10rpx;
    }
    
    .difficulty-select {
      display: flex;
      align-items: center;
      margin-top: 20rpx;
      
      text {
        width: 110rpx;
        font-size: 28rpx;
        color: #666;
      }
      
      .picker-value {
        flex: 1;
        height: 70rpx;
        line-height: 70rpx;
        padding: 0 20rpx;
        border: 2rpx solid #ddd;
        border-radius: 8rpx;
        font-size: 28rpx;
        background-color: #f9f9f9;
        box-shadow: inset 0 1rpx 3rpx rgba(0, 0, 0, 0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
        overflow: hidden;
        
        .picker-text {
          width: 150rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding-right: 30rpx; /* 为箭头留出空间 */
        }
        
        .picker-arrow {
          font-size: 20rpx;
          color: #999;
          margin-left: 10rpx;
          flex-shrink: 0;
          position: absolute;
          right: 20rpx;
        }
        
        &:active {
          border-color: #6366f1;
          background-color: #f0f8ff;
          
          .picker-arrow {
            color: #6366f1;
          }
        }
      }
    }
  }
  
  .version-list {
    height: 60vh;
    padding: 0;
    
    .version-scroll {
      height: 100%;
      padding: 0 30rpx;
      position: relative;
      
      &::before, &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        height: 30rpx;
        pointer-events: none;
        z-index: 1;
      }
      
      &::before {
        top: 0;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
      }
      
      &::after {
        bottom: 0;
        background: linear-gradient(to top, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
      }
    }
    
    .version-item {
      padding: 20rpx 24rpx;
      font-size: 28rpx;
      color: #666;
      border-bottom: 2rpx solid #f5f5f5;
      position: relative;
      transition: all 0.3s ease;
      box-sizing: border-box;
      overflow: hidden;
      display: flex;
      align-items: center;
      min-height: 80rpx;
      
      text {
        line-height: 1.4;
        word-break: break-word;
        white-space: normal;
        flex: 1;
      }
      
      &.active {
        color: #6366f1;
        background-color: rgba(99, 102, 241, 0.08);
        font-weight: 500;
        box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.2);
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 6rpx;
          background-color: #6366f1;
        }
      }
      
      &:active {
        background-color: #f5f5f5;
      }
    }
  }
  
  .popup-footer {
    display: flex;
    padding: 20rpx;
    gap: 20rpx;
    border-top: 2rpx solid #f0f0f0;
    background: linear-gradient(to bottom, #f9f9f9, #fcfcfc);
    
    button {
      flex: 1;
      height: 80rpx;
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      transition: all 0.3s ease;
      
      &.cancel-btn {
        background-color: #f5f5f5;
        color: #666;
        box-shadow: inset 0 0 0 1rpx rgba(0, 0, 0, 0.05);
        
        &:active {
          background-color: #eaeaea;
          box-shadow: inset 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
        }
      }
      
      &.confirm-btn {
        background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
        color: #fff;
        box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.2);
        
        &:active {
          box-shadow: inset 0 2rpx 5rpx rgba(0, 0, 0, 0.2);
          transform: translateY(2rpx);
        }
      }
    }
  }
}

.filter-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  height: 120rpx; // 固定高度保持一致
  flex: 1;
  position: relative;
  border-radius: 12rpx;
  background-color: #f5f5f5;
  margin: 0 10rpx;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
  
  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);
  }
  
  .filter-name {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 8rpx;
    position: relative;
    top: -4rpx; // 向上移动一点
  }
  
  .filter-value {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    max-width: 140rpx; // 限制宽度
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  &.active {
    background-color: #eef2ff;
    border-color: #6366f1;
    
    .filter-name {
      color: #6366f1;
    }
    
    .filter-value {
      color: #4f46e5;
    }
  }
}

.ds-popup {
  .popup-content {
    .form-item {
      margin-bottom: 30rpx;
      
      &.ds-range {
        display: flex;
        align-items: center;
        
        input {
          flex: 1;
          height: 70rpx;
          border: 2rpx solid #ddd;
          border-radius: 8rpx;
          padding: 0 20rpx;
          font-size: 28rpx;
          background-color: #f5f5f5;
          margin: 0 10rpx;
          width: 120rpx; // 足够容纳三位数字
          transition: all 0.3s ease;
        }
        
        .range-separator {
          margin: 0 10rpx;
          color: #999;
        }
      }
    }
  }
}

// 网格视图样式
.grid-view {
  padding: 10rpx;
  
  .grid-group {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 30rpx;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 20rpx;
    padding: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  }
  
  .grid-item {
    width: calc(33.33% - 20rpx);
    margin: 10rpx;
    aspect-ratio: 1;
    
    .grid-cover {
      width: 100%;
      height: 100%;
      border-radius: 16rpx;
      overflow: hidden;
      box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.15);
      
      image {
        width: 100%;
        height: 100%;
        transition: transform 0.3s ease;
        
        &:hover {
          transform: scale(1.08);
        }
      }
    }
  }
}
</style> 