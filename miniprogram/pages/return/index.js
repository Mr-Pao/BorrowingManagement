const db = wx.cloud.database()
const app = getApp();
Page({

  data: {

  },

  onLoad: function (options) {
    this.setData({
      openid:app.globalData.openid, // 保存openid
      myBorrow:app.globalData.myBorrow,  //保存借用信息
      list_index: options.list_id, // 保存上一页传来的_id 字段
    })
  },

  async onShow() {

  },


  //归还响应
  return(e) {
      var that = this
      wx.requestSubscribeMessage({
        tmplIds: ['fy0obTxe8G4V3fM3V31py_y1oOzAYKpQbGMs1NMkUW4'],
        success(res) {
          that.addreturn(),
          that.sendOne()
        },
        fail(err) {
          console.log(err)
        }
      })
    },
    addreturn() {
      var that = this
      db.collection("borrow").where({
        _id: that.data.myBorrow[that.data.list_index]._id
      })
      .update({
        data: {
          borrowRequest: 0,
          borrow: 1,
          returnRequest: 1,
          return: 0
        }
      })
      .then(res => {
        wx.showToast({
          title: '已提交归还申请',
        })
      })
    wx.switchTab({
      url: '../index/index',
    })
    }
})