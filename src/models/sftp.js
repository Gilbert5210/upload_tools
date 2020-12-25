/**
 * Created by ued on 2019/4/25.
 */

let path = require('path');
let fs = require('fs');
let Client = require('ssh2-sftp-client');
let BaseUploader = require('./base_uploader');
let { glob } = require('../util/util');
class Sftp extends BaseUploader {

    initOptions (options) {
        this.options = Object.assign({
            host: '',
            port: 22,
            user: 'root',
            password: '',
            root: '/root/',
            files: []
        }, options);
        this.options.files = glob(this.options.files);

        // this.assert();
    }

    assert () {
        ['host', 'port', 'user', 'password', 'root'].forEach(key => {
            if (!this.options[key]) {
                throw new Error(`[sftp] options: "${key}" not found`);
            }
        })
    }

    connect () {
        this.sftpClient = new Client();

        console.log(`[sftp] connect sftp://${this.options.host}:${this.options.port}/${this.options.root}`);
        return this.sftpClient.connect({
            host: this.options.host,
            port: this.options.port,
            username: this.options.user,
            password: this.options.password
        }).then(async () => {
            this.onReady();
            let list = await this.getFileList();
            console.log('当前文件列表为:', list.length);
            console.dir(list);
        }).catch((e => {
            throw new Error(`[sftp] connect error. ${e}`);
        }));
    }


    /**
     * 获取文件夹列表(指定路径获取文件列表)
     * 默认获取根目录的所有文件
     * @param {string} dirpath   目标地址
     * @param {string} pattern   正则过滤
     */
    async getFileList (dirpath, pattern) {
        if (!dirpath) {
            dirpath = '/'
        }

        return await this.sftpClient.list(dirpath, pattern);
    }

    //下载文件
    async downloadFile (filePath, targetPath) {
        await this.sftpClient.get(filePath, targetPath);
    }

    // 上传文件(找不到)
    _upload (filePath) {
        let remotePath = path.posix.join(this.options.root, filePath);
        if (fs.statSync(filePath).isDirectory()) {
            return this.sftpClient.mkdir(remotePath, true);
        }

        return this.sftpClient.put(filePath, remotePath);
    }


    // 删除文件
    async delete (remoteFile) {
        if (await this.exists(remoteFile)) {
            console.error('当前路径不存在');
            return;
        }
        await this.sftpClient.delete(remoteFile);
    }

    /**
     * 判断文件以及文件夹是否存在
     * @param {String} remotePath 
     * @returns {Boolean} 返回true | false
     */
    async exists (remotePath) {
        return await this.sftpClient.exists(remotePath);
    }

    async startUpload () {
        console.log(`[sftp] start upload files... root: ${this.options.root}`);
        this.onStart();

        // sftp上传过快会挂掉，这里改成单个文件一个一个升级
        try {
            for (let file of this.options.files) {
                await this._upload(file);
                this.onFileUpload(file);
            }
        } catch (e) {
            this.onFailure(e);
        }

        this.onSuccess();
    }

    onDestroyed () {
        if (this.sftpClient) {
            this.sftpClient.end();
            this.sftpClient = null;
        }
        super.onDestroyed();
    }
}

module.exports = Sftp;
