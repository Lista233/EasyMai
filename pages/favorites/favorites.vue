<template>
  <view class="container" :class="{'dark-mode': isDarkMode}">
    <view class="header">
      <text class="title">我的收藏</text>
      <view class="header-actions">
        <view class="manage-btn" @click="showFolderManageDialog">
          <text class="manage-icon">管理收藏夹️</text>
        </view>
        <view class="add-btn" @click="showNewFolderDialog">
          <text class="add-icon">+</text>
        </view>
      </view>
    </view>
    
    <!-- 收藏夹选择器 -->
    <view class="folder-tabs" v-if="!loading && favoriteFolders.length > 0">
      <scroll-view scroll-x="true" class="folder-scroll" show-scrollbar="false">
        <view class="folder-tabs-inner">
          <view 
            v-for="(folder, index) in favoriteFolders" 
            :key="index" 
            class="folder-tab"
            :class="{ active: currentFolderId === folder.id }"
            @click="selectFolder(folder.id)"
          >
            <text class="folder-name">{{ folder.name }}</text>
            <text class="folder-count">({{ folder.count || 0 }})</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 歌曲列表 -->
    <view class="songs-section" v-if="!loading">
      <view v-if="favoriteFolders.length > 0">
        <view v-if="currentSongs.length > 0">
          <view class="random-song-btn" @click="selectRandomSong">
         
            <text class="random-text">随机选歌</text>
          </view>
          
          <view 
            v-for="(song, index) in currentSongs" 
            :key="index" 
            class="song-card"
            @click="navigateToDetail(song.id, song.selectedDifficulty)"
          >
            <view class="song-cover">
              <image class="cover-image" :src="getCoverUrl(song.id)" mode="aspectFill"></image>
              <view class="difficulty-badge" :class="getDifficultyClass(song.selectedDifficulty)">
                {{ song.ds[song.selectedDifficulty]}}
              </view>
            </view>
            <view class="song-info">
              <text class="song-title">{{ song.title }}</text>
              <view class="song-details">
                <!-- <text class="song-artist">{{ song.basic_info?.artist || '未知艺术家' }}</text> -->
                <text class="song-version">{{ formatVersion(song.basic_info.from) }}</text>
                <text class="song-genre">{{ formatGenre(song.basic_info.genre || '未知类别') }}</text>
                <text class="song-bpm" v-if="song.basic_info?.bpm">BPM {{ song.basic_info.bpm }}</text>
              </view>
            </view>
            <view class="remove-btn" @click.stop="removeSong(song.id,song.selectedDifficulty)">
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
      
      <view v-else class="empty-state">
        <image class="empty-icon" src="/static/images/empty-folder.png" mode="aspectFit"></image>
        <text class="empty-text">暂无收藏夹</text>
        <button class="create-folder-btn" @click="showNewFolderDialog">创建收藏夹</button>
      </view>
    </view>
    
    <!-- 加载中状态 -->
    <view class="loading-container" v-if="loading">
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 新建收藏夹弹窗 -->
    <uni-popup ref="newFolderPopupRef" type="center">
      <view class="folder-popup">
        <view class="popup-header">
          <text class="title">新建收藏夹</text>
          <text class="close-btn" @click="closeNewFolderDialog">×</text>
        </view>
        <view class="popup-content">
          <input 
            type="text" 
            v-model="newFolderName" 
            placeholder="输入收藏夹名称" 
            class="folder-input"
            maxlength="20"
          />
        </view>
        <view class="popup-footer">
          <button class="cancel-btn" @click="closeNewFolderDialog">取消</button>
          <button class="confirm-btn" @click="createNewFolder">创建</button>
        </view>
      </view>
    </uni-popup>
    
    <!-- 收藏夹管理弹窗 -->
    <uni-popup ref="folderManagePopupRef" type="bottom">
      <view class="folder-manage-popup">
        <view class="popup-header">
          <text class="title">管理收藏夹</text>
          <text class="close-btn" @click="closeFolderManageDialog">×</text>
        </view>
        <view class="folder-list">
          <view 
            v-for="(folder, index) in favoriteFolders" 
            :key="index"
            class="folder-item"
          >
            <text class="folder-name">{{ folder.name }}</text>
            <view class="folder-actions">
              <text class="edit-btn" @click="showEditFolderDialog(folder)">编辑</text>
              <text class="delete-btn" @click="deleteFolder(folder.id)">删除</text>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
    
    <!-- 随机选歌弹窗 -->
    <uni-popup ref="randomSongPopupRef" type="center">
      <view class="random-song-popup">
        <view class="popup-header">
          <text class="title">随机选歌</text>
          <text class="close-btn" @click="closeRandomSongPopup">×</text>
        </view>
        <view class="popup-content">
          <view class="cover-wrapper">
            <view 
              class="cover-container" 
              :class="{ clickable: selectedRandomSong && !isRolling }"
              @click="handleCoverClick"
            >
              <image 
                v-if="isRolling && currentSongs.length > 0" 
                class="rolling-cover" 
                :src="getCoverUrl(rollingSongs[currentRollingIndex].id)" 
                mode="aspectFill"
              ></image>
              <image 
                v-else-if="selectedRandomSong" 
                class="selected-cover" 
                :src="getCoverUrl(selectedRandomSong.id)" 
                mode="aspectFill"
              ></image>
              <view v-else class="placeholder-cover">
                <text>准备开始</text>
              </view>
            </view>
            
            <!-- 难度标识放在封面下方 -->
            <view 
              v-if="selectedRandomSong && !isRolling" 
              class="difficulty-badge" 
              :class="getDifficultyClass(selectedRandomSong.selectedDifficulty)"
            >
              {{ getDifficultyName(selectedRandomSong.selectedDifficulty) }} {{ selectedRandomSong.ds[selectedRandomSong.selectedDifficulty] }}
            </view>
          </view>
          
          <view class="song-info" v-if="selectedRandomSong && !isRolling">
            <text class="song-title">{{ selectedRandomSong.title }}</text>
            <text class="song-artist">{{ selectedRandomSong.basic_info?.artist || '未知艺术家' }}</text>
            
            <!-- 添加BPM和谱师信息 -->
            <view class="song-details">
              <text class="bpm-info" v-if="selectedRandomSong.basic_info?.bpm">BPM: {{ selectedRandomSong.basic_info.bpm }}</text>
              <text class="charter-info" v-if="getCharter(selectedRandomSong)">谱师: {{ getCharter(selectedRandomSong) }}</text>
            </view>
          </view>
          
          <view class="rolling-tip" v-else-if="isRolling">
            <text>点击停止选择</text>
          </view>
        </view>
        <view class="popup-footer">
          <button 
            class="action-btn" 
            :class="{ 'stop-btn': isRolling, 'play-btn': !isRolling }" 
            @click="toggleRolling"
          >
            {{ isRolling ? '点击停止' : '再抽一次' }}
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, inject } from 'vue';
import SongService from '@/utils/songService.js';
import { getCoverUrl } from '@/util/coverManager.js';
import {onShow} from '@dcloudio/uni-app';
import {updateNativeTabBar} from '@/utils/updateNativeTabBar.js';

