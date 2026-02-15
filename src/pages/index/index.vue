<template>
  <view class="home-page">
    <!-- 顶部导航栏 -->
    <NavBar />

    <!-- 分类筛选 -->
    <view class="category-section">
      <scroll-view scroll-x class="category-filter" show-scrollbar="false">
        <view :class="['filter-btn', { active: selectedCategory === null }]" @click="selectCategory(null)">
          全部
        </view>
        <view v-for="cat in categories" :key="cat.id" :class="['filter-btn', { active: selectedCategory === cat.id }]"
          @click="selectCategory(cat.id)">
          {{ cat.icon }} {{ cat.name }}
        </view>
      </scroll-view>
    </view>

    <!-- 瀑布流笔记列表 -->
    <scroll-view scroll-y class="content-area" @scrolltolower="loadMore" :refresher-enabled="true"
      :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
      <Waterfall :notes="filteredNotes" @note-click="handleNoteClick" />

      <!-- 加载更多 -->
      <view v-if="loading" class="loading-more">
        <view class="loading-spinner"></view>
        <text>加载中...</text>
      </view>

      <!-- 没有更多了 -->
      <view v-if="!hasMore && notes.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view v-if="notes.length === 0 && !loading" class="empty-state">
        <text class="empty-title">暂无笔记</text>
        <text class="empty-desc">去发布你的第一篇学习笔记吧</text>
      </view>
    </scroll-view>

    <!-- 返回顶部按钮 -->
    <view v-if="showBackToTop" class="back-to-top" @click="scrollToTop">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </view>

    <!-- 底部导航 -->
    <TabBar :current="0" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useNoteStore } from '@/stores/note'
import NavBar from '@/components/NavBar.vue'
import TabBar from '@/components/TabBar.vue'
import Waterfall from '@/components/Waterfall.vue'
import type { Note } from '@/types/api.types'

const noteStore = useNoteStore()

// 响应式数据
const refreshing = ref(false)
const showBackToTop = ref(false)

// 从 store 获取数据
const notes = computed(() => noteStore.notes)
const filteredNotes = computed(() => noteStore.filteredNotes)
const categories = computed(() => noteStore.categories)
const loading = computed(() => noteStore.loading)
const hasMore = computed(() => noteStore.hasMore)
const selectedCategory = computed(() => noteStore.selectedCategory)

// 选择分类
const selectCategory = (id: number | null) => {
  noteStore.selectCategory(id)
}

// 加载更多
const loadMore = () => {
  if (!loading.value && hasMore.value) {
    noteStore.fetchNotes()
  }
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  await noteStore.fetchNotes(true)
  refreshing.value = false
}

// 笔记点击
const handleNoteClick = (note: Note) => {
  uni.navigateTo({
    url: `/pages/note/detail?id=${note.id}`
  })
}

// 返回顶部
const scrollToTop = () => {
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300
  })
}

// 生命周期
onMounted(() => {
  noteStore.fetchNotes(true)

  // 监听笔记更新事件
  uni.$on('notes-updated', () => {
    console.log('收到笔记更新事件，刷新列表')
    noteStore.fetchNotes(true)
  })
})

// 每次显示页面时检查是否需要刷新
onShow(() => {
  // 检查是否有刷新标记
  const needRefresh = uni.getStorageSync('need_refresh_notes')
  if (needRefresh) {
    console.log('检测到刷新标记，刷新笔记列表')
    noteStore.fetchNotes(true)
    uni.removeStorageSync('need_refresh_notes')
  }
})
</script>

<style>
@import '@/styles/theme.css';

.home-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-top: 112px;
  padding-bottom: calc(48px + env(safe-area-inset-bottom));
}

.category-section {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  z-index: 99;
}

.category-filter {
  white-space: nowrap;
  padding: 12px 16px;
}

.filter-btn {
  display: inline-block;
  padding: 8px 16px;
  margin-right: 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}

.filter-btn.active {
  background: var(--accent-warm);
  color: white;
  border-color: var(--accent-warm);
}

.content-area {
  height: calc(100vh - 160px - env(safe-area-inset-bottom));
  padding-top: 10px;
  padding-bottom: 20px;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 8px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-light);
  border-top-color: var(--accent-warm);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.no-more {
  text-align: center;
  padding: 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.back-to-top {
  position: fixed;
  bottom: 84px;
  right: 20px;
  width: 44px;
  height: 44px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-medium);
  z-index: 98;
}

.back-to-top svg {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
}
</style>
