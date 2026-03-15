const app = getApp();
Page({
  data: {
    form: {
      username: '',
      nickName: '',
      avatar: ''
    }
  },
  onLoad() {
    // 预填充用户信息
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo') || {};
    this.setData({
      form: {
        username: userInfo.username || '',
        nickName: userInfo.nickName || '',
        avatar: userInfo.avatar || ''
      }
    });
  },
  // 选择头像
  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        // 保存到本地存储
        this.setData({
          'form.avatar': tempFilePath
        });
        // 更新全局数据
        if (app.globalData.userInfo) {
          app.globalData.userInfo.avatar = tempFilePath;
        }
        wx.showToast({ title: '头像更新成功', icon: 'success' });
      },
      fail: (err) => {
        console.error('选择头像失败:', err);
        wx.showToast({ title: '选择头像失败', icon: 'error' });
      }
    });
  },
  onSubmit(e) {
    const data = e.detail.value;
    const updatedUserInfo = Object.assign({}, this.data.form, data);
    
    // 保存到本地存储
    wx.setStorageSync('userInfo', updatedUserInfo);
    
    // 更新全局数据
    if (app.globalData.userInfo) {
      app.globalData.userInfo = updatedUserInfo;
    }
    
    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      wx.navigateBack();
    }, 1000);
  }
}); 