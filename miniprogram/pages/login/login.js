const { ApiService } = require('../../utils/api.js');

Page({
  data: {
    isLogin: true, // true为登录，false为注册
    loginForm: {
      username: 'aaa',
      password: '123456'
    },
    registerForm: {
      username: '',
      password: '',
      confirmPassword: ''
    },
    loading: false,
    showPassword: false,
    showConfirmPassword: false
  },

  onLoad(options) {
    // 可以从其他页面传递参数来决定显示登录还是注册
    if (options.mode === 'register') {
      this.setData({
        isLogin: false
      });
    }

    // 检查是否已经登录
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const app = getApp();
    if (app.globalData.token) {
      wx.showToast({
        title: '您已登录',
        icon: 'success'
      });
      this.navigateBack();
    }
  },

  // 切换登录/注册表单
  switchForm() {
    this.setData({
      isLogin: !this.data.isLogin,
      loginForm: { username: 'aaa', password: '123456' },
      registerForm: { username: '', password: '', confirmPassword: '' },
      showPassword: false,
      showConfirmPassword: false
    });
  },

  // 登录表单输入
  onLoginInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`loginForm.${field}`]: e.detail.value
    });
  },

  // 注册表单输入
  onRegisterInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`registerForm.${field}`]: e.detail.value
    });
  },

  // 切换密码显示
  togglePasswordVisibility() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  // 切换确认密码显示
  toggleConfirmPasswordVisibility() {
    this.setData({
      showConfirmPassword: !this.data.showConfirmPassword
    });
  },

  // 登录
  async handleLogin() {
    const { username, password } = this.data.loginForm;
    
    // 表单验证
    if (!this.validateLoginForm()) {
      return;
    }

    this.setData({ loading: true });

    try {
      console.log('🔐 开始登录:', { username, password });
      
      const api = new ApiService();
      const result = await api.user.login({ username, password });
      
      console.log('✅ 登录成功:', result);
      
      if (result.success) {
        // 保存token和用户信息
        this.saveUserData(result.data);
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });

        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          this.navigateBack();
        }, 1500);
      } else {
        throw new Error(result.message || '登录失败');
      }
    } catch (error) {
      console.error('❌ 登录错误:', error);
      wx.showToast({
        title: error.message || '登录失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 注册
  async handleRegister() {
    const { username, password, confirmPassword } = this.data.registerForm;
    
    // 表单验证
    if (!this.validateRegisterForm()) {
      return;
    }

    this.setData({ loading: true });

    try {
      console.log('📝 开始注册:', { username, password });
      
      const api = new ApiService();
      
      // 使用用户输入的用户名进行注册
      const result = await api.user.register({ 
        username, 
        password
      });
      
      console.log('✅ 注册成功:', result);
      
      if (result.success) {
        wx.showToast({
          title: '注册成功，请登录',
          icon: 'success'
        });
        
        // 切换到登录表单，并填入用户名
        this.setData({
          isLogin: true,
          loginForm: { username: 'aaa', password: '123456' },
          registerForm: { username: '', password: '', confirmPassword: '' }
        });
      } else {
        throw new Error(result.message || '注册失败');
      }
    } catch (error) {
      console.error('❌ 注册错误:', error);
      wx.showToast({
        title: error.message || '注册失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 验证登录表单
  validateLoginForm() {
    const { username, password } = this.data.loginForm;
    
    if (!username.trim()) {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none'
      });
      return false;
    }

    if (!password.trim()) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return false;
    }

    if (password.length < 6) {
      wx.showToast({
        title: '密码至少6位',
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 验证注册表单
  validateRegisterForm() {
    const { username, password, confirmPassword } = this.data.registerForm;
    
    if (!username.trim()) {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none'
      });
      return false;
    }

    if (username.length < 3) {
      wx.showToast({
        title: '用户名至少3位',
        icon: 'none'
      });
      return false;
    }

    if (!password.trim()) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return false;
    }

    if (password.length < 6) {
      wx.showToast({
        title: '密码至少6位',
        icon: 'none'
      });
      return false;
    }

    if (!confirmPassword.trim()) {
      wx.showToast({
        title: '请确认密码',
        icon: 'none'
      });
      return false;
    }

    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次密码不一致',
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 保存用户数据
  saveUserData(data) {
    const { token, userInfo } = data;
    
    // 保存到本地存储
    wx.setStorageSync('token', token);
    wx.setStorageSync('userInfo', userInfo);
    
    // 更新全局数据
    const app = getApp();
    app.globalData.token = token;
    app.globalData.userInfo = userInfo;
    
    // 设置API服务的token
    const api = new ApiService();
    api.setToken(token);
  },

  // 导航返回
  navigateBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },

  // 返回
  goBack() {
    this.navigateBack();
  },

  // 忘记密码
  handleForgotPassword() {
    wx.showToast({
      title: '请联系管理员重置密码',
      icon: 'none'
    });
  },

  // 微信登录（可选功能）
  handleWechatLogin() {
    wx.showToast({
      title: '微信登录功能开发中',
      icon: 'none'
    });
  }
}); 