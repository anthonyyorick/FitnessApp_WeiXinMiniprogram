const app = getApp();

Page({
  data: {
    healthData: {
      heartRate: 0,
      steps: 0,
      sleep: '良好',
      sleepUnit: ''
    },
    courses: [
      {
        id: 1,
        title: '初级跑步训练',
        duration: 30,
        cover: 'https://pic2.zhimg.com/100/v2-2b08edab6c02188b06e351637218eab9_r.jpg'
      },
      {
        id: 2,
        title: '瑜伽放松课程',
        duration: 45,
        cover: 'https://pica.zhimg.com/100/v2-cb165e4accd434294f39771427423794_r.jpg'
      }
    ],
    courseList: [
      {
        id: 3,
        title: 'HIIT高强度训练',
        description: '快速燃脂，提升心肺功能',
        duration: 20,
        level: '中级',
        cover: 'https://picx.zhimg.com/100/v2-d01be9c5a01c5334a38c0443039daa89_r.jpg'
      },
      {
        id: 4,
        title: '力量训练基础',
        description: '增强肌肉力量，改善体态',
        duration: 40,
        level: '初级',
        cover: '	https://pic2.zhimg.com/100/v2-cd74563e9e2df58a09350633c367f405_r.jpg'
      },
      {
        id: 5,
        title: '有氧舞蹈',
        description: '快乐运动，燃烧卡路里',
        duration: 35,
        level: '初级',
        cover: 'https://pic4.zhimg.com/100/v2-3166e786d4f48ae777c6fd4bd4439321_r.jpg'
      },
      {
        id: 6,
        title: '核心训练',
        description: '强化核心肌群，稳定身体',
        duration: 25,
        level: '中级',
        cover: 'https://pic1.zhimg.com/100/v2-193a629845643f71aed7c6c5907ffc4e_r.jpg'
      }
    ],
    healthTip: '每天保持30分钟以上的中等强度运动，有助于提高心肺功能和免疫力。'
  },

  onLoad() {
    this.loadHealthData();
    this.loadCourses();
    this.loadHealthTip();
    
    // 添加运动记录更新事件监听器
    app.addEventListener('sportRecordUpdated', this.onSportRecordUpdated.bind(this));
  },

  onShow() {
    // 每次显示页面时刷新数据，特别是从健康记录中获取最新的heartRate和steps
    this.updateHeartRateAndSteps();
  },

  onUnload() {
    // 页面卸载时移除事件监听器
    app.removeEventListener('sportRecordUpdated', this.onSportRecordUpdated.bind(this));
  },

  onPullDownRefresh() {
    // 下拉刷新
    Promise.all([
      this.loadHealthData(),
      this.loadCourses(),
      this.loadHealthTip()
    ]).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 安全的日期解析函数，兼容iOS
  parseDate(dateStr) {
    if (!dateStr) return null;
    
    try {
      // 如果是ISO格式，直接解析
      if (dateStr.includes('T') || dateStr.includes('Z')) {
        return new Date(dateStr);
      }
      
      // 如果是 "yyyy-MM-dd HH:mm" 格式，转换为 "yyyy-MM-ddTHH:mm:ss"
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(dateStr)) {
        return new Date(dateStr.replace(' ', 'T') + ':00');
      }
      
      // 如果是 "yyyy-MM-dd HH:mm:ss" 格式，转换为 "yyyy-MM-ddTHH:mm:ss"
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
        return new Date(dateStr.replace(' ', 'T'));
      }
      
      // 如果是 "yyyy-MM-dd" 格式，直接解析
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return new Date(dateStr);
      }
      
      // 如果是 "yyyy/MM/dd" 格式，直接解析
      if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateStr)) {
        return new Date(dateStr);
      }
      
      // 其他格式尝试直接解析
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.warn('无法解析日期格式:', dateStr);
        return null;
      }
      return date;
    } catch (error) {
      console.error('日期解析失败:', error, dateStr);
      return null;
    }
  },

  // 加载健康数据
  loadHealthData() {
    return new Promise((resolve) => {
      // 优先从本地存储获取数据
      const localHealthData = wx.getStorageSync('healthData');
      if (localHealthData) {
        this.setData({
          healthData: localHealthData
        });
        resolve();
        return;
      }

      // 如果没有本地数据，从健康记录中获取heartRate和steps
      const localHealthRecords = wx.getStorageSync('localHealthRecords') || [];
      
      // 获取最新的心率数据
      const heartRateRecords = localHealthRecords
        .filter(record => record.type === 'heartRate')
        .sort((a, b) => this.parseDate(b.createdAt || b.time) - this.parseDate(a.createdAt || a.time));
      
      // 获取最新的步数数据（从运动记录中计算）
      const localSportRecords = wx.getStorageSync('localSportRecords') || [];
      const today = new Date();
      const todayString = today.toDateString();
      
      const todaySteps = localSportRecords
        .filter(record => {
          const recordDate = this.parseDate(record.startTime || record.createdAt);
          return recordDate && recordDate.toDateString() === todayString;
        })
        .reduce((total, record) => total + (parseInt(record.steps) || 0), 0);

      // 如果没有今日记录，尝试从sportStats中获取今日步数
      let finalSteps = todaySteps;
      if (todaySteps === 0) {
        const sportStats = wx.getStorageSync('sportStats');
        if (sportStats && sportStats.today) {
          finalSteps = sportStats.today.steps || 0;
        }
      }

      // 构建健康数据
      const healthData = {
        heartRate: heartRateRecords.length > 0 ? heartRateRecords[0].value : 75,
        steps: finalSteps || 0,
        sleep: '良好',
        sleepUnit: ''
      };

      this.setData({
        healthData: healthData
      });

      // 保存到本地存储
      wx.setStorageSync('healthData', healthData);

      // 如果有token，尝试从服务器获取其他数据
      if (app.globalData.token) {
        wx.request({
          url: `${app.globalData.baseUrl}/health/today`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${app.globalData.token}`
          },
          success: (res) => {
            if (res.data.success) {
              const serverHealthData = res.data.data;
              // 合并服务器数据，但保持heartRate和steps使用本地数据
              const mergedHealthData = {
                ...serverHealthData,
                heartRate: healthData.heartRate,
                steps: healthData.steps
              };
              this.setData({ healthData: mergedHealthData });
              // 保存到本地存储
              wx.setStorageSync('healthData', mergedHealthData);
            }
          },
          fail: () => {
            // 请求失败时使用本地数据
            console.log('获取健康数据失败，使用本地数据');
          },
          complete: resolve
        });
      } else {
        // 未登录时使用本地数据
        resolve();
      }
    });
  },

  // 加载课程数据
  loadCourses() {
    return new Promise((resolve) => {
      // 优先从本地存储获取数据
      const localCourses = wx.getStorageSync('courses');
      if (localCourses) {
        this.setData({
          courses: localCourses
        });
        resolve();
        return;
      }

      // 如果没有本地数据，尝试从服务器获取
      if (app.globalData.token) {
        wx.request({
          url: `${app.globalData.baseUrl}/courses/hot`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${app.globalData.token}`
          },
          success: (res) => {
            if (res.data.success) {
              const courses = res.data.data;
              this.setData({ courses });
              // 保存到本地存储
              wx.setStorageSync('courses', courses);
            }
          },
          fail: () => {
            console.log('获取课程数据失败，使用默认数据');
          },
          complete: resolve
        });
      } else {
        // 未登录时使用默认数据
        resolve();
      }
    });
  },

  // 加载健康小贴士
  loadHealthTip() {
    return new Promise((resolve) => {
      // 优先从本地存储获取数据
      const localHealthTip = wx.getStorageSync('healthTip');
      if (localHealthTip) {
        this.setData({
          healthTip: localHealthTip
        });
        resolve();
        return;
      }

      // 如果没有本地数据，生成新的小贴士
      const tips = [
        '每天保持30分钟以上的中等强度运动，有助于提高心肺功能和免疫力。',
        '充足的睡眠是健康的基础，建议每晚保持7-8小时的睡眠时间。',
        '多喝水有助于新陈代谢，建议每天饮水2000ml左右。',
        '定期监测心率变化，了解自己的身体状况。',
        '运动前要做好热身，运动后要进行拉伸放松。'
      ];
      
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      this.setData({
        healthTip: randomTip
      });
      
      // 保存到本地存储
      wx.setStorageSync('healthTip', randomTip);
      resolve();
    });
  },

  // 跳转到健康详情
  goToHealthDetail(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/health/health?type=${type}`
    });
  },

  // 跳转到课程列表
  goToCourseList() {
    wx.navigateTo({
      url: '/pages/course/course'
    });
  },

  // 跳转到课程详情
  goToCourseDetail(e) {
    const id = e.currentTarget.dataset.id || e.currentTarget.id;
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${id}`
    });
  },

  // 开始运动
  startSport() {
    wx.switchTab({
      url: '/pages/sport/sport'
    });
  },

  // 记录健康指标
  recordHealth() {
    wx.navigateTo({
      url: '/pages/add-health/add-health'
    });
  },

  // 更新心率 and 步数数据
  updateHeartRateAndSteps() {
    // 从健康记录中获取最新的心率数据
    const localHealthRecords = wx.getStorageSync('localHealthRecords') || [];
    const heartRateRecords = localHealthRecords
      .filter(record => record.type === 'heartRate')
      .sort((a, b) => this.parseDate(b.createdAt || b.time) - this.parseDate(a.createdAt || a.time));
    
    // 从运动记录中计算今日步数，与sport页面逻辑保持一致
    const localSportRecords = wx.getStorageSync('localSportRecords') || [];
    const today = new Date();
    const todayString = today.toDateString();
    
    const todaySteps = localSportRecords
      .filter(record => {
        const recordDate = this.parseDate(record.startTime || record.createdAt);
        return recordDate && recordDate.toDateString() === todayString;
      })
      .reduce((total, record) => total + (parseInt(record.steps) || 0), 0);

    // 如果没有今日记录，尝试从sportStats中获取今日步数
    let finalSteps = todaySteps;
    if (todaySteps === 0) {
      const sportStats = wx.getStorageSync('sportStats');
      if (sportStats && sportStats.today) {
        finalSteps = sportStats.today.steps || 0;
      }
    }

    // 更新数据
    const currentHealthData = this.data.healthData || {};
    const updatedHealthData = {
      ...currentHealthData,
      heartRate: heartRateRecords.length > 0 ? heartRateRecords[0].value : currentHealthData.heartRate || 75,
      steps: finalSteps || currentHealthData.steps || 0
    };

    this.setData({
      healthData: updatedHealthData
    });

    // 保存到本地存储
    wx.setStorageSync('healthData', updatedHealthData);
  },

  // 处理运动记录更新事件
  onSportRecordUpdated(event) {
    console.log('收到运动记录更新事件，刷新步数数据');
    // 更新步数数据
    this.updateHeartRateAndSteps();
  }
}); 