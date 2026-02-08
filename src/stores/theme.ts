import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 主题状态
  const isDark = ref(false)
  
  // 初始化时读取本地存储
  const initTheme = () => {
    const savedTheme = uni.getStorageSync('theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // 根据系统偏好
      isDark.value = uni.getSystemInfoSync().theme === 'dark'
    }
    applyTheme()
  }
  
  // 应用主题
  const applyTheme = () => {
    const theme = isDark.value ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    uni.setStorageSync('theme', theme)
  }
  
  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
  }
  
  // 设置为白天模式
  const setLight = () => {
    isDark.value = false
    applyTheme()
  }
  
  // 设置为夜间模式
  const setDark = () => {
    isDark.value = true
    applyTheme()
  }
  
  // 当前主题文本
  const themeText = computed(() => isDark.value ? '夜间' : '白天')
  
  return {
    isDark,
    themeText,
    initTheme,
    toggleTheme,
    setLight,
    setDark
  }
})
