const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT密钥，在生产环境中应该使用环境变量
const SECRET = process.env.JWT_SECRET || 'myfitnessapp_secret_key_2024';

// JWT认证中间件
function jwtAuth(req, res, next) {
  try {
    // 从请求头获取token
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: '未提供认证令牌' 
      });
    }

    // 检查token格式
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: '认证令牌格式错误' 
      });
    }

    // 验证token
    jwt.verify(token, SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            success: false, 
            message: '认证令牌已过期' 
          });
        } else if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({ 
            success: false, 
            message: '认证令牌无效' 
          });
        } else {
          return res.status(401).json({ 
            success: false, 
            message: '认证失败' 
          });
        }
      }

      try {
        // 检查用户是否存在
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
          return res.status(401).json({ 
            success: false, 
            message: '用户不存在' 
          });
        }

        // 将用户信息添加到请求对象
        req.user = user;
        next();
      } catch (dbError) {
        console.error('数据库查询错误:', dbError);
        return res.status(500).json({ 
          success: false, 
          message: '服务器内部错误' 
        });
      }
    });
  } catch (error) {
    console.error('认证中间件错误:', error);
    return res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
}

// 可选认证中间件（不强制要求登录）
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      req.user = null;
      return next();
    }

    jwt.verify(token, SECRET, async (err, decoded) => {
      if (err) {
        req.user = null;
        return next();
      }

      try {
        const user = await User.findById(decoded.id).select('-password');
        req.user = user || null;
        next();
      } catch (dbError) {
        console.error('数据库查询错误:', dbError);
        req.user = null;
        next();
      }
    });
  } catch (error) {
    console.error('可选认证中间件错误:', error);
    req.user = null;
    next();
  }
}

// 生成token
function generateToken(userId) {
  return jwt.sign({ id: userId }, SECRET, { 
    expiresIn: '7d' // 7天过期
  });
}

// 验证token（不查询数据库）
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    return null;
  }
}

// 刷新token
function refreshToken(userId) {
  return jwt.sign({ id: userId }, SECRET, { 
    expiresIn: '30d' // 30天过期
  });
}

module.exports = { 
  jwtAuth, 
  optionalAuth,
  generateToken,
  verifyToken,
  refreshToken,
  SECRET 
}; 