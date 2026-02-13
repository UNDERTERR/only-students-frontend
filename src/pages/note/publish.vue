<template>
  <view class="publish-page">
    <view class="page-nav">
      <view class="back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </view>
      <text class="nav-title">{{ isEdit ? '编辑笔记' : '创建笔记' }}</text>
      <view class="nav-right">
        <view
          :class="['save-btn', { loading: loading || uploadingCover }]"
          @click="handleSave"
        >
          <text v-if="!loading && !uploadingCover">保存</text>
          <view v-else class="btn-spinner"></view>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="content-area">
      <!-- 封面图 -->
      <view class="cover-section">
        <view v-if="!form.coverImage" class="upload-cover" @click="chooseCover">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <text>添加封面图</text>
        </view>
        <view v-else class="cover-wrapper">
          <image :src="form.coverImage" class="cover-image" mode="aspectFill" @click="chooseCover"/>
          <!-- 删除封面按钮 -->
          <view class="delete-cover-btn" @click.stop="removeCover">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </view>
        </view>
      </view>

      <!-- 标题 -->
      <view class="input-section">
        <input
          type="text"
          v-model="form.title"
          placeholder="填写标题会有更多赞哦~"
          class="title-input"
          maxlength="50"
        />
        <text class="char-count">{{ form.title.length }}/50</text>
      </view>

      <!-- 正文 -->
      <view class="input-section">
        <textarea
          v-model="form.content"
          placeholder="添加正文..."
          class="content-input compact"
          maxlength="500"
        />
        <text class="char-count">{{ form.content.length }}/500</text>
      </view>

      <!-- 文件上传 -->
      <view class="input-section file-section">
        <text class="section-label">上传文件</text>
        <view v-if="!form.originalFileId" class="upload-file-btn" @click="chooseFile">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <text>点击上传文件</text>
          <text class="file-hint">支持 PDF、Word、PPT 等格式</text>
        </view>
        <view v-else class="file-info">
          <view class="file-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </view>
          <view class="file-details">
            <text class="file-name">{{ uploadedFileName }}</text>
            <text class="file-size">{{ uploadedFileSize }}</text>
          </view>
          <view class="remove-file" @click="removeFile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </view>
        </view>
      </view>

      <!-- 分类 -->
      <view class="section">
        <text class="section-title">选择分类</text>
        <view class="category-list">
          <view
            v-for="cat in categories"
            :key="cat.id"
            :class="['category-item', { active: form.categoryId === cat.id }]"
            @click="selectCategory(cat.id)"
          >
            <text class="category-icon">{{ cat.icon }}</text>
            <text class="category-name">{{ cat.name }}</text>
          </view>
        </view>
      </view>

      <!-- 标签 -->
      <view class="section">
        <text class="section-title">添加标签</text>
        <view class="tags-input">
          <view v-for="(tag, index) in form.tags" :key="index" class="tag-item">
            <text>{{ tag }}</text>
            <view class="remove-tag" @click="removeTag(index)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </view>
          </view>
          <input
            v-if="form.tags.length < 5"
            type="text"
            v-model="tagInput"
            placeholder="输入标签"
            class="tag-input"
            @confirm="addTag"
          />
        </view>
        <text class="hint">最多添加5个标签，按回车确认</text>
      </view>

      <!-- 可见性设置 -->
      <view class="section">
        <text class="section-title">可见性设置</text>
        <view class="visibility-select-wrapper">
          <picker
            mode="selector"
            :range="visibilityOptions"
            :value="form.visibility"
            @change="onVisibilityChange"
          >
            <view class="visibility-picker">
              <text class="picker-label">{{ visibilityOptions[form.visibility] }}</text>
              <svg class="picker-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </view>
          </picker>
        </view>

        <!-- 价格设置（仅付费可见和订阅后付费可见时显示） -->
        <view v-if="form.visibility === 2 || form.visibility === 3" class="price-setting">
          <text class="label">设置价格</text>
          <view class="price-input-wrapper">
            <text class="currency">¥</text>
            <input
              type="digit"
              v-model="form.price"
              placeholder="0.00"
              class="price-input"
            />
          </view>
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="footer-actions" v-if="isEdit">
        <view class="delete-btn" @click="handleDelete">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          <text>删除笔记</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNoteStore } from '@/stores/note'
import { NOTE_CATEGORIES } from '@/config/api.config'
import { noteApi } from '@/api/note'
import { useUserStore } from '@/stores/user'
import { uploadPrivateFile, uploadPublicFile } from '@/api/file'

const noteStore = useNoteStore()
const userStore = useUserStore()
// 获取页面参数（编辑模式）
const page = getCurrentPages()[getCurrentPages().length - 1] as any
const noteId = ref<number | null>(page.options?.id ? parseInt(page.options.id) : null)
const isEdit = ref(!!noteId.value)

const form = ref({
  title: '',
  content: '',
  coverImage: '',
  categoryId: null as number | null,
  tags: [] as string[],
  visibility: 0,
  price: '',
  originalFileId: null as number | null
})

