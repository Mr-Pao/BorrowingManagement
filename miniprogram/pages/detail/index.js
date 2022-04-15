/* 物品详情 */
const db = wx.cloud.database()
const app = getApp();
Page({
  data: {

  },

  onLoad: function (options) {
    this.setData({
      list_id: options.list_id,    // 保存上一页传来的 _id 字段
      openid:app.globalData.openid,
      userInfo:app.globalData.userInfo
    })
  },

  // 根据 _id 值查询并显示数据
  async onShow() {
    if (this.data.list_id.length > 0) {
      const db = await getApp().database()
      // 根据 _id 值查询数据库中对应的待办事项
      db.collection(getApp().globalData.collection).where({
        _id: this.data.list_id
      }).get().then(res => {
        // 解包获得待办事项
        const {
          data: [detail]
        } = res
        // 将数据保存到本地、更新显示
        this.setData({
          detail
        })
      })
    }
  },

  //借用响应
  borrow(e) {
    var that = this
    wx.requestSubscribeMessage({
      tmplIds: ['9tv28UFh_-9rl6P6w68_AWFSzi0nLQ9S3NgNy44tQog'],
      success(res) {
        that.addborrow()
      },
      fail(err) {
        console.log(err)
      }
    })
  },
  addborrow() {
    var that = this
    db.collection("borrow").add({
      data: {
        userName:that.data.userInfo.nickName,
        openid: that.data.openid,
        product: that.data.list_id,
        borrowTime: Date.parse(new Date),
        borrowRequest: 1,
        borrow:0,
        returnRequest:0,
        return: 0
      }
    }).then(res => {
      wx.showToast({
        title: '已提交借用申请',
      })
    })
    wx.switchTab({
      url: '../list/index',
    })
  },
})