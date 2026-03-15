// app.js
const { ApiService, DataSync } = require('./utils/api.js');

App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: 'http://localhost:3000/api',
    units: 'metric', // metric or imperial
    theme: 'light', // light or dark
    isLoggedIn: false,
    apiService: null,
    eventListeners: {}
  },

  onLaunch() {
    console.log('应用启动');
    
    // 加载本地设置
    this.loadLocalSettings();
    
    // 初始化API服务（在globalData准备好后）
    this.globalData.apiService = new ApiService();
    
    // 检查登录状态
    this.checkLoginStatus();
    
    // 检查网络状态
    this.checkNetworkStatus();
  },

  onShow() {
    // 应用显示时检查登录状态
    this.checkLoginStatus();
  },

  // 加载本地设置
  loadLocalSettings() {
    try {
      const units = wx.getStorageSync('units') || 'metric';
      const theme = wx.getStorageSync('theme') || 'light';
      this.globalData.units = units;
      this.globalData.theme = theme;
    } catch (error) {
      console.error('加载本地设置失败:', error);
    }
  },

  // 检查登录状态
  async checkLoginStatus() {
    try {
      const token = wx.getStorageSync('token');
      const userInfo = wx.getStorageSync('userInfo');
      
      if (token && userInfo) {
        // 验证token是否有效
        const isValid = await this.validateToken(token);
        
        if (isValid) {
          this.globalData.token = token;
          this.globalData.userInfo = userInfo;
          this.globalData.isLoggedIn = true;
          
          // 设置API服务的token
          this.globalData.apiService.setToken(token);
          
          console.log('自动登录成功');
          
          // 同步本地数据
          this.syncLocalData();
        } else {
          // token无效，清除本地数据
          this.logout();
          console.log('token已过期，需要重新登录');
        }
      } else {
        this.globalData.isLoggedIn = false;
        console.log('未登录状态');
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      this.globalData.isLoggedIn = false;
    }
  },

  // 验证token
  async validateToken(token) {
    try {
      const result = await this.globalData.apiService.user.getProfile();
      return result.success;
    } catch (error) {
      console.error('token验证失败:', error);
      return false;
    }
  },

  // 检查网络状态
  checkNetworkStatus() {
    wx.getNetworkType({
      success: (res) => {
        const isOnline = res.networkType !== 'none';
        this.globalData.isOnline = isOnline;
        console.log('网络状态:', res.networkType);
        
        if (isOnline && this.globalData.isLoggedIn) {
          // 网络恢复时同步数据
          this.syncLocalData();
        }
      },
      fail: (error) => {
        console.error('获取网络状态失败:', error);
        this.globalData.isOnline = false;
      }
    });
  },

  // 同步本地数据
  async syncLocalData() {
    if (!this.globalData.isLoggedIn || !this.globalData.isOnline) {
      return;
    }

    try {
      const success = await DataSync.syncLocalData();
      if (success) {
        console.log('本地数据同步成功');
      }
    } catch (error) {
      console.error('本地数据同步失败:', error);
    }
  },

  // 登录
  async login(loginData) {
    try {
      const result = await this.globalData.apiService.user.login(loginData);
      
      if (result.success) {
        this.saveUserData(result.data);
        return { success: true, message: '登录成功' };
      } else {
        return { success: false, message: result.message || '登录失败' };
      }
    } catch (error) {
      console.error('登录失败:', error);
      return { success: false, message: error.message || '登录失败' };
    }
  },

  // 注册
  async register(registerData) {
    try {
      const result = await this.globalData.apiService.user.register(registerData);
      
      if (result.success) {
        this.saveUserData(result.data);
        return { success: true, message: '注册成功' };
      } else {
        return { success: false, message: result.message || '注册失败' };
      }
    } catch (error) {
      console.error('注册失败:', error);
      return { success: false, message: error.message || '注册失败' };
    }
  },

  // 保存用户数据
  saveUserData(data) {
    const { token, userInfo } = data;
    
    // 保存到本地存储
    wx.setStorageSync('token', token);
    wx.setStorageSync('userInfo', userInfo);
    
    // 更新全局数据
    this.globalData.token = token;
    this.globalData.userInfo = userInfo;
    this.globalData.isLoggedIn = true;
    
    // 设置API服务的token
    this.globalData.apiService.setToken(token);
    
    console.log('用户数据保存成功');
  },

  // 更新用户信息
  async updateUserInfo(userInfo) {
    try {
      if (!this.globalData.isLoggedIn) {
        throw new Error('未登录');
      }

      const result = await this.globalData.apiService.user.updateProfile(userInfo);
      
      if (result.success) {
        // 更新全局数据
        this.globalData.userInfo = {
          ...this.globalData.userInfo,
          ...result.data
        };
        
        // 更新本地存储
        wx.setStorageSync('userInfo', this.globalData.userInfo);
        
        return { success: true, message: '更新成功' };
      } else {
        return { success: false, message: result.message || '更新失败' };
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return { success: false, message: error.message || '更新失败' };
    }
  },

  // 获取用户信息
  async getUserInfo() {
    try {
      if (!this.globalData.isLoggedIn) {
        throw new Error('未登录');
      }
      
      const result = await this.globalData.apiService.user.getProfile();
      
      if (result.success) {
        this.globalData.userInfo = result.data;
        wx.setStorageSync('userInfo', result.data);
        return { success: true, data: result.data };
      } else {
        return { success: false, message: result.message || '获取失败' };
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return { success: false, message: error.message || '获取失败' };
    }
  },

  // 退出登录
  logout() {
    console.log('用户退出登录');
    
    // 清除全局数据
    this.globalData.token = null;
    this.globalData.userInfo = null;
    this.globalData.isLoggedIn = false;
    
    // 清除本地存储
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    
    // 清除API服务的token
    this.globalData.apiService.clearToken();
    
    // 跳转到登录页
    wx.reLaunch({
      url: '/pages/login/login'
    });
  },

  // 检查是否需要登录
  checkNeedLogin() {
    if (!this.globalData.isLoggedIn) {
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return true;
    }
    return false;
  },

  // 刷新token
  async refreshToken() {
    try {
      if (!this.globalData.token) {
        throw new Error('没有token');
      }

      const result = await this.globalData.apiService.request({
        url: '/auth/refresh',
        method: 'POST',
        data: { token: this.globalData.token }
      });

      if (result.success) {
        this.globalData.token = result.data.token;
        wx.setStorageSync('token', result.data.token);
        this.globalData.apiService.setToken(result.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('刷新token失败:', error);
      return false;
    }
  },

  // 显示错误信息
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },

  // 显示成功信息
  showSuccess(message) {
    wx.showToast({
      title: message,
      icon: 'success'
    });
  },

  // 添加事件监听器
  addEventListener(eventName, callback) {
    if (!this.globalData.eventListeners[eventName]) {
      this.globalData.eventListeners[eventName] = [];
    }
    this.globalData.eventListeners[eventName].push(callback);
  },

  // 移除事件监听器
  removeEventListener(eventName, callback) {
    if (this.globalData.eventListeners[eventName]) {
      const index = this.globalData.eventListeners[eventName].indexOf(callback);
      if (index > -1) {
        this.globalData.eventListeners[eventName].splice(index, 1);
      }
    }
  },

  // 触发事件
  triggerEvent(eventName, data) {
    if (this.globalData.eventListeners[eventName]) {
      this.globalData.eventListeners[eventName].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('事件监听器执行失败:', error);
        }
      });
    }
  }
}); 