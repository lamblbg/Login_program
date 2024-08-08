const { decrypt } = require('../utils/crypto')
const RedisHandler = require('../utils/redisHandler')


module.exports = async function (ctx, next) {
  let xSession = ctx.get('x-session')
  let commonSession = ctx.session
  let sessionObj = null

  // 小程序发来的请求
  if (xSession) sessionObj = JSON.parse(xSession)
  // 普通客户端发来的请求
  if (JSON.stringify(commonSession) !== '{}') sessionObj = commonSession
  // 如果请求没有session 
  if (sessionObj == undefined || JSON.stringify(sessionObj) === '{}') {
    return ctx.throw(401, JSON.stringify({ code: 1, message: '请携带上登录凭证' }))
  }
  // 如果请求包含session
  if (JSON.stringify(sessionObj) !== '{}') {
    if (!sessionObj.hasOwnProperty('iv') || !sessionObj.hasOwnProperty('data'))
      ctx.throw(401, JSON.stringify({ code: 2, message: 'session格式不正确' }))
    let { id, createdTime } = decrypt(sessionObj)
    // 检查session是否过期 
    if (Date.now() - createdTime > 1000 * 60 * 60 * 12) // 半天过期 
      ctx.throw(401, JSON.stringify({ code: 3, message: 'session已过期' }))
    // 检查用户是否已登录 
    let loginInfo = await RedisHandler.getObject(id)
    Object.setPrototypeOf(loginInfo, Object)
    if (JSON.stringify(loginInfo) === '{}') {
      ctx.throw(401, JSON.stringify({ code: 4, message: '在redis服务器中未能找到该会话信息，请重新登录' }))
    }
    // 到redis查找对应用户信息
    let userInfo = JSON.parse(loginInfo.userInfo)
    if (!userInfo) ctx.throw(401, JSON.stringify({ code: 5, message: '在redis服务器中未能找到该用户' }))
    if (userInfo.userType === -1) ctx.throw(401, JSON.stringify({ code: 6, message: '当前用户被禁用' }))

    ctx.state.userInfo = userInfo
  }
  await next()
}
