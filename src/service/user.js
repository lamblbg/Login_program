const UserModel = require('../model/user')
const RedisHandler = require('../utils/redisHandler')
const captchaHandler = require('../utils/captchaHandler')
const generateRandomCode = require('../utils/generateRandomCode')
const { encrypt, decrypt } = require('../utils/crypto')
const { getJscode2session } = require('../utils/wx')
const jwt = require('../utils/JWT')

class userService {
	async register(phone, password) {
		let userInfo = await UserModel.findByAccount(phone)
		if (!userInfo) {
			UserModel.create({ account: phone, password })
			return 0
		}
		else
			return 1

	}

	async login(phone, password) {
		let userInfo = await UserModel.findByAccountAndPwd(phone, password)
		if (!userInfo) {
			throw new Error('用户名或密码错误')
		}
		userInfo = userInfo.toObject()
		const _id = userInfo._id

		// 更新登录时间
		userInfo.lastLogin = new Date(Date.now())
		await UserModel.update({ _id }, userInfo)
		// 创建session
		const session = encrypt(_id)
		// 把用户信息和登录凭证存储到redis中，并设置过期时间
		let result = { userInfo, session }
		await RedisHandler.setObject(_id, result, 1 * 60 * 60 * 12) // 半天
		// 移除敏感信息
		delete result.userInfo.password

		return result
	}

	async jwtLogin(phone, password) {
		let userInfo = await UserModel.findByAccountAndPwd(phone, password)
		if (!userInfo) {
			throw new Error('用户名或密码错误')
		}
		userInfo = userInfo.toObject()
		const _id = userInfo._id

		// 更新登录时间
		userInfo.lastLogin = new Date(Date.now())
		await UserModel.update({ _id }, userInfo)
		// 移除敏感信息
		delete userInfo.password
		// 创建token并设置过期时间
		const token = jwt.generate(userInfo, 30)

		return { userInfo, token }
	}

	async sendCaptcha(phone) {
		let captcha = generateRandomCode(6)
		let res = await captchaHandler.send(phone, captcha)
		if (res.statusCode === 200) {
			RedisHandler.set(phone, captcha, 1 * 60 * 5) // 5分钟内有效
			return 0
		}
		else {
			return 1
		}
	}

	async checkCaptcha(phone, captcha) {
		let redisCaptcha = await RedisHandler.get(phone)
		if (captcha === redisCaptcha) {
			RedisHandler.delete(phone)
			let userInfo = await UserModel.findByAccount(phone)
			// 没有找到则新建用户
			if (!userInfo) {
				userInfo = await UserModel.create({ account: phone })
			}
			const _id = userInfo._id
			// 创建session
			const session = encrypt(_id)
			// 把用户信息和登录凭证存储到redis中，并设置过期时间
			let result = { userInfo, session }
			await RedisHandler.setObject(_id, result, 1 * 60 * 60 * 12) // 半天
			return 0
		}
		else {
			return 1
		}
	}

	async wxlogin(code) {
		// 换取用户信息
		const jscode2session = await getJscode2session(code)
		if (jscode2session.errmsg)
			throw new Error('无法通过该code到微信服务器换取用户信息，' + jscode2session.errmsg)

		const { openid } = jscode2session
		let userInfo = await UserModel.findByOpenid(openid)
		if (!userInfo) {
			userInfo = await UserModel.create({ openid, account: `微信用户${openid}`, lastLogin: Date.now() })
		}
		const _id = userInfo._id
		// 创建session
		const session = encrypt(_id)
		// 把该用户信息、jscode2session和登录凭证存储到redis中，并设置过期时间
		let result = { userInfo, session, jscode2session }
		RedisHandler.setObject(_id, result, 1 * 60 * 60 * 12) // 半天

		// 移除jscode2session，因为这个不能下发到客户端
		delete result.jscode2session
		return result

	}

	async getQRCodeString() {
		// 生成二维码字符串
		const qrcodeString = encrypt(Date.now()).data
		// 将字符串存储到redis中,键为这个二维码字符串,值先为空对象,我也想存一个null但存不进去啊 
		RedisHandler.setObject(qrcodeString, { iv: '0' }, 20) // 20秒过期
		return qrcodeString
	}

	async bindLoginCredentials(qrcodeString, session) {
		const redisQrcodeString = await RedisHandler.getObject(qrcodeString)
		if (JSON.stringify(redisQrcodeString) === '{"iv":"0"}') {
			// 更新二维码字符串对应的值为登录凭证
			await RedisHandler.setObject(qrcodeString, session)
		}
		else {
			throw new Error('二维码已过期，请重新获取')
		}

	}

	async checkQRCode(qrcodeString) {
		const startTime = Date.now()
		async function check() {
			const session = await RedisHandler.getObject(qrcodeString)
			// 如果有登录凭证
			if (session.iv && session.data) {
				// 到redis查找该用户的信息并返回
				let _id = decrypt(session).id
				let appLoginInfo = await RedisHandler.getObject(_id)
				if (JSON.stringify(appLoginInfo) === '{}') {
					throw new Error('app的登录信息在redis中已过期，请在app重新登录')
				}
				else {
					let userInfo = JSON.parse(appLoginInfo.userInfo)
					// 创建session
					const session = encrypt('qrcodeLogin:' + _id)
					// 把该用户信息和登录凭证存储到redis中，并设置过期时间
					let result = { userInfo, session }
					RedisHandler.setObject('qrcodeLogin:' + _id, result, 1 * 60 * 60 * 12) // 半天 

					delete result.userInfo.openid
					return result
				}
			}
			// 没有登录凭证
			else {
				// 在10秒内一直检测
				if (Date.now() - startTime < 10000) {
					await new Promise((resolve) => {
						process.nextTick(() => resolve())
					})
					return await check()
				}
				// 超过10秒
				else {
					throw new Error('请重新发送请求轮询')
				}
			}
		}
		return check()
	}
}
module.exports = new userService();
