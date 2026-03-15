const app = getApp();

Page({
  data: {
    searchKey: '',
    category: 'all',
    courses: [
      {
        id: 1,
        title: '初级跑步训练',
        description: '适合新手的跑步入门课程',
        duration: 30,
        level: '初级',
        cover: 'https://pic2.zhimg.com/100/v2-2b08edab6c02188b06e351637218eab9_r.jpg'
      },
      {
        id: 2,
        title: '瑜伽放松课程',
        description: '舒缓身心的瑜伽课程',
        duration: 45,
        level: '中级',
        cover: 'https://pica.zhimg.com/100/v2-cb165e4accd434294f39771427423794_r.jpg'
      },
      {
        id: 3,
        title: '力量训练基础',
        description: '提升基础力量的训练课程',
        duration: 40,
        level: '初级',
        cover: 'https://pic2.zhimg.com/100/v2-cd74563e9e2df58a09350633c367f405_r.jpg'
      }
    ],
    allCourses: []
  },

  onLoad() {
    this.loadCourses();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadCourses();
  },

  // 加载课程数据
  loadCourses() {
    // 优先从本地存储获取数据
    const localCourses = wx.getStorageSync('courseList');
    if (localCourses && localCourses.length > 0) {
      console.log('📱 从本地存储获取课程数据');
      this.setData({
        courses: localCourses,
        allCourses: localCourses
      });
      return;
    }

    // 如果没有本地数据，尝试从服务器获取
    if (app.globalData.token) {
      console.log('🌐 从服务器获取课程数据');
      wx.request({
        url: `${app.globalData.baseUrl}/courses`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${app.globalData.token}`
        },
        success: (res) => {
          if (res.data.success) {
            const courses = res.data.data || this.data.courses;
            this.setData({
              courses: courses,
              allCourses: courses
            });
            // 保存到本地存储
            wx.setStorageSync('courseList', courses);
          } else {
            console.log('获取课程数据失败，使用默认数据');
            this.setData({
              allCourses: this.data.courses
            });
          }
        },
        fail: (err) => {
          console.log('网络请求失败，使用默认数据');
          this.setData({
            allCourses: this.data.courses
          });
        }
      });
    } else {
      // 未登录时使用默认数据
      console.log('🔐 未登录，使用默认课程数据');
      this.setData({
        allCourses: this.data.courses
      });
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKey: e.detail.value
    });
  },

  // 搜索课程
  search() {
    const key = this.data.searchKey.trim().toLowerCase();
    const filtered = this.data.allCourses.filter(item =>
      item.title.toLowerCase().includes(key) ||
      item.description.toLowerCase().includes(key)
    );
    this.setData({
      courses: filtered
    });
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    let filtered = this.data.allCourses;
    if (category !== 'all') {
      filtered = filtered.filter(item => {
        if (category === 'running') return item.title.includes('跑步');
        if (category === 'yoga') return item.title.includes('瑜伽');
        if (category === 'strength') return item.title.includes('力量');
        return true;
      });
    }
    this.setData({
      category,
      courses: filtered
    });
  },

  // 跳转到课程详情
  goToCourseDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${id}`
    });
  }
}); 