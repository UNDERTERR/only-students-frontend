import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '@/api/user'
import type { UserInfo, LoginRequest, RegisterRequest, LoginResponse } from '@/types/api.types'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>('')
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)

  // 初始化用户状态
  const initUser = () => {
    const storedToken = uni.getStorageSync('token')
    const storedUserInfo = uni.getStorageSync('userInfo')

    if (storedToken && storedUserInfo) {
      token.value = storedToken
      userInfo.value = storedUserInfo

      // 验证token是否有效
      validateToken()
    }
  }

  // 验证token
  const validateToken = async () => {
    try {
      const user = await userApi.getCurrentUser()
      userInfo.value = user
    } catch (error) {
      // token失效，清除登录状态
      logout()
    }
  }

  // 登录
  const login = async (loginData: LoginRequest) => {
    try {
      // 获取设备信息
      const systemInfo = uni.getSystemInfoSync()
      const deviceId = uni.getStorageSync('deviceId') || generateDeviceId()

      const response = await userApi.login({
        ...loginData,
        deviceId,
        deviceType: getDeviceType(systemInfo.platform),
        deviceName: `${systemInfo.brand} ${systemInfo.model}`,
        ip: '' // 后端会自动获取
      })

      // 保存登录信息
      userApi.saveLoginInfo(response)
      token.value = response.token
      userInfo.value = response.userInfo

      return { success: true, data: response }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '登录失败'
      }
    }
  }

  // 注册
  const register = async (registerData: RegisterRequest) => {
    try {
      const user = await userApi.register(registerData)
      return { success: true, data: user }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '注册失败'
      }
    }
  }

  // 登出
  const logout = async () => {
    try {
      await userApi.logout()
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      userApi.clearLoginInfo()
      token.value = ''
      userInfo.value = null
    }
  }

  // 更新用户信息
  const updateUserInfo = async () => {
    try {
      const user = await userApi.getCurrentUser()
      userInfo.value = user
      uni.setStorageSync('userInfo', user)
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  // 获取设备类型
  const getDeviceType = (platform: string): number => {
    const map: Record<string, number> = {
      'android': 1,
      'ios': 2,
      'windows': 3,
      'mac': 4,
      'linux': 5
    }
    return map[platform.toLowerCase()] || 0
  }

  // 生成设备ID
  const generateDeviceId = (): string => {
    const deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    uni.setStorageSync('deviceId', deviceId)
    return deviceId
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    initUser,
    login,
    register,
    logout,
    updateUserInfo
  }
})
