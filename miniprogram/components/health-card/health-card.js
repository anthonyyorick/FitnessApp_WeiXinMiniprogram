Component({
  data:{
    // 图片映射表，根据type或title来匹配对应的图片
    imageMap: {
      // 运动相关
      'sport': '/images/figure_running.png',
      'running': '/images/figure_running.png',
      'exercise': '/images/figure_running1.png',
      'workout': '/images/figure_running1.png',
      
      // 健康相关
      'health': '/images/people.png',
      'weight': '/images/people.png',
      'bmi': '/images/people.png',
      
      // 心率相关
      'heart': '/images/person.png',
      'heartrate': 'https://pic2.zhimg.com/100/v2-543e566282fdb1cb4f2ff97621eb5f15_r.jpg',
      'pulse': '/images/person.png',
      
      // 步数相关
      'steps': 'https://pica.zhimg.com/100/v2-7abaf79c5e5d180048c543a7004581e0_r.jpg',
      'walking': '/images/figure_running.png',
      
      // 卡路里相关
      'calories': '/images/figure_running1.png',
      'calorie': '/images/figure_running1.png',
      
      // 睡眠相关
      'sleep': 'https://pic2.zhimg.com/100/v2-fa55d4847303de024a09771c79c471af_r.jpg',
      'rest': '/images/house_fill.png',
      
      // 默认图片
      'default': '/images/figure_running.png'
    },
    
    // 背景色映射表，根据type或title来匹配对应的背景色
    backgroundColorMap: {
      // 心率相关 - 红色系
      'heart': 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
      'heartrate': 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
      'pulse': 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
      
      // 步数相关 - 绿色系
      'steps': 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
      'walking': 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
      'running': 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
      
      // 运动相关 - 蓝色系
      'sport': 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
      'exercise': 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
      'workout': 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
      
      // 睡眠相关 - 紫色系
      'sleep': 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
      'rest': 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
      
      // 体重相关 - 橙色系
      'weight': 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)',
      'bmi': 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)',
      
      // 卡路里相关 - 黄色系
      'calories': 'linear-gradient(135deg, #fffde7 0%, #fff59d 100%)',
      'calorie': 'linear-gradient(135deg, #fffde7 0%, #fff59d 100%)',
      
      // 健康相关 - 青色系
      'health': 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
      
      // 默认背景色
      'default': 'linear-gradient(135deg, #f9fdf9 0%, #e8f5e8 100%)'
    }
  },
  
  properties: {
    title: {
      type: String,
      value: ''
    },
    subtitle: {
      type: String,
      value: ''
    },
    value: {
      type: String,
      value: ''
    },
    unit: {
      type: String,
      value: ''
    },
    footer: {
      type: String,
      value: ''
    },
    type: {
      type: String,
      value: ''
    },
    // 新增：直接指定图片URL
    imageUrl: {
      type: String,
      value: ''
    },
    // 新增：直接指定背景色
    backgroundColor: {
      type: String,
      value: ''
    }
  },

  lifetimes: {
    attached() {
      // 组件加载时计算图片URL和背景色
      this.setData({
        currentImageUrl: this.getImageUrl(),
        currentBackgroundColor: this.getBackgroundColor()
      });
    }
  },

  methods: {
    // 获取图片URL的方法
    getImageUrl() {
      // 如果直接指定了imageUrl，优先使用
      if (this.data.imageUrl) {
        return this.data.imageUrl;
      }
      
      // 根据type匹配图片
      if (this.data.type && this.data.imageMap[this.data.type.toLowerCase()]) {
        return this.data.imageMap[this.data.type.toLowerCase()];
      }
      
      // 根据title匹配图片
      if (this.data.title) {
        const titleLower = this.data.title.toLowerCase();
        for (const [key, url] of Object.entries(this.data.imageMap)) {
          if (titleLower.includes(key)) {
            return url;
          }
        }
      }
      
      // 返回默认图片
      return this.data.imageMap.default;
    },
    
    // 获取背景色的方法
    getBackgroundColor() {
      // 如果直接指定了backgroundColor，优先使用
      if (this.data.backgroundColor) {
        return this.data.backgroundColor;
      }
      
      // 根据type匹配背景色
      if (this.data.type && this.data.backgroundColorMap[this.data.type.toLowerCase()]) {
        return this.data.backgroundColorMap[this.data.type.toLowerCase()];
      }
      
      // 根据title匹配背景色
      if (this.data.title) {
        const titleLower = this.data.title.toLowerCase();
        for (const [key, color] of Object.entries(this.data.backgroundColorMap)) {
          if (titleLower.includes(key)) {
            return color;
          }
        }
      }
      
      // 返回默认背景色
      return this.data.backgroundColorMap.default;
    },
    
    onTap() {
      this.triggerEvent('tap', {
        type: this.data.type
      });
    }
  }
}); 