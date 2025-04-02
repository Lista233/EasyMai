import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  // 从本地存储获取初始主题，默认为亮色模式
  const isDarkMode = ref(uni.getStorageSync('isDarkMode') === 'true' ? true : false)
  
  // 切换主题模式
  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
    // 保存到本地存储
    uni.setStorageSync('isDarkMode', isDarkMode.value.toString())
    // 应用主题
    applyTheme()
  }
  
  // 应用主题到页面
  function applyTheme() {
    // 设置系统状态栏颜色
    if (isDarkMode.value) {
      uni.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#1c1c1e'
      })
    } else {
      uni.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#f8f8f8'
      })
    }
    
    // 可以在这里添加其他全局主题应用逻辑
  }
  
  // 初始化主题
  function initTheme() {
    applyTheme()
  }
  
  return { isDarkMode, toggleDarkMode, initTheme }
}) 