// 已上传文件信息
const uploadedFileName = ref('')
const uploadedFileSize = ref('')

const tagInput = ref('')
const loading = ref(false)
const categories = NOTE_CATEGORIES

// 如果是编辑模式，加载现有笔记数据
onMounted(async () => {
  if (isEdit.value && noteId.value) {
    try {
      loading.value = true
      const note = await noteApi.getById(noteId.value)
      form.value.title = note.title
      form.value.content = note.content
      form.value.coverImage = note.coverImage || ''
      form.value.categoryId = note.categoryId
      form.value.tags = note.tags || []
      form.value.visibility = note.visibility
      form.value.price = note.price ? String(note.price) : ''
      
      // 加载文件信息
      if (note.originalFileId) {
        form.value.originalFileId = note.originalFileId
        // 如果有文件信息，从note中获取文件名
        if (note.fileName) {
          uploadedFileName.value = note.fileName
          uploadedFileSize.value = note.fileSize ? formatFileSize(note.fileSize) : ''
        }
      }
    } catch (error) {
      console.error('加载笔记失败:', error)
      uni.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      loading.value = false
    }
  }
})

const uploadingCover = ref(false)

const chooseCover = async () => {
  try {
    // 选择图片
    const res = await uni.chooseImage({ count: 1 });
    const tempFilePath = res.tempFilePaths[0];
    
    // 显示上传中
    uploadingCover.value = true
    uni.showLoading({ title: '上传中...', mask: true });
    
    // 上传图片到服务器
    const result = await uploadPublicFile(tempFilePath);
    
    // 添加时间戳参数防止缓存，并确保MinIO已完成写入
    const timestamp = Date.now();
    const imageUrl = result.fileUrl.includes('?') 
      ? `${result.fileUrl}&t=${timestamp}` 
      : `${result.fileUrl}?t=${timestamp}`;
    
    // 预加载图片确保可用
    await preloadImage(imageUrl);
    
    // 保存返回的URL
    form.value.coverImage = imageUrl;
    
    uni.showToast({ title: '上传成功', icon: 'success' });
  } catch (error) {
    console.error('封面上传失败:', error);
    uni.showToast({ title: '上传失败', icon: 'none' });
  } finally {
    uploadingCover.value = false
    uni.hideLoading();
  }
}

