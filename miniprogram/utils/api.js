class ApiService {
  constructor() {
    this.baseUrl = 'http://localhost:3000/api';
    this.token = null;
  }

  // 懒加载方式获取应用实例
  getAppInstance() {
    try {
      return getApp();
    } catch (error) {
      console.warn('无法获取应用实例:', error);
      return null;
    }
  }

  // 从应用实例获取配置
  getAppConfig() {
    const app = this.getAppInstance();
    if (app && app.globalData) {
      return {
        baseUrl: app.globalData.baseUrl || this.baseUrl,
        token: app.globalData.token || null
      };
    }
    return {
      baseUrl: this.baseUrl,
      token: this.token
    };
  }

  // 设置token
  setToken(token) {
    this.token = token;
    const app = this.getAppInstance();
    if (app && app.globalData) {
      app.globalData.token = token;
    }
  }

  // 清除token
  clearToken() {
    this.token = null;
    const app = this.getAppInstance();
    if (app && app.globalData) {
      app.globalData.token = null;
    }
  }

  // 获取当前配置
  getCurrentConfig() {
    const config = this.getAppConfig();
    return {
      baseUrl: config.baseUrl,
      token: config.token || this.token
    };
  }

  // 通用请求方法
  async request(options) {
    const { url, method = 'GET', data, headers = {}, skipAuth = false } = options;
    
    // 获取当前配置
    const config = this.getCurrentConfig();

    // 构建请求头
    const requestHeaders = { ...headers };

    // 添加认证头（除非明确跳过）
    if (config.token && !skipAuth) {
      requestHeaders['Authorization'] = `Bearer ${config.token}`;
    }

    // 添加内容类型
    if (method !== 'GET') {
      requestHeaders['Content-Type'] = 'application/json';
    }

    console.log('🌐 发送请求:', {
      url: `${config.baseUrl}${url}`,
      method,
      data,
      skipAuth,
      hasToken: !!config.token
    });

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${config.baseUrl}${url}`,
        method,
        data,
        header: requestHeaders,
        success: (res) => {
          console.log('📡 响应状态:', res.statusCode, '响应数据:', res.data);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else if (res.statusCode === 401) {
            // 检查是否是业务逻辑错误（如用户名密码错误）
            if (res.data && res.data.message && 
                (res.data.message.includes('用户名或密码错误') || 
                 res.data.message.includes('用户名已存在'))) {
              // 这是业务逻辑错误，直接返回错误信息
              reject(new Error(res.data.message));
            } else {
              // 这是真正的认证错误
              this.clearToken();
              wx.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none'
              });
              setTimeout(() => {
                wx.navigateTo({
                  url: '/pages/login/login'
                });
              }, 1500);
              reject(new Error('未授权'));
            }
          } else {
            const errorMessage = res.data && res.data.message ? res.data.message : '请求失败';
            reject(new Error(errorMessage));
          }
        },
        fail: (err) => {
          console.error('❌ 网络请求失败:', err);
          reject(new Error('网络连接失败'));
        }
      });
    });
  }

  // 运动记录相关API
  sport = {
    // 创建运动记录
    create: (data) => this.request({
      url: '/sport/record',
      method: 'POST',
      data
    }),

    // 获取运动记录列表
    getList: (params = {}) => this.request({
      url: '/sport/records',
      method: 'GET',
      data: params
    }),

    // 获取运动统计
    getStats: (params = {}) => this.request({
      url: '/sport/stats',
      method: 'GET',
      data: params
    }),

    // 获取运动详情
    getDetail: (id) => this.request({
      url: `/sport/detail/${id}`,
      method: 'GET'
    }),

    // 更新运动记录
    update: (id, data) => this.request({
      url: `/sport/record/${id}`,
      method: 'PUT',
      data
    }),

    // 删除运动记录
    delete: (id) => this.request({
      url: `/sport/record/${id}`,
      method: 'DELETE'
    })
  };

  // 健康数据相关API
  health = {
    // 创建健康记录
    create: (data) => this.request({
      url: '/health/record',
      method: 'POST',
      data
    }),

    // 获取健康记录列表
    getList: (params = {}) => this.request({
      url: '/health/records',
      method: 'GET',
      data: params
    }),

    // 获取健康统计
    getStats: (params = {}) => this.request({
      url: '/health/stats',
      method: 'GET',
      data: params
    }),

    // 获取健康详情
    getDetail: (id) => this.request({
      url: `/health/detail/${id}`,
      method: 'GET'
    }),

    // 更新健康记录
    update: (id, data) => this.request({
      url: `/health/record/${id}`,
      method: 'PUT',
      data
    }),

    // 删除健康记录
    delete: (id) => this.request({
      url: `/health/record/${id}`,
      method: 'DELETE'
    })
  };

  // 用户相关API
  user = {
    // 用户登录
    login: (data) => {
      // 如果是默认用户，直接返回成功
      if (data.username === 'aaa' && data.password === '123456') {
        return Promise.resolve({
          success: true,
          message: '登录成功',
          data: {
            token: 'default_token_' + Date.now(),
            userInfo: {
              _id: 'default_user_id',
              username: 'aaa',
              nickName: 'aaa',
              email: '',
              phone: '',
              avatar: '',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
        });
      }
      
      // 其他用户走正常API流程
      return this.request({
        url: '/auth/login',
        method: 'POST',
        data,
        skipAuth: true
      });
    },

    // 用户注册
    register: (data) => this.request({
      url: '/auth/register',
      method: 'POST',
      data,
      skipAuth: true
    }),

    // 获取用户信息
    getProfile: () => this.request({
      url: '/user/profile',
      method: 'GET'
    }),

    // 更新用户信息
    updateProfile: (data) => this.request({
      url: '/user/profile',
      method: 'PUT',
      data
    }),

    // 修改密码
    changePassword: (data) => this.request({
      url: '/user/password',
      method: 'PUT',
      data
    })
  };

  // 课程相关API
  course = {
    // 获取课程列表
    getList: (params = {}) => this.request({
      url: '/course/list',
      method: 'GET',
      data: params
    }),

    // 获取课程详情
    getDetail: (id) => this.request({
      url: `/course/detail/${id}`,
      method: 'GET'
    }),

    // 获取用户收藏的课程
    getFavorites: () => this.request({
      url: '/course/favorites',
      method: 'GET'
    }),

    // 收藏/取消收藏课程
    toggleFavorite: (courseId) => this.request({
      url: `/course/favorite/${courseId}`,
      method: 'POST'
    })
  };
}

// 本地存储管理
class LocalStorage {
  // 运动记录
  static sport = {
    // 保存运动记录
    saveRecord: (record) => {
      try {
        let records = wx.getStorageSync('localSportRecords') || [];
        records.unshift({
          id: Date.now(),
          ...record,
          createdAt: new Date().toISOString()
        });
        
        // 限制数量
        if (records.length > 100) {
          records = records.slice(0, 100);
        }
        
        wx.setStorageSync('localSportRecords', records);
        
        // 触发运动记录更新事件
        const app = getApp();
        if (app && app.triggerEvent) {
          app.triggerEvent('sportRecordUpdated', { record });
        }
        
        return true;
      } catch (error) {
        console.error('保存运动记录失败:', error);
        return false;
      }
    },

    // 获取运动记录
    getRecords: () => {
      try {
        return wx.getStorageSync('localSportRecords') || [];
      } catch (error) {
        console.error('获取运动记录失败:', error);
        return [];
      }
    },

    // 删除运动记录
    deleteRecord: (id) => {
      try {
        let records = wx.getStorageSync('localSportRecords') || [];
        records = records.filter(record => record.id !== id);
        wx.setStorageSync('localSportRecords', records);
        return true;
      } catch (error) {
        console.error('删除运动记录失败:', error);
        return false;
      }
    },

    // 清空运动记录
    clearRecords: () => {
      try {
        wx.removeStorageSync('localSportRecords');
        return true;
      } catch (error) {
        console.error('清空运动记录失败:', error);
        return false;
      }
    }
  };

  // 健康记录
  static health = {
    // 保存健康记录
    saveRecord: (record) => {
      try {
        let records = wx.getStorageSync('localHealthRecords') || [];
        records.unshift({
          id: Date.now(),
          ...record,
          createdAt: new Date().toISOString()
        });
        
        if (records.length > 100) {
          records = records.slice(0, 100);
        }
        
        wx.setStorageSync('localHealthRecords', records);
        return true;
      } catch (error) {
        console.error('保存健康记录失败:', error);
        return false;
      }
    },

    // 获取健康记录
    getRecords: () => {
      try {
        return wx.getStorageSync('localHealthRecords') || [];
      } catch (error) {
        console.error('获取健康记录失败:', error);
        return [];
      }
    },

    // 删除健康记录
    deleteRecord: (id) => {
      try {
        let records = wx.getStorageSync('localHealthRecords') || [];
        records = records.filter(record => record.id !== id);
        wx.setStorageSync('localHealthRecords', records);
        return true;
      } catch (error) {
        console.error('删除健康记录失败:', error);
        return false;
      }
    }
  };

  // 用户设置
  static settings = {
    // 保存设置
    save: (settings) => {
      try {
        wx.setStorageSync('userSettings', settings);
        return true;
      } catch (error) {
        console.error('保存设置失败:', error);
        return false;
      }
    },

    // 获取设置
    get: () => {
      try {
        return wx.getStorageSync('userSettings') || {};
      } catch (error) {
        console.error('获取设置失败:', error);
        return {};
      }
    }
  };
}

// 数据同步工具
class DataSync {
  // 同步本地数据到服务器
  static async syncLocalData() {
    if (!app.globalData.token) {
      return false;
    }

    const api = new ApiService();
    
    try {
      // 同步运动记录
      const localSportRecords = LocalStorage.sport.getRecords();
      for (const record of localSportRecords) {
        if (!record.synced) {
          try {
            await api.sport.create(record);
            record.synced = true;
          } catch (error) {
            console.error('同步运动记录失败:', error);
          }
        }
      }
      
      // 同步健康记录
      const localHealthRecords = LocalStorage.health.getRecords();
      for (const record of localHealthRecords) {
        if (!record.synced) {
          try {
            await api.health.create(record);
            record.synced = true;
          } catch (error) {
            console.error('同步健康记录失败:', error);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('数据同步失败:', error);
      return false;
    }
  }

  // 检查网络状态
  static checkNetwork() {
    return new Promise((resolve) => {
      wx.getNetworkType({
        success: (res) => {
          resolve(res.networkType !== 'none');
        },
        fail: () => {
          resolve(false);
        }
      });
    });
  }
}

module.exports = {
  ApiService,
  LocalStorage,
  DataSync
}; 