// 注入深色模式变量
const isDarkMode = inject('isDarkMode');
const applyTheme = inject('applyTheme');

// 状态变量
const loading = ref(true);
const favoriteFolders = ref([]);
const songService = ref(null);
const newFolderPopupRef = ref(null);
const folderManagePopupRef = ref(null);
const newFolderName = ref('');
const currentFolderId = ref('');
const currentSongs = ref([]);

// 随机选歌相关变量
const randomSongPopupRef = ref(null);
const isRolling = ref(false);
const rollingSongs = ref([]);
const currentRollingIndex = ref(0);
const selectedRandomSong = ref(null);
const rollingInterval = ref(null);
const rollingSpeed = ref(100); // 初始滚动速度(毫秒)
const maxRollingTime = 5000; // 最大滚动时间(毫秒)
const rollingStartTime = ref(0);
const usedRandomIndices = ref({}); // 改为对象，按收藏夹ID存储已使用的索引

// 格式化曲风
const formatGenre = (genre) => {
  const genreMap = {
    'niconico & VOCALOID': 'nico&vocal',
    '音击&中二节奏': '音击&中二',
    '流行&动漫': '流行&动漫',
    '东方Project': '东方',
    '其他游戏': '其他游戏',
    '舞萌': '舞萌',
    'niconicoボーカロイド': 'nico&vocal',
    'POPSアニメ': '流行&动漫',
    'ゲームバラエティ': '其他游戏',
    'maimai': '舞萌',
    'オンゲキCHUNITHM': '音击&中二',
    '東方Project': '东方',
  };
  
  return genreMap[genre] || genre;
};

