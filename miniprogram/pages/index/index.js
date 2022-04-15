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
    //异步获取openid
    if (app.globalData.isRequst) {
      this.setData({
        openid: app.globalData.openid
      })
    } else {
      app.getUserInfoCallback = res => {
        if (res != '') {
          this.setData({
            openid: res.result.openid
          })
          app.globalData.openid = res.result.openid
        }
      }
    }
    //获取用户信息
    this.getUserProfile()
    var user = wx.getStorageSync('user'); //从本地缓存获取用户信息
    if (user && user.nickName) { //如果本地缓存有信息就显示本地缓存
      this.setData({
        userInfo: user,
        hasUserInfo: true
      })
      app.globalData.userInfo = user
    }
  },

  onShow() {
    //通过openid获取用户借用列表，延时500ms
    setTimeout(() => {
      if (this.data.openid) {
        this.getMyBorrow()
        this.getUserName()
      }
    }, 500)

  },

  //获取用户昵称和头像
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log("获取用户信息成功", res)
        let user = res.userInfo
        wx.setStorageSync('user', user)
        this.setData({
          userInfo: user,
          hasUserInfo: true
        })
        app.globalData.userInfo = user
      }
    })
  },

  //从数据库获取用户信息
  getUserName(e) {
    db.collection('UserInfo').where({
      _openid: this.data.openid,
    }).get({
      success: res => {
        this.setData({
          UserInfo: res.data[0]
        })
        //判断管理员
        if ( res.data[0].isManager) {
          this.getAllBorrow()
        }
        app.globalData.UserInfo = res.data[0]
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


})