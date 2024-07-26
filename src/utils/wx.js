const { appid, appSecret } = require('../config')
const axios = require('axios')

module.exports = {
    async getJscode2session(code) {
        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`
        return new Promise((resolve, reject) => {
            axios.get(url).then((res) => {
                resolve(res.data)
            }).catch((err) => {
                reject(err)
            })
        })
    }
}
