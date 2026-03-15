# 数据库操作指南

## 📋 概述

本文档详细说明了如何在MyFitnessApp中向数据库添加数据并显示到前端页面上。系统支持在线和离线两种模式，确保用户在任何情况下都能正常使用应用。

## 🏗️ 系统架构

### 后端架构
```
server/
├── models/          # 数据模型定义
├── routes/          # API路由
├── middleware/      # 中间件
└── app.js          # 主应用文件
```

### 前端架构
```
miniprogram/
├── pages/          # 页面文件
├── components/     # 组件
├── utils/          # 工具类
└── app.js         # 应用入口
```

## 📊 数据模型设计

### 1. 运动记录模型 (Sport.js)

```javascript
const SportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['running', 'walking', 'cycling', 'swimming', 'gym'], required: true },
  distance: { type: Number, default: 0, min: 0 },
  duration: { type: Number, default: 0, min: 0 },
  steps: { type: Number, default: 0, min: 0 },
  calories: { type: Number, default: 0, min: 0 },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  notes: { type: String, maxlength: 500 },
  weather: {
    temperature: Number,
    condition: String
  },
  heartRate: {
    avg: Number,
    max: Number,
    min: Number
  },
  pace: {
    avg: Number,
    best: Number
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 2. 健康记录模型 (Health.js)

```javascript
const HealthSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['heartRate', 'bloodPressure', 'weight', 'sleep'], required: true },
  value: { type: Number, required: true },
  unit: { type: String, required: true },
  recordTime: { type: Date, default: Date.now },
  notes: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
});
```

## 🔌 API接口设计

### 运动记录API

#### 1. 创建运动记录
```http
POST /api/sport/record
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": "running",
  "distance": 5.2,
  "duration": 1800,
  "steps": 6500,
  "calories": 280,
  "startTime": "2024-01-15T07:30:00.000Z",
  "endTime": "2024-01-15T08:00:00.000Z",
  "location": {
    "latitude": 39.9042,
    "longitude": 116.4074,
    "address": "北京市朝阳区"
  },
  "notes": "晨跑，天气很好",
  "weather": {
    "temperature": 18,
    "condition": "晴天"
  },
  "heartRate": {
    "avg": 140,
    "max": 165,
    "min": 120
  },
  "pace": {
    "avg": 5.8,
    "best": 5.2
  }
}
```

#### 2. 获取运动记录列表
```http
GET /api/sport/records?sportType=running&timeRange=week&page=1&limit=20
Authorization: Bearer <token>
```

#### 3. 获取运动统计
```http
GET /api/sport/stats?timeRange=month
Authorization: Bearer <token>
```

#### 4. 更新运动记录
```http
PUT /api/sport/record/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "distance": 5.5,
  "notes": "更新后的备注"
}
```

#### 5. 删除运动记录
```http
DELETE /api/sport/record/:id
Authorization: Bearer <token>
```

## 💻 前端数据操作

### 1. 使用API服务类

```javascript
// 引入API服务
const { ApiService, LocalStorage, DataSync } = require('../../utils/api.js');

// 创建API实例
const api = new ApiService();

// 创建运动记录
async function createSportRecord(sportData) {
  try {
    const result = await api.sport.create(sportData);
    console.log('运动记录创建成功:', result);
    return result;
  } catch (error) {
    console.error('创建失败:', error);
    throw error;
  }
}

// 获取运动记录列表
async function getSportRecords(params = {}) {
  try {
    const result = await api.sport.getList(params);
    console.log('获取运动记录成功:', result);
    return result;
  } catch (error) {
    console.error('获取失败:', error);
    throw error;
  }
}
```

### 2. 本地存储操作

```javascript
// 保存到本地存储
function saveToLocal(sportData) {
  const success = LocalStorage.sport.saveRecord(sportData);
  if (success) {
    console.log('保存到本地成功');
  } else {
    console.error('保存到本地失败');
  }
}

