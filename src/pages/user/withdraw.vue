<template>
  <view class="withdraw-page">
    <view class="page-nav">
      <view class="back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </view>
      <text class="nav-title">申请提现</text>
      <view class="nav-right"></view>
    </view>

    <scroll-view scroll-y class="content-area">
      <!-- 余额显示 -->
      <view class="balance-card">
        <text class="balance-label">当前余额</text>
        <text class="balance-amount">¥{{ wallet?.balance?.toFixed(2) || '0.00' }}</text>
        <text class="balance-hint">可提现金额：¥{{ availableAmount.toFixed(2) }}</text>
      </view>

      <!-- 提现金额 -->
      <view class="form-section">
        <text class="section-title">提现金额</text>
        <view class="amount-input-wrapper">
          <text class="currency">¥</text>
          <input
            type="digit"
            v-model="amount"
            placeholder="请输入提现金额"
            class="amount-input"
          />
        </view>
        <view class="quick-amounts">
          <view
            v-for="amt in quickAmounts"
            :key="amt"
            :class="['quick-amount', { active: amount === amt.toString() }]"
            @click="amount = amt.toString()"
          >
            {{ amt }}
          </view>
          <view class="quick-amount" @click="amount = availableAmount.toString()">
            全部
          </view>
        </view>
      </view>

      <!-- 到账方式 -->
      <view class="form-section">
        <text class="section-title">到账方式</text>
        <view class="payment-methods">
          <view
            :class="['payment-method', { active: accountType === 1 }]"
            @click="accountType = 1"
          >
            <image src="/static/alipay.png" class="payment-icon" mode="aspectFit"/>
            <text>支付宝</text>
            <view v-if="accountType === 1" class="check-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </view>
          </view>
          <view
            :class="['payment-method', { active: accountType === 2 }]"
            @click="accountType = 2"
          >
            <image src="/static/wechat.png" class="payment-icon" mode="aspectFit"/>
            <text>微信支付</text>
            <view v-if="accountType === 2" class="check-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </view>
          </view>
        </view>
      </view>

      <!-- 账号信息 -->
      <view class="form-section">
        <text class="section-title">收款账号</text>
        <input
          type="text"
          v-model="accountInfo.account"
          placeholder="请输入支付宝账号/微信号"
          class="form-input"
        />
        <input
          type="text"
          v-model="accountInfo.name"
          placeholder="请输入真实姓名"
          class="form-input"
          style="margin-top: 12px;"
        />
      </view>

      <!-- 提示信息 -->
      <view class="tips-section">
        <text class="tips-title">提现说明：</text>
        <text class="tips-item">1. 单次提现金额最低10元</text>
        <text class="tips-item">2. 提现申请将在1-3个工作日内审核</text>
        <text class="tips-item">3. 审核通过后款项将转入您的收款账号</text>
        <text class="tips-item">4. 如有问题请联系客服</text>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <button
          class="submit-btn"
          :class="{ loading: loading }"
          :disabled="loading || !isValid"
          @click="submitWithdrawal"
        >
          <text v-if="!loading">确认提现</text>
          <view v-else class="btn-spinner"></view>
        </button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { walletApi, withdrawalApi } from '@/api/message'
import type { WalletInfo } from '@/types/api.types'

const wallet = ref<WalletInfo | null>(null)
const amount = ref('')
const accountType = ref(1)
const accountInfo = ref({
  account: '',
  name: ''
})
const loading = ref(false)

const quickAmounts = [50, 100, 200, 500]

const availableAmount = computed(() => {
  return wallet.value?.balance || 0
})

const isValid = computed(() => {
  const numAmount = parseFloat(amount.value)
  return numAmount >= 10 &&
         numAmount <= availableAmount.value &&
         accountInfo.value.account &&
         accountInfo.value.name
})

onMounted(() => {
  loadWallet()
})

const loadWallet = async () => {
  try {
    wallet.value = await walletApi.getWallet()
  } catch (error) {
    console.error('加载钱包失败:', error)
  }
}

const submitWithdrawal = async () => {
  if (!isValid.value) return

  const numAmount = parseFloat(amount.value)
  if (numAmount < 10) {
    uni.showToast({ title: '最低提现金额为10元', icon: 'none' })
    return
  }

  if (numAmount > availableAmount.value) {
    uni.showToast({ title: '余额不足', icon: 'none' })
    return
  }

  loading.value = true

  try {
    await withdrawalApi.apply(numAmount, {
      accountType: accountType.value,
      account: accountInfo.value.account,
      name: accountInfo.value.name
    })

    uni.showToast({
      title: '申请提交成功',
      icon: 'success',
      duration: 2000
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.showToast({ title: '申请失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.withdraw-page {
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
  padding: 16px;
  height: calc(100vh - 60px);
}

.balance-card {
  background: linear-gradient(135deg, var(--accent-warm), var(--accent-coral));
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  color: white;
  text-align: center;
}

.balance-label {
  font-size: 14px;
  opacity: 0.9;
  display: block;
  margin-bottom: 8px;
}

.balance-amount {
  font-size: 40px;
  font-weight: 700;
  display: block;
  margin-bottom: 8px;
}

.balance-hint {
  font-size: 13px;
  opacity: 0.8;
}

.form-section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid var(--border-light);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  display: block;
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-bottom: 12px;
}

.currency {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.amount-input {
  flex: 1;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.quick-amounts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-amount {
  padding: 8px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  font-size: 14px;
  color: var(--text-secondary);
}

.quick-amount.active {
  background: var(--accent-warm);
  color: white;
  border-color: var(--accent-warm);
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-light);
  font-size: 15px;
  color: var(--text-primary);
}

.payment-method.active {
  border-color: var(--accent-warm);
  background: #FFF5F2;
}

.payment-icon {
  width: 28px;
  height: 28px;
}

.check-icon {
  margin-left: auto;
  color: var(--accent-warm);
}

.form-input {
  width: 100%;
  height: 48px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 0 12px;
  font-size: 15px;
  color: var(--text-primary);
}

.tips-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.tips-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: 8px;
}

.tips-item {
  font-size: 13px;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 4px;
}

.submit-section {
  padding: 16px 0;
}

.submit-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, var(--accent-warm), var(--accent-coral));
  color: white;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn[disabled] {
  opacity: 0.6;
}

.submit-btn.loading {
  background: var(--text-tertiary);
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
