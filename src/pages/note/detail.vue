<template>
  <view class="detail-page" v-if="note">
    <!-- 导航栏 -->
    <view class="detail-nav">
      <view class="back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </view>
      <text class="nav-title">笔记详情</text>
      <view class="more-btn" @click="showMoreActions">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="1"/>
          <circle cx="19" cy="12" r="1"/>
          <circle cx="5" cy="12" r="1"/>
        </svg>
      </view>
    </view>

    <!-- 内容区 -->
    <scroll-view scroll-y class="detail-content" @scrolltolower="loadMoreComments">
      <!-- 封面 -->
      <image v-if="note.coverImage" :src="note.coverImage" mode="widthFix" class="detail-cover"/>

      <!-- 标题和分类 -->
      <view class="detail-header">
        <view class="category-badge">{{ note.categoryName }}</view>
        <text class="detail-title">{{ note.title }}</text>

        <!-- 作者信息 -->
        <view class="author-section" @click="goToAuthor(note.userId)">
          <image v-if="note.authorAvatar" :src="note.authorAvatar" class="author-avatar-large"/>
          <view class="author-info">
            <text class="author-name-large">{{ note.authorName }}</text>
            <text class="publish-time">{{ formatTime(note.createdAt) }}</text>
          </view>
          <view v-if="!isSelf" class="subscribe-btn" @click.stop="toggleSubscribe">
            <text>{{ isSubscribed ? '已订阅' : '订阅' }}</text>
          </view>
        </view>
      </view>

      <!-- 笔记内容 -->
      <view class="content-body">
        <text class="content-text">{{ note.content }}</text>

        <!-- 如果是付费内容，显示遮罩 -->
        <view v-if="note.visibility === 2 && !hasPurchased && !isSelf" class="paywall">
          <view class="paywall-content">
            <text class="paywall-title">继续阅读</text>
            <text class="paywall-desc">订阅创作者或购买此笔记解锁完整内容</text>
            <view class="paywall-price">
              <text class="price-label">价格</text>
              <text class="price-value">¥{{ note.price }}</text>
            </view>
            <view class="paywall-actions">
              <view class="btn-secondary" @click="buyNote">购买笔记</view>
              <view class="btn-primary" @click="subscribeCreator">订阅创作者</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 标签 -->
      <view v-if="note.tags && note.tags.length > 0" class="tags-section">
        <view v-for="(tag, index) in note.tags" :key="index" class="tag-item">
          #{{ tag }}
        </view>
      </view>

      <!-- 互动数据 -->
      <view class="stats-bar">
        <view class="stat-item">
          <text class="stat-num">{{ note.viewCount || 0 }}</text>
          <text class="stat-label">浏览</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ note.likeCount || 0 }}</text>
          <text class="stat-label">点赞</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ note.favoriteCount || 0 }}</text>
          <text class="stat-label">收藏</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ note.shareCount || 0 }}</text>
          <text class="stat-label">分享</text>
        </view>
      </view>

      <!-- 评分 -->
      <view class="rating-section">
        <view class="rating-header">
          <text class="section-title">评分</text>
          <view v-if="averageRating > 0" class="rating-info">
            <text class="rating-score">{{ averageRating.toFixed(1) }}</text>
            <text class="rating-count">({{ ratingCount }}人评分)</text>
          </view>
        </view>
        <view class="rating-stars">
          <view
            v-for="star in 5"
            :key="star"
            class="star"
            @click="rateNote(star)"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              :fill="star <= (myRating || 0) ? '#FFC107' : 'none'"
              :stroke="star <= (myRating || 0) ? '#FFC107' : '#DDD'"
              stroke-width="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </view>
        </view>
        <text v-if="myRating" class="my-rating">我的评分: {{ myRating }}星</text>
      </view>

      <!-- 评论列表 -->
      <view class="comments-section">
        <view class="comments-header">
          <text class="section-title">评论</text>
          <text class="comments-count">{{ commentCount }}条</text>
        </view>

        <view v-if="comments.length === 0 && !commentLoading" class="empty-comments">
          <text>暂无评论，快来抢沙发吧~</text>
        </view>

        <view v-else class="comments-list">
          <view
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item"
          >
            <image
              :src="comment.userAvatar || '/static/default-avatar.svg'"
              class="comment-avatar"
              mode="aspectFill"
            />
            <view class="comment-content">
              <view class="comment-header">
                <text class="comment-username">{{ comment.username }}</text>
                <text class="comment-time">{{ formatTime(comment.createdAt) }}</text>
              </view>
              <text class="comment-text">{{ comment.content }}</text>
              <view class="comment-actions">
                <view class="comment-action" @click="likeComment(comment)">
                  <svg width="14" height="14" viewBox="0 0 24 24" :fill="comment.isLiked ? '#FF6B6B' : 'none'" :stroke="comment.isLiked ? '#FF6B6B' : 'currentColor'" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <text>{{ comment.likeCount || 0 }}</text>
                </view>
                <view class="comment-action" @click="replyComment(comment)">
                  <text>回复</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-if="commentLoading" class="loading-more">
          <view class="loading-spinner"></view>
          <text>加载中...</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="action-input" @click="focusComment">
        <text class="placeholder">写评论...</text>
      </view>
      <view class="action-btns">
        <view class="action-btn" @click="toggleLike">
          <svg :class="{ active: isLiked }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <text>{{ note.likeCount || 0 }}</text>
        </view>
        <view class="action-btn" @click="toggleFavorite">
          <svg :class="{ active: isFavorited }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <text>{{ note.favoriteCount || 0 }}</text>
        </view>
        <view class="action-btn" @click="shareNote">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <text>分享</text>
        </view>
      </view>
    </view>

    <!-- 评论输入框 -->
    <view v-if="showCommentInput" class="comment-modal">
      <view class="modal-mask" @click="closeCommentInput"></view>
      <view class="comment-input-box">
        <textarea
          v-model="commentContent"
          :placeholder="replyTo ? `回复 ${replyTo.username}:` : '写评论...'"
          class="comment-textarea"
          :focus="showCommentInput"
          maxlength="500"
        />
        <view class="input-actions">
          <text class="char-count">{{ commentContent.length }}/500</text>
          <view
            :class="['send-btn', { active: commentContent.trim() }]"
            @click="submitComment"
          >
            <text>发送</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { noteApi, favoriteApi, ratingApi, shareApi, commentApi } from '@/api/note'
