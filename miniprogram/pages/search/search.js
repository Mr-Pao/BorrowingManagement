// pages/search/search.js
const db = wx.cloud.database();
const app = getApp();

Page({


    onLoad: function (options) {
        this.setData({
            searchList: app.globalData.searchList,
            products: app.globalData.products,
        })
    },

    //跳转到物品详情
    goToDetail: function (e) {
        wx.navigateTo({
            url: '../detail/index?list_id=' + e.currentTarget.id,
        })
    },

})