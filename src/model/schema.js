const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  openid: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  account: {
    type: String,
  },
  password: {
    type: String,
  },
  avatar: {
    type: String
  },
  userType: {
    type: Number,
    default: 0
  }
})

module.exports = {
  User: mongoose.model('User', userSchema),
}
