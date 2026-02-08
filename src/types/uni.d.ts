// Uni-app 全局类型声明
declare const uni: {
  request(options: any): void
  uploadFile(options: any): void
  showLoading(options: any): void
  hideLoading(): void
  showToast(options: any): void
  getStorageSync(key: string): any
  setStorageSync(key: string, value: any): void
  removeStorageSync(key: string): void
  getSystemInfoSync(): any
  navigateTo(options: any): void
  switchTab(options: any): void
  navigateBack(): void
  pageScrollTo(options: any): void
}
