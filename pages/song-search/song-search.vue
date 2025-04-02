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
            placeholder="搜索曲名/别名/BPM/ID/曲师/谱师"
            @input="onSearchInput"
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
    
    <!-- 添加搜索结果计数 -->
    <view class="search-result-count" v-if="searchResults.length > 0">
      共找到 <text class="count-highlight">{{ searchResults.length }}</text> 条结果
      <text class="search-time">(耗时 {{ searchTime }}秒)</text>
    </view>
    
    <!-- 列表视图 - 添加分页 -->
    <view class="result-list" v-if="viewMode === 'list'">
      <view 
        v-for="(result, index) in paginatedResults" 
        :key="result.songId" 
        class="result-item"
        @click="navigateToDetail(result.songId, result.matchedDifficulty)"
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
          <view class="result-info">
            <view v-if="result.matchedId" class="match-info">
              乐曲ID: {{result.matchedId}}
            </view>
            <view v-else-if="result.matchedBpm" class="match-info">
              乐曲BPM: {{result.matchedBpm}}
            </view>
            <view v-if="result.matchedCharter" class="match-info">
              谱师: {{result.matchedCharter}}
            </view>
            <view v-if="result.matchedArtist" class="match-info">
              曲师: {{result.matchedArtist}}
            </view>
            <view v-if="result.matchedAliases && result.matchedAliases.length > 0" class="match-info">
              别名: {{formatAliases(result.matchedAliases)}}
            </view>
          </view>
        </view>
      </view>
      
      <!-- 优化分页控制 -->
      <view class="pagination" v-if="searchResults.length > pageSize">
        <view class="pagination-container">
          <!-- 左侧页码输入区域 -->
          <view class="page-input-wrapper">
            <text class="page-label">页码:</text>
            <input 
              type="number" 
              v-model="inputPage" 
              @blur="handlePageInputBlur"
              @confirm="handlePageInputConfirm"
              class="page-input"
            />
            <text class="page-separator">/</text>
            <text class="total-pages">{{ totalPages }}</text>
          </view>
          
          <!-- 右侧翻页按钮 -->
          <view class="page-buttons">
            <button class="page-btn prev-page" 
              :disabled="currentPage === 1"
              @click="currentPage--">
              上一页
            </button>
            
            <button class="page-btn next-page" 
              :disabled="currentPage === totalPages"
              @click="currentPage++">
              下一页
            </button>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 网格视图 - 简化封面显示 -->
    <view class="grid-view" v-else>
      <!-- 控制部分保持不变 -->
      <view class="grid-controls">
        <text class="control-label">每行显示:</text>
        <view class="slider-container">
          <slider 
            :value="gridColumns" 
            :min="2" 
            :max="5" 
            :step="1" 
            show-value 
            @change="onGridColumnsChange"
            activeColor="#6366f1"
            backgroundColor="#e0e0e0"
            block-size="18"
            block-color="#6366f1"
          />
        </view>
      </view>
      
      <!-- 修改网格容器结构 -->
      <view class="grid-container" :style="{ '--grid-columns': gridColumns }">
        <view class="grid-items-wrapper">
          <view 
            v-for="(result, index) in filteredGridResults" 
            :key="result.songId" 
            class="grid-item"
            @click="navigateToDetail(result.songId, result.matchedDifficulty)"
          >
            <image 
              :src="getCoverUrl(result.songId)" 
              mode="aspectFill" 
              class="grid-cover"
              :loading="getLoadingPriority(index)"
              @error="handleImageError"
            />
          </view>
        </view>
      </view>
      
      <!-- 同样优化网格视图的分页控制 -->
      <view class="pagination" v-if="filteredGridResults.length > 0">
        <view class="pagination-container">
          <!-- 左侧页码输入区域 -->
          <view class="page-input-wrapper">
            <text class="page-label">页码:</text>
            <input 
              type="number" 
              v-model="inputGridPage" 
              @blur="handleGridPageInputBlur"
              @confirm="handleGridPageInputConfirm"
              class="page-input"
            />
            <text class="page-separator">/</text>
            <text class="total-pages">{{ totalGridPages }}</text>
          </view>
          
          <!-- 右侧翻页按钮 -->
          <view class="page-buttons">
            <button class="page-btn prev-page" 
              :disabled="currentGridPage === 1"
              @click="currentGridPage--">
              上一页
            </button>
            
            <button class="page-btn next-page" 
              :disabled="currentGridPage === totalGridPages"
              @click="currentGridPage++">
              下一页
            </button>
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
              maxlength="4"
            />
            <text class="range-separator">至</text>
            <input 
              type="digit" 
              v-model="dsFilter.max" 
              placeholder="最大值"
              @input="onDsInput('max')"
              @focus="onInputFocus"
              @blur="onInputBlur"
              maxlength="4"
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
import { ref, onMounted, computed, watch } from 'vue'
import SongSearcher from '@/utils/songSearcher.js'
import SongService from '@/utils/songService.js'
import {getCoverUrl,initCoverList} from '../../util/coverManager.js'

