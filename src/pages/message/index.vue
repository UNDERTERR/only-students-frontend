<template>
  <view class="message-page">
    <!-- 导航栏 -->
    <view class="page-nav">
      <text class="nav-title">消息</text>
    </view>
    
    <!-- 消息列表 -->
    <scroll-view scroll-y class="message-list">
      <view 
        v-for="msg in messages" 
        :key="msg.id"
        class="message-item"
        @click="goToChat(msg)"
      >
        <view class="msg-avatar-wrapper">
          <image :src="msg.avatar" class="msg-avatar" mode="aspectFill"/>
          <view v-if="msg.unread > 0" class="msg-badge">{{ msg.unread > 99 ? '99+' : msg.unread }}</view>
        </view>
        <view class="msg-content">
          <view class="msg-header">
            <text class="msg-name">{{ msg.name }}</text>
            <text class="msg-time">{{ msg.time }}</text>
          </view>
          <text class="msg-preview" :class="{ unread: msg.unread > 0 }">{{ msg.preview }}</text>
        </view>
      </view>
      
      <!-- 系统通知 -->
      <view class="section-title">系统通知</view>
      <view 
        v-for="notice in notifications" 
        :key="notice.id"
        class="notice-item"
      >
        <view class="notice-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </view>
        <view class="notice-content">
          <text class="notice-title">{{ notice.title }}</text>
          <text class="notice-desc">{{ notice.desc }}</text>
          <text class="notice-time">{{ notice.time }}</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部导航 -->
    <TabBar :current="2" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TabBar from '../../components/TabBar.vue'

const messages = ref([
  { id: '1', name: '数学小王子', avatar: 'https://picsum.photos/100/100?random=1', preview: '你好，请问那份高考数学资料还有吗？', time: '10分钟前', unread: 2 },
  { id: '2', name: '英语达人', avatar: 'https://picsum.photos/100/100?random=2', preview: '已发送雅思口语资料给你', time: '2小时前', unread: 0 },
  { id: '3', name: '考研学姐', avatar: 'https://picsum.photos/100/100?random=3', preview: '谢谢你的订阅！有问题随时问我', time: '昨天', unread: 1 },
  { id: '4', name: '编程大牛', avatar: 'https://picsum.photos/100/100?random=4', preview: 'Python课程更新了，记得查看', time: '2天前', unread: 0 }
])

const notifications = ref([
  { id: '1', title: '笔记审核通过', desc: '你发布的《高考数学压轴题技巧》已通过审核', time: '3小时前' },
  { id: '2', title: '收到新订阅', desc: '用户 @小明 订阅了你的创作者服务', time: '1天前' },
  { id: '3', title: '收益到账', desc: '本月收益 ¥128.50 已到账', time: '2天前' }
])

const goToChat = (msg: any) => {
  uni.navigateTo({
    url: `/pages/message/chat?id=${msg.id}&name=${msg.name}`
  })
}
</script>

<style scoped>
.message-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-top: 60px;
  padding-bottom: 64px;
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
  justify-content: center;
  border-bottom: 1px solid var(--border-light);
  z-index: 100;
}

.nav-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.message-list {
  height: calc(100vh - 124px);
}

.message-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
}

.msg-avatar-wrapper {
  position: relative;
  margin-right: 12px;
}

.msg-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.msg-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  background: var(--accent-coral);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

.msg-content {
  flex: 1;
  overflow: hidden;
}

.msg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.msg-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.msg-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.msg-preview {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.msg-preview.unread {
  color: var(--text-primary);
  font-weight: 500;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-tertiary);
  padding: 20px 16px 12px;
  background: var(--bg-primary);
}

.notice-item {
  display: flex;
  padding: 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
}

.notice-icon {
  width: 44px;
  height: 44px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: var(--accent-warm);
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: 4px;
}

.notice-desc {
  font-size: 13px;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 4px;
}

.notice-time {
  font-size: 11px;
  color: var(--text-tertiary);
}
</style>
