// API 基础配置
export const API_BASE_URL = 'http://localhost:8080/api'

// 请求头常量
export const HEADERS = {
  USER_ID: 'X-User-Id',
  TOKEN: 'Authorization',
  CONTENT_TYPE: 'Content-Type'
}

// 笔记分类
export const NOTE_CATEGORIES = [
  { id: 1, name: '数学', icon: '📐' },
  { id: 2, name: '物理', icon: '⚛️' },
  { id: 3, name: '化学', icon: '⚗️' },
  { id: 4, name: '英语', icon: '🔤' },
  { id: 5, name: '语文', icon: '📚' },
  { id: 6, name: '编程', icon: '💻' },
  { id: 7, name: '考研', icon: '🎓' },
  { id: 8, name: '高考', icon: '📝' },
  { id: 9, name: '其他', icon: '📖' }
]

// 笔记可见性
export enum NoteVisibility {
  PUBLIC = 0,      // 公开
  SUBSCRIBERS = 1, // 订阅者可见
  PAID = 2         // 付费可见
}

// 笔记状态
export enum NoteStatus {
  DRAFT = 0,    // 草稿
  PUBLISHED = 1 // 已发布
}