// 添加防抖相关变量
const searchTimeout = ref(null)
const debounceDelay = 300 // 300毫秒的防抖延迟

// 添加搜索耗时变量
const searchTime = ref(0)

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
  'maimai でらっくす': 'DX2020',
  'maimai でらっくす Splash': 'DX2021',
  'maimai でらっくす UNiVERSE': 'DX2022',
  'maimai でらっくす FESTiVAL': 'DX2023',
  'maimai でらっくす BUDDiES': 'DX2024'
}

const reverseVersionMap = {
  '任意版本': '',
  '(真)-maimai': 'maimai',
  '(真)-maimai PLUS': 'maimai PLUS',
  '(檄)-GreeN': 'maimai GreeN',
  '(超)-GreeN PLUS': 'maimai GreeN PLUS',
  '(橙)-ORANGE': 'maimai ORANGE',
  '(暁)-ORANGE PLUS': 'maimai ORANGE PLUS',
  '(桃)-PiNK': 'maimai PiNK',
  '(櫻)-PiNK PLUS': 'maimai PiNK PLUS',
  '(紫)-MURASAKi': 'maimai MURASAKi',
  '(菫)-MURASAKi PLUS': 'maimai MURASAKi PLUS',
  '(白)-MiLK': 'maimai MiLK',
  '(雪)-MiLK PLUS': 'MiLK PLUS',
  '(輝)-FiNALE': 'maimai FiNALE',
  '(熊華)-舞萌DX2020': 'maimai でらっくす',
  '(爽煌)-舞萌DX2021': 'maimai でらっくす Splash',
  '(宙星)-舞萌DX2022': 'maimai でらっくす UNiVERSE',
  '(祭祝)-舞萌DX2023': 'maimai でらっくす FESTiVAL',
  '(双宴)-舞萌DX2024': 'maimai でらっくす BUDDiES'
}

// 版本列表（使用显示名称）
const versions = [
	'任意版本',
	'(真)-maimai',
	'(真)-maimai PLUS',
	'(檄)-GreeN',
	'(超)-GreeN PLUS',
	'(橙)-ORANGE',
	'(暁)-ORANGE PLUS',
	'(桃)-PiNK',
	'(櫻)-PiNK PLUS',
	'(紫)-MURASAKi',
	'(菫)-MURASAKi PLUS',
	'(白)-MiLK',
	'(雪)-MiLK PLUS',
	'(輝)-FiNALE',
	'(熊華)-舞萌DX2020',
	'(爽煌)-舞萌DX2021',
	'(宙星)-舞萌DX2022',
	'(祭祝)-舞萌DX2023',
	'(双宴)-舞萌DX2024'
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

// 添加分页相关的响应式变量
const pageSize = ref(20) // 列表视图每页显示数量
const currentPage = ref(1)
const gridPageSize = ref(4) // 网格视图每页显示的组数
const currentGridPage = ref(1)

// 添加网格列数控制
const gridColumns = ref(4) // 默认每行4个

// 将网格组大小与列数关联
const itemsPerGroup = computed(() => gridColumns.value * 3) // 每组是3行

// 将搜索结果分组（每组9个，用于网格视图）
const groupedResults = computed(() => {
  const groups = []
  const itemsPerGroupValue = itemsPerGroup.value
  
  for (let i = 0; i < searchResults.value.length; i += itemsPerGroupValue) {
    // 获取当前组的元素
    const group = searchResults.value.slice(i, i + itemsPerGroupValue)
    
    // 如果不足一组，填充空元素保持布局
    while (group.length < itemsPerGroupValue) {
      group.push(null)
    }
    
    groups.push(group)
  }
  
  return groups
})

// 切换视图模式
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'list' ? 'grid' : 'list'
}

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
  let value = dsFilter.value[type];
 //value = value.replace(/[^\d.]/g, '');
  //dsFilter.value[type] = value;
};

