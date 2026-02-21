<template>
  <view class="follower-notifiers-page">
    <!-- 导航栏 -->
    <view class="page-nav">
      <view class="back-btn" @click="goBack">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </view>
      <text class="nav-title">新增粉丝</text>
      <view class="nav-right"></view>
    </view>

    <!-- 粉丝列表 -->
    <scroll-view scroll-y class="follower-list" @scrolltolower="loadMore">
      <!-- 加载状态 -->
      <view v-if="loading && followers.length === 0" class="loading-state">
        <view class="spinner"></view>
        <text>加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!loading && followers.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="8.5" cy="7" r="4"/>
          <line x1="20" y1="8" x2="20" y2="14"/>
          <line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
        <text class="empty-text">暂无新粉丝</text>
      </view>

      <!-- 粉丝列表 -->
      <view v-else class="follower-items">
        <view
          v-for="follower in followers"
          :key="follower.id"
          class="follower-item"
          :class="{ unread: !follower.isRead }"
          @click="handleFollowerClick(follower)"
        >
          <!-- 头像 -->
          <image 
            :src="follower.subscriberAvatar || '/static/default-avatar.svg'" 
            class="follower-avatar" 
            mode="aspectFill"
          />
          
          <!-- 内容 -->
          <view class="follower-content">
            <view class="follower-header">
              <text class="follower-name">{{ follower.subscriberNickname || follower.subscriberUsername || '用户' }}</text>
              <text class="follower-time">{{ formatTime(follower.createdAt) }}</text>
            </view>
            <view class="follower-action">
              <text class="action-text">关注了我</text>
            </view>
          </view>
          
          <!-- 未读红点 -->
          <view v-if="!follower.isRead" class="unread-dot"></view>
        </view>

        <!-- 加载更多 -->
        <view v-if="hasMore" class="load-more">
          <text>{{ loading ? '加载中...' : '上拉加载更多' }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { subscriptionApi } from '@/api/message'

const canBack = ref(false)

onShow(() => {
  const pages = getCurrentPages()
  canBack.value = pages.length > 1
})

const goBack = () => {
  if (canBack.value) {
    uni.navigateBack()
  } else {
    uni.reLaunch({ url: '/pages/index/index' })
  }
}

const followers = ref<Follower[]>([])
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = 20

const formatTime = (timeStr: string): string => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const fetchFollowers = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    const data = await subscriptionApi.getMySubscribers()
    if (data && data.length > 0) {
      followers.value = data.map(f => ({
        ...f,
        isRead: f.isRead || 0
      }))
      hasMore.value = data.length === pageSize
    } else {
      hasMore.value = false
    }
  } catch (error) {
    console.error('获取粉丝记录失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!loading.value && hasMore.value) {
    currentPage.value++
    fetchFollowers()
  }
}

const handleFollowerClick = async (follower: Follower) => {
  if (!follower.isRead || follower.isRead === 0) {
    try {
      await subscriptionApi.markFollowerAsRead(follower.id)
      follower.isRead = 1
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }
  
  uni.navigateTo({ 
    url: `/pages/user/profile?id=${follower.subscriberId}` 
  })
}

onMounted(() => {
  fetchFollowers()
})
</script>

<style scoped>
.follower-notifiers-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-top: 50px;
}

.page-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-light);
  z-index: 100;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  background: var(--bg-secondary);
  border-radius: 50%;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.nav-right {
  width: 36px;
}

.follower-list {
  height: calc(100vh - 50px);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-tertiary);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-light);
  border-top-color: var(--accent-warm);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state svg {
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
}

.follower-items {
  padding: 0;
}

.follower-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.follower-item:active {
  background: var(--bg-secondary);
}

.follower-item.unread {
  background: var(--bg-card);
}

.follower-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-right: 12px;
}

.follower-content {
  flex: 1;
  min-width: 0;
}

.follower-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.follower-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.follower-time {
  font-size: 11px;
  color: var(--text-tertiary);
}

.follower-action {
  margin-bottom: 2px;
}

.action-text {
  font-size: 12px;
  color: var(--text-tertiary);
}

.follower-item.unread .follower-name {
  font-weight: 700;
}

.unread-dot {
  position: absolute;
  top: 18px;
  right: 16px;
  width: 8px;
  height: 8px;
  background: #FF3B30;
  border-radius: 50%;
}

.load-more {
  text-align: center;
  padding: 16px;
  color: var(--text-tertiary);
  font-size: 13px;
}
</style>
