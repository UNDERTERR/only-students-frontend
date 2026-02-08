# OnlyStudents 前端项目

高校生学习笔记订阅平台 - 前端用户端

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev:h5
```
访问 http://localhost:5173/

### 构建生产环境
```bash
# H5
npm run build:h5

# 微信小程序
npm run build:mp-weixin
```

## 📁 项目结构

```
src/
├── api/          # API 接口封装
├── components/   # 公共组件
├── config/       # 配置文件
├── pages/        # 页面文件
├── stores/       # Pinia 状态管理
├── styles/       # 全局样式
├── types/        # TypeScript 类型
└── utils/        # 工具函数
```

## 📱 主要功能

- ✅ 用户认证（登录/注册）
- ✅ 笔记浏览（瀑布流）
- ✅ 笔记详情（评分、评论、分享）
- ✅ 发布笔记（支持付费）
- ✅ 订阅创作者
- ✅ 个人中心（钱包、订单、收藏）
- ✅ 消息通知
- ✅ 搜索功能

## 📖 文档
- [项目复盘报告](./PROJECT_REVIEW.md)

## 🔧 技术栈

- Vue 3
- TypeScript
- uni-app
- Pinia
- Axios

## ⚠️ 注意事项

1. 确保后端服务在 `localhost:8080` 运行
2. 编辑资料功能仅本地保存（后端接口待完善）
3. 支付功能需要接入真实 SDK

## 📝 License

MIT
