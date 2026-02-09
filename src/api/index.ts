// api/index.js
export * from './user'
export * from './search'
export * from './file'
// 单独导出各个API模块
export { noteApi, favoriteApi, ratingApi, shareApi, commentApi, reportApi } from './note'
export { messageApi, notificationApi, subscriptionApi, walletApi, paymentApi, withdrawalApi } from './message'
// 基础方法
export { request, get, post, put, del } from './axios'
export { default as instance } from './axios'