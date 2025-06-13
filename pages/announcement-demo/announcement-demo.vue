<template>
  <view class="container">
    <view class="title">公告组件演示</view>
    
    <view class="button-group">
      <button class="demo-button" @click="showAnnouncement1">显示公告1</button>
      <button class="demo-button" @click="showAnnouncement2">显示公告2</button>
      <button class="demo-button" @click="clearHiddenAnnouncements">清除已隐藏公告</button>
    </view>
    
    <!-- 公告组件1 -->
    <AnnouncementPopup 
      ref="announcement1" 
      id="announcement_001"
      title="系统更新公告"
      content="尊敬的用户：\n\n感谢您使用我们的应用！我们已经更新了系统，主要包含以下内容：\n\n1. 优化了用户界面\n2. 修复了已知问题\n3. 提升了整体性能\n\n如有问题，请联系客服。"
      confirm="我知道了"
      :autoShow="false"
      @confirm="onAnnouncementConfirm"
    />
    
    <!-- 公告组件2 -->
    <AnnouncementPopup 
      ref="announcement2" 
      id="announcement_002"
      title="活动预告"
      content="即将推出全新活动，敬请期待！\n\n活动时间：2024年7月1日 - 2024年7月15日\n活动内容：完成指定任务，获取丰厚奖励。\n\n更多详情请关注官方公告。"
      confirm="立即查看"
      :autoShow="false"
      @confirm="onAnnouncementConfirm"
    />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AnnouncementPopup from '@/components/AnnouncementPopup/AnnouncementPopup.vue';

// 公告组件引用
const announcement1 = ref(null);
const announcement2 = ref(null);

// 显示公告1
const showAnnouncement1 = () => {
  if (announcement1.value) {
    const isShown = announcement1.value.showAnnouncement();
    if (!isShown) {
      uni.showToast({
        title: '此公告已设置为不再提示',
        icon: 'none'
      });
    }
  }
};

// 显示公告2
const showAnnouncement2 = () => {
  if (announcement2.value) {
    const isShown = announcement2.value.showAnnouncement();
    if (!isShown) {
      uni.showToast({
        title: '此公告已设置为不再提示',
        icon: 'none'
      });
    }
  }
};

// 清除已隐藏的公告记录
const clearHiddenAnnouncements = () => {
  uni.removeStorageSync('hidden_announcements');
  uni.showToast({
    title: '已清除所有隐藏公告记录',
    icon: 'success'
  });
};

// 公告确认回调
const onAnnouncementConfirm = (data) => {
  console.log('公告确认回调:', data);
  uni.showToast({
    title: `已确认公告 ${data.id}${data.dontShowAgain ? '，并不再提示' : ''}`,
    icon: 'none'
  });
};

// 页面加载
onMounted(() => {
  // 可以在这里根据需要自动显示某个公告
  // 例如，从服务器获取公告信息后显示
});
</script>

<style lang="scss" scoped>
.container {
  padding: 40rpx;
  
  .title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 60rpx;
    text-align: center;
  }
  
  .button-group {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
    margin-bottom: 60rpx;
    
    .demo-button {
      height: 90rpx;
      line-height: 90rpx;
      background: linear-gradient(135deg, #4F46E5, #6366F1);
      color: #fff;
      border-radius: 45rpx;
      font-size: 32rpx;
      font-weight: bold;
      box-shadow: 0 4rpx 12rpx rgba(79, 70, 229, 0.3);
      transition: all 0.3s ease;
      
      &:active {
        transform: translateY(2rpx);
        box-shadow: 0 2rpx 6rpx rgba(79, 70, 229, 0.2);
      }
      
      &:last-child {
        background: linear-gradient(135deg, #F87171, #EF4444);
        box-shadow: 0 4rpx 12rpx rgba(239, 68, 68, 0.3);
        
        &:active {
          box-shadow: 0 2rpx 6rpx rgba(239, 68, 68, 0.2);
        }
      }
    }
  }
}
</style> 