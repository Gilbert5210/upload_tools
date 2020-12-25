/**
 * @file 获取模拟数据
 */

let fs = require('fs');
let path = require('path');

class ScreenIndex {

    static async getLineData (ctx) {
        let data = JSON.parse( fs.readFileSync(path.resolve(__dirname, '../mock/lineData.json'), 'utf8'));

        ctx.response.body = {
            success: true,
            data: data
        };
    }

    static setScreenApi () {
        return {
            'GET /getLineData': this.getLineData
        };
    }
}

module.exports = ScreenIndex.setScreenApi();
