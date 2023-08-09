// pages/index/index.js
const app = getApp()
const cloud = app.globalData.cloud

const db = cloud.database()

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
    data: {
        hasUserInfo: true,
        hasMyBorrow: true,
        avatarUrl: defaultAvatarUrl,
    },

    async onLoad() {
        //获取openid
        let openid = await this.getOpenID()
        //从数据库下载用户借用列表
        let myBorrow = await this.getMyBorrow(openid)
        //获取用户信息
        // let UserInfo = await this.getUserInfo(openid)
        //获取所有借用信息
        this.getAllBorrow()


        //获取物品分类
        this.getKind()
        //获取物品信息
        this.getProducts()
        // 检查是否需要更新
        this.checkForUpdates();
    },

    onShow() {
        //刷新用户信息和借用列表
        if (app.globalData.openid) {
            this.getUserInfo(app.globalData.openid)
            this.getMyBorrow(app.globalData.openid)
        }
    },

    // 获取用户openid
    async getOpenID() {
        return new Promise((resolve, reject) => {
            // 登录
            wx.login({
                success: res => {
                    // 发送 res.code 到后台换取 openId, sessionKey, unionId
                    if (res.code) {
                        // 发起网络请求
                        wx.request({
                            url: 'https://hy87gr.laf.run/BorrowingManagement-wxLogin',
                            data: {
                                code: res.code
                            },
                            success(res) {
                                const openid = res.data.openid;
                                app.globalData.openid = res.data.openid;
                                resolve(openid);
                                console.log("登录成功，登录用户的openid为：", openid);
                            },
                            fail(err) {
                                reject(err);
                                console.log('请求失败！', err);
                            }
                        });
                    } else {
                        console.log('登录失败！' + res.errMsg);
                        reject(new Error('登录失败'));
                    }
                },
                fail(err) {
                    reject(err);
                    console.log('登录失败！', err);
                }
            });
        });
    },

    //存储用户openid
    saveUserProfile(res) {
        db.collection("BorrowingManagement_UserInfo").set({
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
    //获取并存储用户昵称
    onChange_name(event) {
        // event.detail 为当前输入的值
        console.log(event.detail);
        this.setData({
            user_name: event.detail
        })
    },

    //获取并存储用户头像
    async onChooseAvatar(event) {
        this.setData({
            avatarUrl: event.detail,
        })
    },


    //从数据库下载用户信息
    async getUserInfo(openid) {
        var that = this
        return new Promise(function (resolve) {
            db.collection('BorrowingManagement_UserInfo').where({
                _openid: openid,
            }).get({
                success: function (res) {
                    resolve(res.data[0])
                    if (res.data[0]) {
                        that.setData({
                            UserInfo: res.data[0],
                            hasUserInfo: true
                        })
                        app.globalData.UserInfo = res.data[0]
                    }
                }
            })
        })
    },




    //获取借用列表
    async getMyBorrow(openid) {
        const res = await db.collection("BorrowingManagement_allBorrow").where({
            openid: openid
        }).get()
        this.setData({
            myBorrow: res.data
        })
        app.globalData.myBorrow = res.data
    },

    //通过云函数获取物品分类
    async getKind() {
        const res = await db.collection('BorrowingManagement_kind').get()
        this.setData({
            kind: res.data
        })
        app.globalData.kind = res.data
    },

    //通过云函数获取所有物品
    async getProducts() {
        const res = await db.collection('BorrowingManagement_products').get()
        this.setData({
            products: res.data
        })
        app.globalData.products = res.data
    },




    //获取所有借用
    async getAllBorrow() {
        const res = await db.collection("BorrowingManagement_allBorrow").get()
        this.setData({
            allBorrow: res.data
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
        db.collection("BorrowingManagement_allBorrow").where({ //修改物品状态为借用
            _id: this.data.allBorrow[e.currentTarget.id]._id
        }).update({
            borrowRequest: 0,
            borrow: 1,
            returnRequest: 0,
            return: 0,
        })
        wx.showToast({
            title: '已确认',
        })
        this.onLoad()
        // wx.cloud.callFunction({ //发送申请通过通知
        //     name: "borrowAgree",
        //     data: {
        //         openid: this.data.allBorrow[e.currentTarget.id].openid,
        //         title: this.data.allBorrow[e.currentTarget.id].product_name,
        //         userName: this.data.allBorrow[e.currentTarget.id].userName
        //     }
        // })
    },

    //确认归还申请
    goToReturnConfirm: function (e) {
        db.collection("BorrowingManagement_allBorrow").where({ //修改物品状态为归还
            _id: this.data.allBorrow[e.currentTarget.id]._id
        }).update({
            borrowRequest: 0,
            borrow: 0,
            returnRequest: 0,
            return: 1
        }).then(res => {
            wx.showToast({
                title: '已确认',
            })
            this.onLoad()
        })
        // wx.cloud.callFunction({ //发送申请通过通知
        //     name: "returnAgree",
        //     data: {
        //         openid: this.data.allBorrow[e.currentTarget.id].openid,
        //         title: this.data.allBorrow[e.currentTarget.id].borrowList[0].title
        //     }
        // })
    },

    //下拉刷新
    onPullDownRefresh: function () {
        wx.showNavigationBarLoading(); //在标题栏中显示加载图标
        if (this.data.openid) {
            this.onLoad()
            wx.hideNavigationBarLoading(); //完成停止加载图标
            wx.stopPullDownRefresh();
        }
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

    //检查版本更新
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