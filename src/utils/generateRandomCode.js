module.exports = function generateRandomCode(length) {
    // 验证传入的长度是否为正整数  
    if (!Number.isInteger(length) || length <= 0) {
        throw new Error('Length must be a positive integer');
    }

    // 初始化一个空字符串用于存储验证码  
    let code = '';

    // 生成每一位随机数并拼接  
    for (let i = 0; i < length; i++) {
        // 这里乘以10是因为我们想要的是0-9的数字，如果需要其他范围或字符集，可以相应调整  
        let randomDigit = Math.floor(Math.random() * 10);
        code += randomDigit.toString(); // 将数字转换为字符串并拼接到验证码上  
    }

    return code 
}  