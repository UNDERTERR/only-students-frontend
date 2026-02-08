# OnlyStudents 前端 API 集成文档

## 🎉 最新更新

### 新增功能
- ✅ 评论系统（评论列表、发表评论、点赞评论）
- ✅ 评分系统（1-5星评分）
- ✅ 分享功能（生成分享码）
- ✅ 举报功能（举报笔记/评论/用户）
- ✅ 提现列表页面
- ✅ 完善笔记详情页（集成评论、评分、分享）
- ✅ 修复API路径问题

---

## 🚀 项目架构

### API层 (`src/api/`)
```
api/
├── axios.ts           # axios实例配置
├── request.ts         # 请求方法导出
├── index.ts           # API统一导出
├── user.ts            # 用户认证API
├── note.ts            # 笔记、收藏、评分、分享、评论、举报API
├── search.ts          # 搜索API
└── message.ts         # 消息、通知、订阅、钱包、支付、提现API
```

### 页面结构 (`src/pages/`)
```
pages/
├── index/index.vue           # 首页（瀑布流笔记）
├── auth/
│   ├── login.vue            # 登录
│   └── register.vue         # 注册
├── note/
│   ├── detail.vue           # 笔记详情（含评论、评分、分享）
│   └── publish.vue          # 发布笔记
├── discover/index.vue       # 发现页
├── message/index.vue        # 消息列表
├── user/
│   ├── index.vue            # 个人中心
│   ├── edit-profile.vue     # 编辑资料
│   ├── my-notes.vue         # 我的笔记
│   ├── my-favorites.vue     # 我的收藏
│   ├── my-subscriptions.vue # 我的订阅
│   ├── my-subscribers.vue   # 我的粉丝
│   ├── my-orders.vue        # 我的订单
│   ├── transactions.vue     # 交易明细/提现记录
│   ├── withdraw.vue         # 提现申请
│   ├── creator-settings.vue # 创作者设置
│   ├── profile.vue          # 创作者主页
│   └── settings.vue         # 设置
└── report/
    └── submit.vue           # 举报页面
```

---

## 📡 完整API列表

### 1. 用户认证 (`userApi`)
```typescript
// 注册
POST /user/register
await userApi.register({ username, password, nickname, ... })

// 登录
POST /user/login
await userApi.login({ username, password })

// 获取当前用户信息
GET /user/info
await userApi.getCurrentUser()

// 获取指定用户信息
GET /user/{userId}
await userApi.getUserById(userId)

// 登出
POST /user/logout
await userApi.logout()

// 登出所有设备
POST /user/logout-all
await userApi.logoutAll()
```

### 2. 笔记管理 (`noteApi`)
```typescript
// 创建笔记
POST /note
await noteApi.create(data)

// 获取笔记详情
GET /note/{noteId}
await noteApi.getById(noteId)

// 更新笔记
PUT /note/{noteId}
await noteApi.update(noteId, data)

// 删除笔记
DELETE /note/{noteId}
await noteApi.delete(noteId)

// 发布笔记
POST /note/{noteId}/publish
await noteApi.publish(noteId)

// 获取热门笔记
GET /note/hot
await noteApi.getHot(limit)

// 获取最新笔记
GET /note/latest
await noteApi.getLatest(limit)

// 获取用户笔记列表
GET /note/user/{userId}
await noteApi.getByUserId(userId)

// 获取我的笔记
GET /note/my-notes
await noteApi.getMyNotes()
```

### 3. 收藏管理 (`favoriteApi`)
```typescript
// 收藏笔记
POST /favorite/{noteId}
await favoriteApi.add(noteId)

// 取消收藏
DELETE /favorite/{noteId}
await favoriteApi.remove(noteId)

// 检查是否已收藏
GET /favorite/check/{noteId}
await favoriteApi.check(noteId)

// 获取笔记收藏数
GET /favorite/count/{noteId}
await favoriteApi.count(noteId)

// 获取我的收藏列表
GET /favorite/my
await favoriteApi.getMyFavorites()
```

### 4. 评分管理 (`ratingApi`)
```typescript
// 评分笔记（score: 1-5）
POST /rating/{noteId}
await ratingApi.rate(noteId, score)

// 获取笔记平均评分
GET /rating/average/{noteId}
await ratingApi.getAverage(noteId)

// 获取笔记评分人数
GET /rating/count/{noteId}
await ratingApi.getCount(noteId)

// 获取我对笔记的评分
GET /rating/my/{noteId}
await ratingApi.getMyRating(noteId)

// 获取我的所有评分
GET /rating/my
await ratingApi.getMyRatings()
```

