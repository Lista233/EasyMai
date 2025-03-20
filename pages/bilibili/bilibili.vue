<template>
  <view class="bilibili-container">
    <view class="header">
      <image class="bilibili-logo" src="/static/bilibili-logo.png" mode="aspectFit"></image>
      <text class="title">B站搜索</text>
    </view>
    
    <view class="content">
      <view class="search-box">
        <input 
          type="text" 
          v-model="searchKeyword"
          placeholder="请输入搜索关键词"
          class="search-input"
        />
        <button class="search-btn" @click="handleSearch">搜索</button>
      </view>
      
      <view class="quick-search">
        <text class="section-title">快速搜索</text>
        <view class="tag-list">
          <view 
            class="tag-item" 
            v-for="(tag, index) in quickSearchTags" 
            :key="index"
            @click="handleQuickSearch(tag)"
          >
            {{ tag }}
          </view>
        </view>
      </view>

      <!-- 添加视频跳转部分 -->
      <view class="section">
        <view class="section-title">视频跳转</view>
        <view class="input-group">
          <input 
            type="text" 
            v-model="bvid" 
            placeholder="请输入BV号" 
            class="input"
          />
          <button 
            @click="handleVideoJump" 
            :disabled="!bvid"
            class="btn"
          >
            跳转到视频
          </button>
        </view>
      </view>
    </view>
    
    <view class="footer">
      <text class="tip">点击搜索将跳转至B站APP</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onHide, onShow } from '@dcloudio/uni-app';
import { openBiliSearch, openBiliSpace, openBiliVideo } from '@/utils/biliUtils';

const searchKeyword = ref('');
const quickSearchTags = [
  'maimai',
  'maimai DX',
  'maimai 手元',
  'maimai 教程'
];

// 视频跳转相关
const bvid = ref('');

// 执行搜索
const doSearch = (keyword) => {
  // B站搜索的Scheme URL
  const biliScheme = `bilibili://search?keyword=${encodeURIComponent(keyword)}`;
  // 备选网页链接
  const webUrl = `https://search.bilibili.com/all?keyword=${encodeURIComponent(keyword)}`;
  
  // 尝试打开B站APP
  plus.runtime.openURL(biliScheme, (err) => {
    if (err) {
      // 如果打开失败(未安装B站),提示用户或打开网页版
      uni.showModal({
        title: '提示',
        content: '未检测到哔哩哔哩APP，是否打开网页版?',
        success: (res) => {
          if (res.confirm) {
            plus.runtime.openURL(webUrl);
          }
        }
      });
    }
  });
}

// 处理搜索按钮点击
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    uni.showToast({
      title: '请输入搜索关键词',
      icon: 'none'
    });
    return;
  }
  doSearch(searchKeyword.value.trim());
}

// 处理快速搜索标签点击
const handleQuickSearch = (tag) => {
  doSearch(tag);
}

const handleVideoJump = async () => {
  uni.showLoading({
    title: '正在跳转...',
    mask: true
  });
  
  const timeout = setTimeout(() => {
    uni.hideLoading();
  }, 10000);

  const hideCallback = () => {
    clearTimeout(timeout);
  };

  const showCallback = () => {
    uni.hideLoading();
    uni.$off('page-show', showCallback);
    uni.$off('page-hide', hideCallback);
  };

  uni.$once('page-hide', hideCallback);
  uni.$once('page-show', showCallback);
  
  await openBiliVideo(bvid.value);
};

// 页面生命周期
onHide(() => {
  uni.$emit('page-hide');
});

onShow(() => {
  uni.$emit('page-show');
});
</script>

<style lang="scss" scoped>
.bilibili-container {
  min-height: 100vh;
  padding: 32rpx;
  background-color: #f6f7fb;
  
  .header {
    display: flex;
    align-items: center;
    margin-bottom: 48rpx;
    
    .bilibili-logo {
      width: 80rpx;
      height: 80rpx;
      margin-right: 16rpx;
    }
    
    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
  }
  
  .content {
    .search-box {
      display: flex;
      gap: 20rpx;
      margin-bottom: 40rpx;
      
      .search-input {
        flex: 1;
        height: 80rpx;
        background: #ffffff;
        border-radius: 12rpx;
        padding: 0 24rpx;
        font-size: 28rpx;
      }
      
      .search-btn {
        width: 160rpx;
        height: 80rpx;
        background: #fb7299;
        color: #ffffff;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
      }
    }
    
    .quick-search {
      background: #ffffff;
      border-radius: 16rpx;
      padding: 24rpx;
      
      .section-title {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 20rpx;
      }
      
      .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 20rpx;
        
        .tag-item {
          padding: 12rpx 24rpx;
          background: #f6f7fb;
          border-radius: 8rpx;
          font-size: 26rpx;
          color: #666;
          
          &:active {
            background: #eef0f6;
          }
        }
      }
    }

    .section {
      margin: 20rpx;
      padding: 20rpx;
      background-color: #fff;
      border-radius: 12rpx;
      
      .section-title {
        font-size: 32rpx;
        font-weight: bold;
        margin-bottom: 20rpx;
      }
      
      .input-group {
        display: flex;
        gap: 20rpx;
        
        .input {
          flex: 1;
          height: 80rpx;
          padding: 0 20rpx;
          border: 1px solid #ddd;
          border-radius: 8rpx;
        }
        
        .btn {
          width: 200rpx;
          height: 80rpx;
          line-height: 80rpx;
          text-align: center;
          background-color: #fb7299;
          color: #fff;
          border-radius: 8rpx;
          
          &:disabled {
            background-color: #ccc;
          }
        }
      }
    }
  }
  
  .footer {
    margin-top: 32rpx;
    text-align: center;
    
    .tip {
      font-size: 24rpx;
      color: #999;
    }
  }
}
</style> 