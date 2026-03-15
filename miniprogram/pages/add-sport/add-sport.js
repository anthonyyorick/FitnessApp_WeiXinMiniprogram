const app = getApp();

Page({
  data: {
    sportTypes: [
      { value: 'running', name: '跑步', icon: '🏃' },
      { value: 'walking', name: '步行', icon: '🚶' },
      { value: 'cycling', name: '骑行', icon: '🚴' }
    ],
    selectedType: 'running',
    distance: '',
    duration: '',
    steps: '',
    calories: '',
    recordDate: '',
    recordTime: '',
    durationHours: '0',
    durationMinutes: '30',
    durationSeconds: '0',
    formattedDuration: '00:30:00',
    notes: '',
    location: null,
    weather: {
      temperature: '',
      condition: ''
    },
    heartRate: {
      avg: '',
      max: '',
      min: ''
    },
    pace: {
      avg: '',
      best: ''
    },
    loading: false,
    submitting: false
  },

  onLoad(options) {
    // 如果有传入的运动类型，设置默认值
    if (options.type) {
      this.setData({
        selectedType: options.type
      });
    }

    // 设置默认时间
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8); // 包含秒
    
    this.setData({
      recordDate: dateStr,
      recordTime: timeStr
    });

    // 初始化总时长
    this.updateTotalDuration();

    // 获取位置信息
    this.getLocation();
  },

  // 选择运动类型
  selectSportType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedType: type
    });
  },

  // 输入距离
  onDistanceInput(e) {
    this.setData({
      distance: e.detail.value
    });
  },

  // 输入步数
  onStepsInput(e) {
    this.setData({
      steps: e.detail.value
    });
  },

  // 输入卡路里
  onCaloriesInput(e) {
    this.setData({
      calories: e.detail.value
    });
  },

  // 选择记录日期
  onRecordDateChange(e) {
    this.setData({
      recordDate: e.detail.value
    });
  },

  // 选择记录时间
  onRecordTimeChange(e) {
    this.setData({
      recordTime: e.detail.value
    });
  },

  // 输入时长小时
  onDurationHoursInput(e) {
    let value = parseInt(e.detail.value) || 0;
    if (value < 0) value = 0;
    if (value > 99) value = 99;
    
    this.setData({
      durationHours: value.toString()
    });
    this.updateTotalDuration();
  },

  // 输入时长分钟
  onDurationMinutesInput(e) {
    let value = parseInt(e.detail.value) || 0;
    if (value < 0) value = 0;
    if (value > 59) value = 59;
    
    this.setData({
      durationMinutes: value.toString()
    });
    this.updateTotalDuration();
  },

  // 输入时长秒数
  onDurationSecondsInput(e) {
    let value = parseInt(e.detail.value) || 0;
    if (value < 0) value = 0;
    if (value > 59) value = 59;
    
    this.setData({
      durationSeconds: value.toString()
    });
    this.updateTotalDuration();
  },

  // 更新总时长（秒）
  updateTotalDuration() {
    const hours = parseInt(this.data.durationHours) || 0;
    const minutes = parseInt(this.data.durationMinutes) || 0;
    const seconds = parseInt(this.data.durationSeconds) || 0;
    
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    
    // 格式化显示时间
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    const formattedDuration = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    
    this.setData({
      duration: totalSeconds.toString(),
      formattedDuration: formattedDuration
    });
  },

  // 输入备注
  onNotesInput(e) {
    this.setData({
      notes: e.detail.value
    });
  },

  // 输入天气温度
  onTemperatureInput(e) {
    this.setData({
      'weather.temperature': e.detail.value
    });
  },

  // 输入天气状况
  onWeatherConditionInput(e) {
    this.setData({
      'weather.condition': e.detail.value
    });
  },

  // 输入平均心率
  onAvgHeartRateInput(e) {
    this.setData({
      'heartRate.avg': e.detail.value
    });
  },

  // 输入最大心率
  onMaxHeartRateInput(e) {
    this.setData({
      'heartRate.max': e.detail.value
    });
  },

  // 输入最小心率
  onMinHeartRateInput(e) {
    this.setData({
      'heartRate.min': e.detail.value
    });
  },

  // 输入平均配速
  onAvgPaceInput(e) {
    this.setData({
      'pace.avg': e.detail.value
    });
  },

  // 输入最佳配速
  onBestPaceInput(e) {
    this.setData({
      'pace.best': e.detail.value
    });
  },

  // 获取位置信息
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
        
        // 根据坐标获取地址
        this.getAddress(res.latitude, res.longitude);
      },
      fail: (err) => {
        console.log('获取位置失败:', err);
        wx.showToast({
          title: '获取位置失败',
          icon: 'none'
        });
      }
    });
  },

  // 根据坐标获取地址
  getAddress(latitude, longitude) {
    // 这里可以调用地图API获取地址
    // 暂时使用默认地址
    this.setData({
      'location.address': '当前位置'
    });
  },

  // 验证表单数据
  validateForm() {
    const { selectedType, distance, duration, steps } = this.data;

    if (!selectedType) {
      wx.showToast({
        title: '请选择运动类型',
        icon: 'none'
      });
      return false;
    }

    if (!distance && !duration && !steps) {
      wx.showToast({
        title: '请至少填写距离、时长或步数',
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 提交运动记录
  async submitSportRecord() {
    if (!this.validateForm()) {
      return;
    }

    this.setData({ submitting: true });

    try {
      // 构建记录时间
      const recordDateTime = this.data.recordDate && this.data.recordTime ? 
        `${this.data.recordDate}T${this.data.recordTime}` : new Date().toISOString();

      const sportData = {
        type: this.data.selectedType,
        distance: parseFloat(this.data.distance) || 0,
        duration: parseInt(this.data.duration) || 0, // 总秒数
        steps: parseInt(this.data.steps) || 0,
        calories: parseInt(this.data.calories) || 0,
        recordTime: recordDateTime,
        durationHours: parseInt(this.data.durationHours) || 0,
        durationMinutes: parseInt(this.data.durationMinutes) || 0,
        durationSeconds: parseInt(this.data.durationSeconds) || 0,
        formattedDuration: this.data.formattedDuration,
        notes: this.data.notes,
        location: this.data.location,
        weather: this.data.weather.temperature || this.data.weather.condition ? this.data.weather : null,
        heartRate: this.data.heartRate.avg || this.data.heartRate.max || this.data.heartRate.min ? this.data.heartRate : null,
        pace: this.data.pace.avg || this.data.pace.best ? this.data.pace : null
      };

      // 检查是否是默认用户或没有token，直接使用本地存储
      const app = getApp();
      if (!app.globalData.token || app.globalData.userInfo?.username === 'aaa') {
        console.log('🔐 默认用户或未登录，使用本地存储');
        this.saveToLocalStorage(sportData);
        return;
      }

      // 其他用户发送到服务器
      console.log('🌐 发送到服务器');
      const res = await this.uploadToServer(sportData);
      
      if (res.success) {
        wx.showToast({
          title: '记录添加成功',
          icon: 'success'
        });
        
        // 返回上一页并刷新
        setTimeout(() => {
          const pages = getCurrentPages();
          const prevPage = pages[pages.length - 2];
          if (prevPage && prevPage.loadSportRecords) {
            prevPage.loadSportRecords();
          }
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(res.message || '添加失败');
      }
    } catch (error) {
      console.error('❌ 提交运动记录失败:', error);
      
      // 如果服务器请求失败，也保存到本地
      if (error.message.includes('认证') || error.message.includes('未授权')) {
        console.log('🔐 认证失败，保存到本地存储');
        this.saveToLocalStorage(sportData);
      } else {
        wx.showToast({
          title: error.message || '添加失败',
          icon: 'none'
        });
      }
    } finally {
      this.setData({ submitting: false });
    }
  },

  // 上传到服务器
  uploadToServer(sportData) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${app.globalData.baseUrl}/sport/record`,
        method: 'POST',
        data: sportData,
        header: {
          'Authorization': `Bearer ${app.globalData.token}`,
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 201) {
            resolve(res.data);
          } else {
            reject(new Error(res.data.message || '服务器错误'));
          }
        },
        fail: (err) => {
          reject(new Error('网络请求失败'));
        }
      });
    });
  },

  // 保存到本地存储
  saveToLocalStorage(sportData) {
    try {
      // 获取本地存储的运动记录
      let localRecords = wx.getStorageSync('localSportRecords') || [];
      
      // 添加新记录
      const newRecord = {
        id: Date.now(),
        ...sportData,
        startTime: sportData.recordTime, // 添加startTime字段
        createdAt: new Date().toISOString()
      };
      
      localRecords.unshift(newRecord);
      
      // 限制本地存储数量
      if (localRecords.length > 100) {
        localRecords = localRecords.slice(0, 100);
      }
      
      // 保存到本地存储
      wx.setStorageSync('localSportRecords', localRecords);
      
      // 触发运动记录更新事件
      const app = getApp();
      app.triggerEvent('sportRecordUpdated', { record: newRecord });
      
      wx.showToast({
        title: '记录已保存',
        icon: 'success'
      });
      
      // 返回上一页并刷新
      setTimeout(() => {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (prevPage && prevPage.loadSportRecords) {
          prevPage.loadSportRecords();
        }
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('保存到本地存储失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  },

  // 重置表单
  resetForm() {
    wx.showModal({
      title: '确认重置',
      content: '确定要清空所有输入的内容吗？',
      success: (res) => {
        if (res.confirm) {
          // 设置默认时间
          const now = new Date();
          const dateStr = now.toISOString().slice(0, 10);
          const timeStr = now.toTimeString().slice(0, 8);
          
          this.setData({
            distance: '',
            duration: '1800', // 30分钟 = 1800秒
            steps: '',
            calories: '',
            recordDate: dateStr,
            recordTime: timeStr,
            durationHours: '0',
            durationMinutes: '30',
            durationSeconds: '0',
            formattedDuration: '00:30:00',
            notes: '',
            weather: { temperature: '', condition: '' },
            heartRate: { avg: '', max: '', min: '' },
            pace: { avg: '', best: '' }
          });
        }
      }
    });
  }
}); 