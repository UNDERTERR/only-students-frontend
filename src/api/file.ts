import { API_BASE_URL } from '@/config/api.config'
import type { FileUploadResult } from '@/types/api.types'
// 上传文件
export const uploadFile = (filePath: string, url: string = '/file/upload'): Promise<FileUploadResult> => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    const userId = uni.getStorageSync('userId')

    console.log('缓存中的userId：', userId); // 重点看这里是不是 null/undefined/空字符串

    const header: Record<string, string> = {}

    if (token) header['Authorization'] = `Bearer ${token}`
    // if (userId)header['X-User-Id'] = userId
    //小程序自动过滤自定义头部，把userId拼到url
    const urlWithParams = `${API_BASE_URL}${url}?X-User-Id=${userId}`;

    console.log('最终请求头：', header);
    uni.uploadFile({
      url: urlWithParams,
      filePath,
      name: 'file',
      header,
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 200) {
            resolve(data.data)
          } else {
            uni.showToast({ title: data.message || '上传失败', icon: 'none' })
            reject(data)
          }
        } catch (e) {
          reject(e)
        }
      },

      fail: reject
    })
  })
}
