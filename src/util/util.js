let fs = require('fs');
let path = require('path');
let {logger} = require('./logger');
let glob = require('glob');

const DEFAULT_ALLOW_BLANK_KEY = ['host', 'port', 'user', 'password'];

// 删除整个目录
function deleteDir (dir) {
    let dirStat = fs.statSync(dir);
    if (!dirStat.isDirectory()) {
        return;
    }

    let files = fs.readdirSync(dir);

    files.forEach(file => {
        let filePath = path.resolve(dir, file);
        let stats = fs.statSync(filePath);

        if (stats.isFile() && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        } else {

            // 递归删除
            arguments.callee(filePath);
        }
    });

    // 删除当前空文件夹
    fs.rmdirSync(dir);
}

function mkdirPath (pathStr) {
    let projectPath = path.join(process.cwd());
    let tempDirArray = pathStr.split('/');

    for (let i = 0; i < tempDirArray.length; i++) {
        projectPath = projectPath + '/' + tempDirArray[i];

        if (fs.existsSync(projectPath)) {
            let stats = fs.statSync(projectPath);

            if (!(stats.isDirectory())) {
                fs.unlinkSync(projectPath);
                fs.mkdirSync(projectPath);
            }
        } else {
            fs.mkdirSync(projectPath);
        }
    }
    return projectPath;
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
 * 校验当前文件路径时候存在
 * @param {*} filePath 
 */
function existFiled (filePath) {
    let existFlag = fs.existsSync(filePath);
    if (!existFlag) {
        logger.error(`源文件 ${filePath} 不存在！`);
    }
    return existFlag;
}

function hasDirectoryPath (files) {
    return files.some(file => fs.statSync(file).isDirectory());
}

/**
 * 校验连接必须字段
 * @param {Array} allowBlanks 需要检验的关键字 
 * @param {Object} options 待校验的对象
 * @returns {Boolean}
 */
function isValidObjectKey (options, allowBlanks = DEFAULT_ALLOW_BLANK_KEY) {
    let errorKeys = allowBlanks.filter(key => !options[key]);

    if (errorKeys.length) {
        let warnTipStr = `[isValidObjectKey] options: "${errorKeys}" not found in ${allowBlanks}`;
        logger.warn(warnTipStr);
        throw new Error('isValidObjectKey error');
    }

    return !errorKeys.length;
}

module.exports = {
    deleteDir,
    mkdirPath,
    glob: parseFiles,
    existFiled,
    hasDirectoryPath,
    isValidObjectKey
};
