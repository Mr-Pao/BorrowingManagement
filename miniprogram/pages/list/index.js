// pages/list/index.js
const db = wx.cloud.database();
const app = getApp();
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';


Page({
  data: {
    activeKey: 0,
    kind:["模块","工具","开发板","套件","显示屏","其它"]
  },
  onLoad: function (options) {
    //通过云函数获取所有物品
    wx.cloud.callFunction({
      name: "getData",
      data: {
        dataName: "products"
      },
      success: res => {
        this.setData({
          products: res.result.data
        })
      }
    })
    //通过云函数获取轮播图片
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
    // 通过云函数获取公告
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
      activeKey:event.detail
    })
    Notify({ type: 'primary', message: event.detail });
  },

  //跳转到物品详情
  goToDetail: function (e) {
    wx.navigateTo({
      url: '../detail/index?list_id=' + e.currentTarget.id,
    })
  },

  //用户点击右上角分享
  onShareAppMessage: function () {
    return {
      title: '物品借用管理系统'
    }
  },
  onShareTimeline: function () {
    return {
      title: '物品借用管理系统',
    }
  },
})