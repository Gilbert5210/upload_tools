/**
 * 后台服务器配置，部署新服务器时需修改
 */

let path = require('path');
/**
 * ftp服务器的默认配置
 */
const FTP_OPTION = {
    host: '47.107.157.97',
    port: 21,
    user: 'ftp',
    password: 'Admin123@',
    root: '/zjy',
    files: []
};

// sftp 服务器的默认配置
const SFTP_OPTION = {
    host: '47.107.157.97',
    port: 22,
    user: 'sftp',
    password: 'Admin123@',
    root: '/zjy',
    files: []
}



module.exports = {
    server_port: 5001, // 服务器端口
    log_path: path.resolve(__dirname, './logs/cheese.log'),
    FTP_OPTION,
    SFTP_OPTION
};