// 删除封面
const removeCover = () => {
  uni.showModal({
    title: '删除封面',
    content: '确定要删除当前封面吗？',
    confirmColor: '#F44336',
    success: (res) => {
      if (res.confirm) {
        form.value.coverImage = ''
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

// 预加载图片确保可用
const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = url;
  });
}

// 选择并上传文件
const chooseFile = () => {
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.md'],
    success: async (res) => {
      const file = res.tempFiles[0]
      
      // 显示上传中
      uni.showLoading({ title: '上传中...', mask: true })
      
      try {
        // 上传文件到服务器
        const result = await uploadPrivateFile(file.path)
        
        // 保存文件信息
        form.value.originalFileId = result.fileId
        uploadedFileName.value = result.originalName || result.fileName
        uploadedFileSize.value = formatFileSize(result.fileSize)
        
        uni.showToast({ title: '上传成功', icon: 'success' })
      } catch (error) {
        console.error('文件上传失败:', error)
        uni.showToast({ title: '上传失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },
    fail: (err) => {
      console.error('选择文件失败:', err)
    }
  })
}

// 移除已上传的文件
const removeFile = () => {
  uni.showModal({
    title: '确认移除',
    content: '确定要移除已上传的文件吗？',
    success: (res) => {
      if (res.confirm) {
        form.value.originalFileId = null
        uploadedFileName.value = ''
        uploadedFileSize.value = ''
        uni.showToast({ title: '已移除', icon: 'success' })
      }
    }
  })
}

// 格式化文件大小
const formatFileSize = (size: number): string => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + ' MB'
  return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

const selectCategory = (id: number) => {
  form.value.categoryId = id
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && form.value.tags.length < 5 && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (index: number) => {
  form.value.tags.splice(index, 1)
}

// 可见性选项
const visibilityOptions = [
  '公开',
  '仅订阅可见',
  '仅付费可见',
  '订阅后付费可见',
  '仅自己可见'
]

// 可见性选择改变
const onVisibilityChange = (e: any) => {
  form.value.visibility = parseInt(e.detail.value)
  // 如果不是付费选项，清空价格
  if (form.value.visibility !== 2 && form.value.visibility !== 3) {
    form.value.price = ''
  }
}

const handleSave = async () => {
  if (uploadingCover.value) {
    uni.showToast({ title: '封面上传中，请稍候...', icon: 'none' })
    return
  }

  if (!form.value.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }

  if (!form.value.content.trim()) {
    uni.showToast({ title: '请输入正文内容', icon: 'none' })
    return
  }

  if (!form.value.categoryId) {
    uni.showToast({ title: '请选择分类', icon: 'none' })
    return
  }

  loading.value = true

  try {
    const noteData = {
      title: form.value.title,
      content: form.value.content,
      categoryId: form.value.categoryId,
      visibility: form.value.visibility,
      price: (form.value.visibility === 2 || form.value.visibility === 3) ? (parseFloat(form.value.price) || 0) : 0,
      tags: form.value.tags,
      coverImage: form.value.coverImage,
      originalFileId: form.value.originalFileId,
      authorNickname: userStore.userInfo?.nickname,
      authorUsername: userStore.userInfo?.username,
      authorAvatar: userStore.userInfo?.avatar,
    }

    if (isEdit.value && noteId.value) {
      // 更新现有笔记
      await noteApi.update(noteId.value, noteData)
    } else {
      // 创建新笔记（草稿状态）
      await noteApi.create(noteData)
    }

    uni.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 2000
    })

    setTimeout(() => {
      // 发送全局事件通知列表页刷新
      uni.$emit('notes-updated')
      
      uni.navigateBack({
        success: () => {
          uni.showToast({ title: '保存成功', icon: 'success', duration: 1500 })
        }
      })
    }, 1500)
  } catch (error) {
    console.error('保存失败:', error)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const handleDelete = () => {
  if (!isEdit.value || !noteId.value) {
    uni.showToast({ title: '新笔记无法删除', icon: 'none' })
    return
  }

  uni.showModal({
    title: '确认删除',
    content: '确定要删除这篇笔记吗？此操作不可恢复。',
    confirmColor: '#F44336',
    success: async (res) => {
      if (res.confirm) {
        try {
          await noteApi.delete(noteId.value!)
          uni.showToast({ title: '删除成功', icon: 'success' })
          setTimeout(() => {
            uni.redirectTo({ url: '/pages/user/my-notes' })
          }, 1500)
        } catch (error) {
          console.error('删除失败:', error)
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.publish-page {
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
  width: 80px;
  display: flex;
  justify-content: flex-end;
}

.save-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, var(--accent-warm), var(--accent-coral));
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 16px;
}

.save-btn.loading {
  background: var(--text-tertiary);
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.content-area {
  margin-top: 60px;
  padding: 16px;
}

.cover-section {
  margin-bottom: 16px;
}

.upload-cover {
  width: 100%;
  height: 200px;
  background: var(--bg-secondary);
  border: 2px dashed var(--border-medium);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  gap: 8px;
}

.cover-image {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  object-fit: cover;
}

.cover-wrapper {
  position: relative;
  width: 100%;
}

.delete-cover-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.delete-cover-btn:active {
  background: rgba(0, 0, 0, 0.7);
}

.input-section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid var(--border-light);
  position: relative;
}

.title-input {
  width: 100%;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  padding-bottom: 8px;
}

.content-input {
  width: 100%;
  min-height: 200px;
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.8;
}

.content-input.compact {
  min-height: 100px;
  max-height: 150px;
}

.char-count {
  position: absolute;
  bottom: 8px;
  right: 16px;
  font-size: 12px;
  color: var(--text-tertiary);
}

/* 文件上传区域 */
.file-section {
  margin-top: 12px;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
  display: block;
}

.upload-file-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg-secondary);
  border: 2px dashed var(--border-medium);
  border-radius: 10px;
  color: var(--text-tertiary);
  gap: 6px;
}

.upload-file-btn:active {
  background: var(--border-light);
}

.file-hint {
  font-size: 11px;
  color: var(--text-tertiary);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.file-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-warm);
  color: white;
  border-radius: 8px;
}

.file-details {
  flex: 1;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
  word-break: break-all;
}

.file-size {
  font-size: 12px;
  color: var(--text-tertiary);
}

.remove-file {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  background: var(--bg-card);
  border-radius: 50%;
}

.section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid var(--border-light);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  display: block;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: var(--bg-secondary);
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}

.category-item.active {
  background: var(--accent-warm);
  color: white;
  border-color: var(--accent-warm);
}

.category-icon {
  font-size: 14px;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-height: 40px;
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--accent-warm);
  color: white;
  font-size: 13px;
  border-radius: 12px;
}

.remove-tag {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-input {
  flex: 1;
  min-width: 80px;
  font-size: 14px;
  color: var(--text-primary);
}

.hint {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 8px;
  display: block;
}

.visibility-select-wrapper {
  background: var(--bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.visibility-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
}

.picker-label {
  font-size: 15px;
  color: var(--text-primary);
}

.picker-arrow {
  color: var(--text-tertiary);
}

.price-setting {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

.label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: block;
}

.price-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.currency {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-warm);
}

.price-input {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 底部操作栏 */
.footer-actions {
  margin-top: 32px;
  padding: 20px 0;
  border-top: 1px solid var(--border-light);
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: #FFEBEE;
  border-radius: 12px;
  color: #F44336;
  font-size: 15px;
  font-weight: 500;
}

.delete-btn:active {
  background: #FFCDD2;
}
</style>
