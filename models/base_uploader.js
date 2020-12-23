/**
 * Created by uedc on 2020/9/14.
 */

const { option } = require('commander');
let EventEmitter = require('events');
const { promises } = require('fs');
let {glob} = require('../lib/util');
const {logger:Logger} = require('../lib/Logger');

const ACTION_TYPE = {           // 上传下载发生方式
    parallel: 'parallel',       // 并行
    serial: 'serial'            // 串行
}

class BaseUploader extends EventEmitter {

    constructor (options = {}) {
        super();
        this.initOptions(options);
    }

    initOptions (options) {
        this.options = options;
    }

    /**
     * 派生类必须实现，当连接成功后需要调用 this.onReady 接口
     * @return {Promise<void>}
     */
    async connect () {
        throw new Error(`[BaseUploader] Method: connect will be override`);

        // this.onReady();
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
     * 将文件上传到ftp目标地址
     * 目的必须添加相应的文件名称，不然是没办法创建成功的，也是我的疑问，要怎么优化
     * @param {*} currentFile 
     * @param {*} targetFilePath 
     * @param {*} actionType 默认使用并行的方式
     */
    async uploadFile (currentFile, targetFilePath, actionType = ACTION_TYPE.parallel) {
        let files = glob(currentFile);

        // let dirList = getDirectory(files, remote);
        // let fileList = getFiles(files);

        

        await this.uploadActionType(files, actionType, targetFilePath)
    }

    /**
     * 派生类必须实现，有几个注意事项：
     * 1. 启动前需要调用 onStart()
     * 2. 对于每写成一个文件的上传，则需要调用 onFileUpload(file)
     * 3. 最终所有文件成功上传后调用 onSuccess();
     * 4. 只要有任何错误都需要调用 onFailure(); 结束上传
     * @return {Promise<void>}
     */
    async startUpload () {
        throw new Error(`[BaseUploader] Method: startUpload will be override`);
    }

    /**
     * 上传方式的处理
     * 只有两种方式
     * @param {*} files     文件列表
     * @param {*} action    方式
     * @param {*} targetFilePath    目标地址
     * @param {Function} callback (file)  回调函数
     * @param {Object} client (file)  ftp链接实例
     * @returns {Array} 
     */
    async uploadActionType (files, action, targetFilePath) {

        // 并行
        if (action === ACTION_TYPE.parallel) {
            await this.parallelUpload(files, targetFilePath);
            return;
        }
        await this.serialUpload(files, targetFilePath);
    }
    
    /**
     * 并行上传
     * @param {*} files 
     * @param {*} targetFilePath 
     */
    parallelUpload (files, targetFilePath) {
        return new Promise((resolve, reject) => {
            Promise.all([files.map(file=> this.startUpload(file, targetFilePath))]).then(() => {
                resolve();
            }).catch(err => {
                reject(err);
            });
        })
    }

    /**
     * 串行上传
     * @param {*} files 
     * @param {*} targetFilePath 
     */
    async serialUpload (files, targetFilePath) {
        for (let file of files) {
            let res = await this.startUpload(file, targetFilePath);

            if (res !== file) {
                continue;
            }
        }
    }

    onReady () {
        console.log('[BaseUploader] connect ready.');
        this.emit('upload:ready');
    }

    onStart () {
        console.log('[BaseUploader] start upload.');
        this.emit('upload:start', this.options);
    }

    onSuccess () {
        console.log('[BaseUploader] all files uploaded.');
        this.emit('upload:success', this.options);
    }

    onFailure (e) {
        console.error('[BaseUploader] file upload error.', e);
        this.emit('upload:failure', this.options, e);
    }

    onFileUpload (file) {
        this.emit('upload:file', this.options, file);
    }

    /**
     * 提供接口方便在销毁前做业务处理
     */
    onBeforeDestroy () {
        this.emit('upload:beforedestroy');
    }

    /**
     * 在销毁时不同的业务需要不同的处理，比如断开连接等
     */
    onDestroyed () {
        this.emit('upload:destroy');
    }

    
    /**
     * 断开连接
     */
    logout () {
        this.ftpClient.end();
        this.destroy();
        Logger.info('[ftp] logout');
    }

    destroy () {
        if (this.destroyed) {
            this.onBeforeDestroy();
            this.options = null;
            this.removeAllListeners();
            this.onDestroyed();
            this.destroyed = true;
        }
    }
}


module.exports = BaseUploader;
