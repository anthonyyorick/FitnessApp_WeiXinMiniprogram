const app = getApp();

Page({
  data: {
    healthType: 'heartRate', // heartRate, bloodPressure, sleep, weight
    timeRange: '7days', // 7days, 30days, 1year
    healthTypeName: '心率',
    chartData: [],
    latestData: {
      value: 0,
      unit: 'bpm',
      time: ''
    },
    healthRecords: [],
    ec: {
      lazyLoad: true
    }
  },

  onLoad(options) {
    // 如果有传入的type参数，设置健康指标类型
    if (options.type) {
      this.setData({
        healthType: options.type
      });
      this.updateHealthTypeName();
    }
    
    // 初始化默认数据
    this.loadHealthData();
  },

  onShow() {
    this.loadHealthData();
  },

  onPullDownRefresh() {
    this.loadHealthData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReady() {
    console.log('页面准备完成，开始初始化图表');
    // 延迟初始化图表，确保数据已加载
    setTimeout(() => {
      console.log('延迟初始化图表');
      this.initHealthChart();
    }, 1000);
  },

  // 切换健康指标类型
  switchHealthType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      healthType: type
    });
    this.updateHealthTypeName();
    this.loadHealthData();
  },

  // 切换时间范围
  switchTimeRange(e) {
    const range = e.currentTarget.dataset.range;
    this.setData({
      timeRange: range
    });
    this.loadHealthData();
  },

  // 更新健康指标名称
  updateHealthTypeName() {
    const typeNames = {
      heartRate: '心率',
      bloodPressure: '血压',
      sleep: '睡眠',
      weight: '体重'
    };
    
    this.setData({
      healthTypeName: typeNames[this.data.healthType]
    });
  },

  // 加载健康数据
  loadHealthData() {
    return new Promise((resolve) => {
      console.log('开始加载健康数据');
      
      // 优先从本地存储加载数据
      const localRecords = this.loadLocalHealthRecords();
      
      if (localRecords.length > 0) {
        console.log('📱 从本地存储获取健康数据');
        // 使用本地数据
        this.setData({
          healthRecords: localRecords
        });
        // 生成图表数据
        this.generateChartDataFromRecords(localRecords);
      } else {
        // 如果没有本地数据，尝试从服务器获取
        if (app.globalData.token) {
          console.log('🌐 从服务器获取健康数据');
          this.loadServerData();
        } else {
          // 未登录时显示空状态
          console.log('🔐 未登录，显示空状态');
          this.setEmptyState();
        }
      }
      
      resolve();
    });
  },

  // 从本地存储加载健康记录
  loadLocalHealthRecords() {
    try {
      const records = wx.getStorageSync('localHealthRecords') || [];
      
      // 根据健康类型筛选
      const filteredRecords = records.filter(record => record.type === this.data.healthType);
      
      // 按时间排序，确保最新的数据在后面
      const sortedRecords = filteredRecords.sort((a, b) => {
        const timeA = this.parseDate(a.createdAt || a.time);
        const timeB = this.parseDate(b.createdAt || b.time);
        return timeA - timeB;
      });
      
      // 格式化记录数据
      return sortedRecords.map(record => ({
        ...record,
        value: record.value,
        unit: this.getHealthUnit(record.type),
        time: this.formatTime(record.createdAt || record.time)
      }));
    } catch (error) {
      console.error('加载本地健康记录失败:', error);
      return [];
    }
  },

  // 获取健康指标单位
  getHealthUnit(type) {
    const unitMap = {
      'heartRate': 'bpm',
      'bloodPressure': 'mmHg',
      'sleep': '小时',
      'weight': 'kg'
    };
    return unitMap[type] || '';
  },

  // 格式化时间
  formatTime(timeStr) {
    if (!timeStr) return '';
    const date = this.parseDate(timeStr);
    if (!date) return timeStr;
    
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  },

  // 从记录生成图表数据
  generateChartDataFromRecords(records) {
    // 按时间排序，确保最新的数据在后面
    const sortedRecords = records.sort((a, b) => {
      const timeA = this.parseDate(a.createdAt || a.time);
      const timeB = this.parseDate(b.createdAt || b.time);
      return timeA - timeB;
    });

    const chartData = sortedRecords.map(record => ({
      date: this.formatTime(record.createdAt || record.time),
      value: record.value
    }));

    // 获取最新数据
    const latestRecord = sortedRecords[sortedRecords.length - 1];
    const latestData = {
      value: latestRecord ? latestRecord.value : 0,
      unit: this.getHealthUnit(this.data.healthType),
      time: latestRecord ? this.formatTime(latestRecord.createdAt || latestRecord.time) : ''
    };

    this.setData({
      chartData: chartData,
      latestData: latestData
    });

    // 更新图表
    this.updateChart();
  },

  // 从服务器加载数据
  loadServerData() {
    wx.request({
      url: `${app.globalData.baseUrl}/health/records`,
      method: 'GET',
      data: {
        type: this.data.healthType,
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
            value: record.value,
            unit: this.getHealthUnit(record.type),
            time: this.formatTime(record.createdAt || record.time)
          }));
          
          this.setData({
            healthRecords: formattedRecords
          });
          
          // 生成图表数据
          this.generateChartDataFromRecords(formattedRecords);
          
          // 保存到本地存储
          const allRecords = wx.getStorageSync('localHealthRecords') || [];
          const updatedRecords = allRecords.filter(record => record.type !== this.data.healthType);
          updatedRecords.push(...records);
          wx.setStorageSync('localHealthRecords', updatedRecords);
        } else {
          console.log('获取健康数据失败，显示空状态');
          this.setEmptyState();
        }
      },
      fail: (err) => {
        console.log('网络请求失败，显示空状态');
        this.setEmptyState();
      }
    });
  },

  // 设置空状态
  setEmptyState() {
    this.setData({
      chartData: [],
      latestData: {
        value: 0,
        unit: this.getHealthUnit(this.data.healthType),
        time: ''
      },
      healthRecords: []
    });
  },

  // 测试图表功能
  testChart() {
    console.log('=== 图表功能测试开始 ===');
    console.log('1. 检查数据:', this.data);
    console.log('2. 检查图表实例:', this.chart);
    console.log('3. 检查图表组件:', this.selectComponent('#healthChart'));
    
    // 强制重新加载数据
    this.loadHealthData();
    
    // 强制重新初始化图表
    setTimeout(() => {
      this.initHealthChart();
    }, 500);
    
    console.log('=== 图表功能测试结束 ===');
  },

  // 手动记录健康数据
  addHealth() {
    wx.navigateTo({
      url: '/pages/add-health/add-health'
    });
  },

  // 初始化 ECharts 图表
  initHealthChart() {
    console.log('开始初始化图表');
    const chartComponent = this.selectComponent('#healthChart');
    if (!chartComponent) {
      console.error('找不到图表组件');
      return;
    }
    
    chartComponent.init((canvas, width, height, dpr) => {
      console.log('图表组件初始化回调', { width, height, dpr });
      const echarts = require('../../components/echarts/ec-canvas/echarts');
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });
      canvas.setChart(chart);
      this.chart = chart;
      
      // 确保有数据后再设置图表选项
      if (this.data.chartData && this.data.chartData.length > 0) {
        this.setHealthChartOption(chart);
      } else {
        console.log('等待数据加载完成');
        // 如果没有数据，等待数据加载完成后再设置
        setTimeout(() => {
          if (this.chart && this.data.chartData && this.data.chartData.length > 0) {
            this.setHealthChartOption(this.chart);
          }
        }, 1000);
      }
      
      return chart;
    });
  },

  // 更新图表
  updateChart() {
    console.log('更新图表', this.chart, this.data.chartData);
    if (this.chart && this.data.chartData && this.data.chartData.length > 0) {
      this.setHealthChartOption(this.chart);
    } else {
      console.log('图表或数据未准备好，延迟更新');
      // 如果图表或数据未准备好，延迟更新
      setTimeout(() => {
        if (this.chart && this.data.chartData && this.data.chartData.length > 0) {
          this.setHealthChartOption(this.chart);
        }
      }, 500);
    }
  },

  // 设置图表 option
  setHealthChartOption(chart) {
    console.log('设置图表配置', this.data.chartData, this.data.healthTypeName, this.data.healthType);
    const { chartData, healthTypeName, healthType } = this.data;
    
    if (!chartData || chartData.length === 0) {
      console.log('图表数据为空，显示空状态');
      // 显示空状态图表
      const option = {
        title: {
          text: `${healthTypeName}趋势图`,
          left: 'center',
          top: 10,
          textStyle: { 
            fontSize: 16, 
            color: '#333',
            fontWeight: 'bold'
          }
        },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: '暂无数据',
            fontSize: 16,
            fill: '#999'
          }
        }
      };
      chart.setOption(option);
      return;
    }
    
    const xData = chartData.map(item => item.date);
    
    // 根据健康指标类型处理数据
    let yData, yAxisConfig, seriesConfig;
    
    switch (healthType) {
      case 'heartRate':
        yData = chartData.map(item => Number(item.value));
        yAxisConfig = {
          type: 'value',
          name: '心率 (bpm)',
          min: 60,
          max: 90,
          axisLabel: { color: '#666' }
        };
        seriesConfig = {
          name: '心率',
          type: 'line',
          data: yData,
          smooth: true,
          lineStyle: { color: '#ff6b6b', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(255, 107, 107, 0.3)' },
                { offset: 1, color: 'rgba(255, 107, 107, 0.1)' }
              ]
            }
          },
          itemStyle: { color: '#ff6b6b' }
        };
        break;
        
      case 'bloodPressure':
        // 血压需要显示两条线（收缩压和舒张压）
        const systolicData = chartData.map(item => {
          const parts = item.value.split('/');
          return Number(parts[0]);
        });
        const diastolicData = chartData.map(item => {
          const parts = item.value.split('/');
          return Number(parts[1]);
        });
        
        yAxisConfig = {
          type: 'value',
          name: '血压 (mmHg)',
          min: 60,
          max: 140,
          axisLabel: { color: '#666' }
        };
        
        seriesConfig = [
          {
            name: '收缩压',
            type: 'line',
            data: systolicData,
            smooth: true,
            lineStyle: { color: '#ff6b6b', width: 3 },
            itemStyle: { color: '#ff6b6b' }
          },
          {
            name: '舒张压',
            type: 'line',
            data: diastolicData,
            smooth: true,
            lineStyle: { color: '#4ecdc4', width: 3 },
            itemStyle: { color: '#4ecdc4' }
          }
        ];
        break;
        
      case 'sleep':
        yData = chartData.map(item => Number(item.value));
        yAxisConfig = {
          type: 'value',
          name: '睡眠时长 (小时)',
          min: 5,
          max: 9,
          axisLabel: { color: '#666' }
        };
        seriesConfig = {
          name: '睡眠时长',
          type: 'line',
          data: yData,
          smooth: true,
          lineStyle: { color: '#45b7d1', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(69, 183, 209, 0.3)' },
                { offset: 1, color: 'rgba(69, 183, 209, 0.1)' }
              ]
            }
          },
          itemStyle: { color: '#45b7d1' }
        };
        break;
        
      case 'weight':
        yData = chartData.map(item => Number(item.value));
        yAxisConfig = {
          type: 'value',
          name: '体重 (kg)',
          min: 64,
          max: 68,
          axisLabel: { color: '#666' }
        };
        seriesConfig = {
          name: '体重',
          type: 'line',
          data: yData,
          smooth: true,
          lineStyle: { color: '#96ceb4', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(150, 206, 180, 0.3)' },
                { offset: 1, color: 'rgba(150, 206, 180, 0.1)' }
              ]
            }
          },
          itemStyle: { color: '#96ceb4' }
        };
        break;
    }
    
    const option = {
      title: {
        text: `${healthTypeName}趋势图`,
        left: 'center',
        top: 10,
        textStyle: { 
          fontSize: 16, 
          color: '#333',
          fontWeight: 'bold'
        }
      },
      tooltip: { 
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#ddd',
        borderWidth: 1,
        textStyle: { color: '#333' }
      },
      legend: {
        data: healthType === 'bloodPressure' ? ['收缩压', '舒张压'] : [healthTypeName],
        top: 40,
        textStyle: { color: '#666' }
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '25%',
        bottom: '15%'
      },
      xAxis: {
        type: 'category',
        data: xData,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#ddd' } },
        axisLabel: { color: '#666' }
      },
      yAxis: yAxisConfig,
      series: Array.isArray(seriesConfig) ? seriesConfig : [seriesConfig]
    };
    
    console.log('图表配置', option);
    chart.setOption(option);
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

  // 加载健康记录
  loadHealthRecords() {
    // 实现加载健康记录的逻辑
  }
}); 