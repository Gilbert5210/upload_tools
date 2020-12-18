/**
 * 后台服务器配置，部署新服务器时需修改
 */

let path = require('path');

module.exports = {
    server_port: 5001, // 服务器端口
    log_path: path.resolve(__dirname, './logs/cheese.log')
};
