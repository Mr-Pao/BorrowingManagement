// pages/userInfo/index.js
const db = wx.cloud.database();
const app = getApp();
Page({

    data: {

    },

    onLoad: function (options) {
        this.setData({
            openid: app.globalData.openid,
            userInfo: app.globalData.userInfo,
            UserInfo: app.globalData.UserInfo
        })
    },

    //提交响应
    submit(res) {
        let id=this.data.openid
        db.collection("UserInfo").doc(id).set({
                data: {
                    name: this.data.name,
                    tel: this.data.tel,
                }
            }).then(res => {
                wx.showToast({
                    title: '已提交',
                })
            })
        wx.switchTab({
            url: '../index/index',
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