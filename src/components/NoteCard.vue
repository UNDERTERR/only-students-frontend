<template>
  <view class="note-card" @click="$emit('click')">
    <!-- 封面图 -->
    <view class="note-cover">
      <image
        v-if="note.coverImage"
        :src="note.coverImage"
        mode="widthFix"
        lazy-load
        class="cover-image"
      />
      <!-- 默认封面占位图 -->
      <view v-else class="default-cover">
        <view class="default-cover-content">
          <text class="default-cover-icon">📝</text>
          <text class="default-cover-text">学习笔记</text>
        </view>
      </view>

      <!-- 分类标签 -->
      <view class="category-tag">{{ note.categoryName }}</view>

      <!-- 价格标签 -->
      <view :class="['price-tag', { free: note.isFree }]">
        <text v-if="note.isFree">免费</text>
        <text v-else>¥{{ note.price }}</text>
      </view>
    </view>

    <!-- 内容区 -->
    <view class="note-content">
      <text class="note-title">{{ note.title }}</text>
      <text v-if="note.summary" class="note-summary">{{ note.summary }}</text>

      <!-- 底部信息 -->
      <view class="note-meta">
        <view class="note-author">
          <image
            v-if="note.authorAvatar"
            :src="note.authorAvatar"
            class="author-avatar"
            mode="aspectFill"
          />
          <text class="author-name">{{ note.authorName }}</text>
        </view>

        <view class="note-stats">
          <view class="stat-item">
            <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <text>{{ formatNumber(note.viewCount) }}</text>
          </view>

          <view class="stat-item">
            <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <text>{{ formatNumber(note.likeCount) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Note } from '@/stores/note'

interface Props {
  note: Note
}

defineProps<Props>()
defineEmits<{
  (e: 'click'): void
}>()

// 格式化数字（超过1000显示为1k）
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
</script>

<style scoped>
.note-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  transition: all var(--transition-medium);
}

.note-card:active {
  transform: scale(0.98);
}

.note-cover {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: auto;
  display: block;
}

.default-cover {
  width: 100%;
  aspect-ratio: 3/4;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--border-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.default-cover-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.default-cover-icon {
  font-size: 48px;
  opacity: 0.6;
}

.default-cover-text {
  font-size: 13px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.note-content {
  padding: 12px;
}

.note-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.5;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-summary {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid var(--border-light);
}

.note-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-size: 12px;
  color: var(--text-secondary);
}

.note-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-tertiary);
}

.stat-icon {
  width: 14px;
  height: 14px;
}

.price-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: #FFD700;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
}

.price-tag.free {
  background: var(--accent-olive);
  color: white;
}

.category-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: var(--accent-warm);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
}
</style>
