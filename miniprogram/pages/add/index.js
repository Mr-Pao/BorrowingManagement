const db = wx.cloud.database();
const app = getApp();

Page({
  // 保存编辑中待办的信息
  data: {
    title: '',
    desc: '',
    freqOptions: ['工具', '模块', '开发板', '套件', '显示屏'],
    freq: 0
  },

  // 表单输入处理函数
  onTitleInput(e) {
    this.setData({
      title: e.detail.value
    })
  },
  onDescInput(e) {
    this.setData({
      desc: e.detail.value
    })
  },

  // 响应事件状态选择器
  onChooseFreq(e) {
    this.setData({
      freq: e.detail.value
    })
  },

  // 保存待办
  async saveTodo() {
    // 对输入框内容进行校验
    if (this.data.title === '') {
      wx.showToast({
        title: '事项标题未填写',
        icon: 'error',
        duration: 2000
      })
      return
    }
    if (this.data.title.length > 10) {
      wx.showToast({
        title: '事项标题过长',
        icon: 'error',
        duration: 2000
      })
      return
    }
    if (this.data.desc.length > 100) {
      wx.showToast({
        title: '事项描述过长',
        icon: 'error',
        duration: 2000
      })
      return
    }
    // 在数据库中新建物品信息
    db.collection("products").add({
      data: {
        title: this.data.title, // 物品名称
        desc: this.data.desc, // 物品备注
        freq: Number(this.data.freq), // 物品种类
      }
    }).then(res=>{
      wx.showToast({
        title: '已新增',
      })
    })
  },

  // 重置所有表单项
  resetTodo() {
    this.setData({
      title: '',
      desc: '',
      freqOptions: ['工具', '模块', '开发板', '套件', '显示屏'],
      freq: 0,
    })
  }
})