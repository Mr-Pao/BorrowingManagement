// pages/list/index.js
const db = wx.cloud.database();
const app = getApp();
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';

Page({
  data: {
    activeKey: 0,
  },
  onLoad: function (options) {
    this.getNoticeList()
    this.getPhotoList()
    this.getKind()
    this.setData({
      products: app.globalData.products
  })
  },

 //通过云函数获取物品分类
 getKind() {
  wx.cloud.callFunction({
    name: "getData",
    data: {
      dataName: "kind"
    },
    success: res => {
      this.setData({
        kind: res.result.data[0].kind
      })
    }
  })
},

  //通过云函数获取轮播图片
  getPhotoList() {
    wx.cloud.callFunction({
      name: "getData",
      data: {
        dataName: "photo"
      },
      success: res => {
        this.setData({
          photoList: res.result.data
        })
      }
    })
  },

  // 通过云函数获取公告
  getNoticeList() {
    wx.cloud.callFunction({
      name: "getData",
      data: {
        dataName: "notice"
      },
      success: res => {
        this.setData({
          noticeList: res.result.data
        })
      }
    })
  },

  //侧边栏
  onChange(event) {
    this.setData({
      activeKey: event.detail
    })
    Notify({
      type: 'primary',
      message: event.detail
    });
  },

  //跳转到物品详情
  goToDetail: function (e) {
    wx.navigateTo({
      url: '../detail/index?list_id=' + e.currentTarget.id,
    })
  },

  //分享给好友
  onShareAppMessage: function () {
    return {
      path: '/pages/index/index',
      imageUrl: '../../images/fengmian.png'
    }
  },
  onShareTimeline: function () {
    return {
      path: '/pages/index/index',
      imageUrl: '../../images/fengmian.png'
    }
  },
})