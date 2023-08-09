const app = getApp()
const cloud = app.globalData.cloud

const db = cloud.database()

var times = require('../times.js');
Page({

  data: {

  },

  onLoad: function (options) {
    this.setData({
      openid: app.globalData.openid, // 保存openid
      myBorrow: app.globalData.myBorrow, //保存借用信息
      list_index: options.list_id, // 保存上一页传来的_id 字段
    })
    this.data.returnTime = times.toDate( Date.parse(new Date))
  },

  async onShow() {
    this.showDetail()
  },


  // 根据 _id 值查询并显示数据
  async showDetail(e) {
    if (this.data.myBorrow[this.data.list_index].product_id.length > 0) {
      // const db = await getApp().database()
      // 根据 _id 值查询数据库中对应的待办事项
      db.collection('BorrowingManagement_products').where({
        _id: this.data.myBorrow[this.data.list_index].product_id
      }).get().then(res => {
          console.log(res)
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

  //长按识别小程序码
  previewImage: function (e) {
    var url = e.target.dataset.src;
    wx.previewImage({
      current: url,
      urls: [url]
    })
  },

  //点击复制网址
  copy: function (e) {
    let item = e.currentTarget.dataset.item;
    wx.setClipboardData({
      data: item,
      success(res) {
        wx.showToast({
          title: '复制成功',
          icon: "success"
        });
      }
    });
  },

  //归还响应
  return (e) {
    var that = this
    wx.requestSubscribeMessage({
      tmplIds: ['fy0obTxe8G4V3fM3V31py_y1oOzAYKpQbGMs1NMkUW4'],
      success(res) {
        that.addreturn()
      },
      fail(err) {
        console.log(err)
      }
    })
  },
  addreturn() {
    var that = this
    db.collection("BorrowingManagement_allBorrow").where({
        _id: that.data.myBorrow[that.data.list_index]._id
      })
      .update({
          returnTime: this.data.returnTime,
          borrowRequest: 0,
          borrow: 1,
          returnRequest: 1,
          return: 0
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