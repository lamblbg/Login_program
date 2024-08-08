const userService = require('../service/user')

class UserController {
    async register(ctx, next) {
        const { phone, password } = ctx.request.body
        let result = null
        try {
            if (phone && password) {
                const res = await userService.register(phone, password)
                if (res === 0)
                    result = { code: 0, message: '注册成功' }
                else if (res === 1)
                    result = { code: 1, message: '该手机号已注册，请直接登录' }
            }
            else {
                ctx.status = 400
                result = { code: 2, message: '缺少必要的注册信息' }
            }
        } catch (error) {
            ctx.status = 500
            result = { code: -1, message: '服务器内部错误：' + error.message }
        }
        ctx.body = result
    }

    async login(ctx, next) {
        const { phone, password } = ctx.request.body
        let result = null
        try {
            if (phone && password) {
                let { userInfo, session } = await userService.login(phone, password)
                ctx.session = session
                result = { code: 0, message: '登录成功', data: userInfo }
            }
            else {
                ctx.status = 400
                result = { code: 1, message: '缺少必要的登录信息' }
            }
        } catch (error) {
            ctx.status = 500
            result = { code: -1, message: '服务器内部错误：' + error.message }
        }
        ctx.body = result
    }

    async jwtLogin(ctx, next) {
        const { phone, password } = ctx.request.body
        let result = null
        try {
            if (phone && password) {
                let jwtLoginInfo = await userService.jwtLogin(phone, password)
                result = { code: 0, message: '登录成功', data: jwtLoginInfo }
            }
            else {
                ctx.status = 400
                result = { code: 1, message: '缺少必要的登录信息' }
            }
        } catch (error) {
            ctx.status = 500
            result = { code: -1, message: '服务器内部错误：' + error.message }
        }
        ctx.body = result
    }

    async getCaptcha(ctx, next) {
        const { phone } = ctx.request.body
        let result = null
        try {
            if (phone) {
                let res = await userService.sendCaptcha(phone)
                if (res === 0) {
                    result = { code: 0, message: '验证码发送成功' }
                }
                else {
                    result = { code: 1, message: '验证码发送失败' }
                }
            }
            else {
                ctx.status = 400
                result = { code: 2, message: '缺少必要的信息' }
            }
        } catch (error) {
            ctx.status = 500
            result = { code: -1, message: '服务器内部错误：' + error.message }
        }
        ctx.body = result
    }

    async checkCaptcha(ctx, next) {
        try {
            const { phone, captcha } = ctx.request.body
            const result = await userService.checkCaptcha(phone, captcha);
            if (result === 0) {
                ctx.body = { code: 0, message: '验证码正确' }
            }
            else {
                ctx.body = { code: 1, message: '验证码错误' }
            }

        } catch (error) {
            ctx.body = { code: -1, message: '服务器内部错误：' + error.message }
        }
    }

    async wxlogin(ctx, next) {
        const { code } = ctx.request.body
        let result = null

        try {
            if (code) {
                let loginInfo = await userService.wxlogin(code)
                result = { code: 0, message: '登录成功', data: loginInfo }
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
            const { userInfo, session } = await userService.checkQRCode(qrcodeString);
            ctx.session = session
            ctx.body = { code: 0, message: '登录成功', data: userInfo }
        } catch (error) {
            ctx.body = { code: -1, message: '服务器内部错误：' + error.message }
        }
    }

    async updatePassword(ctx, next) {
        ctx.body = `你好${ctx.state.userInfo.account}，你可以修改密码`
    }
}

module.exports = new UserController();