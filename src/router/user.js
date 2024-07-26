const Router = require('koa-router');
const { register, login, updatePassword, getQRCode, bindSession, checkQRCode } = require('../controller/user');
const auth = require('../middlewares/auth')
const authWebpage = require('../middlewares/auth_webpage')
const router = new Router({ prefix: '/user' });

// 用户注册
router.post('/register', register);

// 用户登录
router.post('/login', login);

// 二维码字符串获取
router.get('/login/qrcode', getQRCode);

// 发送二维码字符串和登录凭证到后端
router.post('/login/qrcode', bindSession);

// 轮询二维码是否绑定了登录凭证
router.get('/login/qrcode/check', checkQRCode);

// 修改密码
router.post('/updatepassword', auth, authWebpage, updatePassword);

module.exports = router;