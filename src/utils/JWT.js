const jwt = require('jsonwebtoken');
const JWT_SECRET = 'lamb'

module.exports = {
    generate(data, expires) {
        return jwt.sign(data, JWT_SECRET, { expiresIn: expires })
    },
    verify(token) {
        try {
            return jwt.verify(token, JWT_SECRET)
        } catch (error) {
            return false
        }
    }
} 