const UserModel = require('../model/user')
const RedisHandler = require('../utils/redisHandler')
const { encrypt, decrypt } = require('../utils/crypto')
const { getJscode2session } = require('../utils/wx')

class userService {
	async login(code) {
		// 换取用户信息
		const jscode2session = await getJscode2session(code)
		if (jscode2session.errmsg)
			throw new Error('无法通过该code到微信服务器换取用户信息，' + jscode2session.errmsg)

		const { openid } = jscode2session
		let userInfo = await UserModel.findByOpenid(openid)
		if (!userInfo) {
			userInfo = await UserModel.create({ openid, lastLogin: Date.now() })
		}
		const _id = userInfo._id
		// 创建session
		const session = encrypt(_id)
		// 把该用户信息、jscode2session和登录凭证存储到redis中
		let result = { userInfo, session, jscode2session }
		// 设置过期时间
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
		// 更新二维码字符串对应的值为登录凭证
		await RedisHandler.setObject(qrcodeString, session)
	}

	async checkQRCode(qrcodeString) {
		const startTime = Date.now()
		async function check() {
			const session = await RedisHandler.getObject(qrcodeString)
			// 如果有登录凭证
			if (session.iv && session.data) {
				// 到redis查找该用户的信息并返回
				let _id = decrypt(session).id
				let userInfo = JSON.parse((await RedisHandler.getObject(_id)).userInfo)
				delete userInfo.openid
				return userInfo
			}
			// 没有登录凭证
			else {
				// 在10秒内
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
