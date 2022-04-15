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
          "thing1": {
            "value": event.title
          },
          "time3": {
            "value": '2022年04月10日'
          },
        },
        "templateId": 'fy0obTxe8G4V3fM3V31py_y1oOzAYKpQbGMs1NMkUW4'
      })
    return result
  } catch (err) {
    return err
  }
}