/**
 * Created by uedc on 2020/9/11.
 */

let fs = require('fs');
let path = require('path');
let glob = require('glob');

function globFile (pattern) {
    let p = path.join(process.cwd(), pattern);
    if (fs.existsSync(p)) {
        if (fs.statSync(p).isDirectory()) {
            pattern += '/**';
        } else {
            return [pattern];
        }
    }
    return glob.sync(pattern, {

    });
}

function globFiles (files) {
    let ret = [];
    files.forEach(file => {
        ret.push(...globFile(file));
    });
    return ret;
}

function parseFiles (files = []) {
    if (!Array.isArray(files)) {
        files = [
            files
        ];
    }
    return globFiles(files);
}


/**
 * 上传方式的处理
 * 只有两种方式
 * @param {*} files     文件列表
 * @param {*} action    方式
 * @param {Function} callback (file)  回调函数
 */
async function uploadActionType (files, action, callback) {

    // 并行
    if (action === ACTION_TYPE.parallel) {
        files.forEach(file => {
            callback(file);
        })
        return;
    }

    for (let file of files) {
        let res = await callback(file);

        if (res !== file) {
            break;
        }
    }
}

module.exports = {
    glob: parseFiles,
    uploadActionType
}
