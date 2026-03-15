const express = require('express');
const Course = require('../models/Course');
const Comment = require('../models/Comment');
const User = require('../models/User');
const router = express.Router();

// 获取热门课程（首页）
router.get('/hot', async (req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 }).limit(2);
  res.json({ success: true, data: courses });
});

// 课程列表
router.get('/', async (req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 });
  res.json({ success: true, data: courses });
});

// 课程详情
router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id);
  res.json({ success: true, data: course });
});

// 课程评论列表
router.get('/:id/comments', async (req, res) => {
  const comments = await Comment.find({ course: req.params.id }).populate('user', 'nickName');
  res.json({ success: true, data: comments });
});

// 新增评论（需登录）
router.post('/:id/comment', async (req, res) => {
  // 需前端带token
  const userId = req.user ? req.user.id : null;
  if (!userId) return res.status(401).json({ success: false, message: '未登录' });
  const { content } = req.body;
  const comment = await Comment.create({
    course: req.params.id,
    user: userId,
    content
  });
  res.json({ success: true, data: comment });
});

module.exports = router; 