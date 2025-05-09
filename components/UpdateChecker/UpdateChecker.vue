<template>
  <view class="update-checker">
    <!-- 强制更新弹窗 -->
    <uni-popup 
      ref="forceUpdatePopup"
      type="center" 
      :mask-click="false"
      background-color="rgba(0, 0, 0, 0.5)"
    >
      <view class="update-popup">
        <view class="update-header">
          <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
          <view class="update-title">发现新版本</view>
          <view class="update-version">v{{ updateInfo.version }}</view>
        </view>
        <scroll-view scroll-y class="update-content">
          <text>{{ updateInfo.description }}</text>
        </scroll-view>
        <view class="update-buttons force-buttons">
          <!-- <button class="exit-button" @click="handleExit">退出应用</button> -->
          <button class="update-button" @click="handleUpdate">立即更新</button>
        </view>
      </view>
    </uni-popup>
    
    <!-- 可选更新弹窗 -->
    <uni-popup 
      ref="optionalUpdatePopup"
      type="center"
      background-color="rgba(0, 0, 0, 0.5)"
    >
      <view class="update-popup">
        <view class="update-header">
          <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
          <view class="update-title">发现新版本</view>
          <view class="update-version">v{{ updateInfo.version }}</view>
        </view>
        <scroll-view scroll-y class="update-content">
          <text>{{ updateInfo.description }}</text>
        </scroll-view>
        <view class="update-buttons optional-buttons">
          <button class="skip-button" @click="handleSkip">暂不更新</button>
          <button class="update-button" @click="handleUpdate">立即更新</button>
        </view>
        <view class="ignore-text-container">
          <text class="ignore-text" @click="handleIgnore">忽略此版本</text>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getVersion } from '@/api/myapi.js'
import { refreshAllBaseData } from '@/api/maiapi.js' // 导入刷新API的函数
// 导入 uni-popup 组件
import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'

// 定义组件属性
const props = defineProps({
  // 当前应用版本号
  currentVersion: {
    type: String,
    required: true
  },
  // 是否自动检查更新
  autoCheck: {
    type: Boolean,
    default: true
  }
});

// 定义组件事件
const emit = defineEmits(['update', 'skip', 'ignore', 'error', 'api-refreshed']);

// 更新信息
const updateInfo = ref({
  version: '',
  description: '',
  force_update: false,
  download_url: '',
  api_version: '' // 添加API版本字段
});
let data;
// 弹窗引用
const forceUpdatePopup = ref(null);
const optionalUpdatePopup = ref(null);

// 检查更新
const checkUpdate = async (forceCheck = false) => {
  try {
    // 显示加载提示
    uni.showLoading({
      title: '检查更新中...'
    });
    
    // 请求更新信息
    const response = await getVersion()
   
    // 隐藏加载提示
    uni.hideLoading();
    
    // 检查请求是否成功
    if (response.statusCode !== 200) {
      throw new Error('获取更新信息失败');
    }
    
    data = response.data;
    
    // 检查返回数据格式
    if (!data || !data.version) {
      throw new Error('更新信息格式错误');
    }
    
    // 检查API版本
    if (data.api_version) {
      // 获取本地存储的API版本
      const localApiVersion = uni.getStorageSync('api_version') || '';
      
      // 如果API版本不一致，需要刷新API数据
      if (localApiVersion !== data.api_version) {
        console.log('API版本不一致，正在刷新API数据...');
        console.log('本地版本:', localApiVersion);
        console.log('服务器版本:', data.api_version);
        
        try {
          // 刷新API数据
          await refreshAllBaseData();
          
          // 更新本地存储的API版本
          uni.setStorageSync('api_version', data.api_version);
          
          // 触发API刷新完成事件
          emit('api-refreshed', { oldVersion: localApiVersion, newVersion: data.api_version });
        } catch (refreshError) {
          console.error('刷新API数据失败:', refreshError);
        }
      }
    }
    
    // 比较版本号
    const versionCompare = compareVersion(data.version, props.currentVersion);
    
    // 获取忽略的版本
    const ignoredVersion = uni.getStorageSync('ignored_version') || '';
    
    // 如果是强制检查或版本号不同且不是被忽略的版本，则显示更新弹窗
    if (versionCompare != 0 && (forceCheck || data.version !== ignoredVersion)) {
      // 保存完整的更新信息，包括 download_url 和 api_version
      updateInfo.value = data;
      
      // 根据是否强制更新显示不同弹窗
      if (data.force_update) {
        forceUpdatePopup.value.open();
      } else {
        optionalUpdatePopup.value.open();
      }
      
      return true;
    } else {
      // 已是最新版本或用户已忽略此版本
      emit('skip', updateInfo.value);
      return false;
    }
  } catch (error) {
    uni.hideLoading();
    console.error('检查更新失败:', error);
    emit('error', error);
    return false;
  }
};
const showUpdateDialog = async (versionData) => {
  try {
    // 保存完整的更新信息
    updateInfo.value = versionData;
    
    // 比较版本号
    const versionCompare = compareVersion(versionData.version, props.currentVersion);
    
    // 获取忽略的版本
    const ignoredVersion = uni.getStorageSync('ignored_version') || '';
    
    // 如果有新版本且不是被忽略的版本，则显示更新弹窗
    if (versionCompare != 0 && versionData.version !== ignoredVersion) {
      // 根据是否强制更新显示不同弹窗
      if (versionData.force_update) {
        forceUpdatePopup.value.open();
      } else {
        optionalUpdatePopup.value.open();
      }
      return true;
    } else {
      // 已是最新版本或用户已忽略此版本
      emit('skip', updateInfo.value);
      return false;
    }
  } catch (error) {
    console.error('显示更新弹窗失败:', error);
    emit('error', error);
    return false;
  }
};

