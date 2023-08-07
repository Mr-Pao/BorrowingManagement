// pages/index/index.js
const app = getApp()
const cloud = app.globalData.cloud

const db = cloud.database()

Page({
    data: {
        hasUserInfo: true,
        hasMyBorrow: true,
    },

    async onLoad() {

        const res = await cloud.invoke('MyTools-Love') // test5 为云函数名
        console.log(res) // 这里的 res 是云函数中 return 的内容

        // 查询结果
        // {
        //   data: [ { _id: '6442b2cac4f3afd9a186ecd9', name: 'Jack' } ],
        //   requestId: undefined,
        //   ok: true
        // }


        //获取openid
        // let openid = await this.getOpenID()
        //获取用户信息
        // let UserInfo = await this.getUserInfo(openid)
        // //判断管理员，获取所有借用信息
        // if (UserInfo.isManager) {
        //   await this.getAllBorrow() 
        // }
        // //从数据库下载用户借用列表
        // let myBorrow = await this.getMyBorrow(openid)

        //获取物品分类
        this.getKind()
        //获取物品信息
        this.getProducts()
        // 检查是否需要更新
        this.checkForUpdates();
    },

    onShow() {
        //刷新用户信息和借用列表
        // if (app.globalData.openid) {
        //     this.getUserInfo(app.globalData.openid)
        //     this.getMyBorrow(app.globalData.openid)
        // }
    },

    //获取用户openid
    async getOpenID(obj) {
        var that = this
        return new Promise(function (resolve) {
            wx.cloud.callFunction({
                name: 'getOpenId',
                success: function (res) {
                    resolve(res.result.openid)
                    that.setData({
                        openid: res.result.openid
                    })
                    app.globalData.openid = res.result.openid
                }
            });
        });
    },

    //从数据库下载用户信息
    async getUserInfo(openid) {
        var that = this
        return new Promise(function (resolve) {
            db.collection('UserInfo').where({
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

    //获取借用列表，调用云函数lookup
    async getMyBorrow(openid) {
        var that = this
        return new Promise(function (resolve) {
            wx.cloud.callFunction({
                name: 'lookup',
                data: {
                    openid: openid
                },
                success: function (res) {
                    resolve(res.result.list)
                    app.globalData.myBorrow = res.result.list
                    that.setData({
                        myBorrow: res.result.list,
                        hasMyBorrow: true
                    })

                }
            })
        })
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


    //获取并存储用户昵称和头像
    getUserProfile(e) {
        wx.getUserProfile({
            desc: '用于完善资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
                this.saveUserProfile(res)
            }
        })
    },
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

    //获取所有借用
    getAllBorrow() {
        wx.cloud.callFunction({
            name: 'lookup',
            complete: res => {
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
        db.collection("borrow").where({ //修改物品状态为借用
            _id: this.data.allBorrow[e.currentTarget.id]._id
        }).update({
            data: {
                borrowRequest: 0,
                borrow: true,
                returnRequest: 0,
                return: 0,
            },
        })
        wx.showToast({
            title: '已确认',
        })
        this.onLoad()
        wx.cloud.callFunction({ //发送申请通过通知
            name: "borrowAgree",
            data: {
                openid: this.data.allBorrow[e.currentTarget.id].openid,
                title: this.data.allBorrow[e.currentTarget.id].borrowList[0].title,
                userName: this.data.allBorrow[e.currentTarget.id].userName
            }
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
            this.onLoad()
        })
        wx.cloud.callFunction({ //发送申请通过通知
            name: "returnAgree",
            data: {
                openid: this.data.allBorrow[e.currentTarget.id].openid,
                title: this.data.allBorrow[e.currentTarget.id].borrowList[0].title
            }
        })
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