const $OpenApi = require("@alicloud/openapi-client")
const dysmsapi20170525_1 = require("@alicloud/dysmsapi20170525"), $Dysmsapi20170525 = dysmsapi20170525_1;
const tea_util_1 = require("@alicloud/tea-util"), $Util = tea_util_1;
const tea_console_1 = require("@alicloud/tea-console");

module.exports = class Client {
    static createClient() {
        let config = new $OpenApi.Config({
            // 需要在系统环境变量里添加这两个环境变量
            accessKeyId: process.env['ALIBABA_CLOUD_ACCESS_KEY_ID'],
            accessKeySecret: process.env['ALIBABA_CLOUD_ACCESS_KEY_SECRET'],
        });
        config.endpoint = `dysmsapi.aliyuncs.com`;
        return new dysmsapi20170525_1.default(config);
    }

    static async send(phoneNumbers, captcha) {
        let client = Client.createClient();
        let sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
            signName: '阿里云短信测试',
            templateCode: 'SMS_154950909',
            phoneNumbers,
            templateParam: `{"code":${captcha}}`,
        });
        let runtime = new $Util.RuntimeOptions({});

        try {
            let resp = await client.sendSmsWithOptions(sendSmsRequest, runtime);
            return resp
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
}