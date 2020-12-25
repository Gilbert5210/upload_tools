/**
 * @file 获取模拟数据
 */

let fs = require('fs');
let path = require('path');
let ftpClient = require('../models/ftp');
let Response = require('../util/response');

class FtpTools {

    static async ftpConnect (ctx) {

        try {
            let message = 'connect fail';
            let res = await ftpClient.connect();
            let data = {};

            if (res.success) {
                message = 'connect success';
                ctx.response.body = Response.success(res.data, message);
            }
        } catch (e) {
            Logger.error(e);
            ctx.response.body = Response.failure();
        }
    }

    static setScreenApi () {
        return {
            'GET /ftp/connect': this.ftpConnect
        };
    }
}

module.exports = FtpTools.setScreenApi();
