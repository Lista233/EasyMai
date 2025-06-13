<template>
  <view class="announcement-popup" >
    <!-- 公告弹窗 -->
    <uni-popup 
      ref="announcementPopup"
      type="center"
      background-color="rgba(0, 0, 0, 0.5)"
    >
      <view class="announcement-container" :class="{ 'dark-mode': isDarkMode }">
        <view class="announcement-header">
          <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
          <view class="announcement-title">{{ title }}</view>
        </view>
        <scroll-view scroll-y class="announcement-content">
          <text>{{ content }}</text>
		  <image
		    v-if="imageUrl" 
		    class="announcement-image" 
		    :src="imageUrl" 
		    mode="widthFix"
		    @tap="previewImage"
		  ></image>
        </scroll-view>
        <view class="announcement-footer">
          <view class="dont-show-again" @click="toggleDontShowAgain">
            <checkbox :checked="dontShowAgain" @click="toggleDontShowAgain"/>
            <text>不再提示</text>
          </view>
          <view class="announcement-buttons">
            <button class="confirm-button" @click="handleConfirm">{{ confirm || '确定' }}</button>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted ,inject} from 'vue';

const isDarkMode = inject('isDarkMode', ref(false)); // 提供默认值防止注入失败
// 定义组件属性
const props = defineProps({
  // 公告ID
  id: {
    type: String,
    required: true
  },
  // 公告标题
  title: {
    type: String,
    required: true
  },
  // 公告内容
  content: {
    type: String,
    required: true
  },
  // 图片URL
  imageUrl: {
    type: String,
    default: ''
  },
  // 确认按钮文本
  confirm: {
    type: String,
    default: '确定'
  },
  // 是否自动显示
  autoShow: {
    type: Boolean,
    default: true
  }
});

// 定义组件事件
const emit = defineEmits(['confirm', 'close']);

// 弹窗引用
const announcementPopup = ref(null);
// 是否不再提示
const dontShowAgain = ref(false);

// 预览图片
const previewImage = () => {
  if (props.imageUrl) {
    uni.previewImage({
      urls: [props.imageUrl],
      current: 0
    });
  }
};

// 显示公告
const showAnnouncement = () => {
  // 检查该公告是否已被用户选择不再显示
  const hiddenAnnouncements = uni.getStorageSync('hidden_announcements') || [];
  
  // 如果公告ID在隐藏列表中，则不显示
  if (hiddenAnnouncements.includes(props.id)) {
    return false;
  }
  
  // 显示公告弹窗
  if (announcementPopup.value) {
    announcementPopup.value.open();
    return true;
  }
  return false;
};

// 切换"不再提示"选项
const toggleDontShowAgain = () => {
  dontShowAgain.value = !dontShowAgain.value;
  console.log(dontShowAgain.value)
};

// 处理确认按钮点击
const handleConfirm = () => {
  // 如果用户选择了不再提示，则保存到本地存储
  if (dontShowAgain.value) {
    const hiddenAnnouncements = uni.getStorageSync('hidden_announcements') || [];
    
    // 如果公告ID不在隐藏列表中，添加它
    if (!hiddenAnnouncements.includes(props.id)) {
      hiddenAnnouncements.push(props.id);
      uni.setStorageSync('hidden_announcements', hiddenAnnouncements);
    }
  }
  
  // 关闭弹窗
  announcementPopup.value.close();
  
  // 触发确认事件
  emit('confirm', {
    id: props.id,
    dontShowAgain: dontShowAgain.value
  });
};

// 组件挂载时自动显示公告
onMounted(() => {
  console.log('AnnouncementPopup mounted', {
    popup: announcementPopup.value
  });
  
  if (props.autoShow) {
    // 给弹窗组件一点时间初始化
    setTimeout(() => {
      showAnnouncement();
    }, 100);
  }
});

// 暴露方法给父组件
defineExpose({
  showAnnouncement
});
</script>

<style lang="scss" scoped>

@import './dark-mode.scss';

.announcement-container {
  width: 600rpx;
  background-color: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  
  .announcement-header {
    padding: 30rpx;
    text-align: center;
    background: linear-gradient(135deg, #4F46E5, #6366F1);
    color: #fff;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -2rpx;
      height: 4rpx;
      background: inherit;
    }
    
    .logo {
      width: 160rpx;
      height: 160rpx;
      margin-bottom: 15rpx;
      border-radius: 20rpx;
    }
    
    .announcement-title {
      font-size: 36rpx;
      font-weight: bold;
      margin-bottom: 12rpx;
    }
  }
  
  .announcement-content {
    max-height: 400rpx;
    padding: 40rpx;
    font-size: 28rpx;
    line-height: 1.4;
    color: #4b5563;
    box-sizing: border-box;
    
    .announcement-image {
      margin-top: 20rpx;
      width: 45%;
      margin-bottom: 5rpx;
      border-radius: 12rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
    
    text {
      display: block;
      white-space: pre-wrap;
      word-break: break-all;
      overflow-wrap: break-word;
    }
  }
  
  .announcement-footer {
    padding: 20rpx 40rpx 30rpx;
    border-top: 2rpx solid #e5e7eb;
    background: #fff;
    margin-top: 10rpx;
    .dont-show-again {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      
      checkbox {
        transform: scale(0.8);
        margin-right: 10rpx;
      }
      
      text {
        font-size: 26rpx;
        color: #6b7280;
      }
    }
    
    .announcement-buttons {
      display: flex;
      justify-content: center;
      
      .confirm-button {
        width: 80%;
        height: 80rpx;
        line-height: 80rpx;
        text-align: center;
        background: linear-gradient(135deg, #4F46E5, #6366F1);
        color: #fff;
        border-radius: 40rpx;
        font-size: 28rpx;
        font-weight: bold;
        border: none;
        box-shadow: 0 4rpx 12rpx rgba(79, 70, 229, 0.3);
        transition: all 0.3s ease;
        
        &:active {
          transform: translateY(2rpx);
          box-shadow: 0 2rpx 6rpx rgba(79, 70, 229, 0.2);
        }
      }
    }
  }
}

:deep(.uni-popup__wrapper) {
  border-radius: 24rpx;
  overflow: hidden;
}
</style> 