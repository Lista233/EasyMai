<template>
  <view class="container">
    <view class="search-box">
      <input 
        v-model="searchKeyword" 
        type="text" 
        placeholder="输入歌曲名称或别名搜索"
        @input="onSearch"
      />
    </view>
    
    <view class="result-list">
      <view 
        v-for="result in searchResults" 
        :key="result.songId" 
        class="result-item"
      >
	   <image :src="getCoverUrl(result.songId.toString())"></image>
        <text class="song-id">ID: {{result.songId}}</text>
        <text class="song-name">{{result.name}}</text>
        <view class="matched-aliases" v-if="result.matchedAliases?.length">
          <text>匹配别名：{{result.matchedAliases.join(', ')}}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SongSearcher from '@/utils/songSearcher.js'
import {getCoverUrl,initCoverList} from '../../util/coverManager.js'
// 响应式状态
const searcher = ref(null)
const searchKeyword = ref('')
const searchResults = ref([])

// 搜索方法
const onSearch = () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }
  
  searchResults.value = searcher.value.searchByAlias(searchKeyword.value)
}

// 获取数据方法
const fetchSongData = () => {
  uni.request({
    url: 'https://api.yuzuchan.moe/maimaidx/maimaidxalias',
    method: 'GET',
    success: ({ data }) => {
      if (data && data.status_code === 200) {
        // 初始化搜索器
        searcher.value = new SongSearcher(data)
      }
    },
    fail: (error) => {
      console.error('获取数据失败:', error)
      uni.showToast({
        title: '获取数据失败',
        icon: 'error'
      })
    }
  })
}

// 生命周期钩子
onMounted(() => {
  initCoverList()
  fetchSongData()
})
</script>

<style lang="scss">
.container {
  padding: 20rpx;
  
  .search-box {
    margin-bottom: 20rpx;
    
    input {
      width: 100%;
      height: 80rpx;
      border: 1px solid #ddd;
      border-radius: 8rpx;
      padding: 0 20rpx;
    }
  }
  
  .result-list {
    .result-item {
      padding: 20rpx;
      border-bottom: 1px solid #eee;
      
      .song-id {
        font-size: 28rpx;
        color: #666;
        margin-right: 20rpx;
      }
      
      .song-name {
        font-size: 32rpx;
        font-weight: bold;
      }
      
      .matched-aliases {
        font-size: 24rpx;
        color: #999;
        margin-top: 10rpx;
      }
    }
  }
}
</style> 