// pages/userInfo/index.js
const app = getApp()
const cloud = app.globalData.cloud
Page({

    data: {

    },

    onLoad: function (options) {
        this.getX()
        this.setData({
            openid: app.globalData.openid,
            UserInfo: app.globalData.UserInfo
        })
    },

  //通过云函数获取X
  getX() {
    wx.cloud.callFunction({
      name: "getData",
      data: {
        dataName: "X"
      },
      success: res => {
        this.setData({
          X: res.result.data[0]
        })
      }
    })
  },

    //提交响应
    submit(res) {
        let id=this.data.openid
        db.collection("UserInfo").where({
            _id:id
        }).update({
                data: {
                    name: this.data.name,
                    tel: this.data.tel,
                }
            }).then(res => {
                wx.showToast({
                    title: '已提交',
                })
                wx.switchTab({
                    url: '../index/index',
                })
            })
    },
    onChangeName(event) {
        this.setData({
            name:event.detail
        })
    },
    onChangeTel(event) {
        this.setData({
            tel:event.detail
        })
    },
})