const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { jwtAuth } = require('./middleware/auth');

const app = express();

// 配置中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 数据库连接
mongoose.connect('mongodb://127.0.0.1:27017/myfitnessapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', jwtAuth, require('./routes/user'));
app.use('/api/sport', jwtAuth, require('./routes/sport'));
app.use('/api/health', jwtAuth, require('./routes/health'));
app.use('/api/courses', require('./routes/course'));

// 启动服务
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 