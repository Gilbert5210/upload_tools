/**
 * Created by ued on 2019/4/25.
 */

let path = require('path');
let fs = require('fs');
let Client = require('ssh2-sftp-client');
let BaseUploader = require('./base_uploader');
let { glob, isValidObjectKey } = require('../util/util');
let {SFTP_OPTION} = require('../../config.app');                 // 配置项的默认连接信息
const DEFAULT_PATH = '/zjy';                // 默认路径
const {logger:Logger, setUserName} = require('../util/logger');
let Response = require('../util/response');

class Sftp extends BaseUploader {

    constructor (options = {}) {
        super(options);
        this.client = new Client();
    }

    initOptions (options) {
        this.options = Object.assign(SFTP_OPTION, options);
        this.options.files = glob(this.options.files);
        if (isValidObjectKey(this.options)) {
            setUserName(this.options?.user || 'admin');
        }
    }

    connect () {
        console.log(`[sftp] connect sftp://${this.options.host}:${this.options.port}/${this.options.root}`);
        let  {host, port, user, password} = this.options;
        let infoTipStr = `[sftp] connect ftp://${user}@${host}:${port}`;
        let errTipStr =  (e) => `[sftp] connect error. ${e}`;
        Logger.info(infoTipStr);

        return new Promise((resolve) => {
            this.client.connect({
                host, port, user, password
            }).then(() => {
                this.onReady();
                Logger.info(`${infoTipStr} success`);
                resolve(true);
    
            }).catch((e => {
                Logger.error(errTipStr(e));
                resolve(false);
            }));
        });
    }


    /**
     * 获取文件夹列表(指定路径获取文件列表)
     * 默认获取根目录的所有文件
     * @param {string} dirPath   目标地址
     * @param {string} pattern   正则过滤
     */
    async getFileList (dirPath, pattern) {
        if (!dirPath) {
            dirPath = DEFAULT_PATH
        }

        Logger.info(`[sftp] 正在查找${dirPath}文件列表信息`);

        let list = await this.client.list(dirPath, pattern);
        let tipStr = `[sftp] getFileList ${dirPath}.`;

        if (!Array.isArray(list)) {
            list = [];
            Logger.error(tipStr);
        }

        Logger.info(`[sftp] 文件夹 ${tipStr} 查询成功`);

        return list;
    }

    //下载文件
    async downloadFile (filePath, targetPath) {
        Logger.info(`[sftp] 正在下载${filePath}文件列表信息`);

        let res = await this.client.get(filePath, targetPath);

        if (res) {
            Logger.info(`[sftp] 文件${filePath}成功下载`);
        }

        return res
        
    }
    
    /**
     * 文件上传到服务器
     * @param {*} filePath 
     * @param {*} targetFilePath 
     * @param {*} client  ftp连接实例
     * @param {*} hasDirectoryFlag  是否存在文件夹
     * @returns {*} 成功的话返回当前的路径，失败返回报错信息
     */
    async startUpload (filePath, targetFilePath, hasDirectoryFlag) {
        Logger.info(`[sftp] start upload files... root: ${this.options.root}`);
        this.onStart();

        let remotePath;
        let target = targetFilePath ||  this.options.root;

        if (!hasDirectoryFlag) {
            let baseName = path.basename(filePath);
            remotePath = path.join(target, baseName);   
        } else {
            remotePath = path.join(target, filePath);
        }

        let res;
        let code = 200;
        if (fs.statSync(filePath).isDirectory()) {
            res = await this.client.mkdir(remotePath, true);
        } else {
            // 添加进度条
            let rs = fs.createReadStream(filePath);
            let total = fs.statSync(filePath).size;
            await this.getSpeed(rs, total, filePath);

            res = await this.client.put(filePath, remotePath);
        }

        if (!res) {
            let msg = `[sftp] ${filePath} 文件上传成功`;
            Logger.info(msg);
            return Response.success(filePath, 'msg')
        } else {
            let msg = `[sftp] ${filePath} 文件上传失败.`;
            Logger.info(msg);
            return Response.success(filePath, msg)
        }

    }


    // 删除文件
    async delete (remoteFile) {
        if (await this.exists(remoteFile)) {
            Logger.error(`[sftp] 文件 ${remoteFile} 路径不存在`);
            return;
        }
        await this.client.delete(remoteFile);
    }

    /**
     * 判断文件以及文件夹是否存在
     * @param {String} remotePath 
     * @returns {Boolean} 返回true | false
     */
    async exists (remotePath) {
        return await this.client.exists(remotePath);
    }

    onDestroyed () {
        if (this.client) {
            this.client.end();
            this.client = null;
        }
        super.onDestroyed();
    }
}

module.exports = Sftp;