import { subscriptionApi } from '@/api/message'
import { useUserStore } from '@/stores/user'
import type { Note } from '@/types/api.types'

const userStore = useUserStore()

const noteId = ref<number>(0)
const note = ref<Note | null>(null)
const hasPurchased = ref(false)
const isLiked = ref(false)
const isFavorited = ref(false)
const isSubscribed = ref(false)
const isSelf = computed(() => userStore.userInfo?.id === note.value?.userId)

// 评分
const averageRating = ref(0)
const ratingCount = ref(0)
const myRating = ref(0)

// 评论
const comments = ref<any[]>([])
const commentCount = ref(0)
const commentLoading = ref(false)
const commentPage = ref(1)
const showCommentInput = ref(false)
const commentContent = ref('')
const replyTo = ref<any>(null)

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage.options?.id

  if (id) {
    noteId.value = parseInt(id)
    loadNoteDetail()
    loadComments()
    checkInteractions()
  }
})

const loadNoteDetail = async () => {
  try {
    note.value = await noteApi.getById(noteId.value)

    // 加载评分信息
    const [avg, count] = await Promise.all([
      ratingApi.getAverage(noteId.value).catch(() => 0),
      ratingApi.getCount(noteId.value).catch(() => 0)
    ])
    averageRating.value = avg
    ratingCount.value = count
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const checkInteractions = async () => {
  if (!userStore.isLoggedIn) return

  try {
    const [fav, rating, sub] = await Promise.all([
      favoriteApi.check(noteId.value).catch(() => false),
      ratingApi.getMyRating(noteId.value).catch(() => 0),
      note.value ? subscriptionApi.checkSubscription(note.value.userId).catch(() => false) : false
    ])

    isFavorited.value = fav
    myRating.value = rating
    isSubscribed.value = sub
  } catch (error) {
    console.error('检查互动状态失败:', error)
  }
}

const loadComments = async () => {
  if (commentLoading.value) return

  commentLoading.value = true
  try {
    const res = await commentApi.getByNoteId(noteId.value, commentPage.value)
    if (commentPage.value === 1) {
      comments.value = res.list
    } else {
      comments.value.push(...res.list)
    }
    commentCount.value = res.total
  } catch (error) {
    console.error('加载评论失败:', error)
  } finally {
    commentLoading.value = false
  }
}

const loadMoreComments = () => {
  commentPage.value++
  loadComments()
}

const toggleLike = async () => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }

  // 注意：后端没有单独的点赞接口，点赞通过评分实现（1星表示点赞）
  if (!isLiked.value) {
    await ratingApi.rate(noteId.value, 5)
    isLiked.value = true
    note.value!.likeCount++
    uni.showToast({ title: '已点赞', icon: 'success' })
  }
}

const toggleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }

  try {
    if (isFavorited.value) {
      await favoriteApi.remove(noteId.value)
      isFavorited.value = false
      note.value!.favoriteCount--
      uni.showToast({ title: '已取消收藏', icon: 'none' })
    } else {
      await favoriteApi.add(noteId.value)
      isFavorited.value = true
      note.value!.favoriteCount++
      uni.showToast({ title: '已收藏', icon: 'success' })
    }
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const rateNote = async (score: number) => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }

  try {
    await ratingApi.rate(noteId.value, score)
    myRating.value = score
    uni.showToast({ title: `已评分 ${score} 星`, icon: 'success' })

    // 重新加载平均评分
    const avg = await ratingApi.getAverage(noteId.value)
    averageRating.value = avg
  } catch (error) {
    uni.showToast({ title: '评分失败', icon: 'none' })
  }
}

const shareNote = async () => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }

  try {
    const res = await shareApi.create(noteId.value)
    uni.showModal({
      title: '分享成功',
      content: `分享码: ${res.shareCode}`,
      showCancel: false
    })
    note.value!.shareCount++
  } catch (error) {
    uni.showToast({ title: '分享失败', icon: 'none' })
  }
}

const focusComment = () => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  showCommentInput.value = true
  replyTo.value = null
}

const closeCommentInput = () => {
  showCommentInput.value = false
  commentContent.value = ''
  replyTo.value = null
}

const submitComment = async () => {
  if (!commentContent.value.trim()) return

  try {
    await commentApi.create(
      noteId.value,
      commentContent.value,
      replyTo.value?.id
    )

    uni.showToast({ title: '评论成功', icon: 'success' })
    closeCommentInput()

    // 重新加载评论
    commentPage.value = 1
    await loadComments()
    commentCount.value++
  } catch (error) {
    uni.showToast({ title: '评论失败', icon: 'none' })
  }
}

const replyComment = (comment: any) => {
  replyTo.value = comment
  showCommentInput.value = true
}

const likeComment = async (comment: any) => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }

  try {
    if (comment.isLiked) {
      await commentApi.unlikeComment(comment.id)
      comment.isLiked = false
      comment.likeCount--
    } else {
      await commentApi.likeComment(comment.id)
      comment.isLiked = true
      comment.likeCount++
    }
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const toggleSubscribe = async () => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }

  try {
    if (isSubscribed.value) {
      await subscriptionApi.unsubscribe(note.value!.userId)
      isSubscribed.value = false
      uni.showToast({ title: '已取消订阅', icon: 'none' })
    } else {
      await subscriptionApi.subscribe(note.value!.userId)
      isSubscribed.value = true
      uni.showToast({ title: '订阅成功', icon: 'success' })
    }
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const buyNote = () => {
  uni.showToast({ title: '购买功能开发中', icon: 'none' })
}

const subscribeCreator = () => {
  toggleSubscribe()
}

const goToAuthor = (userId: number) => {
  if (isSelf.value) return
  uni.navigateTo({ url: `/pages/user/profile?id=${userId}` })
}

const showMoreActions = () => {
  uni.showActionSheet({
    itemList: ['举报', '分享'],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.navigateTo({
          url: `/pages/report/submit?targetType=1&targetId=${noteId.value}`
        })
      } else if (res.tapIndex === 1) {
        shareNote()
      }
    }
  })
}

