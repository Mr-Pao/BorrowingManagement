/* 物品详情 */
const db = wx.cloud.database()
const app = getApp();
var times = require('../times.js');
Page({
    data: {

    },

    onLoad: function (options) {
        this.setData({
            list_id: options.list_id, // 保存上一页传来的 _id 字段
            openid: app.globalData.openid,
            UserInfo: app.globalData.UserInfo
        })
        this.data.borrowTime = times.toDate(Date.parse(new Date))
    },


    onShow() {
        this.showDetail()
    },

    // 根据 _id 值查询并显示数据
    async showDetail(e) {
        if (this.data.list_id.length > 0) {
            // const db = await getApp().database()
            // 根据 _id 值查询数据库中对应的待办事项
            db.collection('products').where({
                _id: this.data.list_id
            }).get().then(res => {
                // 解包获得待办事项
                const {
                    data: [detail]
                } = res
                // 将数据保存到本地、更新显示
                this.setData({
                    detail
                })
            })
        }
    },


    //长按识别小程序码
    previewImage: function (e) {
        var url = e.target.dataset.src;
        wx.previewImage({
            current: url,
            urls: [url]
        })
    },

    //点击复制网址
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

    //借用响应
    borrow(e) {
        var that = this
        if (this.data.UserInfo.name && this.data.UserInfo.tel ) {
            wx.requestSubscribeMessage({
                tmplIds: ['9tv28UFh_-9rl6P6w68_AWFSzi0nLQ9S3NgNy44tQog'],
                success(res) {
                    that.addborrow()
                },
                fail(err) {
                    console.log(err)
                }
            })
        } else {
            wx.navigateTo({
                url: '../userInfo/index',
                success(res) {
                    wx.showToast({
                        title: '请登记信息',
                        icon: 'none',
                        duration: 2000
                    })
                }
            })
        }

    },


    //添加借用
    addborrow() {
        var that = this
        db.collection("borrow").add({
            data: {
                userName: that.data.UserInfo.name,
                openid: that.data.openid,
                product: that.data.list_id,
                borrowTime: this.data.borrowTime,
                borrowRequest: 1,
                borrow: 0,
                returnRequest: 0,
                return: 0
            }
        }).then(res => {
            wx.showToast({
                title: '已提交借用申请',
            })
        })
        wx.switchTab({
            url: '../list/index',
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