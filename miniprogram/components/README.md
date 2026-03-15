# 自定义组件目录

此目录用于存放小程序的自定义组件，可以包括：

## 建议组件
- `health-card` - 健康数据卡片组件
- `sport-record` - 运动记录卡片组件
- `course-card` - 课程卡片组件
- `chart` - 图表组件（如使用ECharts）
- `loading` - 加载组件
- `empty` - 空状态组件

## 组件开发规范
1. 每个组件包含四个文件：
   - `component-name.wxml` - 组件模板
   - `component-name.js` - 组件逻辑
   - `component-name.wxss` - 组件样式
   - `component-name.json` - 组件配置

2. 组件配置示例：
```json
{
  "component": true,
  "usingComponents": {}
}
```

3. 组件使用示例：
```json
{
  "usingComponents": {
    "health-card": "/components/health-card/health-card"
  }
}
```

## 注意事项
- 组件路径使用绝对路径
- 组件名使用kebab-case命名
- 组件应该具有良好的复用性 