const goBack = () => {
  uni.navigateBack()
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
/* 样式与之前类似，添加新的评论和评分样式 */
.detail-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-bottom: 60px;
}

/* 导航栏 */
.detail-nav {
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

.back-btn, .more-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 内容区 */
.detail-content {
  padding-top: 60px;
}

.detail-cover {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
}

/* 头部信息 */
.detail-header {
  padding: 20px;
  background: var(--bg-card);
  margin-bottom: 12px;
}

.category-badge {
  display: inline-block;
  background: var(--accent-warm);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.detail-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 16px;
  display: block;
}

.author-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar-large {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  flex: 1;
}

.author-name-large {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
}

.publish-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.subscribe-btn {
  background: var(--accent-warm);
  color: white;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 20px;
}

/* 内容 */
.content-body {
  padding: 20px;
  background: var(--bg-card);
  margin-bottom: 12px;
  position: relative;
}

.content-text {
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.8;
  display: block;
}

.paywall {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to bottom, transparent, var(--bg-card) 30%);
  padding: 60px 20px 20px;
}

.paywall-content {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  border: 1px solid var(--border-light);
}

.paywall-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
  margin-bottom: 8px;
}

.paywall-desc {
  font-size: 13px;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 20px;
}

.paywall-price {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.price-label {
  font-size: 14px;
  color: var(--text-tertiary);
}

.price-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-warm);
}

.paywall-actions {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 12px 20px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.btn-primary {
  background: var(--accent-warm);
  color: white;
}

.btn-secondary {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

/* 标签 */
.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px;
  background: var(--bg-card);
  margin-bottom: 12px;
}

.tag-item {
  padding: 6px 12px;
  background: var(--bg-secondary);
  color: var(--accent-warm);
  font-size: 13px;
  border-radius: 16px;
}

/* 统计 */
.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: var(--bg-card);
  margin-bottom: 12px;
}

.stat-item {
  text-align: center;
}

.stat-num {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* 评分 */
.rating-section {
  padding: 16px;
  background: var(--bg-card);
  margin-bottom: 12px;
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.rating-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-score {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-warm);
}

.rating-count {
  font-size: 13px;
  color: var(--text-tertiary);
}

.rating-stars {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 8px;
}

.star {
  cursor: pointer;
  transition: transform 0.2s;
}

.star:active {
  transform: scale(1.2);
}

.my-rating {
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
}

/* 评论 */
.comments-section {
  background: var(--bg-card);
  padding: 16px;
  margin-bottom: 12px;
}

.comments-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.comments-count {
  font-size: 14px;
  color: var(--text-tertiary);
}

.empty-comments {
  text-align: center;
  padding: 40px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.comment-username {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.comment-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.comment-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 8px;
  display: block;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.comment-action {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-tertiary);
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
  to { transform: rotate(360deg); }
}

/* 底部栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--bg-card);
  border-top: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
  z-index: 100;
}

.action-input {
  flex: 1;
  height: 40px;
  background: var(--bg-secondary);
  border-radius: 20px;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.action-input .placeholder {
  font-size: 14px;
  color: var(--text-tertiary);
}

.action-btns {
  display: flex;
  gap: 20px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: var(--text-secondary);
  font-size: 11px;
}

.action-btn svg {
  width: 22px;
  height: 22px;
}

.action-btn svg.active {
  fill: var(--accent-coral);
  stroke: var(--accent-coral);
  color: var(--accent-coral);
}

/* 评论输入框 */
.comment-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.comment-input-box {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-card);
  padding: 16px;
  border-radius: 16px 16px 0 0;
}

.comment-textarea {
  width: 100%;
  height: 100px;
  font-size: 15px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 12px;
  color: var(--text-tertiary);
}

.send-btn {
  padding: 8px 20px;
  background: var(--border-light);
  color: var(--text-tertiary);
  font-size: 14px;
  font-weight: 600;
  border-radius: 16px;
}

.send-btn.active {
  background: var(--accent-warm);
  color: white;
}
</style>
