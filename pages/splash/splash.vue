<template>
  <view class="splash">
    <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
    <view class="loading">检查更新中...</view>
    
    <UpdateChecker
      ref="updateCheckerRef"
      :current-version="appVersion"
      :auto-check="true"
      @update="handleUpdate"
      @skip="handleSkip"
      @ignore="handleIgnore"
      @error="handleError"
    />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import UpdateChecker from '@/components/UpdateChecker.vue'
import {version} from '@/apiconfig.js'
import { getVersion } from '@/api/myapi.js'

const appVersion = ref('1.0.0') 
appVersion.value = version; // 替换为您的实际版本号
const updateCheckerRef = ref(null)

// 处理更新
const handleUpdate = (updateInfo) => {
  console.log('用户选择更新', updateInfo)
  // 组件内部已处理跳转逻辑
}

// 处理跳过更新
const handleSkip = () => {
  console.log('用户选择跳过更新')
  navigateToMain()
}

// 处理忽略此版本
const handleIgnore = (updateInfo) => {
  console.log('用户选择忽略此版本', updateInfo)
  navigateToMain()
}

// 处理错误
const handleError = (error) => {
  console.error('更新检查失败:', error)
  navigateToMain()
}

// 跳转到主页
const navigateToMain = () => {
  uni.reLaunch({
    url: '/pages/user-center/user-center'
  })
}

// 检查是否需要显示更新弹窗
const checkShouldShowUpdate = async () => {
  try {
    // 获取服务器版本信息
    const response = await getVersion()
    
    if (response.statusCode !== 200 || !response.data || !response.data.version) {
      // 请求失败或数据格式错误，直接进入主页
      navigateToMain()
      return
    }
    
    const serverVersion = response.data.version
    const ignoredVersion = uni.getStorageSync('ignored_version') || ''
    
    // 比较版本号
    const versionCompare = compareVersion(serverVersion, appVersion.value)
    
    // 如果当前版本与服务器版本相同，或者用户已忽略此版本且版本号没有变化，直接进入主页
    if (versionCompare === 0 || (ignoredVersion === serverVersion)) {
      console.log('当前已是最新版本或用户已忽略此版本，跳过更新检查')
      navigateToMain()
    }
    // 否则，让UpdateChecker组件处理更新检查
  } catch (error) {
    console.error('预检查更新失败:', error)
    // 出错时直接进入主页
    navigateToMain()
  }
}

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

onMounted(() => {
  console.log('Splash page mounted')
  // 在组件挂载后，先检查是否需要显示更新弹窗
  // 如果不需要，直接跳转到主页
  // 如果需要，UpdateChecker组件会自动处理
  checkShouldShowUpdate()
})
</script>

<style lang="scss" scoped>
.splash {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  
  .logo {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 40rpx;
  }
  
  .loading {
    font-size: 28rpx;
    color: #666;
  }
}
</style> 