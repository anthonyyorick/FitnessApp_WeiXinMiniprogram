// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, '用户名不能为空'], 
    unique: true,
    trim: true,
    minlength: [3, '用户名至少3个字符'],
    maxlength: [20, '用户名最多20个字符'],
    match: [/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线']
  },
  password: { 
    type: String, 
    required: [true, '密码不能为空'],
    minlength: [6, '密码至少6个字符']
  },
  nickName: { 
    type: String, 
    default: '',
    trim: true,
    maxlength: [20, '昵称最多20个字符']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '邮箱格式不正确']
  },
  phone: {
    type: String,
    match: [/^1[3-9]\d{9}$/, '手机号格式不正确']
  },
  openid: {
    type: String,
    default: null
  },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other', 'secret'],
    default: 'secret'
  },
  birthday: {
    type: Date
  },
  height: { 
    type: Number, 
    min: [50, '身高不能小于50cm'],
    max: [250, '身高不能大于250cm']
  },
  weight: { 
    type: Number, 
    min: [20, '体重不能小于20kg'],
    max: [300, '体重不能大于300kg']
  },
  avatarUrl: { 
    type: String, 
    default: '' 
  },
  signature: { 
    type: String, 
    default: '',
    maxlength: [100, '个性签名最多100个字符']
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date
  },
  loginCount: {
    type: Number,
    default: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// 更新时间中间件
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  // 只有在密码被修改时才加密
  if (this.isModified('password')) {
    try {
      // 加密密码
      const saltRounds = 12;
      this.password = await bcrypt.hash(this.password, saltRounds);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// 验证密码方法
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('密码比较错误:', error);
    return false;
  }
};

// 更新最后登录时间
UserSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  this.loginCount += 1;
  return this.save();
};

// 获取用户等级
UserSchema.methods.getLevel = function() {
  const levels = [
    { level: 1, name: '新手', minExp: 0 },
    { level: 2, name: '初级', minExp: 100 },
    { level: 3, name: '中级', minExp: 500 },
    { level: 4, name: '高级', minExp: 1000 },
    { level: 5, name: '专家', minExp: 2000 },
    { level: 6, name: '大师', minExp: 5000 }
  ];
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (this.experience >= levels[i].minExp) {
      return levels[i];
    }
  }
  
  return levels[0];
};

// 添加经验值
UserSchema.methods.addExperience = function(exp) {
  this.experience += exp;
  const newLevel = this.getLevel();
  if (newLevel.level > this.level) {
    this.level = newLevel.level;
    return { levelUp: true, newLevel };
  }
  return { levelUp: false };
};

// 虚拟字段：年龄
UserSchema.virtual('age').get(function() {
  if (!this.birthday) return null;
  const today = new Date();
  const birthDate = new Date(this.birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// 虚拟字段：BMI
UserSchema.virtual('bmi').get(function() {
  if (!this.height || !this.weight) return null;
  const heightInMeters = this.height / 100;
  return (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
});

// 确保虚拟字段在JSON中可见
UserSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

// 静态方法：根据用户名查找用户
UserSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username.toLowerCase() });
};

// 静态方法：检查用户名是否可用
UserSchema.statics.isUsernameAvailable = async function(username) {
  const user = await this.findOne({ username: username.toLowerCase() });
  return !user;
};

// 索引
UserSchema.index({ username: 1 });
// UserSchema.index({ email: 1 }); // 移除邮箱索引
// UserSchema.index({ phone: 1 }); // 移除手机号索引
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', UserSchema);
