const userService = require('../service/user')

class UserController {
    async register(ctx, next) {
        ctx.body = '注册成功'
    }

    async login(ctx, next) {
        const { code, account, password } = ctx.request.body
        let result = null

        try {
            // 小程序登录
            if (code) {
                let loginInfo = await userService.login(code)
                result = { code: 0, message: '登录成功', data: loginInfo }
            }
            // 网页登录
            else {
                if (account && password) {
                    ctx.session = { account, views: 10 }
                    result = { code: 0, message: '登录成功' }
                }
                else {
                    ctx.status = 400
                    result = { code: 1, message: '缺少必要的登录信息' }
                }
            }
        } catch (error) {
            ctx.status = 500
            result = { code: -1, message: '服务器内部错误：' + error.message }
        }

        ctx.body = result
    }

    async getQRCode(ctx, next) {
        try {
            const qrcodeString = await userService.getQRCodeString();
            ctx.body = { code: 0, message: 'ok', data: qrcodeString }
        } catch (error) {
            ctx.body = { code: -1, message: '服务器内部错误：' + error.message }
        }
    }

    async bindSession(ctx, next) {
        try {
            let { qrcodeString } = ctx.request.body
            // 扫码登录必然是使用App或者小程序扫码的,所以只需拿到x-session就行
            let session = ctx.get('x-session')
            session = JSON.parse(session)
            // 绑定登录凭证到redis中
            await userService.bindLoginCredentials(qrcodeString, session)
            ctx.body = { code: 0, message: 'ok' }
        } catch (error) {
            ctx.body = { code: -1, message: '服务器内部错误：' + error.message }
        }
    }

    async checkQRCode(ctx, next) {
        try {
            const qrcodeString = ctx.request.query.qrcodestring
            const result = await userService.checkQRCode(qrcodeString);
            ctx.body = { code: 0, message: 'ok', data: result }
        } catch (error) {
            ctx.body = { code: -1, message: '服务器内部错误：' + error.message }
        }
    }

    async updatePassword(ctx, next) {
        ctx.body = '可以修改密码'
    }
}

module.exports = new UserController();