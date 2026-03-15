const app = getApp();

Page({
  data: {
    healthTypes: ['心率', '血压', '睡眠', '体重'],
    healthTypeIndex: 0,
    form: {
      heartRate: '',
      bloodPressure: '',
      sleep: '',
      weight: '',
      notes: ''
    },
    recordDate: '',
    recordTime: '',
    submitting: false
  },

  onLoad() {
    // 设置默认时间为当前时间
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5);
    
    this.setData({
      recordDate: dateStr,
      recordTime: timeStr
    });
  },

  // 选择健康指标类型
  selectHealthType(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      healthTypeIndex: index
    });
  },

  // 输入处理
  onInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({
      [`form.${field}`]: value
    });
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      recordDate: e.detail.value
    });
  },

  // 时间选择
  onTimeChange(e) {
    this.setData({
      recordTime: e.detail.value
    });
  },

  // 快捷输入
  quickInput(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      'form.heartRate': value
    });
  },

  // 重置表单
  resetForm() {
    wx.showModal({
      title: '确认重置',
      content: '确定要清空所有输入的内容吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            form: {
              heartRate: '',
              bloodPressure: '',
              sleep: '',
              weight: '',
              notes: ''
            }
          });
        }
      }
    });
  },

  // 提交表单
  submitForm() {
    const { healthTypeIndex, form, recordDate, recordTime } = this.data;
    
    // 数据验证
    const currentType = this.data.healthTypes[healthTypeIndex];
    let value = '';
    
    switch (currentType) {
      case '心率':
        value = form.heartRate;
        const heartRateNum = parseFloat(value);
        if (!value || isNaN(heartRateNum) || heartRateNum < 40 || heartRateNum > 200) {
          wx.showToast({
            title: '请输入有效心率(40-200)',
            icon: 'none'
          });
          return;
        }
        value = heartRateNum; // 转换为数字
        break;
      case '血压':
        value = form.bloodPressure;
        if (!value || !/^\d+\/\d+$/.test(value)) {
          wx.showToast({
            title: '请输入正确血压格式(如:120/80)',
            icon: 'none'
          });
          return;
        }
        break;
      case '睡眠':
        value = form.sleep;
        const sleepNum = parseFloat(value);
        if (!value || isNaN(sleepNum) || sleepNum < 0 || sleepNum > 24) {
          wx.showToast({
            title: '请输入有效睡眠时长(0-24小时)',
            icon: 'none'
          });
          return;
        }
        value = sleepNum; // 转换为数字
        break;
      case '体重':
        value = form.weight;
        const weightNum = parseFloat(value);
        if (!value || isNaN(weightNum) || weightNum < 20 || weightNum > 300) {
          wx.showToast({
            title: '请输入有效体重(20-300kg)',
            icon: 'none'
          });
          return;
        }
        value = weightNum; // 转换为数字
        break;
    }

    this.setData({ submitting: true });

    // 构建记录时间
    const recordDateTime = recordDate && recordTime ? 
      `${recordDate}T${recordTime}:00` : new Date().toISOString();

    const healthData = {
      type: ['heartRate', 'bloodPressure', 'sleep', 'weight'][healthTypeIndex],
      typeName: currentType,
      value: value,
      unit: this.getUnit(currentType),
      recordTime: recordDateTime,
      notes: form.notes || ''
    };

    // 检查是否是默认用户或没有token，直接使用本地存储
    if (!app.globalData.token || app.globalData.userInfo?.username === 'aaa') {
      console.log('🔐 默认用户或未登录，使用本地存储');
      
      // 保存到本地
      const records = wx.getStorageSync('localHealthRecords') || [];
      records.unshift({
        ...healthData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      });
      wx.setStorageSync('localHealthRecords', records);
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      // 返回上一页并刷新
      setTimeout(() => {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (prevPage && prevPage.loadHealthData) {
          prevPage.loadHealthData();
        }
        wx.navigateBack();
      }, 1000);
      
      this.setData({ submitting: false });
      return;
    }

    // 其他用户提交到后端
    console.log('🌐 发送到服务器');
    wx.request({
      url: `${app.globalData.baseUrl}/health/record`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      data: healthData,
      success: (res) => {
        if (res.data.success) {
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
          
          // 更新全局数据
          if (app.globalData.healthRecords) {
            app.globalData.healthRecords.unshift(res.data.data);
          }
          
          setTimeout(() => {
            wx.navigateBack();
          }, 1000);
        } else {
          wx.showToast({
            title: res.data.message || '保存失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ submitting: false });
      }
    });
  },

  // 获取单位
  getUnit(type) {
    const unitMap = {
      '心率': 'bpm',
      '血压': 'mmHg',
      '睡眠': '小时',
      '体重': 'kg'
    };
    return unitMap[type] || '';
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
}); 