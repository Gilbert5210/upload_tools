/**
 * Created by uedc on 2020/9/14.
 */

let EventEmitter = require('events');

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
     * 派生类必须实现，有几个注意事项：
     * 1. 启动前需要调用 onStart()
     * 2. 对于每写成一个文件的上传，则需要调用 onFileUpload(file)
     * 3. 最终所有文件成功上传后调用 onSuccess();
     * 4. 只要有任何错误都需要调用 onFailure(); 结束上传
     * @return {Promise<void>}
     */
    async startUpload () {
        throw new Error(`[BaseUploader] Method: startUpload will be override`);

        // this.onStart();
        // for (let file of this.options.files) {
        //     this.onFileUpload(file);
        // }
        // this.onSuccess();
        // this.onFailure();
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
