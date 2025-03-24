<template>
  <view class="container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="title">{{ folderName }}</text>
      <view class="action-btn" @click="showActionSheet">
        <text class="action-icon">⋮</text>
      </view>
    </view>
    
    <!-- 歌曲列表 -->
    <view class="songs-section" v-if="!loading">
      <view v-if="songList.length > 0">
        <view 
          v-for="(song, index) in songList" 
          :key="index" 
          class="song-card"
          @click="navigateToDetail(song.id, song.selectedDifficulty)"
        >
          <view class="song-cover">
            <image class="cover-image" :src="getSongCover(song.id)" mode="aspectFill"></image>
            <view class="difficulty-badge" :class="getDifficultyClass(song.selectedDifficulty)">
              {{ getDifficultyName(song.selectedDifficulty) }}
            </view>
          </view>
          <view class="song-info">
            <text class="song-title">{{ song.title }}</text>
            <view class="song-details">
              <text class="song-artist">{{ song.basicInfo.artist }}</text>
              <text class="song-version">{{ song.basicInfo.version }}</text>
            </view>
          </view>
          <view class="remove-btn" @click.stop="removeSong(song.id)">
            <text class="remove-icon">×</text>
          </view>
        </view>
      </view>
      
      <view v-else class="empty-state">
        <image class="empty-icon" src="/static/images/empty-songs.png" mode="aspectFit"></image>
        <text class="empty-text">收藏夹中暂无歌曲</text>
        <button class="browse-btn" @click="navigateToSongSearch">浏览歌曲</button>
      </view>
    </view>
    
    <!-- 加载中状态 -->
    <view class="loading-container" v-if="loading">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import SongService from '@/utils/songService.js';

// 状态变量
const loading = ref(true);
const songList = ref([]);
const songService = ref(null);
const folderId = ref('');
const folderName = ref('收藏夹');

// 获取页面参数
const getPageParams = () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options;
  
  if (options.folderId) {
    folderId.value = options.folderId;
    loadFolderName();
  }
};

// 加载收藏夹名称
const loadFolderName = () => {
  try {
    const folders = uni.getStorageSync('favoriteFolders') || [];
    const folder = folders.find(f => f.id === folderId.value);
    if (folder) {
      folderName.value = folder.name;
    }
  } catch (e) {
    console.error('加载收藏夹名称失败:', e);
  }
};