### 5. 分享管理 (`shareApi`)
```typescript
// 创建分享
POST /share/{noteId}
await shareApi.create(noteId)

// 根据分享码获取分享信息
GET /share/code/{shareCode}
await shareApi.getByCode(shareCode)

// 记录分享点击
POST /share/click/{shareCode}
await shareApi.click(shareCode)

// 获取笔记分享数
GET /share/count/{noteId}
await shareApi.getCount(noteId)

// 获取我的分享列表
GET /share/my
await shareApi.getMyShares()
```

### 6. 评论管理 (`commentApi`)
```typescript
// 发表评论
POST /comment
await commentApi.create(noteId, content, parentId)

// 删除评论
DELETE /comment/{commentId}
await commentApi.delete(commentId)

// 获取笔记评论列表
GET /comment/note/{noteId}
await commentApi.getByNoteId(noteId, page, size)

// 点赞评论
POST /comment/{commentId}/like
await commentApi.likeComment(commentId)

// 取消点赞评论
DELETE /comment/{commentId}/like
await commentApi.unlikeComment(commentId)

// 获取评论数量
GET /comment/count/{noteId}
await commentApi.getCount(noteId)
```

### 7. 举报管理 (`reportApi`)
```typescript
// 提交举报
targetType: 1-笔记, 2-评论, 3-用户
POST /report/submit
await reportApi.submit(targetType, targetId, reason, description)

// 获取我的举报列表
GET /report/my
await reportApi.getMyReports()
```

### 8. 订阅管理 (`subscriptionApi`)
```typescript
// 订阅创作者
POST /subscription
await subscriptionApi.subscribe(creatorId)

// 取消订阅
DELETE /subscription/{creatorId}
await subscriptionApi.unsubscribe(creatorId)

// 获取我的订阅列表
GET /subscription/my-subscriptions
await subscriptionApi.getMySubscriptions()

// 获取我的粉丝列表
GET /subscription/my-subscribers
await subscriptionApi.getMySubscribers()

// 获取粉丝数量
GET /subscription/subscriber-count/{creatorId}
await subscriptionApi.getSubscriberCount(creatorId)

// 检查是否已订阅
GET /subscription/check/{creatorId}
await subscriptionApi.checkSubscription(creatorId)

// 更新订阅配置（创作者）
PUT /subscription/config
await subscriptionApi.updateConfig({ price, period, description })

// 获取创作者订阅配置
GET /subscription/config/{creatorId}
await subscriptionApi.getConfig(creatorId)
```

### 9. 消息管理 (`messageApi`)
```typescript
// 获取会话列表
GET /message/conversations
await messageApi.getConversations()

// 获取消息历史
GET /message/history/{conversationId}
await messageApi.getHistory(conversationId, page, size)

// 发送消息
POST /message/send
await messageApi.send(receiverId, content, type)

// 标记消息已读
POST /message/read/{messageId}
await messageApi.markAsRead(messageId)

// 删除会话
DELETE /message/conversation/{conversationId}
await messageApi.deleteConversation(conversationId)
```

### 10. 通知管理 (`notificationApi`)
```typescript
// 获取通知列表
GET /notification/list
await notificationApi.getList(page, size, isRead)

// 获取未读通知数量
GET /notification/unread-count
await notificationApi.getUnreadCount()

// 标记单条已读
POST /notification/read/{notificationId}
await notificationApi.markAsRead(notificationId)

// 标记全部已读
POST /notification/read-all
await notificationApi.markAllAsRead()

// 删除通知
DELETE /notification/{notificationId}
await notificationApi.deleteNotification(notificationId)

// 订阅SSE实时通知
GET /notification/sse/subscribe
notificationApi.subscribeSSE()
```

### 11. 搜索管理 (`searchApi`)
```typescript
// 搜索笔记
GET /search/notes
await searchApi.searchNotes(params)

// 搜索用户
GET /search/users
await searchApi.searchUsers(params)

// 按标签搜索笔记
GET /search/notes/by-tag
await searchApi.searchByTag(tag, page, size)

// 获取热门搜索关键词
GET /search/hot-keywords
await searchApi.getHotKeywords(limit)

// 获取搜索建议
GET /search/suggestions
await searchApi.getSuggestions(prefix, limit)
```

### 12. 支付管理 (`paymentApi`)
```typescript
// 创建订单
targetType: 1-笔记, 2-订阅
POST /payment/order
await paymentApi.createOrder(targetType, targetId, amount, payChannel)

// 查询订单详情
GET /payment/order/{orderNo}
await paymentApi.getOrderByNo(orderNo)

// 获取我的订单
GET /payment/my-orders
await paymentApi.getMyOrders()

// 支付回调（第三方调用，前端无需调用）
POST /payment/callback
```

