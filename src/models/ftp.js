/**
 * Created by zjy on 2020/12/12.
 */

let path = require('path');
let fs = require('fs');
let Client = require('ftp');
let BaseUploader = require('./base_uploader');
let { glob} = require('../util/util');
let {FTP_OPTION} = require('../../config.app');                 // 配置项的默认连接信息
const {logger:Logger, setUserName} = require('../util/logger');

const ALLOW_BLANK_KEY = ['host', 'port', 'user', 'password'];
const DEFAULT_PATH = '/zjy';                // 默认路径
const ACTION_TYPE = {           // 上传下载发生方式
    parallel: 'parallel',       // 并行
    serial: 'serial'            // 串行
}

class Ftp extends BaseUploader {

    constructor (options = {}) {
        super(options);
        this.ftpClient = new Client();
    }

    initOptions (options) {
        this.options = Object.assign(FTP_OPTION, options);
        this.options.files = glob(this.options.files);
        this.assert();
        setUserName(this.options?.user || 'admin');
    }

    /**
     * 校验连接必须字段
     */
    assert () {
        ALLOW_BLANK_KEY.forEach(key => {
            if (!this.options[key]) {
                let warnTipStr = (key) => `[ftp:assert] options: "${key}" not found in ${ALLOW_BLANK_KEY}`;
                Logger.warn(this.options.user, warnTipStr);
                throw new Error(warnTipStr);
            }
        })
    }

    connect () {
        return new Promise((resolve) => {
            let  {host, port, user, password} = this.options;
            let infoTipStr = `[ftp] connect ftp://${user}@${host}:${port}`;
            let errTipStr =  (e) => `[ftp] connect error. ${e}`;
            Logger.info(infoTipStr);

            this.ftpClient.connect({ host, port, user, password});

            this.ftpClient.on('ready', async () => {
                Logger.info(`${infoTipStr} success`);
                resolve(true);
            });

            this.ftpClient.on('error', e => {
                Logger.error(errTipStr(e));
                throw new Error(errTipStr(e));
            });
        });
    }

    /**
     * 获取文件夹列表(指定路径获取文件列表)
     * @param {String} dirPath 
     */
    async getFileList (dirPath = DEFAULT_PATH) {
        Logger.info(`正在查找${dirPath}文件列表信息`);
        
        return new Promise((resolve) => {
            this.ftpClient.list(dirPath, false, (err, list) => {
                let tipStr = `[ftp] getFileList ${dirPath}.`;
                if (err) {
                    Logger.error(tipStr + err);
                    throw new Error(tipStr + err);
                }

                Logger.info(`folder ${tipStr} success`);
                resolve(list);
            });
        });
    }

    /**
     * 切换目录
     * @param {String} dirPath 
     */
    switchDirectory (dirPath) {
        return new Promise((resolve) => {
            this.ftpClient.switchDirectory(dirPath, (err, dir) => {

                if (err) {
                    Logger.error(`[ftp] switchDirectory ${dirPath} error`);
                }

                Logger.info(`[ftp] switchDirectory ${dirPath} success`);
                resolve({ err: err, dir: dir });
            })
        });
    }

    /**
     * 下载文件
     * @param {String} filePath
     */
    async downloadFile (filePath) {
        let dirPath = path.dirname(filePath);
        let fileName = path.basename(filePath);
        let { err: ea, dir } = await this.switchDirectory(dirPath);

        return new Promise((resolve, reject) => {
            this.ftpClient.get(fileName, (err, rs) => {
                let ws = fs.createWriteStream(fileName);
                rs.pipe(ws);
                resolve({ err: err });
            });
        });
    }


    /**
     * 文件上传到服务器
     * @param {*} filePath 
     * @param {*} targetFilePath 
     * @param {*} client  ftp连接实例
     * @param {*} hasDirectoryFlag  是否存在文件夹
     * @returns {*} 成功的话返回当前的路径，失败返回报错信息
     */
    startUpload (filePath, targetFilePath, hasDirectoryFlag) {

        this.onStart();

        // toDo: 这里需要做些文件相关约束判断

        return new Promise((resolve, reject) => {
            let cb = err => {
                if (err) {
                    Logger.error(`[ftp] ${filePath} 文件上传失败. ${err}`);
                    reject(err);
                    return;
                }

                Logger.info(`[ftp] ${filePath} 文件上传成功`);
                resolve(filePath);
            };

            
            console.log('当函数传值为：filePath/targetFilePath', filePath, targetFilePath);

            let remotePath;
            let target = targetFilePath ||  this.options.root;

            if (!hasDirectoryFlag) {
                let baseName = path.basename(filePath);
                remotePath = path.join(target, baseName);   
            } else {
                remotePath = path.join(target, filePath);
            }

            console.log('当前远程文件', remotePath);

            if (fs.statSync(filePath).isDirectory()) {
                this.ftpClient.mkdir(remotePath, true, cb);
            } else {
                // 添加进度条
                let rs = fs.createReadStream(filePath);
                let total = fs.statSync(filePath).size;
                this.getSpeed(rs, total, filePath);

                this.ftpClient.put(filePath, remotePath, cb);
            }
        });
    }

    /**
     * 删除文件
     * 删除文件使用第一个参数，删除文件夹使用第二个参数
     * toDo：这里不知道怎么判断ftp上的路径是否为一个文件夹，所以暂时用规避方案实现
     * fs.statSync(folderPath).isDirectory() ---判断是否为文件夹
     * @param {*} filePath 
     * @param {*} folderPath 
     */
    async deleteFile (filePath, folderPath) {
        if (filePath) {
            let dirPath = path.dirname(filePath);
            let fileName = path.basename(filePath);
            let { err: targetDirErr, dir } = await this.switchDirectory(dirPath);
            if (targetDirErr) {
                return Promise.resolve({ err: targetDirErr });
            }

            return new Promise((resolve, reject) => {
                this.ftpClient.delete(fileName, (err, rs) => {
                    resolve({ err: err });
                });
            });
        }

        if (folderPath) {
            return new Promise((resolve, reject) => {
                this.ftpClient.rmdir(folderPath, true, (err, rs) => {
                    resolve({ err: err });
                });
            });
        }
    }
    
    onDestroyed () {
        if (this.ftpClient) {
            this.ftpClient.destroy();
            this.ftpClient = null;
        }
        super.onDestroyed();
    }
}


module.exports = Ftp;
