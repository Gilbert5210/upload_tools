/**
 * 后台服务器配置，部署新服务器时需修改
 */

let path = require('path');
let widgetPath = path.resolve(__dirname, './widgets');
let dataPath = path.resolve(__dirname, './data');
let screenDataPath = path.resolve(__dirname, './data/screen');

if (process.env.NODE_ENV === 'development') {
    dataPath = 'data';
    screenDataPath = './data/screen';
}

module.exports = {
    product: 'aBDI', // 所合入的产品线
    server_port: 5001, // 服务器端口
    widget_path: widgetPath,
    data_path: dataPath,
    screen_data_path: screenDataPath,
    log_path: path.resolve(__dirname, './logs/cheese.log')
};
