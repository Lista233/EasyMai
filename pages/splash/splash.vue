<template>
  <view class="splash">
    <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
    <view class="loading">{{ loadingText }}</view>
    
    <UpdateChecker
      ref="updateCheckerRef"
      :current-version="appVersion"
      :auto-check="false"
      @update="handleUpdate"
      @skip="handleSkip"
      @ignore="handleIgnore"
      @error="handleError"
      @api-refreshed="handleApiRefreshed"
    />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import UpdateChecker from '@/components/UpdateChecker.vue'
import {version} from '@/apiconfig.js'
import { getVersion } from '@/api/myapi.js'
import { refreshAllBaseData } from '@/api/maiapi.js' // 导入刷新API的函数

const appVersion = ref('1.0.0') 
appVersion.value = version; // 替换为您的实际版本号
const updateCheckerRef = ref(null)
const updateCheckCompleted = ref(false) // 添加标志，表示更新检查是否完成
const loadingText = ref('初始化中...') // 添加加载文本，用于显示当前状态

// 处理更新
const handleUpdate = (updateInfo) => {
  console.log('用户选择更新', updateInfo)
  // 组件内部已处理跳转逻辑
  updateCheckCompleted.value = true // 标记更新检查已完成
}

// 处理跳过更新
const handleSkip = () => {
  console.log('用户选择跳过更新')
  updateCheckCompleted.value = true // 标记更新检查已完成
  navigateToMain()
}

// 处理忽略此版本
const handleIgnore = (updateInfo) => {
  console.log('用户选择忽略此版本', updateInfo)
  // 保存忽略的版本号到本地存储
  if (updateInfo && updateInfo.version) {
    uni.setStorageSync('ignored_version', updateInfo.version)
  }
  updateCheckCompleted.value = true // 标记更新检查已完成
  navigateToMain()
}

// 处理错误
const handleError = (error) => {
  console.error('更新检查失败:', error)
  updateCheckCompleted.value = true // 标记更新检查已完成
  navigateToMain()
}

// 处理API刷新完成
const handleApiRefreshed = (data) => {
  console.log('API已刷新:', data)
  loadingText.value = '数据更新完成，正在检查应用更新...'
  // 继续检查应用版本更新
  checkAppUpdate()
}

// 跳转到主页
const navigateToMain = () => {
  // 只有在更新检查完成后才跳转
  if (updateCheckCompleted.value) {
    uni.reLaunch({
      url: '/pages/user-center/user-center'
    })
  }
}

// 检查是否为首次启动
const isFirstLaunch = () => {
  // 检查是否有初始化标记
  const hasInitialized = uni.getStorageSync('hasInitialized')
  if (!hasInitialized) {
    // 首次启动，设置初始化标记
    uni.setStorageSync('hasInitialized', 'true')
    return true
  }
  return false
}

// 检查API是否需要更新
const checkApiUpdate = async () => {
  try {
    loadingText.value = '检查数据更新...'
    
    // 获取服务器版本信息
    const response = await getVersion()
    
    if (response.statusCode !== 200 || !response.data) {
      // 请求失败或数据格式错误，直接检查应用更新
      console.error('获取服务器版本信息失败，跳过API更新检查')
      loadingText.value = '正在检查应用更新...'
      checkAppUpdate()
      return
    }
    
    // 检查API版本
    if (response.data.api_version) {
      // 获取本地存储的API版本
      const localApiVersion = uni.getStorageSync('api_version') || ''
      const firstLaunch = isFirstLaunch()
      
      // 如果是首次启动，直接设置API版本而不重新初始化数据
      if (firstLaunch) {
        console.log('首次启动，App.vue已初始化数据，直接设置API版本')
        uni.setStorageSync('api_version', response.data.api_version)
        loadingText.value = '正在检查应用更新...'
        checkAppUpdate()
        return
      }
      
      // 如果API版本不一致，需要刷新API数据
      if (localApiVersion !== response.data.api_version) {
        console.log('API版本不一致，正在刷新API数据...')
        console.log('本地版本:', localApiVersion)
        console.log('服务器版本:', response.data.api_version)
        
        loadingText.value = '正在更新数据...'
        
        try {
          // 刷新API数据
          await refreshAllBaseData()
          
          // 更新本地存储的API版本
          uni.setStorageSync('api_version', response.data.api_version)
          
          loadingText.value = '数据更新完成，正在检查应用更新...'
          console.log('API数据刷新成功')
          
          // 继续检查应用版本更新
          checkAppUpdate()
        } catch (refreshError) {
          console.error('刷新API数据失败:', refreshError)
          loadingText.value = '数据更新失败，正在检查应用更新...'
          // 即使API更新失败，也继续检查应用版本更新
          checkAppUpdate()
        }
      } else {
        console.log('API版本一致，无需更新')
        loadingText.value = '正在检查应用更新...'
        // API版本一致，直接检查应用版本更新
        checkAppUpdate()
      }
    } else {
      console.log('服务器未返回API版本信息，跳过API更新检查')
      loadingText.value = '正在检查应用更新...'
      // 没有API版本信息，直接检查应用版本更新
      checkAppUpdate()
    }
  } catch (error) {
    console.error('检查API更新失败:', error)
    loadingText.value = '检查数据更新失败，正在检查应用更新...'
    // 出错时直接检查应用版本更新
    checkAppUpdate()
  }
}

// 检查应用版本是否需要更新
const checkAppUpdate = async () => {
  try {
    // 获取服务器版本信息
    const response = await getVersion()
    
    if (response.statusCode !== 200 || !response.data || !response.data.version) {
      // 请求失败或数据格式错误，直接进入主页
      console.error('获取服务器版本信息失败，跳过应用更新检查')
      updateCheckCompleted.value = true
      navigateToMain()
      return
    }
    
    const serverVersion = response.data.version
    // 获取本地存储的忽略版本
    const ignoredVersion = uni.getStorageSync('ignored_version') || ''
    
    // 如果用户已忽略此版本，直接进入主页
    if (ignoredVersion === serverVersion) {
      console.log('用户已忽略此版本，跳过更新检查')
      updateCheckCompleted.value = true
      navigateToMain()
      return
    }
    
    // 确保更新检查器组件已初始化
    if (!updateCheckerRef.value) {
      console.error('更新检查器组件未初始化')
      updateCheckCompleted.value = true
      navigateToMain()
      return
    }
    
    // 调用组件的 checkUpdate 方法，传入 forceCheck 参数为 true
    const hasUpdate = await updateCheckerRef.value.checkUpdate(true)
    
    // 如果没有更新，直接进入主页
    if (!hasUpdate) {
      updateCheckCompleted.value = true
      navigateToMain()
    }
    // 如果有更新，等待用户操作（通过事件回调处理）
  } catch (error) {
    console.error('检查应用更新失败:', error)
    updateCheckCompleted.value = true
    navigateToMain()
  }
}

onMounted(() => {
  console.log('Splash page mounted')
  console.log('当前应用版本:', appVersion.value);
  setTimeout(() => {
    checkApiUpdate();
  }, 500); // 给组件一些时间初始化

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
    text-align: center;
    padding: 0 40rpx;
  }
}
</style> 