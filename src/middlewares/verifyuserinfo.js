const UserModel = require('../model/user')
// 用户名和密码的正则表达式验证
const accountRegex = /^[a-zA-Z0-9_]{4,16}$/; // 用户名：4到16位字母、数字或下划线  
const passwordRegex = /^[a-zA-Z0-9!@#$%^&*]{6,20}$/; // 密码：6到20位字母、数字或特殊字符 

module.exports = async function verifyUserInfo(ctx, next) {
    const { account, password } = ctx.request.body;

    // 验证用户名和密码的格式  
    if (!accountRegex.test(account)) {
        ctx.status = 400;
        ctx.body = '账号格式不正确';
        return;
    }
    if (!passwordRegex.test(password)) {
        ctx.status = 400;
        ctx.body = '密码格式不正确';
        return;
    }

    // 验证用户名和密码是否匹配
    if (!UserModel.findByAccountAndPwd(account, password)) {
        ctx.status = 401;
        ctx.body = '用户名或密码不正确';
        return;
    }

    // 验证成功，继续执行下一个中间件  
    await next();
}