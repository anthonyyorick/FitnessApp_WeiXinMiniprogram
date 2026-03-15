const express = require('express');
const { generateToken, refreshToken } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 基本数据验证
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名和密码不能为空' 
      });
    }

    if (username.length < 3) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名至少3个字符' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: '密码至少6个字符' 
      });
    }

    // 检查用户名是否已存在
    console.log('🔍 检查用户名:', username.toLowerCase());
    const existingUser = await User.findOne({ 
      username: username.toLowerCase() 
    });
    console.log('📊 查询结果:', existingUser ? '用户已存在' : '用户不存在');
    
    if (existingUser) {
      console.log('❌ 用户名已存在，拒绝注册');
      return res.status(400).json({ 
        success: false, 
        message: '用户名已存在' 
      });
    }

    console.log('✅ 用户名可用，开始创建用户');
    // 创建新用户
    const userData = {
      username: username.toLowerCase(),
      password,
      nickName: username
    };

    const user = await User.create(userData);

    // 生成token
    const token = generateToken(user._id);
    
    // 返回用户信息（不包含密码）
    const userResponse = user.toJSON();

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        token,
        userInfo: userResponse
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    
    // 处理MongoDB唯一索引错误
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名已存在' 
      });
    }

    // 处理验证错误
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: messages[0] 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: '注册失败，请重试' 
    });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 数据验证
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名和密码不能为空' 
      });
    }
    
    // 查找用户
    const user = await User.findOne({ 
      username: username.toLowerCase() 
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: '用户名或密码错误' 
      });
    }

    // 检查用户是否被禁用
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: '账户已被禁用，请联系管理员' 
      });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: '用户名或密码错误' 
      });
    }

    // 更新最后登录时间和登录次数
    await user.updateLastLogin();

    // 生成token
    const token = generateToken(user._id);
    
    // 返回用户信息（不包含密码）
    const userResponse = user.toJSON();

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        userInfo: userResponse
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '登录失败，请重试' 
    });
  }
});

// 刷新token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token不能为空' 
      });
    }

    // 验证当前token
    const jwt = require('jsonwebtoken');
    const { SECRET } = require('../middleware/auth');
    
    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    // 生成新token
    const newToken = refreshToken(user._id);
    
    res.json({
      success: true,
      message: 'Token刷新成功',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Token刷新错误:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Token无效或已过期' 
    });
  }
});

// 检查用户名是否可用
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名不能为空' 
      });
    }

    const isAvailable = await User.isUsernameAvailable(username);
    
    res.json({
      success: true,
      data: {
        username,
        available: isAvailable
      }
    });
  } catch (error) {
    console.error('检查用户名错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '检查失败' 
    });
  }
});

// 忘记密码（发送重置邮件）
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: '邮箱不能为空' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '该邮箱未注册' 
      });
    }

    // 这里应该发送重置密码邮件
    // 暂时返回成功消息
    res.json({
      success: true,
      message: '重置密码邮件已发送，请查收'
    });
  } catch (error) {
    console.error('忘记密码错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '发送失败，请重试' 
    });
  }
});

// 重置密码
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token和新密码不能为空' 
      });
    }

    // 这里应该验证重置token
    // 暂时返回成功消息
    res.json({
      success: true,
      message: '密码重置成功'
    });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '重置失败，请重试' 
    });
  }
});

// 退出登录
router.post('/logout', (req, res) => {
  // 在JWT中，客户端只需要删除token即可
  // 这里可以记录退出日志
  res.json({
    success: true,
    message: '退出成功'
  });
});

module.exports = router;