// 从本地存储获取
function getFromLocal() {
  const records = LocalStorage.sport.getRecords();
  console.log('本地记录:', records);
  return records;
}
```

### 3. 数据同步

```javascript
// 同步本地数据到服务器
async function syncData() {
  const isOnline = await DataSync.checkNetwork();
  if (isOnline) {
    const success = await DataSync.syncLocalData();
    if (success) {
      console.log('数据同步成功');
    } else {
      console.error('数据同步失败');
    }
  } else {
    console.log('网络不可用，无法同步');
  }
}
```

## 📱 页面实现示例

### 1. 添加运动记录页面

```javascript
// pages/add-sport/add-sport.js
const { ApiService, LocalStorage } = require('../../utils/api.js');

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
    // ... 其他字段
  },

  // 提交运动记录
  async submitSportRecord() {
    const sportData = {
      type: this.data.selectedType,
      distance: parseFloat(this.data.distance) || 0,
      duration: parseInt(this.data.duration) || 0,
      // ... 其他字段
    };

    try {
      // 如果有token，发送到服务器
      if (app.globalData.token) {
        const api = new ApiService();
        const result = await api.sport.create(sportData);
        wx.showToast({ title: '保存成功', icon: 'success' });
      } else {
        // 否则保存到本地
        LocalStorage.sport.saveRecord(sportData);
        wx.showToast({ title: '已保存到本地', icon: 'success' });
      }
      
      // 返回上一页
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (error) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  }
});
```

### 2. 运动记录列表页面

```javascript
// pages/sport/sport.js
const { ApiService, LocalStorage } = require('../../utils/api.js');

Page({
  data: {
    sportRecords: [],
    loading: false
  },

  onLoad() {
    this.loadSportRecords();
  },

  // 加载运动记录
  async loadSportRecords() {
    this.setData({ loading: true });

    try {
      let records = [];
      
      if (app.globalData.token) {
        // 从服务器获取
        const api = new ApiService();
        const result = await api.sport.getList({
          timeRange: this.data.timeRange,
          sportType: this.data.sportType
        });
        records = result.data.records || [];
      } else {
        // 从本地获取
        records = LocalStorage.sport.getRecords();
      }

      this.setData({
        sportRecords: records,
        loading: false
      });
    } catch (error) {
      console.error('加载失败:', error);
      this.setData({ loading: false });
    }
  }
});
```

## 🔄 数据流程

### 1. 添加数据流程

```
用户输入数据 → 表单验证 → 检查网络状态 → 
├─ 有网络 → 发送到服务器 → 保存成功 → 返回列表页
└─ 无网络 → 保存到本地 → 标记为未同步 → 返回列表页
```

### 2. 显示数据流程

```
页面加载 → 检查登录状态 → 
├─ 已登录 → 从服务器获取数据 → 显示数据
└─ 未登录 → 从本地获取数据 → 显示数据
```

### 3. 数据同步流程

```
应用启动 → 检查网络 → 
├─ 有网络 → 同步本地数据到服务器 → 清除本地数据
└─ 无网络 → 继续使用本地数据
```

## 🛠️ 开发工具

### 1. 数据库连接测试

```javascript
// 测试数据库连接
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/myfitness', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, '连接失败:'));
db.once('open', function() {
  console.log('数据库连接成功!');
});
```

### 2. API测试

```bash
# 测试创建运动记录
curl -X POST http://localhost:3000/api/sport/record \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "running",
    "distance": 5.2,
    "duration": 1800,
    "calories": 280
  }'

# 测试获取运动记录
curl -X GET http://localhost:3000/api/sport/records \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. 前端调试

```javascript
// 在页面中添加调试信息
console.log('当前数据:', this.data);
console.log('API响应:', result);
console.log('本地存储:', wx.getStorageSync('localSportRecords'));
```

## 📋 最佳实践

### 1. 数据验证

- 前端和后端都要进行数据验证
- 使用正则表达式验证格式
- 设置合理的数值范围

### 2. 错误处理

- 捕获所有可能的异常
- 提供用户友好的错误信息
- 记录详细的错误日志

### 3. 性能优化

- 使用分页加载大量数据
- 实现数据缓存机制
- 优化网络请求频率

### 4. 用户体验

- 提供加载状态指示
- 实现离线功能
- 支持数据同步

## 🚀 部署说明

### 1. 后端部署

```bash
# 安装依赖
cd server
npm install

# 启动服务器
npm start

# 或者使用PM2
pm2 start app.js --name myfitness-api
```

### 2. 数据库配置

```javascript
// 配置MongoDB连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myfitness';
mongoose.connect(MONGODB_URI);
```

### 3. 环境变量

```bash
# .env文件
PORT=3000
MONGODB_URI=mongodb://localhost:27017/myfitness
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

## 📞 技术支持

如果在使用过程中遇到问题，请：

1. 查看控制台错误信息
2. 检查网络连接状态
3. 验证API接口是否正常
4. 确认数据库连接状态
5. 查看服务器日志

---

*本文档会随着系统更新而持续完善，请关注最新版本。* 