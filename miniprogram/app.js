import {
    Cloud
} from "laf-client-sdk";

App({
    globalData: {

        // globalData中添加
        cloud: new Cloud({
            baseUrl: "https://hy87gr.laf.run", // 填入自己的 appid和url
            dbProxyUrl: "/proxy/BorrowingManagement", //数据库访问策略
            getAccessToken: () => wx.getStorageSync('access_token'),
            environment: "wxmp",
        })
    }
})