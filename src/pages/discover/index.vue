<template>
  <view class="discover-page">
    <!-- 导航栏 -->
    <view class="page-nav">
      <text class="nav-title">发现</text>
    </view>

    <!-- 搜索框 -->
    <view class="search-section">
      <view class="search-box" @click="goToSearch">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type="text"
          class="search-input"
          placeholder="搜索笔记、创作者、学科..."
          v-model="searchKeyword"
          @confirm="handleSearch"
          @focus="goToSearch"
        />
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <view class="spinner"></view>
      <text>加载中...</text>
    </view>

    <!-- 内容区域 -->
    <scroll-view v-else scroll-y class="content-area" @scrolltolower="loadMoreCreators">
      <!-- 热门搜索 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">热门搜索</text>
          <text class="refresh-btn" @click="refreshHotTags">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            换一换
          </text>
        </view>
        <view class="hot-tags">
          <view
            v-for="(tag, index) in hotTags"
            :key="index"
            class="hot-tag"
            @click="searchTag(tag)"
          >
            <text class="tag-rank" :class="{ top: index < 3 }">{{ index + 1 }}</text>
            {{ tag }}
          </view>
        </view>
      </view>

      <!-- 推荐创作者 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">推荐创作者</text>
          <text class="view-all" @click="viewAllCreators">查看全部</text>
        </view>
        
        <!-- 创作者列表 -->
        <view v-if="creators.length === 0" class="empty-creators">
          <text>暂无推荐创作者</text>
        </view>
        
        <scroll-view v-else scroll-x class="creators-scroll" show-scrollbar="false">
          <view
            v-for="creator in creators"
            :key="creator.id"
            class="creator-card"
            @click="goToCreator(creator.id)"
          >
            <image 
              :src="creator.avatar || '/static/default-avatar.svg'" 
              class="creator-avatar" 
              mode="aspectFill"
            />
            <text class="creator-name">{{ creator.nickname || creator.username }}</text>
            <text class="creator-desc">{{ creator.bio || '优秀创作者' }}</text>
            <view class="creator-subscribers">
              {{ formatNumber(creator.subscriberCount || 0) }} 订阅
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 推荐笔记分类 -->
      <view class="section">
        <text class="section-title">热门学科</text>
        <view class="category-grid">
          <view
            v-for="cat in categories"
            :key="cat.id"
            class="category-item"
            @click="searchCategory(cat)"
          >
            <text class="category-icon">{{ cat.icon }}</text>
            <text class="category-name">{{ cat.name }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部导航 -->
    <TabBar :current="1" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TabBar from '@/components/TabBar.vue'
import { searchApi } from '@/api/search'
import { NOTE_CATEGORIES } from '@/config/api.config'
import type { UserInfo } from '@/types/api.types'

// 数据状态
const searchKeyword = ref('')
const hotTags = ref<string[]>([])
const creators = ref<UserInfo[]>([])
const categories = ref(NOTE_CATEGORIES)
const loading = ref(false)
const creatorPage = ref(1)
const creatorSize = 10
const hasMoreCreators = ref(true)

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 获取热门搜索关键词
const fetchHotTags = async () => {
  try {
    const data = await searchApi.getHotKeywords(10)
    hotTags.value = data || []
  } catch (error) {
    console.error('获取热门搜索失败:', error)
    // 使用默认热门标签
    hotTags.value = ['高考数学', '雅思备考', 'Python入门', '考研政治', '物理力学', '化学实验']
  }
}

// 获取推荐创作者
const fetchCreators = async (refresh = true) => {
  if (refresh) {
    creatorPage.value = 1
    creators.value = []
    hasMoreCreators.value = true
  }
  
  try {
    const result = await searchApi.searchUsers({
      keyword: '',
      isCreator: 1,  // 只搜索创作者
      page: creatorPage.value,
      size: creatorSize
    })
    
    if (result && result.list) {
      creators.value.push(...result.list)
      hasMoreCreators.value = result.list.length === creatorSize
    }
  } catch (error) {
    console.error('获取推荐创作者失败:', error)
  }
}

// 加载更多创作者
const loadMoreCreators = () => {
  if (!hasMoreCreators.value) return
  creatorPage.value++
  fetchCreators(false)
}

// 刷新热门标签
const refreshHotTags = () => {
  fetchHotTags()
}

// 跳转到搜索页面
const goToSearch = () => {
  uni.navigateTo({
    url: '/pages/search/index'
  })
}

// 搜索标签
const searchTag = (tag: string) => {
  uni.navigateTo({
    url: `/pages/search/result?keyword=${encodeURIComponent(tag)}`
  })
}

// 搜索分类
const searchCategory = (cat: { id: number; name: string }) => {
  uni.navigateTo({
    url: `/pages/search/result?category=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`
  })
}

// 处理搜索
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    uni.navigateTo({
      url: `/pages/search/result?keyword=${encodeURIComponent(searchKeyword.value)}`
    })
  }
}

// 查看全部创作者
const viewAllCreators = () => {
  uni.navigateTo({
    url: '/pages/search/creators'
  })
}

// 跳转到创作者主页
const goToCreator = (id: number) => {
  uni.navigateTo({
    url: `/pages/user/profile?id=${id}`
  })
}

// 初始化数据
const initData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchHotTags(),
      fetchCreators(true)
    ])
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  initData()
})
</script>

<style scoped>
.discover-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-top: 60px;
  padding-bottom: calc(52px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
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

.search-section {
  padding: 16px;
  flex-shrink: 0;
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: 24px;
  padding: 0 16px;
  height: 48px;
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--text-tertiary);
  margin-right: 10px;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 15px;
  color: var(--text-primary);
  background: transparent;
  border: none;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--text-secondary);
  flex: 1;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-light);
  border-top-color: var(--accent-warm);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.content-area {
  flex: 1;
  overflow-y: auto;
}

.section {
  padding: 20px 16px;
  border-bottom: 8px solid var(--bg-secondary);
}

.section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
}

.refresh-btn {
  font-size: 13px;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.view-all {
  font-size: 13px;
  color: var(--accent-warm);
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hot-tag {
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag-rank {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-tertiary);
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.tag-rank.top {
  color: white;
  background: var(--accent-coral);
}

.creators-scroll {
  white-space: nowrap;
}

.empty-creators {
  text-align: center;
  padding: 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.creator-card {
  display: inline-block;
  width: 140px;
  background: var(--bg-card);
  border-radius: 16px;
  padding: 16px;
  margin-right: 12px;
  text-align: center;
  border: 1px solid var(--border-light);
}

.creator-card:active {
  background: var(--bg-secondary);
}

.creator-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 10px;
  background: var(--bg-secondary);
}

.creator-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.creator-desc {
  font-size: 11px;
  color: var(--text-tertiary);
  display: block;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.creator-subscribers {
  font-size: 12px;
  color: var(--accent-warm);
  font-weight: 500;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.category-item {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px 8px;
  text-align: center;
  border: 1px solid var(--border-light);
}

.category-item:active {
  background: var(--bg-secondary);
}

.category-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 8px;
}

.category-name {
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
