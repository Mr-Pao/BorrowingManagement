// pages/index/index.js
const db = wx.cloud.database();
var times = require('../times.js');
const app = getApp();

Page({
  data: {
    hasUserInfo: false,
    hasMyBorrow: false,
  },

  onLoad: function (options) {
    //获取物品信息
    this.getProducts()
    // 检查是否需要更新
    this.checkForUpdates();
    //获取openid
    wx.cloud.callFunction({
      name: 'getOpenId',
      success: res => {
        app.globalData.openid = res.result.openid
        this.setData({
          openid: app.globalData.openid
        })
        this.getUserInfo(res.result.openid) //从数据库下载用户信息
        this.getMyBorrow(res.result.openid) //从数据库下载用户借用列表
      }
    })
  },

  onShow() {
    //通过openid获取用户借用列表
    if (app.globalData.openid) {
      this.getUserInfo(app.globalData.openid)
      this.getMyBorrow(app.globalData.openid)
    }
  },


  //通过云函数获取所有物品
  getProducts() {
    wx.cloud.callFunction({
      name: "getData",
      data: {
        dataName: "products"
      },
      success: res => {
        this.setData({
          products: res.result.data
        })
        app.globalData.products = res.result.data
      }
    })
  },

  //获取用户昵称和头像
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '用于完善资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.saveUserProfile(res)
      }
    })
  },

  //存储用户昵称和头像
  saveUserProfile(res) {
    db.collection("UserInfo").doc(app.globalData.openid).set({
      data: {
        avatarUrl: res.userInfo.avatarUrl,
        nickName: res.userInfo.nickName
      },
      success: res => {
        this.onShow()
        this.onLoad()
      }
    })
  },

  //从数据库下载用户信息
  getUserInfo(openid) {
    db.collection('UserInfo').where({
      _openid: openid,
    }).get({
      success: res => {
        if (res.data != '') {
          this.setData({
            UserInfo: res.data[0],
            hasUserInfo: true
          })
          //判断管理员
          if (res.data[0].isManager) {
            this.getAllBorrow()
          }
          app.globalData.UserInfo = res.data[0]
        }

      }
    })
  },

  //获取借用列表，调用云函数lookup
  getMyBorrow() {
    wx.cloud.callFunction({
      name: 'lookup',
      data: {
        openid: app.globalData.openid
      },
      complete: res => {
        for (let i = 0; i < res.result.list.length; i++) {
          res.result.list[i]["borrowTime"] = times.toDate(res.result.list[i]["borrowTime"])
        }
        this.setData({
          myBorrow: res.result.list,
          hasMyBorrow: true
        })
        app.globalData.myBorrow = res.result.list
      }
    })
  },

  //获取所有借用
  getAllBorrow() {
    wx.cloud.callFunction({
      name: 'lookup',
      complete: res => {
        for (let i = 0; i < res.result.list.length; i++) {
          res.result.list[i]["borrowTime"] = times.toDate(res.result.list[i]["borrowTime"])
        }
        this.setData({
          allBorrow: res.result.list
        })
      }
    })
  },

  //跳转用户信息界面
  goToUserInfo: function () {
    wx.navigateTo({
      url: '/pages/userInfo/index',
    })
  },

  //跳转归还
  goToReturn: function (e) {
    console.log(e)
    wx.navigateTo({
      url: '/pages/return/index?list_id=' + e.currentTarget.id,
    })
  },

  //确认借用申请
  goToBorrowConfirm: function (e) {
    console.log(this.data.allBorrow[e.currentTarget.id]._id)
    db.collection("borrow").where({ //修改物品状态为借用
      _id: this.data.allBorrow[e.currentTarget.id]._id
    }).update({
      data: {
        borrowRequest: 0,
        borrow: true,
        returnRequest: 0,
        return: 0,
      },
      success: function (res) {
        console.log(res.data)
      }
    })
    wx.showToast({
      title: '已确认',
    })
    this.onShow()
    wx.cloud.callFunction({ //发送申请通过通知
      name: "borrowAgree",
      data: {
        openid: this.data.allBorrow[e.currentTarget.id].openid,
        title: this.data.allBorrow[e.currentTarget.id].borrowList[0].title,
        userName: this.data.allBorrow[e.currentTarget.id].userName
      }
    }).then(res => {
      console.log(res)
    })
  },

  //确认归还申请
  goToReturnConfirm: function (e) {
    db.collection("borrow").where({ //修改物品状态为归还
      _id: this.data.allBorrow[e.currentTarget.id]._id
    }).update({
      data: {
        borrowRequest: 0,
        borrow: 0,
        returnRequest: 0,
        return: 1
      }
    }).then(res => {
      wx.showToast({
        title: '已确认',
      })
      this.onShow()
    })
    wx.cloud.callFunction({ //发送申请通过通知
      name: "returnAgree",
      data: {
        openid: this.data.allBorrow[e.currentTarget.id].openid,
        title: this.data.allBorrow[e.currentTarget.id].borrowList[0].title
      }
    }).then(res => {
      console.log(res)
    })
  },

  //下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading(); //在标题栏中显示加载图标
    if (this.data.openid) {
      this.onShow()
      this.onLoad()
      wx.hideNavigationBarLoading(); //完成停止加载图标
      wx.stopPullDownRefresh();
    }
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


  checkForUpdates: function () {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate)
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    })
  },

})