<template>
  <view class="orders-page">
    <view class="page-nav">
      <view class="back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </view>
      <text class="nav-title">我的订单</text>
      <view class="nav-right"></view>
    </view>

    <scroll-view scroll-y class="content-area">
      <view v-if="loading && orders.length === 0" class="loading-state">
        <view class="loading-spinner"></view>
        <text>加载中...</text>
      </view>

      <view v-else-if="orders.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        <text class="empty-title">暂无订单</text>
        <text class="empty-desc">购买笔记或订阅创作者后会显示在这里</text>
      </view>

      <view v-else class="orders-list">
        <view
          v-for="order in orders"
          :key="order.id"
          class="order-card"
        >
          <view class="order-header">
            <text class="order-no">订单号: {{ order.orderNo }}</text>
            <view :class="['status-badge', getStatusClass(order.status)]">
              {{ getStatusText(order.status) }}
            </view>
          </view>

          <view class="order-content">
            <view class="order-type">
              <text v-if="order.targetType === 1">笔记购买</text>
              <text v-else-if="order.targetType === 2">订阅服务</text>
            </view>
            <text class="order-amount">¥{{ order.amount?.toFixed(2) }}</text>
          </view>

          <view class="order-footer">
            <text class="order-time">{{ formatTime(order.createdAt) }}</text>
            <view v-if="order.status === 0" class="btn-pay" @click="payOrder(order)">
              去支付
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { paymentApi } from '@/api'

const orders = ref<any[]>([])
const loading = ref(false)

onMounted(() => {
  loadOrders()
})

const loadOrders = async () => {
  loading.value = true
  try {
    const res = await paymentApi.getMyOrders()
    orders.value = res
  } catch (error) {
    console.error('获取订单列表失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status: number): string => {
  const map: Record<number, string> = {
    0: 'pending',
    1: 'success',
    2: 'failed'
  }
  return map[status] || ''
}

const getStatusText = (status: number): string => {
  const map: Record<number, string> = {
    0: '待支付',
    1: '已支付',
    2: '支付失败'
  }
  return map[status] || '未知'
}

const formatTime = (time: string): string => {
  const date = new Date(time)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const goBack = () => {
  uni.navigateBack()
}

const payOrder = (order: any) => {
  uni.showToast({ title: '跳转支付页面', icon: 'none' })
}
</script>

<style scoped>
.orders-page {
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

.orders-list {
  padding: 16px;
}

.order-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid var(--border-light);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-no {
  font-size: 13px;
  color: var(--text-tertiary);
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge.pending {
  background: #FFF3E0;
  color: #FF9800;
}

.status-badge.success {
  background: #E8F5E9;
  color: #4CAF50;
}

.status-badge.failed {
  background: #FFEBEE;
  color: #F44336;
}

.order-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-type {
  font-size: 15px;
  color: var(--text-primary);
  font-weight: 500;
}

.order-amount {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-warm);
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
}

.order-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.btn-pay {
  padding: 6px 16px;
  background: var(--accent-warm);
  color: white;
  font-size: 13px;
  font-weight: 600;
  border-radius: 14px;
}
</style>