// 初始化数据
const initData = async () => {
  loading.value = true;
  
  try {
    // 初始化 SongService
    const musicData = uni.getStorageSync('musicData');
    if (musicData) {
      songService.value = new SongService(musicData);
    }
    
    // 加载收藏的歌曲
    loadFavoriteSongs();
  } catch (error) {
    console.error('初始化数据失败:', error);
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 加载收藏的歌曲
const loadFavoriteSongs = () => {
  if (!folderId.value || !songService.value) return;
  
  try {
    const allFavorites = uni.getStorageSync('favorites') || {};
    const songIds = allFavorites[folderId.value] || [];
    
    // 获取歌曲详情
    const songs = songIds.map(id => {
      const song = songService.value.getSongById(id);
      if (song) {
        return {
          ...song,
          selectedDifficulty: 3, // 默认选择 MASTER 难度
          basicInfo: {
            artist: song.artist || '未知艺术家',
            version: song.version || '未知版本'
          }
        };
      }
      return null;
    }).filter(Boolean);
    
    songList.value = songs;
  } catch (e) {
    console.error('加载收藏歌曲失败:', e);
    songList.value = [];
  }
};

// 获取歌曲封面
const getSongCover = (songId) => {
  return `https://maimai.wahlap.com/maimai-mobile/img/Music/${songId}.png`;
};

// 获取难度名称
const getDifficultyName = (difficulty) => {
  const difficultyIndex = Number(difficulty);
  if (isNaN(difficultyIndex)) return '未知';
  
  switch(difficultyIndex) {
    case 0: return 'BASIC';
    case 1: return 'ADVANCED';
    case 2: return 'EXPERT';
    case 3: return 'MASTER';
    case 4: return 'Re:MASTER';
    default: return '未知';
  }
};

// 获取难度对应的CSS类
const getDifficultyClass = (difficulty) => {
  const difficultyIndex = Number(difficulty);
  if (isNaN(difficultyIndex)) return '';
  
  switch(difficultyIndex) {
    case 0: return 'basic';
    case 1: return 'advanced';
    case 2: return 'expert';
    case 3: return 'master';
    case 4: return 'remaster';
    default: return '';
  }
};

// 跳转到歌曲详情页
const navigateToDetail = (songId, difficulty) => {
  if (!songId) return;
  
  uni.navigateTo({
    url: `/pages/song-detail/song-detail?songId=${songId}&difficulty=${difficulty}`,
    animationType: 'pop-in',
    animationDuration: 200
  });
};

// 跳转到歌曲搜索页
const navigateToSongSearch = () => {
  uni.navigateTo({
    url: '/pages/song-search/song-search',
    animationType: 'pop-in',
    animationDuration: 200
  });
};

// 从收藏夹中移除歌曲
const removeSong = (songId) => {
  uni.showModal({
    title: '移除歌曲',
    content: '确定要从收藏夹中移除这首歌曲吗？',
    confirmColor: '#3b82f6',
    success: (res) => {
      if (res.confirm) {
        try {
          const allFavorites = uni.getStorageSync('favorites') || {};
          const songIds = allFavorites[folderId.value] || [];
          
          // 移除歌曲
          const index = songIds.indexOf(songId);
          if (index !== -1) {
            songIds.splice(index, 1);
            allFavorites[folderId.value] = songIds;
            uni.setStorageSync('favorites', allFavorites);
            
            // 更新收藏夹中的歌曲数量
            updateFolderCount();
            
            // 刷新列表
            loadFavoriteSongs();
            
            uni.showToast({
              title: '已移除',
              icon: 'success'
            });
          }
        } catch (e) {
          console.error('移除歌曲失败:', e);
          uni.showToast({
            title: '移除失败',
            icon: 'none'
          });
        }
      }
    }
  });
};

// 更新收藏夹中的歌曲数量
const updateFolderCount = () => {
  try {
    const folders = uni.getStorageSync('favoriteFolders') || [];
    const allFavorites = uni.getStorageSync('favorites') || {};
    
    const updatedFolders = folders.map(folder => ({
      ...folder,
      count: (allFavorites[folder.id] || []).length
    }));
    
    uni.setStorageSync('favoriteFolders', updatedFolders);
  } catch (e) {
    console.error('更新收藏夹数量失败:', e);
  }
};

// 显示操作菜单
const showActionSheet = () => {
  uni.showActionSheet({
    itemList: ['重命名收藏夹', '删除收藏夹'],
    success: (res) => {
      if (res.tapIndex === 0) {
        renameFolder();
      } else if (res.tapIndex === 1) {
        deleteFolder();
      }
    }
  });
};

// 重命名收藏夹
const renameFolder = () => {
  uni.showModal({
    title: '重命名收藏夹',
    editable: true,
    placeholderText: '请输入新名称',
    content: folderName.value,
    confirmColor: '#3b82f6',
    success: (res) => {
      if (res.confirm && res.content.trim()) {
        try {
          const folders = uni.getStorageSync('favoriteFolders') || [];
          const index = folders.findIndex(f => f.id === folderId.value);
          
          if (index !== -1) {
            folders[index].name = res.content.trim();
            uni.setStorageSync('favoriteFolders', folders);
            folderName.value = res.content.trim();
            
            uni.showToast({
              title: '重命名成功',
              icon: 'success'
            });
          }
        } catch (e) {
          console.error('重命名收藏夹失败:', e);
          uni.showToast({
            title: '重命名失败',
            icon: 'none'
          });
        }
      }
    }
  });
};

// 删除收藏夹
const deleteFolder = () => {
  uni.showModal({
    title: '删除收藏夹',
    content: '确定要删除这个收藏夹吗？收藏夹中的所有歌曲将被移除。',
    confirmColor: '#f43f5e',
    success: (res) => {
      if (res.confirm) {
        try {
          // 删除收藏夹
          const folders = uni.getStorageSync('favoriteFolders') || [];
          const newFolders = folders.filter(f => f.id !== folderId.value);
          uni.setStorageSync('favoriteFolders', newFolders);
          
          // 删除收藏夹中的歌曲
          const allFavorites = uni.getStorageSync('favorites') || {};
          delete allFavorites[folderId.value];
          uni.setStorageSync('favorites', allFavorites);
          
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });
          
          // 返回上一页
          setTimeout(() => {
            goBack();
          }, 500);
        } catch (e) {
          console.error('删除收藏夹失败:', e);
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          });
        }
      }
    }
  });
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 页面加载时初始化数据
onMounted(() => {
  getPageParams();
  initData();
});
</script>

<style lang="scss">
.container {
  padding: 30rpx;
  background-color: #f8fafc;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
  
  .back-btn, .action-btn {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    
    .back-icon, .action-icon {
      font-size: 40rpx;
      color: #64748b;
    }
  }
  
  .title {
    flex: 1;
    font-size: 36rpx;
    font-weight: 700;
    color: #1e293b;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 20rpx;
  }
}

.songs-section {
  margin-bottom: 30rpx;
}

.song-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
  
  .song-cover {
    position: relative;
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    overflow: hidden;
    margin-right: 20rpx;
    
    .cover-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .difficulty-badge {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 4rpx 0;
      font-size: 20rpx;
      text-align: center;
      color: white;
      background-color: rgba(0, 0, 0, 0.6);
      
      &.basic {
        background-color: rgba(46, 213, 115, 0.8);
      }
      
      &.advanced {
        background-color: rgba(255, 159, 26, 0.8);
      }
      
      &.expert {
        background-color: rgba(255, 71, 87, 0.8);
      }
      
      &.master {
        background-color: rgba(156, 136, 255, 0.8);
      }
      
      &.remaster {
        background-color: rgba(224, 163, 255, 0.8);
      }
    }
  }
  
  .song-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    overflow: hidden;
    
    .song-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #334155;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .song-details {
      display: flex;
      flex-wrap: wrap;
      gap: 10rpx;
      
      .song-artist, .song-version {
        font-size: 24rpx;
        color: #64748b;
        background-color: #f1f5f9;
        padding: 4rpx 12rpx;
        border-radius: 6rpx;
        white-space: nowrap;
      }
    }
  }
  
  .remove-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    
    .remove-icon {
      font-size: 40rpx;
      color: #94a3b8;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  
  .empty-icon {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
    opacity: 0.7;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #94a3b8;
    margin-bottom: 40rpx;
  }
  
  .browse-btn {
    background-color: #3b82f6;
    color: white;
    font-size: 28rpx;
    padding: 20rpx 40rpx;
    border-radius: 10rpx;
    border: none;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300rpx;
  
  .loading-text {
    font-size: 28rpx;
    color: #94a3b8;
  }
}
</style> 