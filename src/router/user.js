const Router = require('koa-router');
const { register, login, jwtLogin, getCaptcha, checkCaptcha, wxlogin, updatePassword, getQRCode, bindSession, checkQRCode } = require('../controller/user');
const auth = require('../middlewares/auth')
const authJWT = require('../middlewares/auth_jwt')
const verifyUserInfo = require('../middlewares/verify_userinfo')
const router = new Router({ prefix: '/user' });

// 注册
router.post('/register', verifyUserInfo, register);

// 普通登录(session)
router.post('/login', verifyUserInfo, login);

// 微信登录凭证code登录
router.post('/login/wxcode', wxlogin);

// 短信验证码登录：获取验证码
router.get('/login/sendcaptcha', getCaptcha);

// 短信验证码登录：校验验证码
router.post('/login/checkcaptcha', checkCaptcha);

// 二维码登录：二维码字符串获取
router.get('/login/qrcode', getQRCode);

// 二维码登录：发送二维码字符串和登录凭证到后端
router.post('/login/qrcode', bindSession);

// 二维码登录：轮询二维码是否绑定了登录凭证
router.get('/login/qrcode/check', checkQRCode);

// JWT登录
router.post('/login/jwt', verifyUserInfo, jwtLogin);

// 修改密码
router.post('/updatepassword', authJWT, updatePassword);

module.exports = router;