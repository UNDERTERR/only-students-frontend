<template>
  <view class="subscribers-page">
    <view class="page-nav">
      <view class="back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </view>
      <text class="nav-title">我的粉丝</text>
      <view class="nav-right"></view>
    </view>

    <scroll-view scroll-y class="content-area">
      <view v-if="loading && subscribers.length === 0" class="loading-state">
        <view class="loading-spinner"></view>
        <text>加载中...</text>
      </view>

      <view v-else-if="subscribers.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <text class="empty-title">暂无粉丝</text>
        <text class="empty-desc">发布优质内容吸引更多粉丝吧</text>
      </view>

      <view v-else class="subscribers-list">
        <view
          v-for="sub in subscribers"
          :key="sub.id"
          class="subscriber-card"
          @click="goToUser(sub.subscriberId)"
        >
          <image
            :src="sub.subscriberAvatar || '/static/default-avatar.png'"
            class="subscriber-avatar"
            mode="aspectFill"
          />
          <view class="subscriber-info">
            <text class="subscriber-name">{{ sub.subscriberName }}</text>
            <text class="subscribe-time">{{ formatTime(sub.startTime) }} 开始关注</text>
          </view>
          <view class="subscriber-action" @click.stop="sendMessage(sub)">
            <text>私信</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { subscriptionApi } from '@/api/message'

const subscribers = ref<any[]>([])
const loading = ref(false)

onMounted(() => {
  loadSubscribers()
})

const loadSubscribers = async () => {
  loading.value = true
  try {
    const res = await subscriptionApi.getMySubscribers()
    subscribers.value = res
  } catch (error) {
    console.error('加载粉丝列表失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const formatTime = (time: string): string => {
  const date = new Date(time)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

const goToUser = (userId: number) => {
  uni.navigateTo({ url: `/pages/user/profile?id=${userId}` })
}

const sendMessage = (sub: any) => {
  uni.navigateTo({
    url: `/pages/message/chat?id=${sub.subscriberId}&name=${sub.subscriberName}`
  })
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.subscribers-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.page-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-light);
  z-index: 100;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.nav-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.nav-right {
  width: 40px;
}

.content-area {
  margin-top: 60px;
  height: calc(100vh - 60px);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
  color: var(--text-tertiary);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-light);
  border-top-color: var(--accent-warm);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: var(--text-tertiary);
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.subscribers-list {
  padding: 16px;
}

.subscriber-card {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid var(--border-light);
}

.subscriber-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 12px;
  border: 2px solid var(--bg-card);
  box-shadow: 0 0 0 1px var(--border-light);
}

.subscriber-info {
  flex: 1;
}

.subscriber-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: 4px;
}

.subscribe-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.subscriber-action {
  padding: 8px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}
</style>
