// 手机号和密码的正则表达式验证
const phoneRegex = /^[0-9]{11}$/; // 手机号：11位数字
const passwordRegex = /^[a-zA-Z0-9!@#$%^&*]{6,20}$/; // 密码：6到20位字母、数字或特殊字符 

module.exports = async function verifyUserInfo(ctx, next) {
    const { phone, password } = ctx.request.body;

    // 验证手机号和密码的格式  
    if (phone && !phoneRegex.test(phone)) {
        ctx.status = 400
        ctx.body = { code: 1, message: '手机号码格式不正确' }
        return;
    }
    if (password && !passwordRegex.test(password)) {
        ctx.status = 400;
        ctx.body = { code: 2, message: '密码格式不正确' }
        return;
    }

    // 验证成功，继续执行下一个中间件  
    await next();
}