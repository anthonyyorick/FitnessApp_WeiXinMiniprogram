const express = require('express');
const Sport = require('../models/Sport');
const router = express.Router();

// 新增运动记录
router.post('/record', async (req, res) => {
  try {
    const { 
      type, 
      distance, 
      duration, 
      steps, 
      calories, 
      startTime, 
      endTime,
      location,
      notes,
      weather,
      heartRate,
      pace
    } = req.body;

    // 数据验证
    if (!type || !['running', 'walking', 'cycling', 'swimming', 'gym'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: '运动类型无效' 
      });
    }

    if (distance < 0 || duration < 0 || steps < 0 || calories < 0) {
      return res.status(400).json({ 
        success: false, 
        message: '数值不能为负数' 
      });
    }

    const record = await Sport.create({
      user: req.user.id,
      type,
      distance: distance || 0,
      duration: duration || 0,
      steps: steps || 0,
      calories: calories || 0,
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : null,
      location,
      notes,
      weather,
      heartRate,
      pace
    });

    // 返回创建的数据
    const savedRecord = await Sport.findById(record._id).populate('user', 'username nickName');
    
    res.status(201).json({ 
      success: true, 
      message: '运动记录创建成功',
      data: savedRecord 
    });
  } catch (error) {
    console.error('创建运动记录失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});

// 获取运动记录列表
router.get('/records', async (req, res) => {
  try {
    const { 
      sportType, 
      timeRange, 
      page = 1, 
      limit = 20,
      sortBy = 'startTime',
      sortOrder = 'desc'
    } = req.query;

    const query = { user: req.user.id };
    
    // 运动类型过滤
    if (sportType && sportType !== 'all') {
      query.type = sportType;
    }
    
    // 时间范围过滤
    if (timeRange) {
      const now = new Date();
      let from;
      
      switch (timeRange) {
        case 'today':
          from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          from = new Date(now - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          from = new Date(now - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          from = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      if (from) {
        query.startTime = { $gte: from };
      }
    }

    // 分页
    const skip = (page - 1) * limit;
    
    // 排序
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const records = await Sport.find(query)
      .populate('user', 'username nickName avatarUrl')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // 获取总数
    const total = await Sport.countDocuments(query);

    res.json({ 
      success: true, 
      data: {
        records,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取运动记录失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});

// 获取运动统计
router.get('/stats', async (req, res) => {
  try {
    const { timeRange } = req.query;
    const query = { user: req.user.id };
    
    if (timeRange) {
      const now = new Date();
      let from;
      
      switch (timeRange) {
        case 'today':
          from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          from = new Date(now - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          from = new Date(now - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          from = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      if (from) {
        query.startTime = { $gte: from };
      }
    }

    const records = await Sport.find(query);
    
    // 计算统计数据
    const stats = {
      totalRecords: records.length,
      steps: records.reduce((sum, r) => sum + (r.steps || 0), 0),
      distance: records.reduce((sum, r) => sum + (r.distance || 0), 0),
      duration: records.reduce((sum, r) => sum + (r.duration || 0), 0),
      calories: records.reduce((sum, r) => sum + (r.calories || 0), 0),
      avgDistance: records.length > 0 ? records.reduce((sum, r) => sum + (r.distance || 0), 0) / records.length : 0,
      avgDuration: records.length > 0 ? records.reduce((sum, r) => sum + (r.duration || 0), 0) / records.length : 0,
      avgCalories: records.length > 0 ? records.reduce((sum, r) => sum + (r.calories || 0), 0) / records.length : 0
    };

    // 按类型统计
    const typeStats = {};
    ['running', 'walking', 'cycling', 'swimming', 'gym'].forEach(type => {
      const typeRecords = records.filter(r => r.type === type);
      typeStats[type] = {
        count: typeRecords.length,
        distance: typeRecords.reduce((sum, r) => sum + (r.distance || 0), 0),
        duration: typeRecords.reduce((sum, r) => sum + (r.duration || 0), 0),
        calories: typeRecords.reduce((sum, r) => sum + (r.calories || 0), 0)
      };
    });

    stats.typeStats = typeStats;

    res.json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    console.error('获取运动统计失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});

// 获取运动详情
router.get('/detail/:id', async (req, res) => {
  try {
    const record = await Sport.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    }).populate('user', 'username nickName avatarUrl');

    if (!record) {
      return res.status(404).json({ 
        success: false, 
        message: '运动记录不存在' 
      });
    }

    res.json({ 
      success: true, 
      data: record 
    });
  } catch (error) {
    console.error('获取运动详情失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});

// 更新运动记录
router.put('/record/:id', async (req, res) => {
  try {
    const { 
      type, 
      distance, 
      duration, 
      steps, 
      calories, 
      startTime, 
      endTime,
      location,
      notes,
      weather,
      heartRate,
      pace
    } = req.body;

    const record = await Sport.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!record) {
      return res.status(404).json({ 
        success: false, 
        message: '运动记录不存在' 
      });
    }

    // 更新字段
    const updateData = {};
    if (type) updateData.type = type;
    if (distance !== undefined) updateData.distance = distance;
    if (duration !== undefined) updateData.duration = duration;
    if (steps !== undefined) updateData.steps = steps;
    if (calories !== undefined) updateData.calories = calories;
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (location) updateData.location = location;
    if (notes !== undefined) updateData.notes = notes;
    if (weather) updateData.weather = weather;
    if (heartRate) updateData.heartRate = heartRate;
    if (pace) updateData.pace = pace;

    const updatedRecord = await Sport.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'username nickName avatarUrl');

    res.json({ 
      success: true, 
      message: '运动记录更新成功',
      data: updatedRecord 
    });
  } catch (error) {
    console.error('更新运动记录失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});

// 删除运动记录
router.delete('/record/:id', async (req, res) => {
  try {
    const record = await Sport.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!record) {
      return res.status(404).json({ 
        success: false, 
        message: '运动记录不存在' 
      });
    }

    await Sport.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true, 
      message: '运动记录删除成功' 
    });
  } catch (error) {
    console.error('删除运动记录失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});

module.exports = router; 