const userModel = require('../model/user')
const { decrypt } = require('../utils/crypto')
const RedisHandler = require('../utils/redisHandler')

module.exports = async function (ctx, next) {

  // 检查x-session格式是否正确
  let xSession = ctx.get('x-session')
  if (!xSession)
    ctx.throw(401, JSON.stringify({ code: 1, message: '请求头中未包含x-session' }))
  xSession = JSON.parse(xSession)
  if (!xSession.hasOwnProperty('iv') || !xSession.hasOwnProperty('data'))
    ctx.throw(401, JSON.stringify({ code: 2, message: 'x-session格式不正确' }))

  let session = decrypt(xSession)
  // 检查session是否过期
  const createdTime = session.createdTime
  if (Date.now() - createdTime > 1000 * 60 * 60 * 12) // 半天
    ctx.throw(401, JSON.stringify({ code: 3, message: 'session已过期' }))

  // 检查session在redis中是否能找到对应信息
  const id = session.id
  let loginInfo = await RedisHandler.getObject(id)
  Object.setPrototypeOf(loginInfo, Object)
  if (JSON.stringify(loginInfo) === '{}') {
    ctx.throw(401, JSON.stringify({ code: 4, message: 'redis服务器中未能找到该会话信息，请重新登录' }))
  }

  // 到数据库查找对应用户信息
  const user = await userModel.findById(id)
  if (!user) ctx.throw(401, JSON.stringify({ code: 5, message: '数据库中未能找到该用户' }))
  if (user.userType === -1) ctx.throw(401, JSON.stringify({ code: 6, message: '当前用户被禁用' }))
  if (/^\/admin/i.test(ctx.url) && !ctx.state.user.isAdmin)
    ctx.throw(401, JSON.stringify({ code: 7, message: '当前资源必须管理员才能访问' }))

  await next()
}
