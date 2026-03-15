const app = getApp();

Page({
  data: {
    faqs: [
      {
        question: '如何添加运动记录？',
        answer: '在运动页面点击"+"按钮，选择运动类型，填写相关信息后保存即可。'
      },
      {
        question: '如何设置健康目标？',
        answer: '在"我的"页面点击"健康目标"，可以设置心率、血压、睡眠等健康指标的目标值。'
      },
      {
        question: '如何查看运动统计？',
        answer: '在运动页面可以查看运动记录列表，点击记录可查看详细信息。'
      },
      {
        question: '数据会丢失吗？',
        answer: '应用会将数据保存在本地存储中，不会丢失。建议定期备份重要数据。'
      },
      {
        question: '如何修改个人信息？',
        answer: '在"我的"页面点击头像或用户名，可以进入个人资料页面进行修改。'
      },
      {
        question: '忘记密码怎么办？',
        answer: '目前支持默认用户登录，用户名：aaa，密码：123456。'
      }
    ],
    feedbackTypes: [
      { value: 'bug', name: '问题反馈', icon: '🐛' },
      { value: 'feature', name: '功能建议', icon: '💡' },
      { value: 'ui', name: '界面优化', icon: '🎨' },
      { value: 'other', name: '其他', icon: '📝' }
    ],
    selectedType: 'bug',
    feedbackContent: '',
    contactInfo: '',
    submitting: false
  },

  onLoad() {
    // 页面加载时的逻辑
  },

  // 切换FAQ展开状态
  toggleFaq(e) {
    const index = e.currentTarget.dataset.index;
    const faqs = this.data.faqs;
    faqs[index].expanded = !faqs[index].expanded;
    this.setData({ faqs });
  },

  // 选择反馈类型
  selectFeedbackType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ selectedType: type });
  },

  // 输入反馈内容
  onFeedbackInput(e) {
    this.setData({
      feedbackContent: e.detail.value
    });
  },

  // 输入联系方式
  onContactInput(e) {
    this.setData({
      contactInfo: e.detail.value
    });
  },

  // 提交反馈
  submitFeedback() {
    const { selectedType, feedbackContent, contactInfo } = this.data;
    
    if (!feedbackContent.trim()) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      });
      return;
    }

    this.setData({ submitting: true });

    // 构建反馈数据
    const feedbackData = {
      type: selectedType,
      content: feedbackContent,
      contact: contactInfo,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    // 保存到本地存储
    const feedbacks = wx.getStorageSync('userFeedbacks') || [];
    feedbacks.unshift(feedbackData);
    wx.setStorageSync('userFeedbacks', feedbacks);

    // 模拟提交到服务器
    setTimeout(() => {
      wx.showToast({
        title: '反馈提交成功',
        icon: 'success'
      });
      
      this.setData({
        feedbackContent: '',
        contactInfo: '',
        submitting: false
      });
    }, 1000);
  },

  // 清空反馈
  clearFeedback() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空反馈内容吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            feedbackContent: '',
            contactInfo: ''
          });
        }
      }
    });
  },

  // 复制邮箱
  copyEmail() {
    wx.setClipboardData({
      data: 'support@fitnessapp.com',
      success: () => {
        wx.showToast({
          title: '邮箱已复制',
          icon: 'success'
        });
      }
    });
  },

  // 拨打电话
  callPhone() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567',
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
  }
}); 