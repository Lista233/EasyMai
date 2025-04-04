<template>
  <view class="toolbox-container" :class="{ 'dark-mode': isDarkMode }">
    <view class="header">
      <text class="title">工具箱</text>
      <text class="subtitle">实用工具与小功能集合</text>
    </view>
    
    <!-- 舞萌工具 -->
    <view class="tool-section">
      <view class="section-header">
        <text class="section-title">实用网站</text>
        <text class="section-desc">舞萌DX相关数据查询网站</text>
      </view>
      
      <view class="tool-grid">
        <view class="tool-card" @click="navigateToWebview('https://www.diving-fish.com/maimaidx/prober/','水鱼查分器')">
          <view class="tool-icon">🐟︎</view>
          <view class="tool-name">水鱼查分器</view>
          <view class="tool-desc">这是本APP接口的本家QwQ</view>
        </view>
        
        <view class="tool-card" @click="navigateToWebview('https://dxrating.net/search','DXRating')">
          <view class="tool-icon">🌐</view>
          <view class="tool-name">DXRating.net</view>
          <view class="tool-desc">包含ZXZR曲目信息的查询网站</view>
        </view>
        
        <view class="tool-card" @click="navigateTo('/pages/webview/webview')">
          <view class="tool-icon">✨</view>
          <view class="tool-name">音游地图</view>
          <view class="tool-desc">查查你地区的机台</view>
        </view>
      </view>
    </view>
    
    <!-- 数据工具 -->
    <view class="tool-section">
      <view class="section-header">
        <text class="section-title">数据工具</text>
        <text class="section-desc">数据查询与分析工具</text>
      </view>
      
      <view class="tool-grid">
        <view class="tool-card" @click="navigateTo('/pages/rank-calculator/rank-calculator')">
          <view class="tool-icon">🎯</view>
          <view class="tool-name">单曲Rating计算</view>
          <view class="tool-desc">根据定数及达成率算出Rating</view>
        </view>
       <view class="tool-card" @click="navigateTo('/pages/test1/index')">
         <view class="tool-icon">🔢</view>
         <view class="tool-name">达成率计算</view>
         <view class="tool-desc">根据Notes算出达成率</view>
       </view>
		<view class="tool-card" @click="navigateTo('/pages/version-map/version-map')">
		  <view class="tool-icon">📊</view>
		  <view class="tool-name">版本名称对照表</view>
		  <view class="tool-desc">妈妈再也不担心我分不清版本啦</view>
		</view>
    <view class="tool-card" @click="navigateTo('/pages/chart-stats/chart-stats')">
          <view class="tool-icon">🔥</view>
          <view class="tool-name">热门乐曲排行</view>
          <view class="tool-desc">震惊!最火爆的谱面竟然是...</view>
        </view>
 <!--       <view class="tool-card" @click="navigateTo('/pages/PlayerRecords/PlayerRecords')">
          <view class="tool-icon">🏆</view>
          <view class="tool-name">成绩查询</view>
          <view class="tool-desc">查看游玩成绩记录</view>
        </view> -->
        
 <!--       <view class="tool-card" @click="navigateTo('/pages/maiupdate/maib50')">
          <view class="tool-icon">📈</view>
          <view class="tool-name">B50查询</view>
          <view class="tool-desc">查看B50成绩数据</view>
        </view> -->
      </view>
    </view>
    
    <!-- 实用工具 -->
<!--    <view class="tool-section">
      <view class="section-header">
        <text class="section-title">实用工具</text>
        <text class="section-desc">其他实用功能</text>
      </view>
      
      <view class="tool-grid">
        <view class="tool-card" @click="navigateTo('/pages/song-search/song-search')">
          <view class="tool-icon">🔍</view>
          <view class="tool-name">乐曲搜索</view>
          <view class="tool-desc">搜索舞萌曲库歌曲</view>
        </view>
        
        <view class="tool-card" @click="navigateToWebview('https://map.bemanicn.com/', '水鱼网站')">
          <view class="tool-icon">🌐</view>
          <view class="tool-name">水鱼网站</view>
          <view class="tool-desc">访问水鱼官网</view>
        </view>
        
        <view class="tool-card" @click="navigateTo('/pages/maiupdate/maiupdate')">
          <view class="tool-icon">🔄</view>
          <view class="tool-name">数据更新</view>
          <view class="tool-desc">更新游戏数据</view>
        </view>
      </view>
    </view> -->
    
   
  </view>
</template>

<script setup>
import { ref, onMounted,inject,onBeforeMount} from 'vue';
import { updateNativeTabBar } from '@/utils/updateNativeTabBar.js';
// 注入主题服务
const applyTheme = inject('applyTheme');
const isDarkMode = inject('isDarkMode');
onBeforeMount(() => {
  updateNativeTabBar(isDarkMode.value);
  applyTheme();
});
// 导航函数
const navigateTo = (url) => {
  uni.navigateTo({
    url: url,
    animationType: 'pop-in',
    animationDuration: 300
  });
};

// 添加专门跳转到 webview 的函数
const navigateToWebview = (targetUrl, title) => {
  // 对 URL 和标题进行编码，避免特殊字符问题
  const encodedUrl = encodeURIComponent(targetUrl);
  const encodedTitle = encodeURIComponent(title || '网页浏览');
  
  uni.navigateTo({
    url: `/pages/webview/webview?url=${encodedUrl}&title=${encodedTitle}`,
    animationType: 'pop-in',
    animationDuration: 300
  });
};

onMounted(() => {
  // 页面加载时的初始化逻辑

});
</script>

<style lang="scss" scoped>
@import './dark-toolbox.scss';
.toolbox-container {
  padding: 30rpx;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header {
  margin-bottom: 40rpx;
  
  .title {
    font-size: 44rpx;
    font-weight: 700;
    color: #1e293b;
    display: block;
    margin-bottom: 10rpx;
  }
  
  .subtitle {
    font-size: 28rpx;
    color: #64748b;
  }
}

.tool-section {
  margin-bottom: 50rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  
  .section-header {
    margin-bottom: 30rpx;
    border-bottom: 2rpx solid #f1f5f9;
    padding-bottom: 20rpx;
    
    .section-title {
      font-size: 34rpx;
      font-weight: 600;
      color: #334155;
      display: block;
      margin-bottom: 8rpx;
    }
    
    .section-desc {
      font-size: 24rpx;
      color: #94a3b8;
    }
  }
  
  .tool-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    
    .tool-card {
      flex: 1;
      min-width: calc(33.333% - 14rpx);
      background: #f8fafc;
      border-radius: 16rpx;
      padding: 24rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.97);
        background: #f1f5f9;
      }
      
      .tool-icon {
        font-size: 48rpx;
        margin-bottom: 16rpx;
      }
      
      .tool-name {
        font-size: 28rpx;
        font-weight: 600;
        color: #334155;
        margin-bottom: 8rpx;
        text-align: center;
      }
      
      .tool-desc {
        font-size: 22rpx;
        color: #64748b;
        text-align: center;
      }
    }
  }
}

@media screen and (max-width: 768rpx) {
  .tool-grid {
    .tool-card {
      min-width: calc(50% - 10rpx);
    }
  }
}
</style> 