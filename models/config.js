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

const SFTP_OPTION = {
    host: '47.107.157.97',
    port: 22,
    user: 'sftp',
    password: 'Admin123@',
    root: '/zjy',
    files: []
}


module.exports = {
    FTP_OPTION,
    SFTP_OPTION
}