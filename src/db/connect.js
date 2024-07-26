const mongoose = require('mongoose')
const { createClient } = require('redis');
const { mongoDBConnectConfig, redisConnectConfig } = require('../config')


class DataBaseConnector {
  static redisClient = createClient(redisConnectConfig)

  static openMongoDB() {
    return mongoose.connect(mongoDBConnectConfig.name)
  }

  static closeMongoDB() {
    return mongoose.connection.close()
  }

  static openRedis() {
    this.redisClient.on('error', (err) => console.log('Redis连接失败'))
    this.redisClient.connect()
    return this.redisClient

  }

  static closeRedis() {
    this.redisClient.disconnect();
  }
}

module.exports = DataBaseConnector