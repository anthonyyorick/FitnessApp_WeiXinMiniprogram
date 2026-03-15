const app = getApp();

Page({
  data: {
    goals: {
      heartRate: { min: 60, max: 100 },
      bloodPressure: { systolic: 120, diastolic: 80 },
      sleep: 8,
      weight: 65,
      bmi: 22
    },
    currentProgress: {
      heartRate: { min: 0, max: 0, avg: 0 },
      bloodPressure: { systolic: 0, diastolic: 0 },
      sleep: 0,
      weight: 0,
      bmi: 0
    },
    editing: false,
    submitting: false
  },

  onLoad() {
    this.loadGoals();
    this.loadCurrentProgress();
  },

  onShow() {
    this.loadCurrentProgress();
  },

  // 加载目标设置
  loadGoals() {
    const goals = wx.getStorageSync('healthGoals') || this.data.goals;
    this.setData({ goals });
  },

  // 加载当前进度
  loadCurrentProgress() {
    const currentProgress = {
      heartRate: { min: 0, max: 0, avg: 0 },
      bloodPressure: { systolic: 0, diastolic: 0 },
      sleep: 0,
      weight: 0,
      bmi: 0
    };

    // 获取最新的健康记录
    const records = wx.getStorageSync('localHealthRecords') || [];
    
    if (records.length > 0) {
      // 获取最新的心率记录
      const heartRateRecords = records.filter(r => r.type === 'heartRate').slice(0, 7);
      if (heartRateRecords.length > 0) {
        const values = heartRateRecords.map(r => r.value);
        currentProgress.heartRate.min = Math.min(...values);
        currentProgress.heartRate.max = Math.max(...values);
        currentProgress.heartRate.avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      }

      // 获取最新的血压记录
      const bloodPressureRecords = records.filter(r => r.type === 'bloodPressure').slice(0, 3);
      if (bloodPressureRecords.length > 0) {
        const latest = bloodPressureRecords[0];
        const [systolic, diastolic] = latest.value.split('/').map(Number);
        currentProgress.bloodPressure.systolic = systolic;
        currentProgress.bloodPressure.diastolic = diastolic;
      }

      // 获取最新的睡眠记录
      const sleepRecords = records.filter(r => r.type === 'sleep').slice(0, 1);
      if (sleepRecords.length > 0) {
        currentProgress.sleep = sleepRecords[0].value;
      }

      // 获取最新的体重记录
      const weightRecords = records.filter(r => r.type === 'weight').slice(0, 1);
      if (weightRecords.length > 0) {
        currentProgress.weight = weightRecords[0].value;
        // 计算BMI（假设身高为170cm）
        const height = 1.7; // 米
        currentProgress.bmi = Math.round((currentProgress.weight / (height * height)) * 10) / 10;
      }
    }

    this.setData({ currentProgress });
  },

  // 开始编辑
  startEdit() {
    this.setData({ editing: true });
  },

  // 取消编辑
  cancelEdit() {
    this.setData({ editing: false });
    this.loadGoals(); // 重新加载原始数据
  },

  // 输入处理
  onInput(e) {
    const { field } = e.currentTarget.dataset;
    const value = parseFloat(e.detail.value) || 0;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      this.setData({
        [`goals.${parent}.${child}`]: value
      });
    } else {
      this.setData({
        [`goals.${field}`]: value
      });
    }
  },

  // 保存目标
  saveGoals() {
    this.setData({ submitting: true });

    // 保存到本地存储
    wx.setStorageSync('healthGoals', this.data.goals);
    
    wx.showToast({
      title: '目标保存成功',
      icon: 'success'
    });

    this.setData({ 
      editing: false,
      submitting: false 
    });
  },

  // 重置目标
  resetGoals() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置所有健康目标吗？',
      success: (res) => {
        if (res.confirm) {
          const defaultGoals = {
            heartRate: { min: 60, max: 100 },
            bloodPressure: { systolic: 120, diastolic: 80 },
            sleep: 8,
            weight: 65,
            bmi: 22
          };
          
          this.setData({ goals: defaultGoals });
          wx.setStorageSync('healthGoals', defaultGoals);
          
          wx.showToast({
            title: '目标已重置',
            icon: 'success'
          });
        }
      }
    });
  },

  // 检查心率状态
  checkHeartRateStatus(value) {
    if (value < 60) return { status: 'low', text: '偏低', color: '#2196f3' };
    if (value > 100) return { status: 'high', text: '偏高', color: '#f44336' };
    return { status: 'normal', text: '正常', color: '#4caf50' };
  },

  // 检查血压状态
  checkBloodPressureStatus(systolic, diastolic) {
    if (systolic < 90 || diastolic < 60) return { status: 'low', text: '偏低', color: '#2196f3' };
    if (systolic > 140 || diastolic > 90) return { status: 'high', text: '偏高', color: '#f44336' };
    return { status: 'normal', text: '正常', color: '#4caf50' };
  },

  // 检查睡眠状态
  checkSleepStatus(hours) {
    if (hours < 6) return { status: 'low', text: '不足', color: '#f44336' };
    if (hours > 9) return { status: 'high', text: '过多', color: '#ff9800' };
    return { status: 'normal', text: '良好', color: '#4caf50' };
  },

  // 检查BMI状态
  checkBMIStatus(bmi) {
    if (bmi < 18.5) return { status: 'low', text: '偏瘦', color: '#2196f3' };
    if (bmi > 24) return { status: 'high', text: '偏重', color: '#f44336' };
    return { status: 'normal', text: '正常', color: '#4caf50' };
  },

  // 获取状态文本
  getStatusText(status) {
    return status.text;
  },

  // 获取状态颜色
  getStatusColor(status) {
    return status.color;
  }
}); 