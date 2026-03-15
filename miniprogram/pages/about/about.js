const app = getApp();

Page({
  data: {
    appInfo: {
      name: '运动健康',
      version: '1.0.0',
      description: '专业的运动健康管理应用，帮助用户记录运动数据、监测健康状况、制定健身计划。',
      features: [
        '运动记录与统计',
        '健康数据监测',
        '目标设定与追踪',
        '课程推荐',
        '数据可视化'
      ],
      contact: {
        email: 'support@fitnessapp.com',
        website: 'www.fitnessapp.com',
        phone: '400-123-4567'
      }
    },
    teamInfo: [
      {
        name: '开发团队',
        description: '致力于为用户提供最好的运动健康管理体验',
        members: [
          { name: '前端开发', role: '界面开发' },
          { name: '后端开发', role: '服务端开发' },
        ]
      }
    ]
  },

  onLoad() {
    // 页面加载时的逻辑
  },

  // 复制邮箱
  copyEmail() {
    wx.setClipboardData({
      data: this.data.appInfo.contact.email,
      success: () => {
        wx.showToast({
          title: '邮箱已复制',
          icon: 'success'
        });
      }
    });
  },

  // 复制网站
  copyWebsite() {
    wx.setClipboardData({
      data: this.data.appInfo.contact.website,
      success: () => {
        wx.showToast({
          title: '网站已复制',
          icon: 'success'
        });
      }
    });
  },

  // 拨打电话
  callPhone() {
    wx.makePhoneCall({
      phoneNumber: this.data.appInfo.contact.phone,
      success: () => {
        console.log('拨打电话成功');
      },
      fail: (err) => {
        console.log('拨打电话失败:', err);
        wx.showToast({
          title: '拨打电话失败',
          icon: 'none'
        });
      }
    });
  },

  // 分享应用
  onShareAppMessage() {
    return {
      title: '运动健康 - 专业的运动健康管理应用',
      path: '/pages/index/index',
      imageUrl: '/images/share-image.png'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '运动健康 - 专业的运动健康管理应用',
      imageUrl: '/images/share-image.png'
    };
  }
}); 