// pages/about/index.js
Page({

    onShow() {
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

    onShareAppMessage() {
        return {
            path: '/pages/index/index?id=123',
            imageUrl:'/miniprogram/images/fengmian.png'
        }
    },

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