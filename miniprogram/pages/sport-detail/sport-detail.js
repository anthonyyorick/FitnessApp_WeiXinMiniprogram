// sport-detail.js
const app = getApp();

Page({
  data: {
    record: {
      id: null,
      typeName: '',
      distance: 0,
      duration: 0,
      steps: 0,
      calories: 0,
      startTime: ''
    },
    latitude: 0,
    longitude: 0,
    polyline: [],
    isRunning: false,
    timer: null,
    startTimestamp: 0,
    duration: 0,
    durationStr: '00:00:00',
    distance: 0,
    distanceStr: '0.00',
    speedStr: '0.00',
    paceStr: '0\'00"',
    points: [],
    paceData: [], // 配速数据
    ec: {
      lazyLoad: true
    }
  },

  onLoad(options) {
    const { type, id } = options;
    
    // 设置运动类型
    if (type) {
      const typeNames = {
        running: '跑步',
        walking: '步行',
        cycling: '骑行'
      };
      this.setData({
        'record.typeName': typeNames[type] || '跑步'
      });
    }

    // 如果有ID，加载运动记录
    if (id) {
      this.loadSportRecord(id);
    }

    // 获取当前位置初始化地图
    this.getCurrentLocation();
  },

  // 获取当前位置
  getCurrentLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: (err) => {
        console.log('获取位置失败:', err);
        wx.showToast({
          title: '请开启位置权限',
          icon: 'none'
        });
      }
    });
  },

  // 加载运动记录
  loadSportRecord(id) {
    if (!app.globalData.token) return;

    wx.request({
      url: `${app.globalData.baseUrl}/sport/record/${id}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: (res) => {
        if (res.data.success) {
          const record = res.data.data;
          this.setData({
            record: {
              ...record,
              startTime: this.formatTime(record.startTime),
              distance: Number(record.distance).toFixed(2),
              duration: Math.round(Number(record.duration || 0) / 60), // 转换为分钟
              calories: Math.round(record.calories)
            }
          });
          
          // 如果有轨迹数据，显示在地图上
          if (record.points && record.points.length) {
            this.setData({
              points: record.points,
              polyline: [{
                points: record.points,
                color: '#FF0000',
                width: 4
              }]
            });
          }
        }
      }
    });
  },

  // 格式化时间
  formatTime(timeStr) {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  },

  // 格式化时长
  formatDuration(seconds) {
    if (!seconds) return '00:00:00';
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  },

  // 格式化配速
  formatPace(distance, duration) {
    if (!distance || !duration) return '0\'00"';
    const pace = duration / (distance / 1000); // 分钟/公里
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}'${String(seconds).padStart(2, '0')}"`;
  },

  onReady() {
    this.initPaceChart();
  },

  initPaceChart() {
    this.selectComponent('#paceChart').init((canvas, width, height, dpr) => {
      const echarts = require('../../components/echarts/ec-canvas/echarts');
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });
      canvas.setChart(chart);
      
      const option = {
        title: {
          text: '配速分析',
          left: 'center',
          top: 10,
          textStyle: { fontSize: 16 }
        },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['1km', '2km', '3km', '4km', '5km'],
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          name: '配速 (min/km)'
        },
        series: [{
          name: '配速',
          type: 'line',
          data: [6.2, 6.0, 6.1, 6.3, 6.0],
          smooth: true,
          areaStyle: {}
        }]
      };
      chart.setOption(option);
      return chart;
    });
  },

  // 开始运动
  startSport() {
    console.log('开始运动');
    
    // 重置数据
    this.setData({
      isRunning: true,
      points: [],
      distance: 0,
      duration: 0,
      durationStr: '00:00:00',
      distanceStr: '0.00',
      speedStr: '0.00',
      paceStr: '0\'00"',
      startTimestamp: Date.now(),
      paceData: [],
      polyline: []
    });
    
    // 记录开始时间
    const startTime = new Date().toISOString();
    this.setData({
      'record.startTime': this.formatTime(startTime)
    });
    
    // 获取初始位置
    this.getLocationAndRecord();
    
    // 启动定时器，每秒更新一次
    this.data.timer = setInterval(() => {
      this.getLocationAndRecord();
      this.updateDurationAndSpeed();
    }, 1000);
    
    wx.showToast({
      title: '运动已开始',
      icon: 'success'
    });
  },

  // 结束运动
  stopSport() {
    console.log('结束运动');
    
    if (this.data.timer) {
      clearInterval(this.data.timer);
      this.data.timer = null;
    }
    
    this.setData({ 
      isRunning: false 
    });
    
    // 计算步数（简单估算：每100米约120步）
    const estimatedSteps = Math.round(this.data.distance * 1.2);
    this.setData({
      'record.steps': estimatedSteps
    });
    
    // 保存运动记录
    this.saveSportRecord();
    
    // 更新配速图表
    this.updatePaceChart();
    
    wx.showToast({
      title: '运动已结束',
      icon: 'success'
    });
  },

  // 获取位置并记录轨迹
  getLocationAndRecord() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const { latitude, longitude } = res;
        let points = [...this.data.points];
        points.push({ latitude, longitude });
        
        // 计算距离
        let distance = this.data.distance;
        if (points.length > 1) {
          const newDistance = this.calcDistance(points[points.length - 2], points[points.length - 1]);
          distance += newDistance;
          
          // 记录配速数据（每公里记录一次）
          const currentKm = Math.floor(distance / 1000);
          if (currentKm > this.data.paceData.length) {
            const pace = this.data.duration / (distance / 1000); // 分钟/公里
            let paceData = [...this.data.paceData];
            paceData.push({
              km: currentKm,
              pace: pace
            });
            this.setData({ paceData });
          }
        }
        
        this.setData({
          latitude,
          longitude,
          points,
          distance,
          polyline: [{
            points: points,
            color: '#FF0000',
            width: 4
          }],
          distanceStr: (distance / 1000).toFixed(2)
        });
      },
      fail: (err) => {
        console.log('获取位置失败:', err);
      }
    });
  },

  // 更新时长和速度
  updateDurationAndSpeed() {
    const duration = Math.floor((Date.now() - this.data.startTimestamp) / 1000);
    const durationStr = this.formatDuration(duration);
    
    // 速度 km/h
    const speed = this.data.distance > 0 && duration > 0 ? (this.data.distance / 1000) / (duration / 3600) : 0;
    const speedStr = speed.toFixed(2);
    
    // 配速 min/km
    const paceStr = this.formatPace(this.data.distance, duration);

    this.setData({
      duration,
      durationStr,
      speedStr,
      paceStr
    });
  },

  // Haversine 公式计算两点间距离（米）
  calcDistance(p1, p2) {
    const toRad = d => d * Math.PI / 180;
    const R = 6371000;
    const dLat = toRad(p2.latitude - p1.latitude);
    const dLon = toRad(p2.longitude - p1.longitude);
    const lat1 = toRad(p1.latitude);
    const lat2 = toRad(p2.latitude);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  // 保存运动记录
  saveSportRecord() {
    const sportData = {
      type: this.getSportType(),
      typeName: this.data.record.typeName,
      distance: this.data.distance / 1000, // 转换为公里
      duration: this.data.duration,
      steps: this.data.record.steps,
      calories: this.calculateCalories(),
      startTime: new Date(this.data.startTimestamp).toISOString(),
      points: this.data.points,
      paceData: this.data.paceData
    };

    console.log('保存运动数据:', sportData);

    if (app.globalData.token) {
      wx.request({
        url: `${app.globalData.baseUrl}/sport/record`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${app.globalData.token}`
        },
        data: sportData,
        success: (res) => {
          if (res.data.success) {
            wx.showToast({
              title: '运动记录已保存',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: '保存失败',
              icon: 'error'
            });
          }
        },
        fail: (err) => {
          console.error('保存运动记录失败:', err);
          wx.showToast({
            title: '保存失败',
            icon: 'error'
          });
        }
      });
    } else {
      // 如果没有token，保存到本地存储
      const records = wx.getStorageSync('sportRecords') || [];
      records.push({
        id: Date.now(),
        ...sportData
      });
      wx.setStorageSync('sportRecords', records);
      
      // 触发运动记录更新事件
      app.triggerEvent('sportRecordUpdated', { record: sportData });
      
      wx.showToast({
        title: '运动记录已保存',
        icon: 'success'
      });
    }
  },

  // 计算卡路里
  calculateCalories() {
    const weight = 70; // 默认体重，实际应该从用户信息获取
    const duration = this.data.duration / 3600; // 小时
    const speed = parseFloat(this.data.speedStr); // km/h
    
    // 简单的卡路里计算公式
    let calories = 0;
    if (this.data.record.typeName === '跑步') {
      calories = weight * duration * 8; // 跑步消耗
    } else if (this.data.record.typeName === '步行') {
      calories = weight * duration * 4; // 步行消耗
    } else if (this.data.record.typeName === '骑行') {
      calories = weight * duration * 6; // 骑行消耗
    }
    
    return Math.round(calories);
  },

  // 获取运动类型
  getSportType() {
    const typeMap = {
      '跑步': 'running',
      '步行': 'walking',
      '骑行': 'cycling'
    };
    return typeMap[this.data.record.typeName] || 'running';
  },

  // 更新配速图表
  updatePaceChart() {
    if (this.data.paceData.length === 0) return;
    
    const chart = this.selectComponent('#paceChart');
    if (chart) {
      chart.init((canvas, width, height, dpr) => {
        const echarts = require('../../components/echarts/ec-canvas/echarts');
        const chartInstance = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr
        });
        canvas.setChart(chartInstance);
        
        const option = {
          title: {
            text: '配速分析',
            left: 'center',
            top: 10,
            textStyle: { fontSize: 16 }
          },
          tooltip: { 
            trigger: 'axis',
            formatter: function(params) {
              const data = params[0];
              return `${data.name}<br/>配速: ${data.value.toFixed(1)}'00"/km`;
            }
          },
          xAxis: {
            type: 'category',
            data: this.data.paceData.map(item => `${item.km}km`),
            boundaryGap: false
          },
          yAxis: {
            type: 'value',
            name: '配速 (min/km)',
            inverse: true
          },
          series: [{
            name: '配速',
            type: 'line',
            data: this.data.paceData.map(item => item.pace),
            smooth: true,
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [{
                  offset: 0, color: 'rgba(255, 0, 0, 0.3)'
                }, {
                  offset: 1, color: 'rgba(255, 0, 0, 0.1)'
                }]
              }
            },
            lineStyle: {
              color: '#FF0000',
              width: 3
            },
            itemStyle: {
              color: '#FF0000'
            }
          }]
        };
        chartInstance.setOption(option);
        return chartInstance;
      });
    }
  },

  onUnload() {
    // 页面卸载时清除定时器
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  }
}); 