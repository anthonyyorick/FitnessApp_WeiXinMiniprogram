const app = getApp();

Page({
  data: {
    goals: {
      dailySteps: 10000,
      dailyDistance: 5,
      dailyCalories: 300,
      weeklyWorkouts: 3,
      monthlyDistance: 100
    },
    currentProgress: {
      dailySteps: 0,
      dailyDistance: 0,
      dailyCalories: 0,
      weeklyWorkouts: 0,
      monthlyDistance: 0
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
    const goals = wx.getStorageSync('sportGoals') || this.data.goals;
    this.setData({ goals });
  },

  // 加载当前进度
  loadCurrentProgress() {
    // 从本地存储或全局数据获取当前进度
    const today = new Date().toISOString().slice(0, 10);
    const currentProgress = {
      dailySteps: 0,
      dailyDistance: 0,
      dailyCalories: 0,
      weeklyWorkouts: 0,
      monthlyDistance: 0
    };

    // 获取今日运动记录
    const todayRecords = this.getTodayRecords();
    todayRecords.forEach(record => {
      currentProgress.dailySteps += record.steps || 0;
      currentProgress.dailyDistance += record.distance || 0;
      currentProgress.dailyCalories += record.calories || 0;
    });

    // 获取本周运动次数
    currentProgress.weeklyWorkouts = this.getWeeklyWorkouts();

    // 获取本月总距离
    currentProgress.monthlyDistance = this.getMonthlyDistance();

    this.setData({ currentProgress });
  },

  // 获取今日运动记录
  getTodayRecords() {
    const today = new Date().toISOString().slice(0, 10);
    const records = wx.getStorageSync('localSportRecords') || [];
    
    return records.filter(record => {
      const recordDate = record.recordTime ? 
        record.recordTime.slice(0, 10) : 
        new Date(record.createdAt).toISOString().slice(0, 10);
      return recordDate === today;
    });
  },

  // 获取本周运动次数
  getWeeklyWorkouts() {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    const records = wx.getStorageSync('localSportRecords') || [];
    
    return records.filter(record => {
      const recordDate = record.recordTime ? 
        new Date(record.recordTime) : 
        new Date(record.createdAt);
      return recordDate >= weekStart && recordDate <= weekEnd;
    }).length;
  },

  // 获取本月总距离
  getMonthlyDistance() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const records = wx.getStorageSync('localSportRecords') || [];
    
    return records.filter(record => {
      const recordDate = record.recordTime ? 
        new Date(record.recordTime) : 
        new Date(record.createdAt);
      return recordDate >= monthStart && recordDate <= monthEnd;
    }).reduce((total, record) => total + (record.distance || 0), 0);
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
    
    this.setData({
      [`goals.${field}`]: value
    });
  },

  // 保存目标
  saveGoals() {
    this.setData({ submitting: true });

    // 保存到本地存储
    wx.setStorageSync('sportGoals', this.data.goals);
    
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
      content: '确定要重置所有运动目标吗？',
      success: (res) => {
        if (res.confirm) {
          const defaultGoals = {
            dailySteps: 10000,
            dailyDistance: 5,
            dailyCalories: 300,
            weeklyWorkouts: 3,
            monthlyDistance: 100
          };
          
          this.setData({ goals: defaultGoals });
          wx.setStorageSync('sportGoals', defaultGoals);
          
          wx.showToast({
            title: '目标已重置',
            icon: 'success'
          });
        }
      }
    });
  },

  // 计算进度百分比
  getProgressPercent(current, target) {
    if (target <= 0) return 0;
    const percent = (current / target) * 100;
    return Math.min(percent, 100);
  },

  // 获取进度颜色
  getProgressColor(percent) {
    if (percent >= 100) return '#4caf50';
    if (percent >= 80) return '#ff9800';
    if (percent >= 60) return '#2196f3';
    return '#f44336';
  }
}); 