// 添加版本映射关系
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
};

// 格式化版本显示
const formatVersion = (version) => {
  return versionMap[version] || version;
};

// 初始化数据
const initData = async () => {
  loading.value = true;
  
  try {
    // 初始化 SongService
    const musicData = uni.getStorageSync('musicData');
    if (musicData) {
      songService.value = new SongService(musicData);
    } else {
      console.error('未找到音乐数据');
      uni.showToast({
        title: '未找到音乐数据',
        icon: 'none'
      });
    }
    
    // 加载收藏夹列表
    await loadFavoriteFolders();
    
    // 如果有收藏夹，默认选择第一个
    if (favoriteFolders.value && favoriteFolders.value.length > 0) {
      selectFolder(favoriteFolders.value[0].id);
    }
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

// 加载收藏夹列表
const loadFavoriteFolders = async () => {
  try {
    let folders = uni.getStorageSync('favoriteFolders') || [];
    
    // 如果没有收藏夹，创建一个默认收藏夹
    if (folders.length === 0) {
      const defaultFolder = {
        id: 'default-' + Date.now().toString(),
        name: '默认收藏夹',
        count: 0
      };
      
      folders.push(defaultFolder);
      uni.setStorageSync('favoriteFolders', folders);
      
      // 确保收藏夹对应的歌曲列表存在
      const allFavorites = uni.getStorageSync('favorites') || {};
      if (!allFavorites[defaultFolder.id]) {
        allFavorites[defaultFolder.id] = [];
        uni.setStorageSync('favorites', allFavorites);
      }
    } else {
      // 更新每个收藏夹中的歌曲数量
      const allFavorites = uni.getStorageSync('favorites') || {};
      
      folders = folders.map(folder => ({
        ...folder,
        count: (allFavorites[folder.id] || []).length
      }));
    }
    
    favoriteFolders.value = folders;
    
    // 确保 favoriteFolders 是一个数组
    if (!Array.isArray(favoriteFolders.value)) {
      favoriteFolders.value = [];
    }
  } catch (e) {
    console.error('加载收藏夹失败:', e);
    favoriteFolders.value = [];
  }
};

// 选择收藏夹
const selectFolder = (folderId) => {
  if (!folderId) return;
  
  currentFolderId.value = folderId;
  loadFavoriteSongs();
  
  // 切换收藏夹时重置随机选歌状态
  if (!usedRandomIndices.value[folderId]) {
    usedRandomIndices.value[folderId] = [];
  }
};

// 加载收藏的歌曲
const loadFavoriteSongs = () => {
  if (!currentFolderId.value || !songService.value) {
    currentSongs.value = [];
    return;
  }
  
  try {
    const allFavorites = uni.getStorageSync('favorites') || {};
    const songlist = allFavorites[currentFolderId.value] || [];
    console.log('所有喜欢',allFavorites)
    // 获取歌曲详情
    const songs = songlist.map(favoritesong => {
      const song = songService.value.getSongById(favoritesong.id);
      if (song) {
        return {
          id: favoritesong.id,
          ...song,
          selectedDifficulty: favoritesong.difficulty, // 默认选择 MASTER 难度
        };
      }
      return null;
    }).filter(Boolean);
    console.log(songs)
    currentSongs.value = songs || [];
  } catch (e) {
    console.error('加载收藏歌曲失败:', e);
    currentSongs.value = [];
  }
};

// 使用正确的页面生命周期函数
onShow(() => {
  console.log('页面加载');
  initData();
});

// 使用 uni-app 的页面显示生命周期
const onShowCallback = () => {
  console.log('页面显示');
  loadFavoriteFolders();
  if (currentFolderId.value) {
    loadFavoriteSongs();
  }
};

// 注册页面显示的回调
uni.$on('favorites-page-show', onShowCallback);

// 在组件卸载时移除事件监听
onBeforeUnmount(() => {
  uni.$off('favorites-page-show', onShowCallback);
});

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
    url: `/pages/song-detail/song-detail?songId=${songId}&difficulty=${difficulty || 3}`,
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

// 显示新建收藏夹弹窗
const showNewFolderDialog = () => {
  newFolderName.value = '';
  if (newFolderPopupRef.value) {
    newFolderPopupRef.value.open();
  }
};

// 关闭新建收藏夹弹窗
const closeNewFolderDialog = () => {
  if (newFolderPopupRef.value) {
    newFolderPopupRef.value.close();
  }
};

// 创建新收藏夹
const createNewFolder = () => {
  if (!newFolderName.value.trim()) {
    uni.showToast({
      title: '请输入收藏夹名称',
      icon: 'none'
    });
    return;
  }
  
  try {
    const folders = uni.getStorageSync('favoriteFolders') || [];
    
    // 生成唯一ID
    const newId = Date.now().toString();
    
    // 添加新收藏夹
    folders.push({
      id: newId,
      name: newFolderName.value.trim(),
      count: 0
    });
    
    // 保存收藏夹列表
    uni.setStorageSync('favoriteFolders', folders);
    
    // 确保收藏夹对应的歌曲列表存在
    const allFavorites = uni.getStorageSync('favorites') || {};
    if (!allFavorites[newId]) {
      allFavorites[newId] = [];
      uni.setStorageSync('favorites', allFavorites);
    }
    
    // 刷新列表
    favoriteFolders.value = folders;
    
    // 选择新创建的收藏夹
    selectFolder(newId);
    
    // 关闭弹窗
    closeNewFolderDialog();
    
    uni.showToast({
      title: '创建成功',
      icon: 'success'
    });
  } catch (e) {
    console.error('创建收藏夹失败:', e);
    uni.showToast({
      title: '创建失败',
      icon: 'none'
    });
  }
};

// 从收藏夹中移除歌曲
const removeSong = (songId,diff) => {
  if (!songId || !currentFolderId.value) return;
  
  // 添加确认弹窗
  uni.showModal({
    title: '确认移除',
    content: '确定要将此歌曲从收藏夹中移除吗？',
    success: (res) => {
      if (res.confirm) {
        try {
          const allFavorites = uni.getStorageSync('favorites') || {};
          const folderSongs = allFavorites[currentFolderId.value] || [];
          
          // 从数组中移除歌曲对象
          const index = folderSongs.findIndex(item => item.id === songId && item.difficulty === diff );
          if (index !== -1) {
            folderSongs.splice(index, 1);
            allFavorites[currentFolderId.value] = folderSongs;
            uni.setStorageSync('favorites', allFavorites);
            
            // 更新收藏夹中的歌曲数量
            const folders = favoriteFolders.value.map(folder => {
              if (folder.id === currentFolderId.value) {
                return { ...folder, count: folderSongs.length };
              }
              return folder;
            });
            
            favoriteFolders.value = folders;
            uni.setStorageSync('favoriteFolders', folders);
            
            // 刷新歌曲列表
            loadFavoriteSongs();
            
            uni.showToast({
              title: '移除成功',
              icon: 'none'
            });
          }
        } catch (e) {
          console.error('移除歌曲失败:', e);
          uni.showToast({
            title: '操作失败',
            icon: 'none'
          });
        }
      }
    }
  });
};

// 显示收藏夹管理弹窗
const showFolderManageDialog = () => {
  if (folderManagePopupRef.value) {
    folderManagePopupRef.value.open();
  }
};

// 关闭收藏夹管理弹窗
const closeFolderManageDialog = () => {
  if (folderManagePopupRef.value) {
    folderManagePopupRef.value.close();
  }
};

// 删除收藏夹
const deleteFolder = (folderId) => {
  uni.showModal({
    title: '确认删除',
    content: '删除收藏夹将同时删除其中的所有收藏，确定要删除吗？',
    success: (res) => {
      if (res.confirm) {
        try {
          // 删除收藏夹
          let folders = uni.getStorageSync('favoriteFolders') || [];
          folders = folders.filter(folder => folder.id !== folderId);
          uni.setStorageSync('favoriteFolders', folders);
          
          // 删除收藏夹中的歌曲
          const allFavorites = uni.getStorageSync('favorites') || {};
          delete allFavorites[folderId];
          uni.setStorageSync('favorites', allFavorites);
          
          // 刷新列表
          loadFavoriteFolders();
          
          // 如果删除的是当前选中的收藏夹，则选择第一个收藏夹
          if (currentFolderId.value === folderId) {
            if (folders.length > 0) {
              selectFolder(folders[0].id);
            } else {
              currentFolderId.value = '';
              currentSongs.value = [];
            }
          }
          
          // 关闭弹窗
          closeFolderManageDialog();
          
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });
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

// 编辑收藏夹
const showEditFolderDialog = (folder) => {
  // 这里可以添加编辑收藏夹的逻辑
  uni.showModal({
    title: '重命名收藏夹',
    editable: true,
    placeholderText: '请输入新名称',
    content: folder.name,
    success: (res) => {
      if (res.confirm && res.content.trim()) {
        try {
          // 更新收藏夹名称
          const folders = uni.getStorageSync('favoriteFolders') || [];
          const updatedFolders = folders.map(f => {
            if (f.id === folder.id) {
              return { ...f, name: res.content.trim() };
            }
            return f;
          });
          
          uni.setStorageSync('favoriteFolders', updatedFolders);
          
          // 刷新列表
          loadFavoriteFolders();
          
          // 关闭弹窗
          closeFolderManageDialog();
          
          uni.showToast({
            title: '重命名成功',
            icon: 'success'
          });
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

// 获取歌曲封面
const getSongCover = (songId) => {
  return getCoverUrl(songId);
};

// 显示随机选歌弹窗
const selectRandomSong = () => {
  if (currentSongs.value.length === 0) {
    uni.showToast({
      title: '收藏夹中没有歌曲',
      icon: 'none'
    });
    return;
  }
  
  // 确保当前收藏夹的索引数组存在
  if (!usedRandomIndices.value[currentFolderId.value]) {
    usedRandomIndices.value[currentFolderId.value] = [];
  }
  
  // 重置状态
  isRolling.value = false;
  selectedRandomSong.value = null;
  
  // 准备滚动歌曲列表
  prepareRollingSongs();
  
  // 打开弹窗
  if (randomSongPopupRef.value) {
    randomSongPopupRef.value.open();
  }
};

// 准备滚动歌曲列表
const prepareRollingSongs = () => {
  // 复制当前歌曲列表
  rollingSongs.value = [...currentSongs.value];
  
  // 如果已经使用了所有索引，则重置
  if (usedRandomIndices.value[currentFolderId.value].length >= currentSongs.value.length) {
    usedRandomIndices.value[currentFolderId.value] = [];
  }
  
  // 打乱歌曲顺序
  for (let i = rollingSongs.value.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rollingSongs.value[i], rollingSongs.value[j]] = [rollingSongs.value[j], rollingSongs.value[i]];
  }
};

// 切换滚动状态
const toggleRolling = () => {
  if (isRolling.value) {
    stopRolling();
  } else {
    startRolling();
  }
};

// 开始滚动
const startRolling = () => {
  if (rollingSongs.value.length === 0) return;
  
  isRolling.value = true;
  currentRollingIndex.value = 0;
  rollingStartTime.value = Date.now();
  
  // 设置滚动间隔
  rollingInterval.value = setInterval(() => {
    currentRollingIndex.value = (currentRollingIndex.value + 1) % rollingSongs.value.length;
    
    // 计算已经滚动的时间
    const elapsedTime = Date.now() - rollingStartTime.value;
    
    // 根据已经滚动的时间调整速度
    if (elapsedTime > maxRollingTime * 0.7) {
      // 减慢速度
      clearInterval(rollingInterval.value);
      rollingInterval.value = setInterval(() => {
        currentRollingIndex.value = (currentRollingIndex.value + 1) % rollingSongs.value.length;
      }, rollingSpeed.value * 3);
    }
    
    // 如果超过最大滚动时间，自动停止
    if (elapsedTime > maxRollingTime) {
      stopRolling();
    }
  }, rollingSpeed.value);
};

// 停止滚动
const stopRolling = () => {
  if (!isRolling.value) return;
  
  clearInterval(rollingInterval.value);
  isRolling.value = false;
  
  // 选择一个未使用过的随机索引
  let availableIndices = [];
  for (let i = 0; i < currentSongs.value.length; i++) {
    if (!usedRandomIndices.value[currentFolderId.value].includes(i)) {
      availableIndices.push(i);
    }
  }
  
  // 如果没有可用索引，则重置并使用所有索引
  if (availableIndices.length === 0) {
    usedRandomIndices.value[currentFolderId.value] = [];
    availableIndices = Array.from({ length: currentSongs.value.length }, (_, i) => i);
  }
  
  // 随机选择一个可用索引
  const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  usedRandomIndices.value[currentFolderId.value].push(randomIndex);
  
  // 设置选中的歌曲
  selectedRandomSong.value = currentSongs.value[randomIndex];
};

// 关闭随机选歌弹窗
const closeRandomSongPopup = () => {
  if (isRolling.value) {
    clearInterval(rollingInterval.value);
    isRolling.value = false;
  }
  
  if (randomSongPopupRef.value) {
    randomSongPopupRef.value.close();
  }
};

// 处理封面点击事件
const handleCoverClick = () => {
  if (selectedRandomSong.value && !isRolling.value) {
    closeRandomSongPopup();
    navigateToDetail(selectedRandomSong.value.id, selectedRandomSong.value.selectedDifficulty);
  } else if (isRolling.value) {
    stopRolling();
  }
};

// 获取谱师信息
const getCharter = (song) => {
  if (!song || !song.charts || !song.selectedDifficulty) return '';
  
  // 获取选中难度的谱师
  const chart = song.charts[song.selectedDifficulty];
  return chart?.charter || '';
};

// 在onMounted中添加深色模式处理
onMounted(() => {
  // 现有的初始化代码...
  
  // 应用深色模式到原生TabBar
  applyTheme();
  updateNativeTabBar(isDarkMode.value);
  
  // 其他现有的onMounted代码...
});
</script>

<style lang="scss" scoped>
/* 导入深色模式样式 */
@import '@/pages/favorites/dark-favorites.scss';

.container {
  padding: 30rpx;
  background-color: #f8fafc;
  min-height: 100vh;
  .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  
  .title {
    font-size: 40rpx;
    font-weight: 700;
    color: #1e293b;
  }
  
  .header-actions {
    display: flex;
    gap: 20rpx;
  }
  
  .manage-btn {
    width: 200rpx;
    height: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #6366f1;
    border-radius: 30rpx;
    
    .manage-icon, .add-icon {
      font-size: 28rpx;
      color: white;
    }
  }
  .add-btn {
     width: 60rpx;
     height: 60rpx;
     display: flex;
     justify-content: center;
     align-items: center;
     background-color: #6366f1;
     border-radius: 30rpx;
     
     .manage-icon, .add-icon {
       font-size: 32rpx;
       color: white;
     }
   }
}

.folder-tabs {
  margin-bottom: 30rpx;
  max-height: 100rpx;
  
  .folder-scroll {
    width: 100%;
    height: 100%;
  }
  
  .folder-tabs-inner {
    display: flex;
    flex-direction: row;
    padding: 10rpx;
    white-space: nowrap;
    height: 80rpx;
    min-width: 100%;
  }
  
  .folder-tab {
    display: inline-flex;
    align-items: center;
    height: 80rpx;
    padding: 0 30rpx;
    margin-right: 20rpx;
    background-color: #ffffff;
    border-radius: 30rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    flex-shrink: 0;
    
    &.active {
      background-color: #6366f1;
      
      .folder-name, .folder-count {
        color: white;
      }
    }
    
    .folder-name {
      font-size: 28rpx;
      font-weight: 600;
      color: #334155;
    }
    
    .folder-count {
      font-size: 24rpx;
      color: #64748b;
      margin-left: 8rpx;
    }
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
      font-weight: 700;
      text-align: center;
      color: white;
      background-color: rgba(0, 0, 0, 0.6);
      
      &.basic {
        background-color: rgb(83, 206, 134);
      }
      
      &.advanced {
         background-color:  rgb(227, 206, 42);
      }
      
      &.expert {
        background-color: rgba(225, 71, 87, 1);
      }
      
      &.master {
        background-color: rgba(156, 136, 255, 1);
      }
      
      &.remaster {
        background-color: rgb(225, 181, 247);
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
      font-size: 30rpx;
      font-weight: 500;
      color: #334155;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      position: relative;
      padding-left: 20rpx;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 8rpx;
        height: 30rpx;
        background-color: #6366f1;
        border-radius: 4rpx;
      }
    }
    
    .song-details {
      display: flex;
      flex-wrap: wrap;
      gap: 10rpx;
      justify-content: center;
      align-items: center;
      .song-artist, .song-version, .song-genre, .song-bpm {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 24rpx;
        color: #64748b;
        padding: 4rpx 12rpx;
        border-radius: 6rpx;
        white-space: nowrap;
      }
      
      .song-version {
        background-color: #e0f2fe;
        color: #0369a1;
      }
      
      .song-artist {
        background-color: #fdfbf0;
        color: #f1a25d;
      }
      
      .song-genre {
        background-color: #f0fdf4;
        color: #16a34a;
      }
      
      .song-bpm {
        background-color: #f4f0fd;
        color: #6e5df1;
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
  
  .create-folder-btn, .browse-btn {
    background-color: #6366f1;
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

.folder-popup {
  width: 600rpx;
  background: white;
  border-radius: 20rpx;
  overflow: hidden;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1px solid #f0f0f0;
    
    .title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
    
    .close-btn {
      font-size: 40rpx;
      color: #999;
      padding: 0 10rpx;
    }
  }
  
  .popup-content {
    padding: 30rpx;
    
    .folder-input {
      width: 100%;
      height: 80rpx;
      border: 1px solid #d1d5db;
      border-radius: 8rpx;
      padding: 0 20rpx;
      font-size: 28rpx;
      box-sizing: border-box;
    }
  }
  
  .popup-footer {
    display: flex;
    border-top: 1px solid #f0f0f0;
    
    button {
      flex: 1;
      height: 90rpx;
      line-height: 90rpx;
      text-align: center;
      font-size: 30rpx;
      border: none;
      border-radius: 0;
      
      &.cancel-btn {
        background-color: #f8f8f8;
        color: #666;
      }
      
      &.confirm-btn {
        background-color: #6366f1;
        color: white;
      }
    }
  }
}

.folder-manage-popup {
  background: white;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  overflow: hidden;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1px solid #f0f0f0;
    
    .title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
    
    .close-btn {
      font-size: 40rpx;
      color: #999;
      padding: 0 10rpx;
    }
  }
  
  .folder-list {
    max-height: 600rpx;
    overflow-y: auto;
    
    .folder-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx;
      border-bottom: 1px solid #f5f5f5;
      
      .folder-name {
        font-size: 28rpx;
        color: #333;
      }
      
      .folder-actions {
        display: flex;
        gap: 20rpx;
        
        .edit-btn, .delete-btn {
          font-size: 24rpx;
          padding: 8rpx 16rpx;
          border-radius: 6rpx;
        }
        
        .edit-btn {
          color: #6366f1;
          background-color: #eff6ff;
        }
        
        .delete-btn {
          color: #ef4444;
          background-color: #fef2f2;
        }
      }
    }
  }
}

/* 随机歌曲按钮样式 */
.random-song-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #6366f1;
  padding: 16rpx;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.random-icon {
  font-size: 36rpx;
  margin-right: 10rpx;
}

.random-text {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
}

/* 随机选歌弹窗样式 - 优化版 */
.random-song-popup {
  width: 600rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 30rpx;
    border-bottom: 1px solid #f0f0f0;
    background-color: #f9f9f9;
    
    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .close-btn {
      font-size: 40rpx;
      color: #999;
      padding: 0 10rpx;
    }
  }
  
  .popup-content {
    padding: 30rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .cover-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 20rpx;
      
      .cover-container {
        width: 300rpx;
        height: 300rpx;
        border-radius: 12rpx;
        overflow: hidden;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
        border: 4rpx solid #f0f0f0;
        margin-bottom: 10rpx; /* 减少封面与难度标识的间距 */
        
        &.clickable {
          cursor: pointer;
          position: relative;
          
          &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.1);
            opacity: 0;
            transition: opacity 0.2s;
          }
          
          &:hover::after {
            opacity: 1;
          }
        }
        
        .rolling-cover, .selected-cover {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .placeholder-cover {
          width: 100%;
          height: 100%;
          background-color: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
        }
      }
      
      .difficulty-badge {
        width: 260rpx; /* 固定宽度，接近封面宽度 */
        padding: 10rpx 0; /* 增加高度 */
        border-radius: 10rpx; /* 减小圆角 */
        font-size: 28rpx; /* 增大字体 */
        font-weight: bold;
        text-align: center;
        color: white;
        box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.2);
        
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
    
    .song-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      background-color: #f9f9f9;
      padding: 16rpx;
      border-radius: 12rpx;
      
      .song-title {
        font-size: 36rpx; /* 增大标题字体 */
        font-weight: bold;
        color: #333;
        margin-bottom: 8rpx;
        text-align: center;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding-bottom: 12rpx; /* 为分隔线留出空间 */
        position: relative; /* 为伪元素定位 */
        
        &::after { /* 添加标题下方分隔线 */
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 1px;
          background-color: #e0e0e0;
        }
      }
      
      .song-artist {
        font-size: 24rpx;
        color: #666;
        margin-top: 8rpx; /* 添加与分隔线的间距 */
        margin-bottom: 12rpx;
        text-align: center;
        width: 100%;
      }
      
      /* 添加BPM和谱师信息样式 */
      .song-details {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 10rpx;
        margin-top: 4rpx;
        width: 100%;
        
        .bpm-info, .charter-info {
          font-size: 22rpx;
          color: #666;
          background-color: #ffffff;
          padding: 4rpx 12rpx;
          border-radius: 6rpx;
          border: 1px solid #eaeaea;
        }
      }
    }
    
    .rolling-tip {
      margin-top: 20rpx;
      font-size: 28rpx;
      color: #666;
      background-color: #f5f5f5;
      padding: 8rpx 16rpx;
      border-radius: 8rpx;
    }
  }
  
  .popup-footer {
    display: flex;
    justify-content: center;
    padding: 24rpx 30rpx;
    border-top: 1px solid #f0f0f0;
    gap: 20rpx;
    background-color: #f9f9f9;
    
    .action-btn {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      border-radius: 40rpx;
      font-size: 28rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
      
      &.stop-btn {
        background-color: #ff6b6b;
        color: white;
      }
      
      &.play-btn {
        background-color: #6366f1;
        color: white;
      }
    }
  }
}
}


</style> 