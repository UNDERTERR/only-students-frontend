// 验证邮箱
export const isEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// 验证手机号（中国大陆）
export const isPhone = (phone: string): boolean => {
  const regex = /^1[3-9]\d{9}$/
  return regex.test(phone)
}

// 验证URL
export const isUrl = (url: string): boolean => {
  const regex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
  return regex.test(url)
}

// 验证密码强度（至少6位，包含字母和数字）
export const isStrongPassword = (password: string): boolean => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
  return regex.test(password)
}

// 验证身份证号
export const isIdCard = (idCard: string): boolean => {
  const regex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  return regex.test(idCard)
}

// 验证是否为空
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

// 验证长度
export const isLength = (value: string, min: number, max: number): boolean => {
  const length = value.length
  return length >= min && length <= max
}

// 验证是否为数字
export const isNumber = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value)
}

// 验证是否为整数
export const isInteger = (value: any): boolean => {
  return Number.isInteger(Number(value))
}
