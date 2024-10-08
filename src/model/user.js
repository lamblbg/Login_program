const { User } = require('./schema')

class UserModel {
  async findByOpenid(openid) {
    const users = await User.find({ openid })
    if (users.length == 0) return null
    return users[0]
  }

  async findById(id) {
    const users = await User.find({ _id: id })
    if (users.length == 0) return null
    return users[0]
  }

  async findByAccount(account) {
    const users = await User.find({ account })
    if (users.length == 0) return null
    return users[0]
  }

  async findByAccountAndPwd(account, password) {
    const users = await User.find({ account, password })
    if (users.length == 0) return null
    return users[0]
  }

  async create(config) {
    return await User.create(config)
  }

  async update(filter, newData) {
    return await User.updateOne(filter, newData)
  }
}

module.exports = new UserModel();
