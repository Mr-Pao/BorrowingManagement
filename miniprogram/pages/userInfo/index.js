// pages/userInfo/index.js
const db = wx.cloud.database()

Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

//       //提交响应
//   submit(res) {
//     db.collection("userInfo")
//     .update({
//       data: {
//         userid: this.data.userid,
//         product: this.data.list_id,
//         borrowTime: Date.parse(new Date),
//         confirm: 1,
//         return: 0
//       }
//     }).then(res => {
//       wx.showToast({
//         title: '已借用',
//       })
//     })
//     wx.switchTab({
//       url: '../list/index',
//     })
//   }
})