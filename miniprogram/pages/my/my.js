const app = getApp();

Page({
  data: {
    userInfo: {
      username: '健身达人',
      avatar: '/images/default-avatar.png',
      level: '中级',
      joinDays: 128,
      totalSteps: 156789,
      totalDistance: 118.2,
      totalCalories: 6450
    }
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    // 每次显示页面时重新加载用户信息，以便登录后更新
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
    
    if (userInfo && userInfo.username) {
      // 如果有真实的用户信息，使用真实数据
      this.setData({
        userInfo: userInfo
      });
    } else {
      // 如果没有用户信息，使用默认数据
      this.setData({
        userInfo: {
          username: '健身达人',
          avatar: '/images/default-avatar.png',
          level: '中级',
          joinDays: 365,
          totalSteps: 156789,
          totalDistance: 118.2,
          totalCalories: 6450
        }
      });
    }
  },

  // 跳转到登录页面
  goToLogin() {
    console.log('goToLogin方法被调用');
    wx.navigateTo({
      url: '/pages/login/login',
      success: () => {
        console.log('跳转到登录页面成功');
      },
      fail: (error) => {
        console.error('跳转到登录页面失败:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 测试方法
  testJump() {
    console.log('testJump方法被调用');
    wx.showToast({
      title: '测试按钮点击成功',
      icon: 'success'
    });
  },

  // 编辑个人信息
  editProfile() {
    if (!this.data.userInfo.username) {
      return;
    }
    
    wx.navigateTo({
      url: '/pages/profile/profile'
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout();
          this.setData({
            userInfo: {}
          });
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 导航方法
  goToSportGoals() {
    wx.navigateTo({ url: '/pages/sport/goals' });
  },

  goToHealthGoals() {
    wx.navigateTo({ url: '/pages/health/goals' });
  },

  goToNotifications() {
    wx.navigateTo({ url: '/pages/settings/notifications' });
  },

  goToUnits() {
    wx.navigateTo({ url: '/pages/settings/units' });
  },

  goToPrivacy() {
    wx.navigateTo({ url: '/pages/settings/privacy' });
  },

  goToAbout() {
    wx.navigateTo({ url: '/pages/about/about' });
  },

  goToHelp() {
    wx.navigateTo({ url: '/pages/about/help' });
  },

  goToPrivacyPolicy() {
    wx.navigateTo({ url: '/pages/about/privacy-policy' });
  }
}); // my.js
