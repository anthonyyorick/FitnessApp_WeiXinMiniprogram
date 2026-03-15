const express = require('express');
const Health = require('../models/Health');
const router = express.Router();

// 新增健康指标
router.post('/record', async (req, res) => {
  const { type, value, unit, time } = req.body;
  const record = await Health.create({
    user: req.user.id,
    type,
    value,
    unit,
    time: time ? new Date(time) : new Date()
  });
  res.json({ success: true, data: record });
});

// 获取健康指标数据（趋势+最新+历史）
router.get('/data', async (req, res) => {
  const { type, timeRange } = req.query;
  const query = { user: req.user.id, type };
  // 时间范围过滤
  let from;
  const now = new Date();
  if (timeRange === '7days') from = new Date(now - 7 * 24 * 60 * 60 * 1000);
  if (timeRange === '30days') from = new Date(now - 30 * 24 * 60 * 60 * 1000);
  if (timeRange === '1year') from = new Date(now - 365 * 24 * 60 * 60 * 1000);
  if (from) query.time = { $gte: from };
  const records = await Health.find(query).sort({ time: -1 });
  // 构造趋势图数据
  const chartData = records.slice(-7).map(r => ({ date: r.time.toLocaleDateString(), value: r.value }));
  const latestData = records[0] || null;
  res.json({
    success: true,
    data: {
      chartData,
      latestData: latestData ? {
        value: latestData.value,
        unit: latestData.unit,
        time: latestData.time
      } : {},
      records: records.map(r => ({
        id: r._id,
        value: r.value,
        unit: r.unit,
        time: r.time
      }))
    }
  });
});

// 获取今日健康概览
router.get('/today', async (req, res) => {
  const user = req.user.id;
  // 取最新一条心率、步数、睡眠
  const heartRate = await Health.findOne({ user, type: 'heartRate' }).sort({ time: -1 });
  const steps = await Health.findOne({ user, type: 'steps' }).sort({ time: -1 });
  const sleep = await Health.findOne({ user, type: 'sleep' }).sort({ time: -1 });
  res.json({
    success: true,
    data: {
      heartRate: heartRate ? heartRate.value : 75,
      steps: steps ? steps.value : 8567,
      sleep: sleep ? sleep.value : '良好',
      sleepUnit: sleep ? sleep.unit : ''
    }
  });
});

module.exports = router; 