### 13. 钱包管理 (`walletApi`)
```typescript
// 获取钱包信息
GET /payment/wallet
await walletApi.getWallet()
```

### 14. 提现管理 (`withdrawalApi`)
```typescript
// 申请提现
POST /withdrawal/apply
await withdrawalApi.apply(amount, accountInfo)

// 获取提现列表
GET /withdrawal/list
await withdrawalApi.getList(page, size)

// 获取提现详情
GET /withdrawal/{applicationId}
await withdrawalApi.getDetail(applicationId)

// 取消提现申请
DELETE /withdrawal/{applicationId}
await withdrawalApi.cancel(applicationId)
```

---

## 🔐 认证说明

### 需要认证的接口（Header中需包含X-User-Id）
- 所有 POST/PUT/DELETE 请求（除了注册登录）
- 获取个人相关数据（我的笔记、我的收藏、我的订单等）
- 修改操作（点赞、收藏、评论、订阅等）

### 无需认证的接口
- 注册/登录
- 获取公开笔记列表
- 搜索
- 获取热门关键词

---

## 📝 使用示例

### 在页面中调用API
```typescript
import { noteApi, favoriteApi, commentApi } from '@/api'

// 获取笔记详情
const note = await noteApi.getById(123)

// 收藏笔记
await favoriteApi.add(123)

// 发表评论
await commentApi.create(123, '这条笔记很有用！')

// 获取评论列表
const comments = await commentApi.getByNoteId(123, 1, 20)
```

### 使用Store
```typescript
import { useNoteStore } from '@/stores/note'
import { useUserStore } from '@/stores/user'

const noteStore = useNoteStore()
const userStore = useUserStore()

// 获取笔记列表
await noteStore.fetchNotes()

// 检查登录状态
if (userStore.isLoggedIn) {
  // 执行需要登录的操作
}
```

---

## ⚠️ 已知问题
//TODO
1. **编辑资料功能**：后端没有提供更新用户信息的PUT接口，目前仅保存到本地
2. **交易明细**：后端没有提供钱包交易记录接口，提现页面只显示提现记录
3. **后端API路径修复**：
   - 订阅：`/subscription` (POST), `/subscription/{id}` (DELETE)
   - 收藏：`/favorite/{noteId}` (POST/DELETE)
   - 点赞：后端没有单独接口，通过评分实现

---

## 🚀 启动命令

```bash
# H5开发
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# 打包H5
npm run build:h5

# 打包小程序
npm run build:mp-weixin
```

---

## 📊 页面功能对照

| 页面 | 功能 | API调用 |
|------|------|---------|
| 首页 | 瀑布流笔记 | GET /note/latest |
| 登录 | 用户登录 | POST /user/login |
| 注册 | 用户注册 | POST /user/register |
| 笔记详情 | 查看详情、收藏、评分、评论、分享 | GET /note/{id}, POST /favorite, POST /rating, POST /comment, POST /share |
| 发布笔记 | 发布新笔记 | POST /note |
| 个人中心 | 用户信息、钱包、统计 | GET /user/info, GET /payment/wallet, GET /note/my-notes, GET /subscription/my-subscribers, GET /subscription/my-subscriptions |
| 我的收藏 | 收藏列表 | GET /favorite/my |
| 我的订阅 | 订阅列表 | GET /subscription/my-subscriptions |
| 我的粉丝 | 粉丝列表 | GET /subscription/my-subscribers |
| 我的订单 | 订单列表 | GET /payment/my-orders |
| 提现记录 | 提现列表 | GET /withdrawal/list |
| 创作者主页 | 查看其他用户 | GET /user/{id}, GET /note/user/{id}, POST /subscription |
| 举报 | 举报内容 | POST /report/submit |
| 消息 | 消息列表 | GET /message/conversations |
| 设置 | 主题切换、通知设置 | 本地存储 |

---

## ✅ 已完成功能清单

### 1. 基础架构
- [x] Vue3 + TypeScript 项目搭建
- [x] Axios 请求封装（拦截器、错误处理）
- [x] Pinia 状态管理（用户、笔记、主题）
- [x] 路由配置（pages.json）
- [x] 主题系统（白天/夜间模式切换）
- [x] CSS 变量设计系统

### 2. 用户认证模块
- [x] 登录页面（/pages/auth/login）
- [x] 注册页面（/pages/auth/register）
- [x] Token 自动管理
- [x] 登录状态持久化
- [x] 用户登出

### 3. 笔记管理模块
- [x] 首页瀑布流（/pages/index/index）
- [x] 笔记详情页（/pages/note/detail）
  - [x] 评分系统（1-5星）
  - [x] 评论列表（分页加载）
  - [x] 发表评论
  - [x] 分享功能
  - [x] 举报入口
