const jwt = require('../utils/JWT')


module.exports = async function (ctx, next) {
  const token = ctx.get('Authorization')
  const userInfo = jwt.verify(token)

  if (!userInfo) {
    ctx.status = 401
    return ctx.body = { code: 1, message: 'token已过期或被篡改，请重新登录' }
  }
  ctx.state.userInfo = userInfo
  await next()
}
