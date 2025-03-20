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
      @error="handleError"
    />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import UpdateChecker from '@/components/UpdateChecker.vue'
import {version} from '@/apiconfig.js'
const appVersion = ref('1.0.0') 
appVersion.value=version;// 替换为您的实际版本号
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

// 处理错误
const handleError = (error) => {
  console.error('更新检查失败:', error)
  
  navigateToMain()
}

// 跳转到主页
const navigateToMain = () => {
  uni.reLaunch({
    url: '/pages/index/index'
  })
}

onMounted(() => {
  console.log('Splash page mounted')
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