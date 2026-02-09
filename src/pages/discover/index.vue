<template>
  <view class="discover-page">
    <!-- 导航栏 -->
    <view class="page-nav">
      <text class="nav-title">发现</text>
    </view>

    <!-- 搜索框 -->
    <view class="search-section">
      <view class="search-box">
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
        />
      </view>
    </view>

    <!-- 热门搜索 -->
    <view class="section">
      <text class="section-title">热门搜索</text>
      <view class="hot-tags">
        <view
          v-for="(tag, index) in hotTags"
          :key="index"
          class="hot-tag"
          @click="searchTag(tag)"
        >
          {{ tag }}
        </view>
      </view>
    </view>

    <!-- 推荐创作者 -->
    <view class="section">
      <text class="section-title">推荐创作者</text>
      <scroll-view scroll-x class="creators-scroll" show-scrollbar="false">
        <view
          v-for="creator in creators"
          :key="creator.id"
          class="creator-card"
          @click="goToCreator(creator.id)"
        >
          <image :src="creator.avatar" class="creator-avatar" mode="aspectFill"/>
          <text class="creator-name">{{ creator.name }}</text>
          <text class="creator-desc">{{ creator.desc }}</text>
          <view class="creator-subscribers">{{ creator.subscribers }} 订阅</view>
        </view>
      </scroll-view>
    </view>

    <!-- 底部导航 -->
    <TabBar :current="1" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TabBar from '@/components/TabBar.vue'

const searchKeyword = ref('')

const hotTags = ref([
  '高考数学', '雅思备考', 'Python入门', '考研政治',
  '物理力学', '化学实验', '英语四六级', '编程算法'
])

const creators = ref([
  { id: '1', name: '数学小王子', desc: '高考数学148分', subscribers: '12.5k', avatar: 'https://picsum.photos/100/100?random=1' },
  { id: '2', name: '英语达人', desc: '雅思8.5分', subscribers: '8.3k', avatar: 'https://picsum.photos/100/100?random=2' },
  { id: '3', name: '编程大牛', desc: '大厂高级工程师', subscribers: '15.2k', avatar: 'https://picsum.photos/100/100?random=3' },
  { id: '4', name: '物理老师', desc: '10年教学经验', subscribers: '6.8k', avatar: 'https://picsum.photos/100/100?random=4' },
  { id: '5', name: '考研学姐', desc: '成功上岸985', subscribers: '9.1k', avatar: 'https://picsum.photos/100/100?random=5' }
])

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    uni.showToast({ title: `搜索: ${searchKeyword.value}`, icon: 'none' })
  }
}

const searchTag = (tag: string) => {
  searchKeyword.value = tag
  handleSearch()
}

const goToCreator = (id: string) => {
  uni.navigateTo({
    url: `/pages/user/profile?id=${id}`
  })
}
</script>

<style scoped>
.discover-page {
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

.search-section {
  padding: 16px;
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

.section {
  padding: 20px 16px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
  display: block;
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hot-tag {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--border-light);
}

.creators-scroll {
  white-space: nowrap;
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

.creator-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.creator-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: 4px;
}

.creator-desc {
  font-size: 11px;
  color: var(--text-tertiary);
  display: block;
  margin-bottom: 8px;
}

.creator-subscribers {
  font-size: 12px;
  color: var(--accent-warm);
  font-weight: 500;
}
</style>
