/**
 * Created by ued on 2019/4/25.
 */

let path = require('path');
let fs = require('fs');
let Client = require('ftp');
let BaseUploader = require('./base_uploader');
let { glob } = require('./util');


class Ftp extends BaseUploader {

    initOptions (options) {
        this.options = Object.assign({

            // default
            host: '10.58.55.241',
            port: 21,
            user: 'sdpt',
            password: 'sdpt',
            root: '',
            files: []
        }, options);
        this.options.files = glob(this.options.files);

        // this.assert();
    }

    assert () {
        ['host', 'port', 'root'].forEach(key => {
            if (!this.options[key]) {
                throw new Error(`[ftp] options: "${key}" not found`);
            }
        })
    }

    connect (option) {
        return new Promise((resolve) => {
            this.client = new Client();
            option && this.initOptions(option);

            console.log(`[ftp] connect ftp://${this.options.user}@${this.options.host}:${this.options.port}`);
            this.client.connect({
                host: this.options.host,
                port: this.options.port,
                user: this.options.user,
                password: this.options.password
            });
            this.client.on('ready', async () => {
                this.onReady();
                let fileList = await this.getFileList()
                resolve({
                    success: true,
                    data: fileList
                });
            });
            this.client.on('error', e => {
                throw new Error(`[ftp] connect error. ${e}`);
            });
        });
    }

    // 断开连接
    exit () {
        this.client.end();
    }

    // 获取文件夹列表(指定路径获取文件列表)
    async getFileList (dirpath) {
        if (dirpath) {
            let {err : cwdErr,dir } = await this.cwd(dirpath);
            throw new Error(`[ftp] cwd() error. ${this.cwdErr}`);
        }

        return new Promise((resolve) => {
            this.client.list((err, list) => {
                if (err) {
                    throw new Error(`[ftp] getList error. ${err}`);
                }
                resolve(list);
            });
        });
    }

    //切换目录
    cwd (dirpath) {
        return new Promise((resolve, reject) => {
            this.client.cwd(dirpath, (err, dir) => {
                resolve({ err: err, dir: dir });
            })
        });
    }

    //下载文件
    async downloadFile (filePath) {
        let dirpath = path.dirname(filePath);
        let fileName = path.basename(filePath);
        let { err: ea, dir } = await this.cwd(dirpath);

        return new Promise((resolve, reject) => {
            this.client.get(fileName, (err, rs) => {
                let ws = fs.createWriteStream(fileName);
                rs.pipe(ws);
                resolve({ err: err });
            });
        });
    }

    async downloadFolder (folderPath) {
        let currName = path.basename(folderPath);
    }

    // 将文件上传到ftp目标地址
    // 目的必须添加相应的文件名称，不然是没办法创建成功的，也是我的疑问，要怎么优化
    async uploadFile (currentFile, targetFilePath) {
        return new Promise(async (resolve, reject) => {
            let dirpath = path.dirname(targetFilePath);
            let fileName = path.basename(targetFilePath);

            let rs = fs.createReadStream(currentFile);
            let total = fs.statSync(currentFile).size;
            let { err: targetDirErr, dir } = await this.cwd(dirpath);//此处应对err做处理

            if (targetDirErr) {
                return resolve({ err: targetDirErr });
            }

            this.getSpeed(rs, total);

            this.client.put(rs, fileName, (err) => {
                resolve({ err: err });
            })
        });
    }

    // 获取上传下载的进度
    getSpeed (file, total) {
        return new Promise((resolve) => {
            let cur = 0;

            file.on('data', function (d) {
                cur += d.length;
                let percent = ((cur / total) * 100).toFixed(1);
                console.log("loading：" + percent + '% complete');

                resolve(percent)
            });
        });
    }

    //  删除文件
    //  删除文件使用第一个参数，删除文件夹使用第二个参数
    // toDo：这里不知道怎么判断ftp上的路径是否为一个文件夹，所以暂时用规避方案实现
    // fs.statSync(folderPath).isDirectory() ---判断是否为文件夹
    async deleteFile (filePath, folderPath) {
        console.log('---safdfdf----dirpath---', filePath)
        console.log('---safdfdf---', folderPath)

        if (filePath) {
            let dirpath = path.dirname(filePath);
            let fileName = path.basename(filePath);
            let { err: targetDirErr, dir } = await this.cwd(dirpath);
            if (targetDirErr) {
                return Promise.resolve({ err: targetDirErr });
            }

            return new Promise((resolve, reject) => {
                this.client.delete(fileName, (err, rs) => {
                    resolve({ err: err });
                });
            });
        }

        if (folderPath) {
            return new Promise((resolve, reject) => {
                this.client.rmdir(folderPath, true, (err, rs) => {
                    resolve({ err: err });
                });
            });
        }
    }



    _upload (filePath) {
        return new Promise((resolve, reject) => {
            let cb = err => {
                if (err) {
                    return reject(err);
                }
                resolve(filePath);
            };
            if (fs.statSync(filePath).isDirectory()) {
                this.client.mkdir(path.join(this.options.root, filePath), true, cb);
                return;
            }

            this.client.put(filePath, path.join(this.options.root, filePath), cb);
        });
    }

    async startUpload () {
        console.log(`[ftp] start upload files... root: ${this.options.root}`);
        this.onStart();

        return Promise.all(this.options.files.map(file => this._upload(file).then(() => {
            this.onFileUpload(file);

        }))).then(() => {
            this.client.end();
            this.onSuccess();

        }).catch(e => {
            this.client.end();
            this.onFailure(e);

        });
    }

    onDestroyed () {
        if (this.client) {
            this.client.destroy();
            this.client = null;
        }
        super.onDestroyed();
    }
}


module.exports = new Ftp();
