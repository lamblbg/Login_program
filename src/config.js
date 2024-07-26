const env = process.env
const nodeEnv = env.NODE_ENV
const appid = env.APP_KET || 'wx98c75a43b16875ee'
const appSecret = env.APP_SECRET || 'b3383784d52bf58d3b39a5b7f602cb96'

// mogoDB连接配置
let mongoDBConnectConfig = {
  name: 'mongodb://127.0.0.1:27017/clund-album',
  user: 'user',
  password: 'pass'
}
if (nodeEnv === 'production') {
  mongoDBConnectConfig = {
    name: 'mongodb://127.0.0.1:27017/clund-album',
    user: 'user',
    password: 'pass'
  }
}

// redis连接配置
let redisConnectConfig = {
  host: 'localhost',
  port: 6379,
  // password: 'yourpassword'  // 如果你的Redis服务器设置了密码，可以这样设置  
}
if (nodeEnv === 'production') {
  redisConnectConfig = {
    host: 'localhost',
    port: 6379,
  }
}

// cookies配置
const cookieConfig = {
  key: 'koa.sess',  /** (string) cookie 键 (默认为 koa.sess) */
  maxAge: 86400000,/** (number || 'session') maxAge 以毫秒为单位 (默认为 1 天) */ /** 'session' 将导致在会话/浏览器关闭时过期的 cookie */ /** 警告：如果会话 cookie 被盗,此 cookie 将永不过期 */
  autoCommit: true,  /** (boolean) 自动提交标头 (默认 true) */
  overwrite: true,  /** (boolean) 可以覆盖或不覆盖 (默认 true) */
  httpOnly: true,  /** (boolean) 是否 httpOnly (默认 true) */
  signed: true,  /** (boolean) 是否签名 (默认 true) */
  rolling: false,  /** (boolean) 强制在每个响应上设置会话标识符 cookie。将过期时间重置为原始的maxAge,重置过期倒计时。（默认为false）*/
  renew: false, /** (boolean) 当会话即将过期时更新会话,以便我们始终保持用户登录状态。（默认为false）*/
  secure: false, /** (boolean) 安全 cookie*/
  sameSite: null, /** (string) 会话 cookie sameSite 选项（默认为null,不要设置）*/
};

module.exports = {
  appid,
  appSecret,
  mongoDBConnectConfig,
  redisConnectConfig,
  cookieConfig,
}
