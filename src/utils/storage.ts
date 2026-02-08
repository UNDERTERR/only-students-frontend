// 本地存储封装
export const storage = {
  // 设置
  set: (key: string, value: any): void => {
    try {
      uni.setStorageSync(key, value)
    } catch (e) {
      console.error('Storage set error:', e)
    }
  },
  
  // 获取
  get: <T>(key: string, defaultValue?: T): T | undefined => {
    try {
      return uni.getStorageSync(key) ?? defaultValue
    } catch (e) {
      console.error('Storage get error:', e)
      return defaultValue
    }
  },
  
  // 删除
  remove: (key: string): void => {
    try {
      uni.removeStorageSync(key)
    } catch (e) {
      console.error('Storage remove error:', e)
    }
  }
}

// 缓存封装（带过期时间）
export const cache = {
  set: (key: string, value: any, expireMinutes: number = 60): void => {
    const data = {
      value,
      expire: Date.now() + expireMinutes * 60 * 1000
    }
    storage.set(key, data)
  },
  
  get: <T>(key: string): T | null => {
    const data = storage.get<{ value: T; expire: number }>(key)
    if (!data) return null
    if (Date.now() > data.expire) {
      storage.remove(key)
      return null
    }
    return data.value
  },
  
  remove: (key: string): void => {
    storage.remove(key)
  }
}
