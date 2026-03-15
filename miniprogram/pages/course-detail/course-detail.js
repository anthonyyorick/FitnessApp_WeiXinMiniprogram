Page({
  data: {
    course: {
      id: 1,
      title: '初级瑜伽入门',
      description: '适合初学者的瑜伽基础课程，帮助您建立正确的呼吸和体式基础，提升身体柔韧性和内心平静。',
      duration: 45,
      level: '初级',
      cover: 'https://pica.zhimg.com/100/v2-cb165e4accd434294f39771427423794_r.jpg',
      videoUrl: 'https://vdn6.vzuu.com/HD/8cbaf6cc-5012-11f0-90f6-eeb70b726246-v8_f2_t1_Fsy5SrRd.mp4?pkey=AAU40xbkWjG-_PLeqNJC8vdrzGsQurT2FtBUL7-kgS5vwjGs6mKMVuP0nUvY4NKI2CjpuZjhcrXrUJy3WnFLHPvL&amp;bu=1513c7c2&amp;c=avc.8.0&amp;expiration=1750909876&amp;f=mp4&amp;pu=1513c7c2&amp;v=ks6&amp;pp=ChMxNDAxNjIzODY1NzM5NTc5MzkyGGMiC2ZlZWRfY2hvaWNlMhMxMzY5MDA1NjA4NTk5OTA0MjU3PXu830Q%3D&amp;pf=Web&amp;pt=zhihu',
      outline: ['冥想调息5分钟', '热身体式10分钟', '基础体式练习20分钟', '放松休息10分钟']
    },
    comments: [
      { id: 1, user: '瑜伽爱好者', content: '老师讲解很详细，动作要领很清楚，适合初学者！' },
      { id: 2, user: '静心练习', content: '跟着练习后感觉身心都很放松，呼吸也变得更加顺畅了。' },
      { id: 3, user: '新手小白', content: '第一次练习瑜伽，这个课程很适合入门，不会太难。' }
    ],
    commentInput: ''
  },
  onLoad(options) {
    // 可根据options.id请求后端获取课程详情
  },
  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value });
  },
  submitComment() {
    if (!this.data.commentInput.trim()) return;
    const newComment = {
      id: Date.now(),
      user: '我',
      content: this.data.commentInput
    };
    this.setData({
      comments: [newComment, ...this.data.comments],
      commentInput: ''
    });
  }
}); 