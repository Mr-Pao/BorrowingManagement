/* 物品详情 */
const app = getApp()
const cloud = app.globalData.cloud

const db = cloud.database()

var times = require('../times.js');
Page({
    data: {
        show: false,
        borrow_num: "1",
        user_name: "",
        uesr_tel: ""

    },

    onLoad: function (options) {
        this.setData({
            list_id: options.list_id, // 保存上一页传来的 _id 字段
            openid: app.globalData.openid,
            // UserInfo: app.globalData.UserInfo
        })
        this.data.borrowTime = times.toDate(Date.parse(new Date))
    },


    onShow() {
        this.showDetail()
    },

    // 根据 _id 值查询并显示数据
    async showDetail(e) {
        if (this.data.list_id.length > 0) {
            db.collection('BorrowingManagement_products').where({
                _id: this.data.list_id
            }).get().then(res => {
                // 解包获得物品详情
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

    //弹出层
    showPopup() {
        this.setData({
            show: true
        });
    },
    onClose() {
        this.setData({
            show: false
        });
    },

    //填写借用信息
    onChange_num(event) {
        // event.detail 为当前输入的值
        console.log(event.detail);
        this.setData({
            borrow_num: event.detail
        })
    },
    onChange_name(event) {
        // event.detail 为当前输入的值
        console.log(event.detail);
        this.setData({
            user_name: event.detail
        })
    },
    onChange_tel(event) {
        // event.detail 为当前输入的值
        console.log(event.detail);
        this.setData({
            user_tel: event.detail
        })
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
    // borrow(e) {
    //     var that = this
    //     if (this.data.UserInfo.name && this.data.UserInfo.tel ) {
    //         wx.requestSubscribeMessage({
    //             tmplIds: ['9tv28UFh_-9rl6P6w68_AWFSzi0nLQ9S3NgNy44tQog'],
    //             success(res) {
    //                 that.addborrow()
    //             },
    //             fail(err) {
    //                 console.log(err)
    //             }
    //         })
    //     } else {
    //         wx.navigateTo({
    //             url: '../userInfo/index',
    //             success(res) {
    //                 wx.showToast({
    //                     title: '请登记信息',
    //                     icon: 'none',
    //                     duration: 2000
    //                 })
    //             }
    //         })
    //     }

    // },

    //借用响应
    borrow(e) {
        var that = this
        wx.requestSubscribeMessage({
            tmplIds: ['9tv28UFh_-9rl6P6w68_AWFSzi0nLQ9S3NgNy44tQog'],
            success(res) {
                that.addborrow()
            },
            fail(err) {
                console.log(err)
            }
        })

    },


    //添加借用
    addborrow() {
        var that = this
        db.collection("BorrowingManagement_allBorrow").add({
            openid: that.data.openid,
            user_name: that.data.user_name,
            user_tel: that.data.user_tel,
            product_id: that.data.list_id,
            product_name: that.data.detail.title,
            borrow_num: that.data.borrow_num,
            borrowTime: this.data.borrowTime,
            borrowRequest: 1,
            borrow: 0,
            returnRequest: 0,
            return: 0
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