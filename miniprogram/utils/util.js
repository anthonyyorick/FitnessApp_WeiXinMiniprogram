/**
 * 格式化时间
 * @param {Date} date 日期对象
 * @param {string} format 格式化字符串
 * @returns {string} 格式化后的时间字符串
 */
const formatTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return format
    .replace('YYYY', year)
    .replace('MM', month.toString().padStart(2, '0'))
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('HH', hour.toString().padStart(2, '0'))
    .replace('mm', minute.toString().padStart(2, '0'))
    .replace('ss', second.toString().padStart(2, '0'))
}

/**
 * 显示成功提示
 * @param {string} title 提示内容
 */
const showSuccess = (title) => {
  wx.showToast({
    title,
    icon: 'success',
    duration: 2000
  })
}

/**
 * 显示错误提示
 * @param {string} title 提示内容
 */
const showError = (title) => {
  wx.showToast({
    title,
    icon: 'none',
    duration: 2000
  })
}

/**
 * 显示加载提示
 * @param {string} title 提示内容
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  })
}

/**
 * 隐藏加载提示
 */
const hideLoading = () => {
  wx.hideLoading()
}

/**
 * 显示确认对话框
 * @param {string} title 标题
 * @param {string} content 内容
 * @returns {Promise} Promise对象
 */
const showConfirm = (title, content) => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
}

/**
 * 网络请求封装
 * @param {Object} options 请求配置
 * @returns {Promise} Promise对象
 */
const request = (options) => {
  const app = getApp()
  const baseUrl = app.globalData.baseUrl || 'http://localhost:3000/api'
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': app.globalData.token ? `Bearer ${app.globalData.token}` : '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      },
      fail: reject
    })
  })
}

/**
 * 计算BMI
 * @param {number} weight 体重(kg)
 * @param {number} height 身高(cm)
 * @returns {number} BMI值
 */
const calculateBMI = (weight, height) => {
  if (!weight || !height) return 0
  const heightInMeters = height / 100
  return (weight / (heightInMeters * heightInMeters)).toFixed(1)
}

/**
 * 计算卡路里消耗
 * @param {string} type 运动类型
 * @param {number} duration 运动时长(分钟)
 * @param {number} weight 体重(kg)
 * @returns {number} 卡路里消耗
 */
const calculateCalories = (type, duration, weight) => {
  const caloriesPerMinute = {
    running: 10,
    walking: 4,
    cycling: 8
  }
  const rate = caloriesPerMinute[type] || 5
  return Math.round(rate * duration * (weight / 60))
}

module.exports = {
  formatTime,
  showSuccess,
  showError,
  showLoading,
  hideLoading,
  showConfirm,
  request,
  calculateBMI,
  calculateCalories
} 