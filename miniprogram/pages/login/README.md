# 登录注册页面

## 功能说明

这是一个独立的登录注册页面，提供以下功能：

1. **登录功能**：用户可以使用用户名和密码登录
2. **注册功能**：新用户可以注册账号
3. **表单切换**：可以在登录和注册表单之间切换
4. **响应式设计**：适配不同屏幕尺寸

## 页面结构

- `login.js` - 页面逻辑
- `login.wxml` - 页面结构
- `login.wxss` - 页面样式
- `login.json` - 页面配置

## 跳转逻辑

### 从其他页面跳转到登录页面

```javascript
// 跳转到登录页面
wx.navigateTo({
  url: '/pages/login/login'
});

// 跳转到注册页面
wx.navigateTo({
  url: '/pages/login/login?mode=register'
});
```

### 登录成功后的跳转

- 如果是从其他页面跳转过来的，会返回上一页
- 如果是直接访问的，会跳转到首页

## API接口

### 登录接口
- URL: `POST /api/auth/login`
- 参数: `{ username, password }`
- 返回: `{ success: true, data: { token, userInfo } }`

### 注册接口
- URL: `POST /api/auth/register`
- 参数: `{ username, password }`
- 返回: `{ success: true, data: { token, userInfo } }`

## 样式特点

1. **渐变背景**：使用紫色渐变背景
2. **毛玻璃效果**：导航栏使用毛玻璃效果
3. **圆角设计**：所有输入框和按钮都使用圆角设计
4. **阴影效果**：卡片和按钮都有阴影效果
5. **动画效果**：按钮点击时有动画效果

## 使用示例

在"我的"页面中，当用户未登录时显示登录按钮：

```wxml
<view class="login-tip" wx:if="{{!userInfo.username}}">
  <view class="tip-content">
    <text class="tip-text">请先登录以使用完整功能</text>
    <button class="login-btn" bindtap="goToLogin">立即登录</button>
  </view>
</view>
```

```javascript
// 跳转到登录页面
goToLogin() {
  wx.navigateTo({
    url: '/pages/login/login'
  });
}
``` 