// 修改应用定数筛选方法，在提交时校验
const applyDsFilter = () => {
  // 开始计时
  const startTime = Date.now()
  
  // 校验并修正定数范围
  let min = dsFilter.value.min ? parseFloat(dsFilter.value.min) : null;
  let max = dsFilter.value.max ? parseFloat(dsFilter.value.max) : null;
  
  // 确保值在1.0-15.0范围内
  // if (min !== null) {
  //   min = Math.max(1.0, Math.min(15.0, min));
  //   dsFilter.value.min = min.toFixed(1);
  // }
  
  // if (max !== null) {
  //   max = Math.max(1.0, Math.min(15.0, max));
  //   dsFilter.value.max = max.toFixed(1);
  // }
  
  // 确保最小值不大于最大值
  if (min !== null && max !== null && min > max) {
    // 交换值
    [dsFilter.value.min, dsFilter.value.max] = [dsFilter.value.max, dsFilter.value.min];
  }
  
  closeDsFilter();
  onSearch();
  
  // 结束计时并计算耗时
  const endTime = Date.now()
  searchTime.value = ((endTime - startTime) / 1000).toFixed(3)
}

// 修改搜索方法
const onSearch = async () => {
  if (!searchKeyword.value.trim() && !dsFilter.value.min && !dsFilter.value.max && !selectedVersion.value && !selectedGenre.value) {
    searchResults.value = []
    return
  }
  
  let matchedIds = new Set()
  const idMatchMap = new Map()
  
  // 解析关键词，检查是否为BPM搜索格式
  const keyword = searchKeyword.value.trim()
  let bpmRange = null
  let songIdSearch = false
  
  // 扩展大于号和小于号的匹配模式
  if (/^[>＞≥≧⩾][\s]*\d+(\.\d+)?$/.test(keyword)) {
    const minBpm = parseFloat(keyword.replace(/[>＞≥≧⩾\s]/g, ''))
    bpmRange = { min: minBpm, max: Infinity }
  } 
  // 检查小于号格式
  else if (/^[<＜≤≦⩽][\s]*\d+(\.\d+)?$/.test(keyword)) {
    const maxBpm = parseFloat(keyword.replace(/[<＜≤≦⩽\s]/g, ''))
    bpmRange = { min: 0, max: maxBpm }
  } 
  // 检查 "数字~数字" 格式 (BPM范围)
  else if (/^\d+(\.\d+)?\s*~\s*\d+(\.\d+)?$/.test(keyword)) {
    const [min, max] = keyword.split('~').map(part => parseFloat(part.trim()))
    bpmRange = { min, max }
  } 
  // 检查纯数字格式 (可能是歌曲ID或精确BPM)
  else if (/^\d+(\.\d+)?$/.test(keyword)) {
    // 如果是整数且长度小于等于5，可能是歌曲ID
    if (Number.isInteger(parseFloat(keyword)) && keyword.length <= 5) {
      songIdSearch = true
      // 尝试按ID搜索
      const song = songService.value.getSongById(keyword)
      if (song) {
        matchedIds.add(song.id)
        // 标记为ID匹配
        idMatchMap.set(song.id, true)
      }
    }
    
    // 无论是否找到ID，都尝试按BPM搜索
    const exactBpm = parseFloat(keyword)
    bpmRange = { min: exactBpm, max: exactBpm }
  }
  
  // 如果是BPM搜索，使用优化的搜索方法
  if (bpmRange) {
    // 修改这里，传递正确的difficulty参数
    // 如果选择了"任意难度"，则传递null或undefined，而不是默认的3
    const difficulty = selectedDifficulty.value.value >= 0 ? selectedDifficulty.value.value : undefined;
    
    const bpmResults = songService.value.searchSongsOptimized({
      bpmRange,
      version: reverseVersionMap[selectedVersion.value] || selectedVersion.value || undefined,
      genre: selectedGenre.value || undefined,
      dsRange: (dsFilter.value.min || dsFilter.value.max) ? {
        min: dsFilter.value.min ? Number(dsFilter.value.min) : undefined,
        max: dsFilter.value.max ? Number(dsFilter.value.max) : undefined
      } : undefined
    }, {
      exactVersion: true,
      exactGenre: true,
      difficulty: difficulty,
      includeEqual: true
    })
    
    // 添加BPM搜索结果
    bpmResults.forEach(song => {
      matchedIds.add(song.id)
    })
  }
  
  // 如果不是纯数字搜索或者没有找到匹配的ID，则进行关键词搜索
  if (!songIdSearch && !bpmRange && keyword) {
    // 使用优化的关键词搜索
    const keywordResults = songService.value.searchByKeyword(keyword, {
      exact: false,
      defaultDifficulty: 3
    })
    
    // 添加关键词搜索结果
    keywordResults.forEach(song => {
      matchedIds.add(song.id)
    })
    
    // 使用别名搜索器 - 修复这部分
    const aliasResults = searcher.value.search({
      keyword: keyword,
      exactMatch: false
    })
    
    // 添加别名搜索结果
    aliasResults.forEach(matchInfo => {
      matchedIds.add(matchInfo.id)
    })
  }
  
  // 应用筛选条件
  let results = []
  
  if (matchedIds.size > 0) {
    // 将匹配的ID转换为歌曲对象
    const matchedSongs = Array.from(matchedIds).map(id => {
      const song = songService.value.getSongById(id)
      return song
    }).filter(Boolean) // 过滤掉undefined
    
    // 应用版本、定数和类别筛选
    results = matchedSongs.filter(song => {
      // 版本筛选
      if (selectedVersion.value) {
        const songVersion = song.basic_info?.from || ''
        const displayVersion = versionMap[songVersion] || songVersion
        if (displayVersion !== selectedVersion.value) {
          return false
        }
      }
      
      // 类别筛选
      const genreMapping = {
      'niconico & VOCALOID': ['niconico & VOCALOID', 'niconicoボーカロイド'],
      '流行&动漫': ['流行&动漫', 'POPSアニメ'],
      '舞萌': ['舞萌', 'maimai'],
      '音击&中二节奏': ['音击&中二节奏', 'オンゲキCHUNITHM'],
      '东方Project': ['东方Project', '東方Project'],
      '其他游戏': ['其他游戏', 'ゲームバラエティ'],
    }
    
      if (selectedGenre.value) {
        const songGenre = song.basic_info?.genre || ''
        // 使用 genreMapping 检查匹配
        const matchFound = Object.entries(genreMapping).some(([zhName, jpNames]) => {
          if (zhName === selectedGenre.value) {
            return jpNames.includes(songGenre)
          }
          return false
        })
        if (!matchFound) {
          return false
        }
      }
      
      // 定数筛选
      if (dsFilter.value.min || dsFilter.value.max) {
        const difficultyIndex = selectedDifficulty.value.value
        
        // 如果选择了特定难度
        if (difficultyIndex >= 0) {
          // 修复：检查歌曲是否有选定的难度
          // 对于Re:Master难度(索引4)，需要特别检查歌曲是否有这个难度
          if (difficultyIndex === 4 && (!song.ds || song.ds.length <= 4 || song.level[4] === "-")) {
            return false; // 歌曲没有Re:Master难度，直接排除
          }
          
          const ds = song.ds[difficultyIndex]
          // 如果ds不存在，说明没有这个难度
          if (ds === undefined) {
            return false;
          }
          
          if (dsFilter.value.min && ds < Number(dsFilter.value.min)) {
            return false
          }
          if (dsFilter.value.max && ds > Number(dsFilter.value.max)) {
            return false
          }
        } else {
          // 检查任意难度是否满足条件
          let matchAnyDifficulty = false
          for (let i = 0; i < song.ds.length; i++) {
            const ds = song.ds[i]
            if ((!dsFilter.value.min || ds >= Number(dsFilter.value.min)) && 
                (!dsFilter.value.max || ds <= Number(dsFilter.value.max))) {
              matchAnyDifficulty = true
              break
            }
          }
          if (!matchAnyDifficulty) {
            return false
          }
        }
      }
      
      return true
    })
  } else if (!keyword) {
    // 如果没有关键词，只有筛选条件，则直接使用筛选条件搜索
    // 修改这里，传递正确的difficulty参数
    const difficulty = selectedDifficulty.value.value >= 0 ? selectedDifficulty.value.value : undefined;
    
    results = songService.value.searchSongsOptimized({
      version: reverseVersionMap[selectedVersion.value] || selectedVersion.value || undefined,
      genre: selectedGenre.value || undefined,
      dsRange: (dsFilter.value.min || dsFilter.value.max) ? {
        min: dsFilter.value.min ? Number(dsFilter.value.min) : undefined,
        max: dsFilter.value.max ? Number(dsFilter.value.max) : undefined
      } : undefined
    }, {
      exactVersion: true,
      exactGenre: true,
      difficulty: difficulty,
      includeEqual: true
    })
  }
  
  // 格式化结果
  const formattedResults = results.map(song => {
    // 获取别名信息
    const aliasInfo = searcher.value.getAliasInfo(song.id)
    
    // 获取匹配的别名
    let matchedAliases = []
    if (keyword && aliasInfo?.alias) {
      // 过滤出包含关键词的别名
      matchedAliases = aliasInfo.alias.filter(alias => 
        alias.toLowerCase().includes(keyword.toLowerCase())
      )
    }
    
    // 获取匹配的难度索引
    let matchedDifficulty = song.matchedDifficulty !== undefined ? song.matchedDifficulty : 3
    
    // 如果选择了特定难度，优先使用选择的难度
    if (selectedDifficulty.value.value >= 0) {
      matchedDifficulty = selectedDifficulty.value.value
    }
    
    // 添加匹配信息
    let matchedBpm = null
    let matchedId = null
    
    // 检查是否为ID匹配
    if (idMatchMap.has(song.id)) {
      matchedId = song.id
    } 
    // 检查是否为BPM匹配
    else if (bpmRange && song.basic_info?.bpm) {
      matchedBpm = parseFloat(song.basic_info.bpm)
      // 确保BPM匹配时默认返回难度索引为3
      if (!selectedDifficulty.value.value >= 0) {
        matchedDifficulty = 3
      }
    }
    
    return {
      songId: song.id,
      name: song.title,
      basic_info: song.basic_info,
      level: song.level,
      ds: song.ds,
      matchedAliases,
      matchedCharter: song.matchType === 'charter' ? song.charts[matchedDifficulty]?.charter : undefined,
      matchedArtist: song.matchType === 'artist' ? song.basic_info?.artist : undefined,
      matchedDifficulty,
      matchedBpm,
      matchedId
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
const navigateToDetail = (songId, difficultyIndex = 3) => {
  uni.navigateTo({
    url: `/pages/song-detail/song-detail?songId=${songId}&difficulty=${difficultyIndex}`,
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
  const lastFourLevels = validLevels.slice(-4);
  
  return lastFourLevels.join('/');
}

// 添加格式化歌曲类别的方法
const formatGenre = (genre) => {
  const genreMap = {
    'niconico & VOCALOID': 'ボーカロ',
    '音击&中二节奏': '音击&中二',
    '流行&动漫': '流行&动漫',
    '东方Project': '东方',
    '其他游戏': '其他游戏',
    '舞萌': '舞萌',
    'niconicoボーカロイド': 'ボーカロ',
    'POPSアニメ': '流行&动漫',
    'ゲームバラエティ': '其他游戏',
    'maimai': '舞萌',
    'オンゲキCHUNITHM': '音击&中二',
    '東方Project': '东方',
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
    '舞萌': '舞萌',
    'niconicoボーカロイド': 'nico&vocal',
    'POPSアニメ': '流行&动漫',
    'ゲームバラエティ': '其他',
    'maimai': '舞萌',
    'オンゲキCHUNITHM': '音击&中二',
    '東方Project': '东方',
  };
  
  return genreMap[selectedGenre.value] || selectedGenre.value;
});

// 修改应用版本筛选方法
const applyVersionFilter = () => {
  // 开始计时
  const startTime = Date.now()
  
  // 执行原有的筛选逻辑
  closeVersionFilter()
  onSearch()
  
  // 结束计时并计算耗时
  const endTime = Date.now()
  searchTime.value = ((endTime - startTime) / 1000).toFixed(3)
}

// 应用类别筛选
const applyGenreFilter = () => {
  // 开始计时
  const startTime = Date.now()
  
  // 执行原有的筛选逻辑
  closeGenreFilter()
  onSearch()
  
  // 结束计时并计算耗时
  const endTime = Date.now()
  searchTime.value = ((endTime - startTime) / 1000).toFixed(3)
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

// 添加分页计算属性
const paginatedResults = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return searchResults.value.slice(startIndex, endIndex)
})

const totalPages = computed(() => {
  return Math.ceil(searchResults.value.length / pageSize.value)
})

// 添加新的计算属性，用于处理网格视图的数据
const filteredSearchResults = computed(() => {
  return searchResults.value.filter(result => {
    return Number(result.songId) < 100000; // 过滤掉6位数及以上的ID
  });
});

// 根据列数动态设置每页显示数量
const getItemsPerPage = computed(() => {
  switch(gridColumns.value) {
    case 2: return 8;  // 2列模式：8个封面
    case 3: return 18; // 3列模式：24个封面
    case 4: return 28; // 4列模式：32个封面
    case 5: return 40; // 5列模式：50个封面
    default: return 24;
  }
});

// 更新过滤后的网格结果计算属性
const filteredGridResults = computed(() => {
  const startIndex = (currentGridPage.value - 1) * getItemsPerPage.value;
  const endIndex = startIndex + getItemsPerPage.value;
  return filteredSearchResults.value.slice(startIndex, endIndex);
});

// 更新总页数计算
const totalGridPages = computed(() => {
  return Math.ceil(filteredSearchResults.value.length / getItemsPerPage.value);
});

// 监听网格列数变化，重置当前页码
watch(gridColumns, () => {
  currentGridPage.value = 1; // 列数变化时重置为第一页
});

// 监听搜索结果变化，重置页码
watch(searchResults, () => {
  currentPage.value = 1
  currentGridPage.value = 1
})

// 监听视图模式变化，重置对应页码
watch(viewMode, () => {
  if (viewMode.value === 'list') {
    currentPage.value = 1
  } else {
    currentGridPage.value = 1
  }
})

// 处理滑动条变化
const onGridColumnsChange = (e) => {
  gridColumns.value = e.detail.value
  // 重置网格分页
  currentGridPage.value = 1
}

// 添加获取难度样式的方法
const getDifficultyStyle = (levelIndex) => {
  const colors = {
    0: '#1EA15D', // Basic
    1: '#F6B40C', // Advanced
    2: '#E9485D', // Expert
    3: '#9E45E2', // Master
    4: '#BA1A1A'  // Re:Master
  }
  
  return {
    backgroundColor: `rgba(0, 0, 0, 0.6)`,
    color: colors[levelIndex] || '#fff',
    borderLeft: `4rpx solid ${colors[levelIndex] || '#fff'}`
  }
}

const getDifficultyLabel = (levelIndex) => {
  const labels = ['Basic', 'Advanced', 'Expert', 'Master', 'Re:Master']
  return labels[levelIndex] || ''
}

// 修改输入事件处理函数，添加防抖
const onSearchInput = (e) => {
  // 清除之前的定时器
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  // 设置新的定时器，实现防抖
  searchTimeout.value = setTimeout(() => {
    // 开始计时
    const startTime = Date.now()
    
    // 执行原有的搜索逻辑
    onSearch()
    
    // 结束计时并计算耗时
    const endTime = Date.now()
    searchTime.value = ((endTime - startTime) / 1000).toFixed(3)
  }, debounceDelay)
}

// 添加页码输入相关变量
const inputPage = ref('1')
const inputGridPage = ref('1')

// 监听当前页码变化，同步到输入框
watch(currentPage, (newPage) => {
  inputPage.value = newPage.toString()
})

watch(currentGridPage, (newPage) => {
  inputGridPage.value = newPage.toString()
})

// 处理页码输入框失焦事件
const handlePageInputBlur = () => {
  let page = parseInt(inputPage.value)
  if (isNaN(page) || page < 1) {
    page = 1
  } else if (page > totalPages.value) {
    page = totalPages.value
  }
  currentPage.value = page
  inputPage.value = page.toString()
}

// 处理页码输入框确认事件
const handlePageInputConfirm = () => {
  handlePageInputBlur()
}

// 处理网格视图页码输入
const handleGridPageInputBlur = () => {
  let page = parseInt(inputGridPage.value)
  if (isNaN(page) || page < 1) {
    page = 1
  } else if (page > totalGridPages.value) {
    page = totalGridPages.value
  }
  currentGridPage.value = page
  inputGridPage.value = page.toString()
}

const handleGridPageInputConfirm = () => {
  handleGridPageInputBlur()
}
</script>

<style lang="scss" scoped>
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
        border-radius: 50%;
        background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        box-shadow: 0 4rpx 10rpx rgba(99, 102, 241, 0.25);
        height: 60rpx;
        width: 60rpx;
        position: relative;
        
        &:active {
          transform: scale(0.9);
          box-shadow: 0 2rpx 6rpx rgba(99, 102, 241, 0.2);
        }
        
        uni-icons {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
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
        height: 125rpx;
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
            max-width: 100%;
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
  padding: 0rpx,10rpx,0rpx,10rpx;
  margin-top: 0rpx;
  
  .result-item {
    display: flex;
    align-items: flex-start;
    margin: 16rpx 10rpx;
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
        width: 100%;
        margin-top: 8rpx;
        
        .version, .genre, .difficulty {
          flex: 1;
          min-width: 0;
          padding: 4rpx 12rpx;
          font-size: 24rpx;
          border-radius: 8rpx;
          margin-right: 8rpx;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 12rpx;
        }
        
        .version {
          background-color: #e4f3fd;
          color: #1890ff;
          flex: 1;
        }
        
        .genre {
          background-color: #f0ffe4;
          color: #52c41a;
          flex: 1;
        }
        
        .difficulty {
          background-color: #fff7e6;
          color: #fa8c16;
          flex: 1.4;
          margin-right: 0;
        }
      }
      
      .result-info {
        font-size: 24rpx;
        color: #888;
        background-color: rgba(0, 0, 0, 0.03);
        padding: 6rpx 14rpx;
        border-radius: 8rpx;
        max-height: 80rpx;
        overflow: hidden;
        min-height: 20rpx;
        .match-info {
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
		width: 90%;
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

// 网格视图样式 - 优化图片大小和间距
.grid-view {
  padding: 10rpx;
  margin-top: 10rpx;
  
  .grid-controls {
    display: flex;
    align-items: center;
    background-color: #fff;
    padding: 20rpx 30rpx;
    border-radius: 16rpx;
    margin-bottom: 16rpx; // 减小控制区域与网格的间距
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    
    .control-label {
      font-size: 28rpx;
      color: #333;
      margin-right: 20rpx;
      white-space: nowrap;
    }
    
    .slider-container {
      flex: 1;
      padding: 0 30rpx 0 10rpx;
      margin-left: 30rpx;
    }
  }
  
  .grid-container {
    --grid-columns: 3; // 默认值，会被JS覆盖
    
    .grid-items-wrapper {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx; // 减小网格项之间的间距
      margin-bottom: 16rpx; // 减小与分页的间距
      
      .grid-item {
        width: calc((100% - (var(--grid-columns) - 1) * 12rpx) / var(--grid-columns)); // 调整宽度计算以匹配新的间距
        background-color: #fff;
        border-radius: 6rpx;
        overflow: hidden;
        box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.06); // 减小阴影，让图片更突出
        position: relative;
        
        &::before {
          content: "";
          display: block;
          padding-top: 100%; // 保持1:1的宽高比
        }
        
        .grid-cover {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
  
  // 添加媒体查询，根据屏幕宽度调整列数
  @media screen and (min-width: 768px) {
    .grid-container {
      --grid-columns: 4; // 在更宽的屏幕上显示更多列
    }
  }
  
  @media screen and (max-width: 375px) {
    .grid-container {
      --grid-columns: 2; // 在较窄的屏幕上减少列数
    }
  }
}

// 修改搜索结果计数样式
.search-result-count {
  
  padding: 30rpx 30rpx;
  font-size: 28rpx;
  color: #64748b;
  background-color: #fff;
  margin-top: 10rpx;
  margin-bottom: 10rpx;
  margin-left:5rpx ;
  margin-right:5rpx ;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .count-highlight {
    color: #6366f1;
    font-weight: 500;
  }
  
  .search-time {
    font-size: 24rpx;
    color: #94a3b8;
    margin-left: auto;
  }
}

// 优化分页样式
.pagination {
  margin: 20rpx 0;
  
  .pagination-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;
    border-radius: 16rpx;
    padding: 16rpx 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    
    .page-input-wrapper {
      display: flex;
      align-items: center;
      
      .page-label {
        font-size: 28rpx;
        color: #666;
        margin-right: 10rpx;
      }
      
      .page-input {
        width: 80rpx;
        height: 60rpx;
        background-color: #f5f5f5;
        border: 2rpx solid #e0e0e0;
        border-radius: 12rpx;
        text-align: center;
        font-size: 28rpx;
        color: #333;
        padding: 0 10rpx;
        
        &:focus {
          border-color: #6366f1;
          background-color: #fff;
        }
      }
      
      .page-separator {
        margin: 0 10rpx;
        color: #666;
        font-size: 28rpx;
      }
      
      .total-pages {
        font-size: 28rpx;
        color: #666;
        min-width: 40rpx;
        text-align: center;
      }
    }
    
    .page-buttons {
      display: flex;
      align-items: center;
      
      .page-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80rpx;
        min-width: 140rpx;
        padding: 0 30rpx;
        font-size: 30rpx;
        font-weight: 500;
        color: #ffffff;
        background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
        border: none;
        border-radius: 12rpx;
        transition: all 0.2s ease;
        box-shadow: 0 4rpx 8rpx rgba(99, 102, 241, 0.2);
        
        &:active {
          transform: scale(0.95);
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          box-shadow: 0 2rpx 4rpx rgba(99, 102, 241, 0.15);
        }
        
        &:disabled {
          opacity: 0.5;
          background: linear-gradient(135deg, #a5a6f3 0%, #9698f5 100%);
          box-shadow: none;
        }
        
        &.prev-page {
          margin-right: 20rpx;
        }
      }
    }
  }
}
</style> 