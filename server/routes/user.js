const express = require('express');
const { jwtAuth } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// 获取用户信息
router.get('/profile', jwtAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取用户信息失败' 
    });
  }
});

// 更新用户信息
router.put('/profile', jwtAuth, async (req, res) => {
  try {
    const { 
      nickName, 
      email, 
      phone, 
      gender, 
      birthday, 
      height, 
      weight, 
      avatarUrl, 
      signature 
    } = req.body;

    // 构建更新数据
    const updateData = {};
    if (nickName !== undefined) updateData.nickName = nickName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (gender !== undefined) updateData.gender = gender;
    if (birthday !== undefined) updateData.birthday = birthday;
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (signature !== undefined) updateData.signature = signature;

    // 检查邮箱是否被其他用户使用
    if (email) {
      const existingEmail = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: req.user._id } 
      });
      if (existingEmail) {
        return res.status(400).json({ 
          success: false, 
          message: '邮箱已被其他用户使用' 
        });
      }
    }

    // 检查手机号是否被其他用户使用
    if (phone) {
      const existingPhone = await User.findOne({ 
        phone, 
        _id: { $ne: req.user._id } 
      });
      if (existingPhone) {
        return res.status(400).json({ 
          success: false, 
          message: '手机号已被其他用户使用' 
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: updatedUser
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    
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
      message: '更新用户信息失败' 
    });
  }
});

// 修改密码
router.put('/password', jwtAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: '当前密码和新密码不能为空' 
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    // 验证当前密码
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: '当前密码错误' 
      });
    }

    // 检查新密码强度
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      return res.status(400).json({ 
        success: false, 
        message: '新密码必须包含字母和数字' 
      });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '修改密码失败' 
    });
  }
});

// 获取用户统计信息
router.get('/stats', jwtAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    // 计算用户等级信息
    const levelInfo = user.getLevel();

    const stats = {
      level: user.level,
      experience: user.experience,
      levelInfo,
      loginCount: user.loginCount,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      age: user.age,
      bmi: user.bmi
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取用户统计失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取用户统计失败' 
    });
  }
});

// 添加经验值
router.post('/experience', jwtAuth, async (req, res) => {
  try {
    const { exp, reason } = req.body;

    if (!exp || exp <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: '经验值必须大于0' 
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    // 添加经验值
    const result = user.addExperience(exp);
    await user.save();

    res.json({
      success: true,
      message: `获得${exp}经验值`,
      data: {
        addedExp: exp,
        totalExp: user.experience,
        levelUp: result.levelUp,
        newLevel: result.newLevel,
        reason: reason || '运动奖励'
      }
    });
  } catch (error) {
    console.error('添加经验值失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '添加经验值失败' 
    });
  }
});

// 删除账户
router.delete('/account', jwtAuth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: '请输入密码确认删除' 
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: '密码错误' 
      });
    }

    // 软删除：设置账户为非活跃状态
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: '账户已删除'
    });
  } catch (error) {
    console.error('删除账户失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '删除账户失败' 
    });
  }
});

module.exports = router; 