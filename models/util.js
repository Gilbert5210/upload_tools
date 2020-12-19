/**
 * Created by uedc on 2020/9/11.
 */

let fs = require('fs');
let path = require('path');
let glob = require('glob');

const ACTION_TYPE = {           // 上传下载发生方式
    parallel: 'parallel',       // 并行
    serial: 'serial'            // 串行
}

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
 * @param {*} targetFilePath    目标地址
 * @param {Function} callback (file)  回调函数
 */
async function uploadActionType (files, action, targetFilePath, callback) {

    // 并行
    if (action === ACTION_TYPE.parallel) {
        return await Promise.all([files.map(file=> callback(file, targetFilePath))])
    }

    // 记录串行的每一个结果
    let results = [];
    // 串行
    for (let file of files) {
        let res = await callback(file);
        results.push(res);

        if (res !== file) {
            continue;
        }
    }

    return results;
}

module.exports = {
    glob: parseFiles,
    uploadActionType
}
