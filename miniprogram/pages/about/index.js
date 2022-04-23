// pages/about/index.js
Page({

  onShow() {},

  //跳转版本记录界面
  version: function (e) {
    wx.navigateTo({
      url: '../version/index',
    })
  },

  //点击复制
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

  //跳转小程序
  goToMiniProgram1: function () {
    wx.navigateToMiniProgram({
      appId: 'wx5d52c6c8f098ed5e', // 其他小程序APPID,必填
      path: '', //其他小程序地址，非必填
      success: res => {
        // 打开成功
        console.log("打开成功", res);
      },
      fail: err => {
        console.log(err);
      }
    });
  },

})