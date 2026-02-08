<template>
  <view class="edit-profile-page">
    <view class="page-nav">
      <view class="back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </view>
      <text class="nav-title">编辑资料</text>
      <view class="nav-right"></view>
    </view>
    
    <scroll-view scroll-y class="content-area">
      <!-- 头像 -->
      <view class="avatar-section">
        <image 
          :src="form.avatar || '/static/default-avatar.png'" 
          class="avatar"
          mode="aspectFill"
          @click="changeAvatar"
        />
        <text class="change-text">点击更换头像</text>
      </view>
      
      <!-- 表单 -->
      <view class="form-section">
        <view class="form-item">
          <text class="label">昵称</text>
          <input 
            type="text" 
            v-model="form.nickname"
            placeholder="请输入昵称"
            class="input"
          />
        </view>
        
        <view class="form-item">
          <text class="label">用户名</text>
          <input 
            type="text" 
            v-model="form.username"
            placeholder="请输入用户名"
            class="input"
            disabled
          />
        </view>
        
        <view class="form-item">
          <text class="label">邮箱</text>
          <input 
            type="text" 
            v-model="form.email"
            placeholder="请输入邮箱"
            class="input"
          />
        </view>
        
        <view class="form-item">
          <text class="label">手机号</text>
          <input 
            type="number" 
            v-model="form.phone"
            placeholder="请输入手机号"
            class="input"
          />
        </view>
        
        <view class="form-item">
          <text class="label">个人简介</text>
          <textarea 
            v-model="form.bio"
            placeholder="介绍一下自己吧..."
            class="textarea"
            maxlength="200"
          />
          <text class="char-count">{{ form.bio?.length || 0 }}/200</text>
        </view>
        
        <view class="form-item">
          <text class="label">学校</text>
          <input 
            type="text" 
            v-model="form.schoolName"
            placeholder="请输入学校名称"
            class="input"
          />
        </view>
        
        <view class="form-item">
          <text class="label">学段</text>
          <picker mode="selector" :range="educationLevels" :value="educationIndex" @change="onEducationChange">
            <view class="picker">
              <text :class="{ placeholder: !form.educationLevel }">{{ educationText }}</text>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </view>
          </picker>
        </view>
      </view>
      
      <!-- 保存按钮 -->
      <view class="action-section">
        <button 
          class="save-btn" 
          :class="{ loading: loading }"
          :disabled="loading"
          @click="saveProfile"
        >
          <text v-if="!loading">保存</text>
          <view v-else class="btn-spinner"></view>
        </button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()

const form = ref({
  avatar: '',
  nickname: '',
  username: '',
  email: '',
  phone: '',
  bio: '',
  schoolName: '',
  educationLevel: null as number | null
})

const loading = ref(false)

const educationLevels = ['小学', '初中', '高中', '本科', '硕士', '博士']
const educationIndex = computed(() => {
  return form.value.educationLevel ? form.value.educationLevel - 1 : 0
})
const educationText = computed(() => {
  if (!form.value.educationLevel) return '请选择学段'
  return educationLevels[form.value.educationLevel - 1]
})

onMounted(() => {
  // 加载当前用户信息
  const userInfo = userStore.userInfo
  if (userInfo) {
    form.value = {
      avatar: userInfo.avatar || '',
      nickname: userInfo.nickname || '',
      username: userInfo.username || '',
      email: userInfo.email || '',
      phone: userInfo.phone || '',
      bio: userInfo.bio || '',
      schoolName: userInfo.schoolName || '',
      educationLevel: userInfo.educationLevel || null
    }
  }
})

const onEducationChange = (e: any) => {
  form.value.educationLevel = e.detail.value + 1
}

const changeAvatar = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      // 这里应该上传图片到服务器
      form.value.avatar = res.tempFilePaths[0]
    }
  })
}

const saveProfile = async () => {
  loading.value = true
  
  try {
    // 注意：后端目前没有更新用户信息的接口
    // 这里只是保存到本地，实际项目中需要后端提供PUT /user接口
    uni.showToast({ 
      title: '资料已更新（仅本地）', 
      icon: 'success' 
    })
    
    // 更新本地存储的用户信息
    const userInfo = userStore.userInfo
    if (userInfo) {
      userInfo.nickname = form.value.nickname
      userInfo.email = form.value.email
      userInfo.phone = form.value.phone
      userInfo.bio = form.value.bio
      userInfo.schoolName = form.value.schoolName
      userInfo.educationLevel = form.value.educationLevel
      uni.setStorageSync('userInfo', userInfo)
    }
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.edit-profile-page {
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

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 12px;
  border: 3px solid var(--bg-card);
  box-shadow: 0 0 0 2px var(--accent-warm);
}

.change-text {
  font-size: 14px;
  color: var(--accent-warm);
}

.form-section {
  background: var(--bg-card);
  margin: 0 16px 16px;
  border-radius: 16px;
  padding: 0 16px;
  border: 1px solid var(--border-light);
}

.form-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--border-light);
}

.form-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: block;
}

.input {
  width: 100%;
  height: 44px;
  font-size: 15px;
  color: var(--text-primary);
  background: transparent;
}

.input[disabled] {
  color: var(--text-tertiary);
}

.textarea {
  width: 100%;
  height: 100px;
  font-size: 15px;
  color: var(--text-primary);
  background: transparent;
  line-height: 1.6;
}

.char-count {
  font-size: 12px;
  color: var(--text-tertiary);
  text-align: right;
  display: block;
  margin-top: 4px;
}

.picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  font-size: 15px;
  color: var(--text-primary);
}

.picker .placeholder {
  color: var(--text-tertiary);
}

.action-section {
  padding: 16px;
}

.save-btn {
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

.save-btn[disabled] {
  opacity: 0.6;
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
