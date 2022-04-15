// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.subscribeMessage.send({
        "touser": event.openid,
        "page": 'pages/index/index',
        "lang": 'zh_CN',
        "data": {
          "thing5": {
            "value": event.title
          },
          "thing7": {
            "value": event.userName
          },
          // "time4": {
          //   "value": '2022年04月10日'
          // },
        },
        "templateId": '9tv28UFh_-9rl6P6w68_AWFSzi0nLQ9S3NgNy44tQog'
      })
    return result
  } catch (err) {
    return err
  }
}