- [x] 发布笔记（/pages/note/publish）
  - [x] 支持付费设置
  - [x] 分类选择
  - [x] 标签添加

### 4. 用户中心模块
- [x] 个人中心（/pages/user/index）
  - [x] 用户信息展示
  - [x] 钱包余额
  - [x] 统计数据（笔记、粉丝、关注）
- [x] 编辑资料（/pages/user/edit-profile）
- [x] 我的笔记（/pages/user/my-notes）
- [x] 我的收藏（/pages/user/my-favorites）
- [x] 我的订阅（/pages/user/my-subscriptions）
- [x] 我的粉丝（/pages/user/my-subscribers）
- [x] 我的订单（/pages/user/my-orders）
- [x] 提现记录（/pages/user/transactions）
- [x] 申请提现（/pages/user/withdraw）
- [x] 创作者设置（/pages/user/creator-settings）
- [x] 创作者主页（/pages/user/profile）
- [x] 设置页面（/pages/user/settings）

### 5. 互动功能模块
- [x] 发现页（/pages/discover/index）
- [x] 消息页（/pages/message/index）
- [x] 举报页面（/pages/report/submit）

### 6. API 集成
- [x] 用户认证 API（6个接口）
- [x] 笔记管理 API（9个接口）
- [x] 收藏管理 API（5个接口）
- [x] 评分管理 API（5个接口）
- [x] 分享管理 API（5个接口）
- [x] 评论管理 API（6个接口）
- [x] 举报管理 API（2个接口）
- [x] 订阅管理 API（7个接口）
- [x] 消息管理 API（5个接口）
- [x] 通知管理 API（6个接口）
- [x] 搜索管理 API（5个接口）
- [x] 支付管理 API（3个接口）
- [x] 钱包管理 API（1个接口）
- [x] 提现管理 API（4个接口）

### 7. 工具函数
- [x] 日期格式化
- [x] 相对时间计算
- [x] 数字格式化（k, w）
- [x] 防抖/节流
- [x] 本地存储封装
- [x] 验证函数

## 📝 项目结构

```
only-students-frontend/
├── src/
│   ├── api/              # API 接口封装
│   │   ├── axios.ts      # axios 实例
│   │   ├── note.ts       # 笔记相关 API
│   │   ├── user.ts       # 用户相关 API
│   │   ├── message.ts    # 消息、订阅、支付 API
│   │   ├── search.ts     # 搜索 API
│   │   └── index.ts      # 统一导出
│   ├── components/       # 公共组件
│   │   ├── NavBar.vue
│   │   ├── TabBar.vue
│   │   ├── Waterfall.vue
│   │   └── NoteCard.vue
│   ├── config/           # 配置文件
│   │   └── api.config.ts
│   ├── pages/            # 页面文件
│   │   ├── index/        # 首页
│   │   ├── auth/         # 登录注册
│   │   ├── note/         # 笔记相关
│   │   ├── discover/     # 发现页
│   │   ├── message/      # 消息页
│   │   ├── user/         # 用户中心
│   │   └── report/       # 举报页
│   ├── stores/           # Pinia Store
│   │   ├── user.ts
│   │   ├── note.ts
│   │   └── theme.ts
│   ├── styles/           # 全局样式
│   │   └── theme.css
│   ├── types/            # TypeScript 类型
│   │   ├── api.types.ts
│   │   └── uni.d.ts
│   ├── utils/            # 工具函数
│   │   ├── index.ts
│   │   ├── storage.ts
│   │   └── validate.ts
│   ├── App.vue           # 应用入口
│   ├── main.ts           # 主入口
│   ├── pages.json        # 页面配置
│   └── manifest.json     # 应用配置
├── src/static/           # 静态资源
│   └── logo.png
├── API_DOCUMENTATION.md  # API 文档
├── PROJECT_REVIEW.md     # 本文件
└── package.json
```



## 🎯 下一步建议

### P0 - 必须完成
1. 接入真实支付 SDK（微信支付/支付宝）
2. 实现文件上传功能（头像、封面图）
3. 后端补充缺失的 API 接口

### P1 - 重要优化
1. SSE 实时通知推送
2. 图片懒加载和预加载
3. 性能优化（分包加载、资源压缩）
4. 添加骨架屏loading状态

### P2 - 体验优化
1. 页面转场动画
2. 下拉刷新动画
3. 空状态插图设计
4. 错误重试机制

### P3 - 功能扩展
1. 笔记搜索高亮
2. 评论支持图片
3. 笔记草稿箱
4. 数据导出功能

---