let fs = require('fs');
let path = require('path');
const request = require('request');
let {logger} = require('./logger');
let axios = require('axios');
let glob = require('glob');

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

// 对图片base64转码
function base64ImgByPath (imgSrc, basePath) {
    let imgPath = path.join(basePath, imgSrc);
    let imgData64 = '';

    if (fs.existsSync(imgPath)) {
        let imgData = fs.readFileSync(imgPath);
        imgData64 = new Buffer.from(imgData, 'base64').toString('base64');
        imgData64 = 'data:image/png;base64,' + imgData64;
    } else {

        logger.error(`[base64ImgByPath]需base64转码图片不存在：${imgPath}`);
    }

    return imgData64;
}

// 拷贝文件至目标目录
function copyUploadFileToGoalDir (filename, goalDir, isDelete = true, isCustomPath = false) {
    let staticSrc = path.resolve(__dirname, isCustomPath ? filename : '../static/' + filename);

    let fileRealName = path.basename(filename);

    console.log(path.basename(filename));

    // fileRealName = fileRealName[fileRealName.length - 1];
    fs.copyFileSync(staticSrc, goalDir + '/' + fileRealName);

    if (isDelete && fs.existsSync(staticSrc)) {
        fs.unlinkSync(staticSrc);
    }
}

// 目录拷贝
function copyDirectory (src, dest) {
    let srcPath = path.resolve(__dirname, src);
    let destPath = path.resolve(__dirname, dest);
    if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath);
    }

    if (!fs.existsSync(srcPath)) {
        logger.error(`[CopyDirectory]源文件不存在：${src}`);
        return false;
    }

    let dirs = fs.readdirSync(srcPath);
    dirs.forEach(function (item) {
        let itemPath = path.join(srcPath, item);
        let temp = fs.statSync(itemPath);
        if (temp.isFile()) {
            fs.copyFileSync(itemPath, path.join(destPath, item));
        } else if (temp.isDirectory()) {
            copyDirectory(itemPath, path.join(destPath, item));
        }
    });

    logger.info(`[CopyDirectory]目录拷贝成功：源文件${src}， 目的文件${dest}`);
}

// 调试环境下获取前端页面调试地址
function getUIServeAddress () {
    let interfaces = require('os').networkInterfaces();

    let IPAddress = '';
    for (let devName in interfaces) {
        if (interfaces.hasOwnProperty(devName)) {
            let iface = interfaces[devName];

            for (let i = iface.length - 1; i >= 0; i--){
                let alias = iface[i];
                if (alias.family === 'IPv4' &&
                    alias.address !== '127.0.0.1' &&
                    !alias.internal) {
                    IPAddress = alias.address;
                }
            }
        }
    }

    return 'http://' + IPAddress + ':8980';
}

const NO_AUTH_CODE = 401;

async function checkLoginToken (ctx, next) {
    let _ga = ctx.cookies.get('_ga');
    let _gid = ctx.cookies.get('_gid');
    let equipmentID = ctx.cookies.get('equipmentID');
    let sess_id = ctx.cookies.get('sess_id');

    let Referer = ctx.get('Referer');

    let cookies = {
        _ga,
        _gid,
        equipmentID,
        sess_id
    };

    await next();
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

module.exports = {
    deleteDir,
    mkdirPath,
    copyUploadFileToGoalDir,
    base64ImgByPath,
    getUIServeAddress,
    checkLoginToken,
    copyDirectory,
    glob: parseFiles
};
