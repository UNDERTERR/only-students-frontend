<template>
  <view class="tabbar">
    <view v-for="(tab, index) in tabs" :key="index" :class="['tab-item', { active: current === index }]"
      @click="switchTab(index)">
      <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <!-- 首页 -->
        <template v-if="index === 0">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </template>
        <!-- 发现 -->
        <template v-else-if="index === 1">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </template>
        <!-- 消息 -->
        <template v-else-if="index === 2">
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </template>
        <!-- 我的 -->
        <template v-else-if="index === 3">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </template>
      </svg>
      <text class="tab-label">{{ tab.label }}</text>

      <!-- 未读消息小红点 -->
      <view v-if="tab.hasBadge" class="tab-badge"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  current?: number
}

withDefaults(defineProps<Props>(), {
  current: 0
})

const tabs = ref([
  { label: '首页', path: '/pages/index/index', hasBadge: false },
  { label: '发现', path: '/pages/discover/index', hasBadge: false },
  { label: '消息', path: '/pages/message/index', hasBadge: true },
  { label: '我的', path: '/pages/user/index', hasBadge: false }
])

const switchTab = (index: number) => {
  const tab = tabs.value[index]

  // 获取当前页面路径
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const currentPath = currentPage ? '/' + currentPage.route : ''

  // 如果已经在目标页面，就不跳转
  if (currentPath === tab.path) {
    return
  }

  // 使用 redirectTo 跳转（因为没有配置 tabBar）
  uni.redirectTo({
    url: tab.path
  })
}
</script>

<style scoped>
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 52px;
  background: var(--bg-card);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 9999;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  isolation: isolate;
  transform: translateZ(0);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 16px;
  position: relative;
}

.tab-icon {
  width: 20px;
  height: 20px;
  color: var(--text-tertiary);
}

.tab-label {
  font-size: 10px;
  color: var(--text-tertiary);
}

.tab-item.active .tab-icon {
  color: var(--accent-warm);
}

.tab-item.active .tab-label {
  color: var(--accent-warm);
  font-weight: 600;
}

.tab-badge {
  position: absolute;
  top: 4px;
  right: 12px;
  width: 6px;
  height: 6px;
  background: var(--accent-coral);
  border-radius: 50%;
}
</style>
