const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const secretKey = 'cloud-album';
const id = 'lamb';

// 加密函数  
function encrypt(id) {

    const key = crypto.scryptSync(secretKey, 'salt', 32); // 使用scrypt生成密钥  
    const iv = crypto.randomBytes(16); // 初始化向量  

    const text = `${id},${Date.now().toString()}`;
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return { iv: iv.toString('hex'), data: encrypted };
}

// 解密函数  
function decrypt(encryptedObject) {
    const key = crypto.scryptSync(secretKey, 'salt', 32);
    const iv = Buffer.from(encryptedObject.iv, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedObject.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const result = decrypted.split(',');
    return {id: result[0], createdTime: result[1]};
}

function test() {
    const encrypted = encrypt(id);
    console.log('Encrypted:', encrypted);

    const decrypted = decrypt(encrypted);
    console.log('Decrypted:', decrypted);
}

module.exports = {
    encrypt,
    decrypt
}