const app = getApp();

Page({
  data: {
    timeRange: 'today', // today, week, month
    sportType: 'all', // all, running, walking, cycling
    sportStats: {
      steps: 0,
      distance: 0,
      duration: 0,
      calories: 0
    },
    sportRecords: [],
    loading: false,
    error: ''
  },

  onLoad() {
    // 初始化默认数据
    this.initDefaultData();
    // 加载实际的运动统计数据
    this.loadSportStats();
    this.loadSportRecords();
    
    // 添加运动记录更新事件监听器
    const app = getApp();
    app.addEventListener('sportRecordUpdated', this.onSportRecordUpdated.bind(this));
  },

  onShow() {
    // 每次显示页面时刷新数据，确保从其他页面返回时能看到最新数据
    this.loadSportStats();
    this.loadSportRecords();
  },

  onPullDownRefresh() {
    Promise.all([
      this.loadSportStats(),
      this.loadSportRecords()
    ]).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onUnload() {
    // 页面卸载时移除事件监听器
    const app = getApp();
    app.removeEventListener('sportRecordUpdated', this.onSportRecordUpdated.bind(this));
  },

  // 初始化默认数据
  initDefaultData() {
    // 默认运动统计数据 - 移除硬编码的默认值，让系统从实际记录中计算
    const defaultStats = {
      today: {
        steps: 0,
        distance: 0,
        duration: 0,
        calories: 0
      },
      week: {
        steps: 0,
        distance: 0,
        duration: 0,
        calories: 0
      },
      month: {
        steps: 0,
        distance: 0,
        duration: 0,
        calories: 0
      }
    };

    // 默认运动记录数据
    const defaultRecords = [];

    // 设置默认数据
    this.setData({
      sportStats: defaultStats.today,
      sportRecords: defaultRecords
    });
  },

  // 切换时间范围
  switchTimeRange(e) {
    const range = e.currentTarget.dataset.range;
    this.setData({
      timeRange: range
    });
    this.loadSportStats();
  },

  // 切换运动类型
  switchSportType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      sportType: type
    });
    this.loadSportRecords();
  },

  // 加载运动统计数据
  loadSportStats() {
    console.log('🔄 开始加载运动统计数据，时间范围:', this.data.timeRange);

    // 直接实时计算，不用缓存
    const localRecords = this.loadLocalSportRecords();
    console.log('📊 本地记录总数:', localRecords.length);

    const stats = this.calculateStatsFromRecords(localRecords);
    console.log('📈 计算出的统计数据:', stats);

    this.setData({ sportStats: stats });
  },

  // 从记录计算统计数据
  calculateStatsFromRecords(records) {
    console.log('🧮 开始计算统计数据，原始记录数:', records.length);
    
    const stats = {
      steps: 0,
      distance: 0,
      duration: 0,
      calories: 0
    };

    // 根据时间范围过滤记录
    const filteredRecords = this.filterRecordsByTimeRange(records, this.data.timeRange);
    console.log('🔍 过滤后的记录数:', filteredRecords.length);

    filteredRecords.forEach((record, index) => {
      const recordSteps = parseInt(record.steps || 0);
      const recordDistance = parseFloat(record.distance || 0);
      const recordDuration = parseInt(record.duration || 0);
      const recordCalories = parseInt(record.calories || 0);
      
      stats.steps += recordSteps;
      stats.distance += recordDistance;
      // 如果record.duration已经是分钟，直接累加；如果是秒，需要转换
      const durationInMinutes = recordDuration > 1000 ? Math.round(recordDuration / 60) : recordDuration;
      stats.duration += durationInMinutes;
      stats.calories += recordCalories;
      
      console.log(`📝 记录 ${index + 1} 统计:`, {
        id: record.id,
        type: record.type,
        steps: recordSteps,
        distance: recordDistance,
        duration: recordDuration,
        durationInMinutes: durationInMinutes,
        calories: recordCalories,
        startTime: record.startTime,
        createdAt: record.createdAt
      });
    });

    console.log('📊 最终统计数据:', stats);
    return stats;
  },

  // 根据时间范围过滤记录
  filterRecordsByTimeRange(records, timeRange) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    console.log('🔍 开始过滤记录:', {
      totalRecords: records.length,
      timeRange: timeRange,
      today: today.toISOString(),
      now: now.toISOString()
    });
    
    const filteredRecords = records.filter(record => {
      const recordDate = this.parseDate(record.startTime || record.createdAt);
      if (!recordDate) {
        console.warn('⚠️ 无法解析记录日期:', record.startTime || record.createdAt, record);
        return false;
      }
      
      let isInRange = false;
      switch (timeRange) {
        case 'today':
          isInRange = recordDate >= today;
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          isInRange = recordDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          isInRange = recordDate >= monthAgo;
          break;
        default:
          isInRange = true;
      }
      
      console.log('📅 记录日期检查:', {
        recordId: record.id,
        recordDate: recordDate.toISOString(),
        startTime: record.startTime,
        createdAt: record.createdAt,
        isInRange: isInRange,
        timeRange: timeRange
      });
      
      return isInRange;
    });
    
    console.log('✅ 过滤结果:', {
      filteredCount: filteredRecords.length,
      timeRange: timeRange
    });
    
    return filteredRecords;
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

  // 加载运动记录
  loadSportRecords() {
    // 优先从本地存储加载数据
    const localRecords = this.loadLocalSportRecords();
    
    if (localRecords.length > 0) {
      console.log('📱 从本地存储获取运动记录');
      // 根据时间范围过滤记录
      let filteredRecords = this.filterRecordsByTimeRange(localRecords, this.data.timeRange);
      
      // 根据运动类型筛选
      if (this.data.sportType !== 'all') {
        filteredRecords = filteredRecords.filter(record => record.type === this.data.sportType);
      }

      this.setData({
        sportRecords: filteredRecords
      });
      return;
    }

    // 如果没有本地数据，尝试从服务器获取
    if (app.globalData.token) {
      console.log('🌐 从服务器获取运动记录');
      wx.request({
        url: `${app.globalData.baseUrl}/sport/records`,
        method: 'GET',
        data: {
          type: this.data.sportType === 'all' ? '' : this.data.sportType,
          timeRange: this.data.timeRange
        },
        header: {
          'Authorization': `Bearer ${app.globalData.token}`
        },
        success: (res) => {
          if (res.data.success) {
            const records = res.data.data || [];
            // 格式化记录数据
            const formattedRecords = records.map(record => ({
              ...record,
              typeIcon: this.getSportTypeIcon(record.type),
              typeName: this.getSportTypeName(record.type),
              distance: Number(record.distance || 0).toFixed(1),
              duration: Math.round(Number(record.duration || 0) / 60), // 将秒转换为分钟
              calories: Math.round(Number(record.calories || 0)),
              startTime: this.formatTime(record.startTime || record.createdAt)
            }));
            
            this.setData({
              sportRecords: formattedRecords
            });
            
            // 保存到本地存储
            wx.setStorageSync('localSportRecords', records);
          }
        },
        fail: (err) => {
          console.log('获取运动记录失败，使用默认数据');
          this.loadDefaultRecords();
        }
      });
    } else {
      // 未登录时使用默认数据
      this.loadDefaultRecords();
    }
  },

  // 加载默认运动记录
  loadDefaultRecords() {
    const defaultRecords = [];

    // 根据运动类型筛选
    let filteredRecords = defaultRecords;
    if (this.data.sportType !== 'all') {
      filteredRecords = defaultRecords.filter(record => record.type === this.data.sportType);
    }

    this.setData({
      sportRecords: filteredRecords
    });
  },

  // 从本地存储加载运动记录
  loadLocalSportRecords() {
    try {
      const records = wx.getStorageSync('localSportRecords') || [];
      
      // 格式化记录数据
      return records.map(record => ({
        ...record,
        typeIcon: this.getSportTypeIcon(record.type),
        typeName: this.getSportTypeName(record.type),
        distance: Number(record.distance || 0).toFixed(1),
        duration: Math.round(Number(record.duration || 0) / 60), // 将秒转换为分钟
        calories: Math.round(Number(record.calories || 0)),
        startTime: this.formatTime(record.startTime || record.createdAt)
      }));
    } catch (error) {
      console.error('加载本地运动记录失败:', error);
      return [];
    }
  },

  // 获取运动类型图标
  getSportTypeIcon(type) {
    const iconMap = {
      'running': '🏃',
      'walking': '🚶',
      'cycling': '🚴'
    };
    return iconMap[type] || '🏃';
  },

  // 获取运动类型名称
  getSportTypeName(type) {
    const nameMap = {
      'running': '跑步',
      'walking': '步行',
      'cycling': '骑行'
    };
    return nameMap[type] || '跑步';
  },

  // 格式化时间
  formatTime(timeStr) {
    if (!timeStr) return '';
    
    const date = this.parseDate(timeStr);
    if (!date) return timeStr;
    
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  },

  // 开始运动
  startSport() {
    wx.showActionSheet({
      itemList: ['跑步', '步行', '骑行'],
      success: (res) => {
        const sportTypes = ['running', 'walking', 'cycling'];
        const type = sportTypes[res.tapIndex];
        this.startSportSession(type);
      }
    });
  },

  // 开始运动会话
  startSportSession(type) {
    wx.showModal({
      title: '开始运动',
      content: '确定要开始记录运动吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/sport-detail/sport-detail?type=' + type
          });
        }
      }
    });
  },

  // 记录运动数据（模拟）
  recordSportData(type) {
    const typeNames = {
      running: '跑步',
      walking: '步行',
      cycling: '骑行'
    };

    const typeIcons = {
      running: '🏃',
      walking: '🚶',
      cycling: '🚴'
    };

    // 模拟运动数据
    const mockData = {
      running: { distance: 5.0, duration: 30, calories: 280, steps: 6000 },
      walking: { distance: 3.0, duration: 45, calories: 120, steps: 3600 },
      cycling: { distance: 10.0, duration: 40, calories: 350, steps: 0 }
    };

    const data = mockData[type];
    const now = new Date();

    const newRecord = {
      id: Date.now(),
      typeIcon: typeIcons[type],
      typeName: typeNames[type],
      distance: data.distance,
      duration: data.duration,
      calories: data.calories,
      steps: data.steps,
      startTime: now.toISOString(),
      type: type,
      createdAt: now.toISOString()
    };

    // 保存到本地存储
    let localRecords = wx.getStorageSync('localSportRecords') || [];
    localRecords.unshift(newRecord);
    
    // 限制本地存储数量
    if (localRecords.length > 100) {
      localRecords = localRecords.slice(0, 100);
    }
    
    wx.setStorageSync('localSportRecords', localRecords);

    // 重新加载运动记录和统计数据
    this.loadSportRecords();
    this.loadSportStats();

    // 触发运动记录更新事件
    const app = getApp();
    app.triggerEvent('sportRecordUpdated', { record: newRecord });

    // 发送到后端
    if (app.globalData.token) {
      wx.request({
        url: `${app.globalData.baseUrl}/sport/record`,
        method: 'POST',
        data: {
          type: type,
          distance: data.distance,
          duration: data.duration,
          calories: data.calories,
          steps: data.steps,
          startTime: now.toISOString()
        },
        header: {
          'Authorization': `Bearer ${app.globalData.token}`
        }
      });
    }
  },

  // 手动记录运动
  addSport() {
    wx.navigateTo({
      url: '/pages/add-sport/add-sport'
    });
  },

  // 跳转到运动详情
  goToSportDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/sport-detail/sport-detail?id=${id}`
    });
  },

  // 处理运动记录更新事件
  onSportRecordUpdated(event) {
    console.log('收到运动记录更新事件，刷新统计数据');
    // 重新加载运动记录和统计数据
    this.loadSportRecords();
    this.loadSportStats();
  },

  // 调试函数：检查本地存储的运动记录
  debugLocalRecords() {
    console.log('🔍 === 调试本地运动记录 ===');
    const records = wx.getStorageSync('localSportRecords') || [];
    console.log('总记录数:', records.length);
    
    records.forEach((record, index) => {
      console.log(`记录 ${index + 1}:`, {
        id: record.id,
        type: record.type,
        startTime: record.startTime,
        createdAt: record.createdAt,
        distance: record.distance,
        steps: record.steps,
        duration: record.duration,
        calories: record.calories
      });
    });
    
    // 测试日期解析
    records.forEach((record, index) => {
      const parsedDate = this.parseDate(record.startTime || record.createdAt);
      console.log(`记录 ${index + 1} 日期解析:`, {
        original: record.startTime || record.createdAt,
        parsed: parsedDate ? parsedDate.toISOString() : '解析失败'
      });
    });
    
    console.log('🔍 === 调试结束 ===');
  }
}); 