// 处理更新
const handleUpdate = () => {
  if (updateInfo.value.download_url) {
    // #ifdef APP-PLUS
    plus.runtime.openURL(updateInfo.value.download_url);
    // #endif
    
    // #ifdef H5
    // 在H5环境下，跳转到更新页面
    uni.navigateTo({
      url: `/pages/webview/update?url=${encodeURIComponent(updateInfo.value.download_url)}`
    });
    // #endif
  } else {
    uni.showToast({
      title: '下载链接无效',
      icon: 'none'
    });
    emit('skip', updateInfo.value);
  }
};

// 处理跳过
const handleSkip = () => {
  optionalUpdatePopup.value.close();
  emit('skip', updateInfo.value);
};

// 处理忽略此版本
const handleIgnore = () => {
  // 保存忽略的版本号到本地存储
  uni.setStorageSync('ignored_version', updateInfo.value.version);
  optionalUpdatePopup.value.close();
  emit('ignore', updateInfo.value);
};

// 添加退出应用的处理函数
const handleExit = () => {
  // #ifdef APP-PLUS
  plus.runtime.quit();
  // #endif
};

// 比较版本号
const compareVersion = (v1, v2) => {
  // 将版本号拆分为数组
  const v1Parts = v1.split('.').map(Number);
  const v2Parts = v2.split('.').map(Number);
  
  // 比较每一部分
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }
  
  return 0; // 版本相同
};

// 组件挂载时自动检查更新
onMounted(() => {
  console.log('UpdateChecker mounted', {
    forcePopup: forceUpdatePopup.value,
    optionalPopup: optionalUpdatePopup.value
  });
  
  if (props.autoCheck) {
    // 给弹窗组件一点时间初始化
    setTimeout(() => {
      checkUpdate();
    }, 100);
  }
});

// 暴露方法给父组件
defineExpose({
  checkUpdate,
  showUpdateDialog
});
</script>

<style lang="scss" scoped>
.update-popup {
  width: 600rpx;
  background-color: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  
  .update-header {
    padding: 40rpx;
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
      margin-bottom: 20rpx;
      border-radius: 20rpx;
    }
    
    .update-title {
      font-size: 36rpx;
      font-weight: bold;
      margin-bottom: 12rpx;
    }
    
    .update-version {
      font-size: 28rpx;
      opacity: 0.9;
    }
  }
  
  .update-content {
    max-height: 400rpx;
    padding: 40rpx;
    font-size: 28rpx;
    line-height: 1.6;
    color: #4b5563;
    box-sizing: border-box;
    
    text {
      display: block;
      white-space: pre-wrap;
      word-break: break-all;
      overflow-wrap: break-word;
    }
  }
  
  .update-buttons {
    padding: 30rpx 40rpx 20rpx;
    display: flex;
    justify-content: center;
    gap: 20rpx;
    border-top: 2rpx solid #e5e7eb;
    background: #fff;
    position: relative;
    
    &.optional-buttons,
    &.force-buttons {
      justify-content: space-between;
    }
    
    .update-button {
      flex: 1;
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
    
    .skip-button, .exit-button {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      background-color: #f3f4f6;
      color: #6b7280;
      border-radius: 40rpx;
      font-size: 28rpx;
      font-weight: bold;
      border: none;
      transition: all 0.3s ease;
      
      &:active {
        background-color: #e5e7eb;
      }
    }
    
    .exit-button {
      background-color: #fee2e2;
      color: #ef4444;
      
      &:active {
        background-color: #fecaca;
      }
    }
  }
  
  .ignore-text-container {
    padding: 0 0 25rpx;
    text-align: center;
    background: #fff;
    margin-top: -5rpx;
    
    .ignore-text {
      font-size: 26rpx;
      color: #9ca3af;
      text-decoration: underline;
      padding: 10rpx 20rpx;
      
      &:active {
        color: #6b7280;
      }
    }
  }
}

:deep(.uni-popup__wrapper) {
  border-radius: 24rpx;
  overflow: hidden;
}
</style> 