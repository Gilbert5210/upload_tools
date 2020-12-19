/**
 * Created by zjy on 2020/12/12.
 */

let path = require('path');
let fs = require('fs');
let Client = require('ftp');
let BaseUploader = require('./base_uploader');
let { glob, uploadActionType } = require('./util');
let {FTP_OPTION} = require('./config');                 // 配置项的默认连接信息
const Logger = require('../lib/Logger');

const ALLOW_BLANK_KEY = ['host', 'port', 'user', 'password'];
const DEFAULT_PATH = '/zjy';                // 默认路径
const ACTION_TYPE = {           // 上传下载发生方式
    parallel: 'parallel',       // 并行
    serial: 'serial'            // 串行
}

class Ftp extends BaseUploader {

    initOptions (options) {
        this.options = Object.assign(FTP_OPTION, options);
        this.options.files = glob(this.options.files);
        this.assert();
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

    connect (option) {
        return new Promise((resolve) => {
            this.ftpClient = new Client();
            option && this.initOptions(option);
            let  {host, port, user, password} = this.options;
            let infoTipStr = `[ftp] connect ftp://${user}@${host}:${port}`;
            let errTipStr =  (e) => `[ftp] connect error. ${e}`;
            Logger.info(user, infoTipStr);

            this.ftpClient.connect({ host, port, user, password});

            this.ftpClient.on('ready', async () => {
                Logger.info(user, `${infoTipStr} success`);
                resolve(true);
            });

            this.ftpClient.on('error', e => {
                Logger.error(user, errTipStr(e));
                throw new Error(errTipStr(e));
            });
        });
    }

    /**
     * 断开连接
     */
    exit () {
        this.ftpClient.end();
        Logger.info(this.options.user, `[ftp] connect end`);
    }

    /**
     * 获取文件夹列表(指定路径获取文件列表)
     * @param {String} dirPath 
     */
    async getFileList (dirPath = DEFAULT_PATH) {
        
        return new Promise((resolve) => {
            this.ftpClient.list(dirPath, false, (err, list) => {
                let tipStr = `[ftp] getFileList ${dirPath}.`;
                if (err) {
                    Logger.error(this.options.user, tipStr + err);
                    throw new Error(tipStr + err);
                }

                Logger.info(this.options.user, `folder ${tipStr} success`);
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
                    Logger.error(this.options.user, `[ftp] switchDirectory ${dirPath} error`);
                }

                Logger.info(this.options.user, `[ftp] switchDirectory ${dirPath} success`);
                resolve({ err: err, dir: dir });
            })
        });
    }

    
    /**
     * 获取上传下载的进度
     * @param {*} rsFile 可读流文件类型
     * @param {*} total   文件大小总数 
     * @param {*} filePath   
     */
    getSpeed (rsFile, total, filePath) {
        return new Promise((resolve) => {
            let cur = 0;

            rsFile.on('data', function (d) {
                cur += d.length;
                let percent = ((cur / total) * 100).toFixed(1);
                console.log(`${filePath} uploading：-------------- ${percent}%`);
                resolve(percent)
            });
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
     * 将文件上传到ftp目标地址
     * 目的必须添加相应的文件名称，不然是没办法创建成功的，也是我的疑问，要怎么优化
     * @param {*} currentFile 
     * @param {*} targetFilePath 
     * @param {*} actionType 默认使用并行的方式
     */
    async uploadFile (currentFile, targetFilePath, actionType = ACTION_TYPE.parallel) {

        return new Promise(async (resolve, reject) => {
            let files = glob(currentFile);
            let result = await uploadActionType(files, actionType, targetFilePath, this._startUpload)
            console.log('返回结果：', result, files);
            resolve(result, files);
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

    /**
     * 文件上传到服务器
     * @param {*} filePath 
     * @param {*} targetFilePath 
     * @returns {*} 成功的话返回当前的路径，失败返回报错信息
     */
    _startUpload (filePath, targetFilePath) {

        // toDo: 这里需要做些文件相关约束判断

        return new Promise((resolve, reject) => {
            let cb = err => {
                if (err) {
                    Logger.error(this.options.user, `[ftp] ${filePath} 文件上传失败`);
                    return reject(err);
                }

                Logger.error(this.options.user, `[ftp] ${filePath} 文件上传成功`);
                resolve(filePath);
            };
            
            targetFilePath = targetFilePath ||  this.options.root;
            let targetPath = path.join(targetFilePath, filePath);

            if (fs.statSync(filePath).isDirectory()) {
                this.ftpClient.mkdir(targetPath, true, cb);
                return;
            }

            console.log('当前的连接实例：', this.ftpClient);

            // // 添加进度条
            // let rs = fs.createReadStream(filePath);
            // let total = fs.statSync(filePath).size;
            // this.getSpeed(rs, total, filePath);

            this.ftpClient.put(filePath, targetPath, cb);
        });
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
