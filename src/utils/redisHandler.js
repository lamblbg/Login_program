const DataBaseConnector = require('../db/connect')

class RedisHandler {
    static redisClient = DataBaseConnector.redisClient

    static async set(key, value, expire) {
        this.redisClient.set(key.toString(), value)
        if (expire)
            this.redisClient.expire(key.toString(), expire)
    }

    static async get(key) {
        return await this.redisClient.get(key.toString())
    }

    static async delete(key) {
        return await this.redisClient.del(key.toString())
    }

    static async setObject(key, object, expire) {
        Object.keys(object).forEach((field) => {
            let value = typeof object[field] === 'string' ? object[field] : JSON.stringify(object[field])
            this.redisClient.hSet(key.toString(), field, value)
        });
        if (expire)
            this.redisClient.expire(key.toString(), expire)
    }

    static async getObject(key) {
        return await this.redisClient.hGetAll(key.toString())
    }
}

module.exports = RedisHandler