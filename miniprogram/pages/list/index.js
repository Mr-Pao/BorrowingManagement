// pages/list/index.js
const db = wx.cloud.database();
const app = getApp();
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';

Page({
  data: {
    activeKey: 0,
    value: '',
  },
  onLoad: function (options) {
    this.getNoticeList()
    this.getPhotoList()
    this.setData({
      products: app.globalData.products,
      kind: app.globalData.kind
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

  //搜索功能
  onChange(e) {
    this.setData({
      value: e.detail,
    });
  },
  onSearch() {
    var that = this
    db.collection('products').where({ //使用正则查询，实现对搜索的模糊查询
      title: db.RegExp({
        regexp: this.data.value, //从搜索栏中获取的value作为规则进行匹配。
        options: 'i' //大小写不区分
      })
    }).get({
      success: res => {
        console.log(res)
        that.setData({
          searchList: res.data
        })
        app.globalData.searchList=res.data
        wx.navigateTo({
          url: '../search/search',
        })
      }
    })
   
  },
})