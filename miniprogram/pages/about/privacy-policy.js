const app = getApp();

Page({
  data: {
    currentTab: 'privacy', // privacy 或 terms
    privacyContent: {
      title: '隐私政策',
      lastUpdated: '2025年6月30日',
      sections: [
        {
          title: '信息收集',
          content: '我们收集的信息包括：\n• 您主动提供的信息（用户名、密码等）\n• 运动健康数据（运动记录、健康指标等）\n• 设备信息（设备型号、操作系统等）\n• 使用数据（功能使用情况、错误日志等）'
        },
        {
          title: '信息使用',
          content: '我们使用收集的信息用于：\n• 提供和改进服务\n• 个性化用户体验\n• 数据分析和统计\n• 客户支持和沟通\n• 安全防护和风险控制'
        },
        {
          title: '信息共享',
          content: '我们不会出售、出租或交易您的个人信息。仅在以下情况下可能共享信息：\n• 获得您的明确同意\n• 法律法规要求\n• 保护用户和公众安全\n• 与授权合作伙伴共享（仅限必要信息）'
        },
        {
          title: '信息保护',
          content: '我们采取多种安全措施保护您的信息：\n• 数据加密传输和存储\n• 访问控制和身份验证\n• 定期安全审计\n• 员工保密培训\n• 应急响应机制'
        },
        {
          title: '信息存储',
          content: '您的信息主要存储在中国境内的服务器上。我们承诺：\n• 遵守当地法律法规\n• 采取适当的安全措施\n• 在必要时进行数据本地化\n• 定期备份重要数据'
        },
        {
          title: '您的权利',
          content: '您对个人信息享有以下权利：\n• 访问和查看个人信息\n• 更正或更新个人信息\n• 删除个人信息\n• 撤回同意授权\n• 投诉和举报'
        },
        {
          title: '儿童隐私',
          content: '我们不会故意收集13岁以下儿童的个人信息。如果发现误收集了儿童信息，我们会立即删除。'
        },
        {
          title: '政策更新',
          content: '我们可能会更新本隐私政策。重大变更时，我们会：\n• 在应用内发布通知\n• 更新生效日期\n• 获得必要同意\n• 保留历史版本'
        }
      ]
    },
    termsContent: {
      title: '用户协议',
      lastUpdated: '2025年6月30日',
      sections: [
        {
          title: '服务说明',
          content: '运动健康应用提供以下服务：\n• 运动数据记录和统计\n• 健康指标监测\n• 健身课程推荐\n• 目标设定和追踪\n• 数据可视化展示'
        },
        {
          title: '用户责任',
          content: '使用本应用时，您需要：\n• 提供真实、准确的信息\n• 遵守相关法律法规\n• 不得恶意使用服务\n• 保护账户安全\n• 及时更新个人信息'
        },
        {
          title: '服务限制',
          content: '以下行为将被禁止：\n• 恶意攻击系统\n• 传播违法信息\n• 侵犯他人权益\n• 商业用途滥用\n• 其他违规行为'
        },
        {
          title: '知识产权',
          content: '本应用的所有内容均受知识产权保护：\n• 软件代码和界面设计\n• 文字内容和图片素材\n• 商标和品牌标识\n• 技术专利和商业秘密'
        },
        {
          title: '免责声明',
          content: '我们不对以下情况承担责任：\n• 不可抗力导致的服务中断\n• 用户自身操作失误\n• 第三方服务问题\n• 数据丢失或损坏\n• 间接损失或后果'
        },
        {
          title: '服务变更',
          content: '我们保留以下权利：\n• 修改或终止服务\n• 调整功能特性\n• 更新使用条款\n• 变更收费标准\n• 限制使用权限'
        },
        {
          title: '争议解决',
          content: '如发生争议，我们将：\n• 优先通过协商解决\n• 遵循相关法律法规\n• 保护用户合法权益\n• 提供必要的技术支持\n• 配合相关部门处理'
        },
        {
          title: '协议生效',
          content: '本协议自您使用服务时生效，持续有效直至终止。您可以通过以下方式联系我们：\n• 邮箱：support@fitnessapp.com\n• 电话：400-123-4567\n• 在线客服：应用内反馈'
        }
      ]
    }
  },

  onLoad() {
    // 页面加载时的逻辑
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
  },

  // 复制邮箱
  copyEmail() {
    wx.setClipboardData({
      data: 'support@fitnessapp.com',
      success: () => {
        wx.showToast({
          title: '邮箱已复制',
          icon: 'success'
        });
      }
    });
  },

  // 拨打电话
  callPhone() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567',
      success: () => {
        console.log('拨打电话成功');
      },
      fail: (err) => {
        console.log('拨打电话失败:', err);
        wx.showToast({
          title: '拨打电话失败',
          icon: 'none'
        });
      }
    });
  }
}); 