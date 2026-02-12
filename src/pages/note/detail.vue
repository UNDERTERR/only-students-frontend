<template>
  <view class="detail-page" v-if="note">
    <!-- 导航栏 -->
    <view class="detail-nav">
      <view class="back-btn" @click="goBack">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </view>
      <text class="nav-title">笔记详情</text>
      <view class="more-btn" @click="showMoreActions">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="1"/>
          <circle cx="19" cy="12" r="1"/>
          <circle cx="5" cy="12" r="1"/>
        </svg>
      </view>
    </view>

    <!-- 内容区 -->
    <scroll-view scroll-y class="detail-content" @scrolltolower="loadMoreComments">
      <!-- 笔记主体轮播（有图片才显示） -->
      <view v-if="noteImages.length > 0" class="media-carousel">
        <swiper 
          class="media-swiper" 
          :indicator-dots="true" 
          :autoplay="false" 
          :circular="true"
          indicator-color="rgba(255, 255, 255, 0.4)"
          indicator-active-color="#fff"
          @change="onSwiperChange"
        >
          <swiper-item 
            v-for="(img, index) in noteImages" 
            :key="index"
            @click="openFullscreenPreview(index)"
          >
            <image :src="img" mode="aspectFill" class="media-image"/>
          </swiper-item>
        </swiper>
      </view>

      <!-- 全屏图片预览 -->
      <view v-if="showFullscreenPreview" class="fullscreen-preview" @click="closeFullscreenPreview">
        <view class="preview-header">
          <view class="preview-close" @click.stop="closeFullscreenPreview">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </view>
          <text class="preview-counter">{{ currentPreviewIndex + 1 }} / {{ noteImages.length }}</text>
        </view>
        
        <swiper 
          class="preview-swiper" 
          :current="currentPreviewIndex"
          :autoplay="false"
          @change="onPreviewSwiperChange"
        >
          <swiper-item v-for="(img, index) in noteImages" :key="index">
            <image :src="img" mode="aspectFit" class="preview-image"/>
          </swiper-item>
        </swiper>
        
        <view class="preview-indicator">
          <view 
            v-for="(img, index) in noteImages" 
            :key="index"
            :class="['preview-dot', { active: index === currentPreviewIndex }]"
          />
        </view>
      </view>

      <!-- 用户信息区域（轮播图下方） -->
      <view class="user-info-section" @click="goToAuthor(note.userId)">
        <image 
          v-if="note.authorAvatar" 
          :src="note.authorAvatar" 
          class="user-avatar"
          mode="aspectFill"
        />
        <view class="user-info">
          <text class="user-nickname">{{ note.authorNickname || note.authorName }}</text>
          <text class="user-username">@{{ note.authorUsername || '用户' + note.userId }}</text>
        </view>
        <text class="publish-time">{{ formatTime(note.createdAt) }}</text>
      </view>

      <!-- 作者和内容区 -->
      <view class="content-wrapper">
        <!-- 标题 -->
        <view class="title-section">
          <text class="detail-title">{{ note.title }}</text>
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

// 笔记图片列表
const noteImages = computed(() => {
  if (!note.value) return []
  const images = []
  // 如果有coverImage，作为第一张
  if (note.value.coverImage) {
    images.push(note.value.coverImage)
  }
  // 如果有图片列表，添加其余图片
  if (note.value.images && note.value.images.length > 0) {
    images.push(...note.value.images)
  }
  // 去重
  return [...new Set(images)]
})

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

// 全屏图片预览
const showFullscreenPreview = ref(false)
const currentPreviewIndex = ref(0)
const currentSwiperIndex = ref(0)

// 打开全屏预览
const openFullscreenPreview = (index: number) => {
  currentPreviewIndex.value = index
  showFullscreenPreview.value = true
}

// 关闭全屏预览
const closeFullscreenPreview = () => {
  showFullscreenPreview.value = false
}

// 轮播图切换
const onSwiperChange = (e: any) => {
  currentSwiperIndex.value = e.detail.current
}

// 预览轮播图切换
const onPreviewSwiperChange = (e: any) => {
  currentPreviewIndex.value = e.detail.current
}

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
/* 页面基础 */
.detail-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-bottom: 60px;
}

/* 导航栏 - 透明悬浮 */
.detail-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.4), transparent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  z-index: 100;
}

.back-btn, .more-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  backdrop-filter: blur(4px);
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

/* 内容区 */
.detail-content {
  padding-top: 0;
}

/* 媒体轮播 */
.media-carousel {
  width: 100%;
  height: 420px;
  background: var(--bg-secondary);
}

.media-swiper {
  width: 100%;
  height: 100%;
}

.media-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 全屏图片预览 */
.fullscreen-preview {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 10000;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: 50px;
  z-index: 10001;
}

.preview-close {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.preview-counter {
  font-size: 15px;
  color: white;
  font-weight: 500;
}

.preview-swiper {
  flex: 1;
  width: 100%;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-indicator {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  padding-bottom: 40px;
}

.preview-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transition: all 0.3s;
}

.preview-dot.active {
  background: white;
  transform: scale(1.2);
}

/* 用户信息区域（轮播图下方） */
.user-info-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-light);
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.user-nickname {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.user-username {
  font-size: 12px;
  color: var(--text-tertiary);
}

.publish-time {
  font-size: 12px;
  color: var(--text-tertiary);
  white-space: nowrap;
}

/* 内容包裹区 */
.content-wrapper {
  padding: 16px;
  background: var(--bg-card);
}

/* 标题区 - 紧凑 */
.title-section {
  margin-bottom: 12px;
}

.detail-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.5;
  display: block;
}

/* 内容体 */
.content-body {
  position: relative;
  margin-bottom: 16px;
}

.content-text {
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.8;
  display: block;
  white-space: pre-wrap;
}

.paywall {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to bottom, transparent, var(--bg-card) 30%);
  padding: 60px 0 0;
}

.paywall-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid var(--border-light);
}

.paywall-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
  margin-bottom: 6px;
}

.paywall-desc {
  font-size: 12px;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 16px;
}

.paywall-price {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 16px;
}

.price-label {
  font-size: 13px;
  color: var(--text-tertiary);
}

.price-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--accent-warm);
}

.paywall-actions {
  display: flex;
  gap: 10px;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 13px;
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
  margin-bottom: 16px;
}

.tag-item {
  padding: 4px 10px;
  background: var(--bg-secondary);
  color: var(--accent-warm);
  font-size: 12px;
  border-radius: 12px;
}

/* 统计数据 */
.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
}

.stat-item {
  text-align: center;
}

.stat-num {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 11px;
  color: var(--text-tertiary);
}

/* 评分 */
.rating-section {
  padding: 16px;
  background: var(--bg-card);
  margin-top: 12px;
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.rating-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rating-score {
  font-size: 22px;
  font-weight: 700;
  color: var(--accent-warm);
}

.rating-count {
  font-size: 12px;
  color: var(--text-tertiary);
}

.rating-stars {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-bottom: 6px;
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
  font-size: 13px;
  color: var(--text-secondary);
}

/* 评论 */
.comments-section {
  background: var(--bg-card);
  padding: 16px;
  margin-top: 12px;
}

.comments-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.comments-count {
  font-size: 13px;
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
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.comment-username {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.comment-time {
  font-size: 11px;
  color: var(--text-tertiary);
}

.comment-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 6px;
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
  height: 55px;
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
  height: 38px;
  background: var(--bg-secondary);
  border-radius: 19px;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.action-input .placeholder {
  font-size: 13px;
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
  font-size: 10px;
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